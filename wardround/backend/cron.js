/**
 * Nightly Medication Sentinel — runs at 2 AM (server local time).
 *
 * WHY CRON ON THE VPS:
 * - 24/7 background tasks: The Toronto VPS runs around the clock so we can schedule
 *   the medication check at 2 AM without relying on a user's machine or a serverless
 *   cron that might be in a different region. Keeps scheduling and data in one place.
 * - Data residency: Sentinel reads client/medication data from our DB and calls
 *   Backboard from the same host; no need to ship data to an external scheduler.
 *
 * Flow: At 2 AM we load clients (from db), for each client we run the Sentinel agent
 * (Backboard) to produce alerts; results can be stored or sent to coordinators (e.g. email).
 * Only runs when NODE_ENV=production to avoid triggering during dev.
 */

import cron from 'node-cron';
import { readDb } from './db.js';
import * as backboard from './services/backboard.js';

const SENTINEL_CRON = '0 2 * * *'; // 2:00 AM every day

/**
 * Run the Medication Sentinel: for each client, run the Sentinel agent and collect flags.
 * In a full implementation you would store results and/or notify coordinators.
 */
async function runMedicationSentinel() {
  const db = readDb();
  const clients = db.clients || [];
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
    const { createThread, runAgent } = backboard;
    const threadRes = await createThread(sentinelAssistantId);
    const threadId = threadRes.thread_id;
    const prompt = `Run the medication sentinel check for the following clients and list any alerts or concerns: ${clients.map((c) => c.name || c.id).join(', ')}.`;
    const { content } = await runAgent(threadId, prompt);
    console.log('[Sentinel] Run completed. Response length:', content?.length ?? 0);
    // TODO: persist alerts to db, send digest to COORDINATOR_EMAIL
  } catch (err) {
    console.error('[Sentinel] Error:', err.message);
  }
}

/**
 * Start the cron job. Call once from server.js.
 * Only schedules in production so dev doesn't trigger at 2 AM.
 */
export function runCron() {
  if (process.env.NODE_ENV !== 'production') {
    console.log('Nightly Medication Sentinel: disabled (NODE_ENV !== production).');
    return;
  }
  cron.schedule(SENTINEL_CRON, runMedicationSentinel, { timezone: 'America/Toronto' });
  console.log('Nightly Medication Sentinel: scheduled for 2:00 AM America/Toronto.');
}
