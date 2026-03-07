/**
 * Nightly Medication Sentinel — runs at 2 AM (America/Toronto).
 *
 * Reads all clients from PostgreSQL, runs the Sentinel agent on Backboard,
 * and logs any alerts. Only active when NODE_ENV=production.
 */

import cron from 'node-cron';
import { getAllClients } from './db.js';
import * as backboard from './services/backboard.js';

const SENTINEL_CRON = '0 2 * * *';

async function runMedicationSentinel() {
    const clients = await getAllClients();
    if (clients.length === 0) {
        console.log('[Sentinel] No clients in DB; skipping.');
        return;
    }

    const sentinelAssistantId = backboard.getAssistantId('sentinel');
    if (!sentinelAssistantId) {
        console.warn('[Sentinel] BACKBOARD_SENTINEL_AGENT_ID not set; skipping.');
        return;
    }

    try {
        const threadRes = await backboard.createThread(sentinelAssistantId);
        const threadId = threadRes.thread_id;
        const clientList = clients.map((c) => `${c.name} (meds: ${c.medications || 'none'})`).join('; ');
        const prompt = `Run the overnight medication sentinel check. Review each client and flag any concerns:\n${clientList}`;
        const { content } = await backboard.runAgent(threadId, prompt);
        console.log('[Sentinel] Completed. Response length:', content?.length ?? 0);
        // TODO: persist alerts to DB and email COORDINATOR_EMAIL
    } catch (err) {
        console.error('[Sentinel] Error:', err.message);
    }
}

export function runCron() {
    if (process.env.NODE_ENV !== 'production') {
        console.log('Nightly Medication Sentinel: disabled (NODE_ENV !== production).');
        return;
    }
    cron.schedule(SENTINEL_CRON, runMedicationSentinel, { timezone: 'America/Toronto' });
    console.log('Nightly Medication Sentinel: scheduled for 2:00 AM America/Toronto.');
}
