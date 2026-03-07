/**
 * Visits: log a visit and write to Backboard client memory so future briefings have context.
 * POST /api/visits { clientId, notes }
 *
 * Only PSWs currently assigned to the client (per the assignments table) can log a visit.
 */

import express from 'express';
import * as backboard from '../services/backboard.js';
import { createVisit, getClientThread, setClientThread, isPswAssignedToClient } from '../db.js';

const router = express.Router();

router.post('/', async (req, res) => {
    try {
        const { clientId, notes } = req.body || {};
        if (!clientId) {
            return res.status(400).json({ error: 'clientId required' });
        }

        const assigned = await isPswAssignedToClient(req.user.id, clientId);
        if (!assigned) {
            return res.status(403).json({ error: 'You are not assigned to this client for the current shift.' });
        }

        const visit = await createVisit({ clientId, pswUserId: req.user.id, notes });

        const assistantId = backboard.getAssistantId('handoff');
        if (assistantId) {
            let threadId = await getClientThread(clientId, 'handoff');
            if (!threadId) {
                const created = await backboard.createThread(assistantId);
                threadId = created.thread_id;
                await setClientThread(clientId, 'handoff', threadId);
            }
            await backboard.writeMemory(threadId, `Visit logged by PSW ${req.user.id}: ${notes || 'No notes.'}`);
        }

        res.json({ message: 'Visit logged', visitId: visit.id });
    } catch (err) {
        console.error('Visits error:', err);
        res.status(500).json({ error: err.message || 'Failed to log visit' });
    }
});

export default router;
