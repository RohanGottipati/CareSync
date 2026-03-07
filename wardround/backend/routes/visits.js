/**
 * Visits: log a visit and write to Backboard client memory so future briefings have context.
 * POST /api/visits { clientId, notes }.
 */

import express from 'express';
import * as backboard from '../services/backboard.js';
import { readDb, writeDb, getClientThread, setClientThread } from '../db.js';

const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const { clientId, notes } = req.body || {};
    if (!clientId) {
      return res.status(400).json({ error: 'clientId required' });
    }
    const db = readDb();
    const visit = {
      id: `v-${Date.now()}`,
      clientId,
      notes: notes || '',
      userId: req.user?.id,
      at: new Date().toISOString(),
    };
    db.visits = db.visits || [];
    db.visits.push(visit);
    writeDb(db);

    const assistantId = backboard.getAssistantId('handoff');
    if (assistantId) {
      let threadId = getClientThread(clientId, 'handoff');
      if (!threadId) {
        const created = await backboard.createThread(assistantId);
        threadId = created.thread_id;
        setClientThread(clientId, 'handoff', threadId);
      }
      await backboard.writeMemory(threadId, `Visit logged: ${notes || 'No notes.'}`);
    }

    res.json({ message: 'Visit logged', visitId: visit.id });
  } catch (err) {
    console.error('Visits error:', err);
    res.status(500).json({ error: err.message || 'Failed to log visit' });
  }
});

export default router;
