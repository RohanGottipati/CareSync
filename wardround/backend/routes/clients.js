/**
 * Clients & Assignments — coordinator only (except GET /my-clients for PSWs).
 *
 * Coordinator routes:
 *   GET    /api/clients                    — list all clients
 *   POST   /api/clients                    — create a client + seed Backboard thread
 *   PUT    /api/clients/:id                — update a client
 *   DELETE /api/clients/:id                — remove a client
 *   GET    /api/clients/assignments/all    — list all assignments
 *   POST   /api/clients/assignments        — assign a PSW to a client for a shift
 *   DELETE /api/clients/assignments/:id    — remove an assignment
 *
 * PSW route:
 *   GET    /api/clients/my-clients         — list clients assigned to the logged-in PSW right now
 */

import express from 'express';
import {
    getAllClients,
    getClientById,
    createClient,
    updateClient,
    deleteClient,
    setClientThread,
    createAssignment,
    getAllAssignments,
    getCurrentAndUpcomingAssignmentsForPsw,
    deleteAssignment,
    getSentinelResult,
} from '../db.js';
import { requireRole } from '../middleware/auth.js';
import { getAssistantId, createThread, writeMemory } from '../services/backboard.js';

const router = express.Router();

// ── PSW: get my current and upcoming assigned clients ────────────────────────
router.get('/my-clients', requireRole('psw', 'coordinator'), async (req, res) => {
    try {
        const assignments = await getCurrentAndUpcomingAssignmentsForPsw(req.user.id);
        res.json({ clients: assignments });
    } catch (err) {
        console.error('my-clients error:', err);
        res.status(500).json({ error: err.message });
    }
});

// ── List all clients (coordinator + family view) ──────────────────────────────
router.get('/', requireRole('coordinator', 'family'), async (req, res) => {
    try {
        const clients = await getAllClients();
        res.json({ clients });
    } catch (err) {
        console.error('GET /clients error:', err);
        res.status(500).json({ error: err.message });
    }
});

// ── Sentinel result for a single client (PSW + coordinator) ───────────────────
router.get('/:id/sentinel', requireRole('psw', 'coordinator'), async (req, res) => {
    try {
        const result = await getSentinelResult(req.params.id);
        res.json({ sentinel: result || null });
    } catch (err) {
        console.error('GET /clients/:id/sentinel error:', err);
        res.status(500).json({ error: err.message });
    }
});

// ── Coordinator: get single client ────────────────────────────────────────────
router.get('/:id', requireRole('coordinator'), async (req, res) => {
    try {
        const client = await getClientById(req.params.id);
        if (!client) return res.status(404).json({ error: 'Client not found' });
        res.json({ client });
    } catch (err) {
        console.error('GET /clients/:id error:', err);
        res.status(500).json({ error: err.message });
    }
});

// ── Coordinator: create client + provision Backboard thread ───────────────────
router.post('/', requireRole('coordinator'), async (req, res) => {
    try {
        const { name, dateOfBirth, medications, conditions, notes } = req.body || {};
        if (!name) return res.status(400).json({ error: 'name required' });

        // 1. Save client record to Postgres
        const client = await createClient({ name, dateOfBirth, medications, conditions, notes });

        // 2. Provision a Backboard handoff thread for this client
        const assistantId = getAssistantId('handoff');
        if (assistantId) {
            try {
                const { thread_id: threadId } = await createThread(assistantId);
                await setClientThread(client.id, 'handoff', threadId);

                // 3. Seed the thread memory with the client profile
                const profileMemory = [
                    `CLIENT PROFILE — ${name}`,
                    dateOfBirth ? `Date of Birth: ${dateOfBirth}` : null,
                    conditions ? `Conditions: ${conditions}` : null,
                    medications ? `Medications: ${medications}` : null,
                    notes ? `Care Notes: ${notes}` : null,
                ]
                    .filter(Boolean)
                    .join('\n');

                await writeMemory(threadId, profileMemory);
            } catch (backboardErr) {
                // Non-fatal: log but still return the created client
                console.warn('[clients] Backboard seeding failed (non-fatal):', backboardErr.message);
            }
        }

        res.status(201).json({ client });
    } catch (err) {
        console.error('POST /clients error:', err);
        res.status(500).json({ error: err.message });
    }
});

// ── Coordinator: update client ────────────────────────────────────────────────
router.put('/:id', requireRole('coordinator'), async (req, res) => {
    try {
        const { name, dateOfBirth, medications, conditions, notes } = req.body || {};
        if (!name) return res.status(400).json({ error: 'name required' });
        const client = await updateClient(req.params.id, { name, dateOfBirth, medications, conditions, notes });
        if (!client) return res.status(404).json({ error: 'Client not found' });
        res.json({ client });
    } catch (err) {
        console.error('PUT /clients/:id error:', err);
        res.status(500).json({ error: err.message });
    }
});

// ── Coordinator: delete client ────────────────────────────────────────────────
router.delete('/:id', requireRole('coordinator'), async (req, res) => {
    try {
        await deleteClient(req.params.id);
        res.json({ message: 'Client removed' });
    } catch (err) {
        console.error('DELETE /clients/:id error:', err);
        res.status(500).json({ error: err.message });
    }
});

// ── Coordinator: list all assignments ─────────────────────────────────────────
router.get('/assignments/all', requireRole('coordinator'), async (req, res) => {
    try {
        const assignments = await getAllAssignments();
        res.json({ assignments });
    } catch (err) {
        console.error('GET /clients/assignments error:', err);
        res.status(500).json({ error: err.message });
    }
});

// ── Coordinator: assign PSW to client for a shift ─────────────────────────────
router.post('/assignments', requireRole('coordinator'), async (req, res) => {
    try {
        const { clientId, pswUserId, shiftStart, shiftEnd } = req.body || {};
        if (!clientId || !pswUserId || !shiftStart || !shiftEnd) {
            return res.status(400).json({ error: 'clientId, pswUserId, shiftStart, shiftEnd required' });
        }
        // Normalise to UTC ISO so stored times match coordinator's intended local time
        const startUtc = new Date(shiftStart).toISOString();
        const endUtc = new Date(shiftEnd).toISOString();
        const assignment = await createAssignment({
            clientId,
            pswUserId,
            shiftStart: startUtc,
            shiftEnd: endUtc,
            setBy: req.user.id,
        });
        res.status(201).json({ assignment });
    } catch (err) {
        console.error('POST /clients/assignments error:', err);
        res.status(500).json({ error: err.message });
    }
});

// ── Coordinator: delete assignment ────────────────────────────────────────────
router.delete('/assignments/:id', requireRole('coordinator'), async (req, res) => {
    try {
        await deleteAssignment(req.params.id);
        res.json({ message: 'Assignment removed' });
    } catch (err) {
        console.error('DELETE /clients/assignments/:id error:', err);
        res.status(500).json({ error: err.message });
    }
});

export default router;
