import nodeCron from 'node-cron';
import { runAgent, writeMemory } from './services/backboard.js';
import { readDb } from './db.js';

// Every night at 2 AM Toronto time — runs on Vultr VPS
nodeCron.schedule('0 2 * * *', async () => {
    console.log('[SENTINEL] Nightly medication check starting...');
    const db = readDb();
    const clients = db.clients.filter(c => c.active);
    const flags = [];

    for (const client of clients) {
        try {
            const result = await runAgent(
                process.env.BACKBOARD_SENTINEL_AGENT_ID,
                client.backboard_thread_id,
                `Review the last 7 days of visit logs. Compare medications given vs. prescribed schedule. Return CLEAR or a specific flag.`
            );

            if (result.trim() !== 'CLEAR') {
                flags.push({ clientName: client.name, issue: result });

                // Write flag into memory — Handoff Agent will surface it tomorrow
                await writeMemory(
                    client.backboard_thread_id,
                    `⚠️ MEDICATION SENTINEL FLAG ${new Date().toDateString()}: ${result}`
                );
            }
        } catch (e) {
            console.error(`Sentinel failed for ${client.name}:`, e.message);
        }
    }

    console.log(`[SENTINEL] Done. ${flags.length} flags raised across ${clients.length} clients.`);
}, { timezone: 'America/Toronto' });
