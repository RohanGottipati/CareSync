// backend/routes/visits.js
// Logs a PSW visit and writes the key details to the Backboard Handoff Agent's memory.

import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { readDb, writeDb } from '../db.js';
import { writeMemory } from '../services/backboard.js';

const router = express.Router();

const HANDOFF_AGENT_ID = process.env.BACKBOARD_HANDOFF_AGENT_ID;

// POST /api/visits
// Body: { clientId, pswId, notes, mood, vitals: { bp, weight, temp }, flaggedConcerns }
router.post('/', async (req, res) => {
    try {
        const {
            clientId,
            pswId,
            notes = '',
            mood = '',
            vitals = {},
            flaggedConcerns = [],
        } = req.body;

        if (!clientId) return res.status(400).json({ error: 'clientId is required' });

        // 1. Verify client exists
        const db = readDb();
        const client = (db.clients || []).find(c => c.id === clientId);
        if (!client) return res.status(404).json({ error: 'Client not found' });

        console.log('Building visit record');

        // 2. Build visit record
        const visit = {
            id: uuidv4(),
            clientId,
            clientName: client.name,
            pswId: pswId || req.user?.id || 'unknown',
            notes,
            mood,
            vitals,
            flaggedConcerns,
            timestamp: new Date().toISOString(),
        };

        console.log('Writing to DB');
        // 3. Persist to db
        db.visits = [...(db.visits || []), visit];
        writeDb(db);

        console.log('Formatting memory string');
        // 4. Format a memory string and write to Handoff Agent
        const visitDate = new Date(visit.timestamp).toLocaleDateString('en-CA', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });

        const memoryLines = [
            `VISIT LOG — ${client.name} — ${visitDate}`,
            mood ? `Mood: ${mood}` : null,
            vitals.bp ? `Blood Pressure: ${vitals.bp}` : null,
            vitals.weight ? `Weight: ${vitals.weight}` : null,
            vitals.temp ? `Temperature: ${vitals.temp}` : null,
            notes ? `Notes: ${notes}` : null,
            flaggedConcerns.length ? `⚠️ Flagged Concerns: ${flaggedConcerns.join('; ')}` : null,
        ]
            .filter(Boolean)
            .join('\n');

        console.log('Calling writeMemory');
        await writeMemory(HANDOFF_AGENT_ID, memoryLines);

        console.log('Sending response');
        res.status(201).json({ visit });
    } catch (err) {
        console.error('=== VISITS POST FATAL ERROR ===');
        console.error(err);
        if (err.response) {
            console.error('Data:', err.response.data);
            console.error('Status:', err.response.status);
            console.error('Headers:', err.response.headers);
        }
        res.status(500).json({ error: 'Failed to log visit', detail: err.message });
    }
});

// GET /api/visits?clientId=... — list visits for a client
router.get('/', (req, res) => {
    const db = readDb();
    const { clientId } = req.query;
    const visits = (db.visits || []).filter(v => !clientId || v.clientId === clientId);
    res.json({ visits });
});

export default router;
