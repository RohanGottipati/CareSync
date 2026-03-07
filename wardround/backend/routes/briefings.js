// backend/routes/briefings.js
// Triggers the Backboard Handoff Agent to generate a pre-visit briefing for a client.

import express from 'express';
import { readDb } from '../db.js';
import { runAgent } from '../services/backboard.js';

const router = express.Router();

const BRIEFING_PROMPT =
    'You are preparing a PSW for their home-care visit. ' +
    'Based on everything you know about this client — including their profile, past visits, medications, ' +
    'and any flagged concerns — generate a concise, actionable pre-visit briefing. ' +
    'Focus on: current health status, mood/behaviour trends, key watchpoints for today, ' +
    'and any family communication notes. Keep it under 200 words.';

// GET /api/briefings/:clientId
router.get('/:clientId', async (req, res) => {
    try {
        const db = readDb();
        const client = (db.clients || []).find(c => c.id === req.params.clientId);

        if (!client) {
            return res.status(404).json({ error: 'Client not found' });
        }

        if (!client.handoffThreadId) {
            return res.status(400).json({ error: 'Client has no Backboard thread — re-create client record' });
        }

        const briefing = await runAgent(client.handoffThreadId, BRIEFING_PROMPT);

        res.json({
            clientId: client.id,
            clientName: client.name,
            briefing,
            generatedAt: new Date().toISOString(),
        });
    } catch (err) {
        console.error('[briefings] GET error:', err.response?.data || err.message);
        res.status(500).json({ error: 'Failed to generate briefing', detail: err.message });
    }
});

export default router;
