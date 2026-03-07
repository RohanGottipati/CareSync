// backend/routes/clients.js
// Coordinator-only CRUD for client profiles.
// On create: provisions a Backboard thread and seeds initial memory.

import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { readDb, writeDb } from '../db.js';
import { createClientThread, writeMemory } from '../services/backboard.js';

const router = express.Router();

const HANDOFF_AGENT_ID = process.env.BACKBOARD_HANDOFF_AGENT_ID;

// GET /api/clients — list all clients
router.get('/', (req, res) => {
    const db = readDb();
    res.json({ clients: db.clients || [] });
});

// GET /api/clients/:id — get a single client
router.get('/:id', (req, res) => {
    const db = readDb();
    const client = (db.clients || []).find(c => c.id === req.params.id);
    if (!client) return res.status(404).json({ error: 'Client not found' });
    res.json({ client });
});

// POST /api/clients — create a new client profile
// Body: { name, dob, diagnosis, medications, allergies, notes }
router.post('/', async (req, res) => {
    try {
        const { name, dob, diagnosis, medications = [], allergies = [], notes = '' } = req.body;

        if (!name) return res.status(400).json({ error: 'name is required' });

        // 1. Create a dedicated Backboard thread for this client under the Handoff Agent
        const handoffThreadId = await createClientThread(HANDOFF_AGENT_ID);

        // 2. Seed the Handoff Agent's shared memory with this client's profile
        const profileMemory = [
            `CLIENT PROFILE — ${name}`,
            dob ? `Date of Birth: ${dob}` : null,
            diagnosis ? `Diagnosis: ${diagnosis}` : null,
            medications.length ? `Medications: ${medications.join(', ')}` : null,
            allergies.length ? `Allergies: ${allergies.join(', ')}` : null,
            notes ? `Care Notes: ${notes}` : null,
        ]
            .filter(Boolean)
            .join('\n');

        await writeMemory(HANDOFF_AGENT_ID, profileMemory);

        // 3. Save client record to local JSON db
        const db = readDb();
        const client = {
            id: uuidv4(),
            name,
            dob: dob || null,
            diagnosis: diagnosis || null,
            medications,
            allergies,
            notes,
            handoffThreadId,
            createdAt: new Date().toISOString(),
        };

        db.clients = [...(db.clients || []), client];
        writeDb(db);

        res.status(201).json({ client });
    } catch (err) {
        console.error('[clients] POST error:', err.response?.data || err.message);
        res.status(500).json({ error: 'Failed to create client', detail: err.message });
    }
});

export default router;
