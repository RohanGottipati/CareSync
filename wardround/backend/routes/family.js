/**
 * Family Comms Agent: draft messages to families. POST /api/family/draft { clientId, context? }
 * returns a draft message using the Family agent.
 */

import express from 'express';
import * as backboard from '../services/backboard.js';
import { getClientThread, setClientThread } from '../db.js';

const router = express.Router();

router.post('/draft', async (req, res) => {
  try {
    const { clientId, context } = req.body || {};
    if (!clientId) {
      return res.status(400).json({ error: 'clientId required' });
    }
    const assistantId = backboard.getAssistantId('family');
    if (!assistantId) {
      return res.status(503).json({ error: 'Family agent not configured' });
    }
    let threadId = getClientThread(clientId, 'family');
    if (!threadId) {
      const created = await backboard.createThread(assistantId);
      threadId = created.thread_id;
      setClientThread(clientId, 'family', threadId);
    }
    const prompt = context
      ? `Draft a short, professional message to the family. Context: ${context}`
      : 'Draft a short, professional message to the family summarizing recent care and any updates.';
    const { content } = await backboard.runAgent(threadId, prompt);
    res.json({ clientId, draft: content });
  } catch (err) {
    console.error('Family draft error:', err);
    res.status(500).json({ error: err.message || 'Failed to generate draft' });
  }
});

export default router;
