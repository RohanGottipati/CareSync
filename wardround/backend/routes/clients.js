import express from 'express';
import { createClientThread } from '../services/backboard.js';
import { readDb, writeDb } from '../db.js';

const router = express.Router();

// GET /api/clients — list all clients (coordinator only)
router.get('/', (req, res) => {
    const db = readDb();
    res.json({ clients: db.clients });
});

// GET /api/clients/:id
router.get('/:id', (req, res) => {
    const db = readDb();
    const client = db.clients.find(c => c.id === req.params.id);
    if (!client) return res.status(404).json({ error: 'Client not found' });
    res.json(client);
});

// POST /api/clients — create client + Backboard thread
router.post('/', async (req, res) => {
    try {
        const { name, dob, address, medications, careNotes, familyMembers } = req.body;
        const id = `client_${Date.now()}`;

        // Create persistent Backboard memory thread for this client
        const backboard_thread_id = await createClientThread(id, name);

        const client = {
            id,
            name,
            dob,
            address,
            medications: medications || [],
            careNotes: careNotes || '',
            familyMembers: familyMembers || [],
            backboard_thread_id,
            active: true,
            createdAt: new Date().toISOString()
        };

        const db = readDb();
        db.clients.push(client);
        writeDb(db);

        res.json(client);
    } catch (err) {
        console.error('Create client error:', err.message);
        res.status(500).json({ error: 'Failed to create client' });
    }
});

// PATCH /api/clients/:id
router.patch('/:id', (req, res) => {
    const db = readDb();
    const idx = db.clients.findIndex(c => c.id === req.params.id);
    if (idx === -1) return res.status(404).json({ error: 'Client not found' });
    db.clients[idx] = { ...db.clients[idx], ...req.body };
    writeDb(db);
    res.json(db.clients[idx]);
});

export default router;
