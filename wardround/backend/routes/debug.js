/**
 * Debug routes — DEV ONLY (not mounted in production).
 *
 * POST /api/debug/sentinel — immediately triggers the Medication Sentinel
 *   without waiting for the 2 AM cron, and returns per-client results.
 */

import express from 'express';
import { runMedicationSentinel } from '../cron.js';

const router = express.Router();

router.post('/sentinel', async (req, res) => {
    try {
        console.log('[debug] Manual Sentinel trigger invoked.');
        const results = await runMedicationSentinel();
        res.json({
            triggeredAt: new Date().toISOString(),
            clients: results,
        });
    } catch (err) {
        console.error('[debug/sentinel] error:', err);
        res.status(500).json({ error: err.message || 'Sentinel run failed' });
    }
});

export default router;
