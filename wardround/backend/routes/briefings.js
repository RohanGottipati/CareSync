import express from 'express';
import { createClientThread, runAgent } from '../services/backboard.js';
import { readDb } from '../db.js';

const router = express.Router();

// GET /api/briefings/:clientId → triggers Handoff Agent
router.get('/:clientId', async (req, res) => {
    try {
        const { clientId } = req.params;
        const db = readDb();
        const client = db.clients.find(c => c.id === clientId);
        if (!client) return res.status(404).json({ error: 'Client not found' });

        const briefing = await runAgent(
            process.env.BACKBOARD_HANDOFF_AGENT_ID,
            client.backboard_thread_id,
            `Generate a pre-visit briefing for ${client.name}. Review the full memory thread and produce a warm, actionable handoff under 200 words.`
        );

        res.json({ briefing, clientName: client.name });
    } catch (err) {
        console.error('Briefing error:', err.message);
        res.status(500).json({ error: 'Failed to generate briefing' });
    }
});

export default router;
