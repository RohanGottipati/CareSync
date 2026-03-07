/**
 * Briefings: pre-visit Handoff Agent. GET /api/briefings/:clientId returns today's briefing
 * by running the Handoff agent on the client's memory thread.
 */

import express from 'express';
import * as backboard from '../services/backboard.js';
import { getClientThread, setClientThread } from '../db.js';

const router = express.Router();

router.get('/:clientId', async (req, res) => {
  try {
    const { clientId } = req.params;
    let threadId = getClientThread(clientId, 'handoff');
    const assistantId = backboard.getAssistantId('handoff');
    if (!assistantId) {
      return res.status(503).json({ error: 'Handoff agent not configured' });
    }
    if (!threadId) {
      const created = await backboard.createThread(assistantId);
      threadId = created.thread_id;
      setClientThread(clientId, 'handoff', threadId);
    }
    const { content } = await backboard.runAgent(threadId, 'Generate a concise pre-visit briefing for today.');
    res.json({ clientId, briefing: content });
  } catch (err) {
    console.error('Briefings error:', err);
    res.status(500).json({ error: err.message || 'Failed to get briefing' });
  }
});

export default router;
