/**
 * Briefings: pre-visit Handoff Agent.
 * GET /api/briefings/:clientId — returns today's AI-generated briefing.
 *
 * PSWs can only access briefings for clients they are currently assigned to.
 * Coordinators can access any client's briefing.
 */

import express from 'express';
import { runAgent, getAssistantId, createThread } from '../services/backboard.js';
import { getClientThread, setClientThread, getClientById, canPswAccessBriefingForClient } from '../db.js';

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
        const { clientId } = req.params;

        // PSWs can access briefing from 30 min before shift start until shift end
        if (req.user.role === 'psw') {
            const canAccess = await canPswAccessBriefingForClient(req.user.id, clientId);
            if (!canAccess) {
                return res.status(403).json({ error: 'You cannot access this briefing.' });
            }
        }

        const client = await getClientById(clientId);
        if (!client) {
            return res.status(404).json({ error: 'Client not found' });
        }

        const assistantId = getAssistantId('handoff');
        if (!assistantId) {
            return res.status(503).json({ error: 'Handoff agent not configured — set BACKBOARD_HANDOFF_AGENT_ID' });
        }

        // Get or create a persistent thread for this client
        let threadId = await getClientThread(clientId, 'handoff');
        if (!threadId) {
            const created = await createThread(assistantId);
            threadId = created.thread_id;
            await setClientThread(clientId, 'handoff', threadId);
        }

        const { content: briefing } = await runAgent(threadId, BRIEFING_PROMPT);

        res.json({
            clientId,
            clientName: client.name,
            briefing,
            generatedAt: new Date().toISOString(),
        });
    } catch (err) {
        console.error('[briefings] GET error:', err.message);
        res.status(500).json({ error: 'Failed to generate briefing', detail: err.message });
    }
});

export default router;
