import express from 'express';
import { runAgent } from '../services/backboard.js';
import { readDb } from '../db.js';

const router = express.Router();

// POST /api/family/draft — Family Comms Agent
router.post('/draft', async (req, res) => {
    try {
        const { clientId, visitEvent } = req.body;
        const db = readDb();
        const client = db.clients.find(c => c.id === clientId);
        if (!client) return res.status(404).json({ error: 'Client not found' });

        const draft = await runAgent(
            process.env.BACKBOARD_FAMILY_AGENT_ID,
            client.backboard_thread_id,
            `Today's visit event: ${visitEvent}\n\nPlease draft tailored family update messages for each family member based on their communication preferences stored in memory.`
        );

        res.json({ draft });
    } catch (err) {
        console.error('Family draft error:', err.message);
        res.status(500).json({ error: 'Failed to draft family messages' });
    }
});

export default router;
