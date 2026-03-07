/**
 * Briefings: pre-visit Handoff Agent.
 * GET /api/briefings/:clientId — returns today's AI-generated briefing.
 *
 * PSWs can only access briefings for clients they are currently assigned to.
 * Coordinators can access any client's briefing.
 */

import express from 'express';
import * as backboard from '../services/backboard.js';
import { getClientThread, setClientThread, isPswAssignedToClient } from '../db.js';

const router = express.Router();

router.get('/:clientId', async (req, res) => {
    try {
        const { clientId } = req.params;

        if (req.user.role === 'psw') {
            const assigned = await isPswAssignedToClient(req.user.id, clientId);
            if (!assigned) {
                return res.status(403).json({ error: 'You are not assigned to this client for the current shift.' });
            }
        }

        const assistantId = backboard.getAssistantId('handoff');
        if (!assistantId) {
            return res.status(503).json({ error: 'Handoff agent not configured' });
        }

        let threadId = await getClientThread(clientId, 'handoff');
        if (!threadId) {
            const created = await backboard.createThread(assistantId);
            threadId = created.thread_id;
            await setClientThread(clientId, 'handoff', threadId);
        }

        const { content } = await backboard.runAgent(threadId, 'Generate a concise pre-visit briefing for today.');
        res.json({ clientId, briefing: content });
    } catch (err) {
        console.error('Briefings error:', err);
        res.status(500).json({ error: err.message || 'Failed to get briefing' });
    }
});

export default router;
