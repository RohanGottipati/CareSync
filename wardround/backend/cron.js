/**
 * Nightly jobs (America/Toronto):
 *   2:00 AM — Medication Sentinel: reviews all clients, writes FLAGGED/CLEAR to DB + handoff memory
 *   1:00 AM — Family Summaries: for each client with visits today, generates a family-friendly
 *              daily update via the Family agent and stores it in family_daily_summaries.
 *
 * Only schedules when NODE_ENV=production.
 * Both jobs are exported so they can be triggered manually (dev / debug endpoints).
 */

import cron from 'node-cron';
import {
    getAllClients, getClientThread, setClientThread,
    upsertSentinelResult,
    getClientsWithVisitsOnDate, getVisitsByClientForDate,
    insertFamilySummary,
} from './db.js';
import * as backboard from './services/backboard.js';

const SENTINEL_CRON = '0 2 * * *';
const FAMILY_SUMMARY_CRON = '0 1 * * *';

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

            // Persist result to DB so the UI can show the flag text without re-running the agent
            try {
                await upsertSentinelResult({ clientId: client.id, status, summaryText: summary });
            } catch (dbErr) {
                console.warn(`[Sentinel] Could not save DB result for ${client.name}:`, dbErr.message);
            }

            console.log(`[Sentinel] ${client.name}: ${status}`);
            return { name: client.name, clientId: client.id, status, summary };
        })
    );

    return results;
}

/**
 * Run the nightly family summary job.
 * For each client that had at least one visit today, generate a family-friendly
 * daily update via the Family agent and store it in family_daily_summaries.
 */
export async function runFamilySummaries() {
    const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD

    const familyAssistantId = backboard.getAssistantId('family');
    if (!familyAssistantId) {
        console.warn('[FamilySummary] BACKBOARD_FAMILY_AGENT_ID not set; skipping.');
        return [];
    }

    const clients = await getClientsWithVisitsOnDate(today);
    if (clients.length === 0) {
        console.log('[FamilySummary] No clients with visits today; skipping.');
        return [];
    }

    console.log(`[FamilySummary] Generating summaries for ${clients.length} client(s)…`);

    const results = await Promise.all(
        clients.map(async (client) => {
            try {
                const visits = await getVisitsByClientForDate(client.id, today);

                // Build sanitised visit context (no PSW user IDs)
                const visitLines = visits.map((v, i) => {
                    const parts = [`Visit ${i + 1}`];
                    if (v.session_type) parts.push(`(${v.session_type})`);
                    if (v.notes) parts.push(`— ${v.notes}`);
                    return parts.join(' ');
                });

                const prompt = [
                    `Write a brief, warm, family-friendly daily care update ONLY for ${client.name}.`,
                    `This update is exclusively about ${client.name}. Do NOT mention, reference, or name any other client or patient.`,
                    'Base it only on the visit notes listed below. Do not include clinical jargon or raw PSW identifiers.',
                    `Focus solely on ${client.name}'s wellbeing, mood, and any noteworthy moments from the day.`,
                    'Keep it under 120 words. Sign off as "The CareSync Care Team".',
                    '',
                    `Today\'s visit notes for ${client.name} (do not reference any other person):`,
                    ...visitLines,
                ].join('\n');

                // Use a per-client family thread so the agent has persistent context
                let threadId = await getClientThread(client.id, 'family');
                if (!threadId) {
                    const created = await backboard.createThread(familyAssistantId);
                    threadId = created.thread_id;
                    await setClientThread(client.id, 'family', threadId);
                }

                const { content: summaryText } = await backboard.runAgent(threadId, prompt);

                await insertFamilySummary({ clientId: client.id, summaryDate: today, summaryText });
                console.log(`[FamilySummary] Saved summary for ${client.name}`);
                return { name: client.name, clientId: client.id, date: today, ok: true };
            } catch (err) {
                console.warn(`[FamilySummary] Failed for ${client.name}:`, err.message);
                return { name: client.name, clientId: client.id, date: today, ok: false, error: err.message };
            }
        })
    );

    return results;
}

export function runCron() {
    if (process.env.NODE_ENV !== 'production') {
        console.log('Nightly jobs: disabled (NODE_ENV !== production).');
        return;
    }
    cron.schedule(SENTINEL_CRON, runMedicationSentinel, { timezone: 'America/Toronto' });
    console.log('Nightly Medication Sentinel: scheduled for 2:00 AM America/Toronto.');

    cron.schedule(FAMILY_SUMMARY_CRON, runFamilySummaries, { timezone: 'America/Toronto' });
    console.log('Nightly Family Summaries: scheduled for 1:00 AM America/Toronto.');
}
