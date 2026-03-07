import express from 'express';
import { writeMemory } from '../services/backboard.js';
import { readDb, writeDb } from '../db.js';

const router = express.Router();

// POST /api/visits — logs a visit and writes to Backboard memory
router.post('/', async (req, res) => {
    try {
        const { clientId, medicationsGiven, observations, mood, pswName } = req.body;
        const db = readDb();
        const client = db.clients.find(c => c.id === clientId);
        if (!client) return res.status(404).json({ error: 'Client not found' });

        const visitLog = {
            id: Date.now().toString(),
            clientId,
            pswName,
            timestamp: new Date().toISOString(),
            medicationsGiven,
            observations,
            mood
        };

        // Store in local JSON DB
        db.visits.push(visitLog);
        writeDb(db);

        // Write structured note into Backboard memory thread
        const memoryContent = `VISIT LOG ${new Date().toDateString()}
PSW: ${pswName}
Medications given: ${medicationsGiven || 'None logged'}
Observations: ${observations || 'None'}
Mood: ${mood || 'Not noted'}`;

        await writeMemory(client.backboard_thread_id, memoryContent);

        res.json({ success: true, visitId: visitLog.id });
    } catch (err) {
        console.error('Visit log error:', err.message);
        res.status(500).json({ error: 'Failed to log visit' });
    }
});

export default router;
