/**
 * Nightly Medication Sentinel — runs at 2 AM (America/Toronto).
 *
 * - Reads all clients from PostgreSQL
 * - Runs the Sentinel agent on Backboard for all clients as a batch
 * - Parses response for CLEAR vs FLAGGED per client
 * - Writes the sentinel result into each client's handoff thread memory
 *   so next morning's briefing includes overnight alert status
 * - Only schedules the cron when NODE_ENV=production
 * - Exports runMedicationSentinel() so it can be triggered manually (dev)
 */

import cron from 'node-cron';
import { getAllClients, getClientThread, setClientThread } from './db.js';
import * as backboard from './services/backboard.js';

const SENTINEL_CRON = '0 2 * * *';

const FLAG_KEYWORDS = ['concern', 'flag', 'alert', 'urgent', 'danger', 'risk', 'warn', 'issue', 'problem'];

/** Parse a per-client section of the sentinel response into a status + summary. */
function parseClientResult(name, fullResponse) {
    // Try to find a section mentioning this client
    const lines = fullResponse.split('\n');
    const clientLines = [];
    let inSection = false;

    for (const line of lines) {
        if (line.toLowerCase().includes(name.toLowerCase())) {
            inSection = true;
        }
        if (inSection) {
            clientLines.push(line);
            // Stop at the next clearly different client section (blank line after content)
            if (clientLines.length > 1 && line.trim() === '') break;
        }
    }

    const excerpt = clientLines.join('\n').trim() || fullResponse.substring(0, 300);
    const lower = excerpt.toLowerCase();
    const isFlagged = FLAG_KEYWORDS.some(kw => lower.includes(kw));
    const isClear = lower.includes('clear') || lower.includes('no concern') || lower.includes('no issue');

    let status;
    if (isFlagged) status = 'FLAGGED';
    else if (isClear) status = 'CLEAR';
    else status = 'UNKNOWN';

    return { status, summary: excerpt || 'No specific details found in response.' };
}

/**
 * Run the Medication Sentinel check across all clients.
 * Returns an array of { name, clientId, status, summary }.
 * Also writes results to each client's handoff memory.
 */
export async function runMedicationSentinel() {
    const clients = await getAllClients();

    if (clients.length === 0) {
        console.log('[Sentinel] No clients in DB; skipping.');
        return [];
    }

    const sentinelAssistantId = backboard.getAssistantId('sentinel');
    if (!sentinelAssistantId) {
        console.warn('[Sentinel] BACKBOARD_SENTINEL_AGENT_ID not set; skipping.');
        return [];
    }

    // Create a fresh sentinel thread for this overnight run
    const threadRes = await backboard.createThread(sentinelAssistantId);
    const sentinelThreadId = threadRes.thread_id;

    const clientList = clients
        .map(c => `${c.name} (conditions: ${c.conditions || 'none'}, medications: ${c.medications || 'none'})`)
        .join('\n');

    const prompt = [
        'Run the overnight medication sentinel check for all clients.',
        'For each client, review their conditions and medications.',
        'Flag any risks: missed doses, interactions, side effects, or concerning conditions.',
        'Clearly state CLEAR or FLAGGED for each client.',
        '',
        'Client list:',
        clientList,
    ].join('\n');

    console.log(`[Sentinel] Running check for ${clients.length} client(s)...`);
    const { content: fullResponse } = await backboard.runAgent(sentinelThreadId, prompt);
    console.log('[Sentinel] Response received. Parsing results...');

    // Parse per-client results and write to handoff memory
    const results = await Promise.all(
        clients.map(async (client) => {
            const { status, summary } = parseClientResult(client.name, fullResponse);

            // Write the sentinel result to the client's handoff thread so next briefing is informed
            const handoffAssistantId = backboard.getAssistantId('handoff');
            if (handoffAssistantId) {
                try {
                    let handoffThreadId = await getClientThread(client.id, 'handoff');
                    if (!handoffThreadId) {
                        const created = await backboard.createThread(handoffAssistantId);
                        handoffThreadId = created.thread_id;
                        await setClientThread(client.id, 'handoff', handoffThreadId);
                    }

                    const date = new Date().toLocaleDateString('en-CA', {
                        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
                    });
                    await backboard.writeMemory(
                        handoffThreadId,
                        `OVERNIGHT SENTINEL — ${date}\nStatus: ${status}\n${summary}`
                    );
                } catch (memErr) {
                    console.warn(`[Sentinel] Could not write memory for ${client.name}:`, memErr.message);
                }
            }

            console.log(`[Sentinel] ${client.name}: ${status}`);
            return { name: client.name, clientId: client.id, status, summary };
        })
    );

    return results;
}

export function runCron() {
    if (process.env.NODE_ENV !== 'production') {
        console.log('Nightly Medication Sentinel: disabled (NODE_ENV !== production).');
        return;
    }
    cron.schedule(SENTINEL_CRON, runMedicationSentinel, { timezone: 'America/Toronto' });
    console.log('Nightly Medication Sentinel: scheduled for 2:00 AM America/Toronto.');
}
