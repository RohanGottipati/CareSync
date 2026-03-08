/**
 * Visits: log a PSW visit, persist to Postgres, and write context to Backboard
 * so future briefings have up-to-date visit history.
 *
 * POST /api/visits  { clientId, notes, mood, vitals, flaggedConcerns, sessionType }
 *
 * PSWs must be currently assigned to the client (per assignments table).
 * Coordinators may log visits on behalf of PSWs.
 */

import express from 'express';
import { createVisit, getClientById, getClientThread, setClientThread, isPswAssignedToClient } from '../db.js';
import { getAssistantId, createThread, writeMemory } from '../services/backboard.js';

const router = express.Router();

// POST /api/visits
router.post('/', async (req, res) => {
    try {
        const {
            clientId,
            notes = '',
            mood = '',
            vitals = {},
            flaggedConcerns = [],
            sessionType = '',
        } = req.body || {};

        if (!clientId) return res.status(400).json({ error: 'clientId is required' });

        // PSWs must be assigned to this client right now
        if (req.user.role === 'psw') {
            const assigned = await isPswAssignedToClient(req.user.id, clientId);
            if (!assigned) {
                return res.status(403).json({ error: 'You are not assigned to this client for the current shift.' });
            }
        }

        // Verify client exists
        const client = await getClientById(clientId);
        if (!client) return res.status(404).json({ error: 'Client not found' });

        // Persist to Postgres
        const visit = await createVisit({ clientId, pswUserId: req.user.id, notes, sessionType: sessionType || null });

        // Build a rich memory string for future briefings
        const visitDate = new Date().toLocaleDateString('en-CA', {
            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
            hour: '2-digit', minute: '2-digit',
        });

        const memoryLines = [
            `VISIT LOG — ${client.name} — ${visitDate}${sessionType ? ` (${sessionType} session)` : ''}`,
            mood ? `Mood: ${mood}` : null,
            vitals.bp ? `Blood Pressure: ${vitals.bp}` : null,
            vitals.weight ? `Weight: ${vitals.weight}` : null,
            vitals.temp ? `Temperature: ${vitals.temp}` : null,
            notes ? `Notes: ${notes}` : null,
            flaggedConcerns.length ? `⚠️ Flagged Concerns: ${flaggedConcerns.join('; ')}` : null,
        ]
            .filter(Boolean)
            .join('\n');

        // Write to Backboard memory (non-fatal if it fails)
        const assistantId = getAssistantId('handoff');
        if (assistantId) {
            try {
                let threadId = await getClientThread(clientId, 'handoff');
                if (!threadId) {
                    const created = await createThread(assistantId);
                    threadId = created.thread_id;
                    await setClientThread(clientId, 'handoff', threadId);
                }
                await writeMemory(threadId, memoryLines);
            } catch (backboardErr) {
                console.warn('[visits] Backboard write failed (non-fatal):', backboardErr.message);
            }
        }

        res.status(201).json({ visit });
    } catch (err) {
        console.error('[visits] POST error:', err);
        res.status(500).json({ error: 'Failed to log visit', detail: err.message });
    }
});

export default router;
