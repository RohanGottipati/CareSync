/**
 * Debug routes — DEV ONLY (not mounted in production).
 *
 * POST /api/debug/sentinel        — immediately triggers the Medication Sentinel
 * POST /api/debug/family-summaries — immediately triggers nightly family summary job
 */

import express from 'express';
import { runMedicationSentinel, runFamilySummaries } from '../cron.js';

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

router.post('/family-summaries', async (req, res) => {
    try {
        console.log('[debug] Manual Family Summaries trigger invoked.');
        const results = await runFamilySummaries();
        res.json({
            triggeredAt: new Date().toISOString(),
            clients: results,
        });
    } catch (err) {
        console.error('[debug/family-summaries] error:', err);
        res.status(500).json({ error: err.message || 'Family summaries run failed' });
    }
});

export default router;
