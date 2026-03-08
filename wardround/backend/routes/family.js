/**
 * Family routes:
 *   GET  /api/family/summaries?clientId=...  — fetch nightly summaries for a client
 *   POST /api/family/draft { clientId, context? }  — manual draft (coordinator)
 *
 * Manual trigger for nightly summaries is at POST /api/debug/family-summaries (debug.js).
 */

import express from 'express';
import * as backboard from '../services/backboard.js';
import { getClientThread, setClientThread, getClientById, getFamilySummaries } from '../db.js';

const router = express.Router();

// Default family contacts for new threads (overridden per-client via client.family_members if set)
const DEFAULT_FAMILY_MEMBERS = [
    { name: 'Linda', role: 'daughter (primary contact)', tone: 'warm and detailed' },
    { name: 'David', role: 'son (power of attorney)', tone: 'concise and factual' },
];

// ── GET /api/family/summaries?clientId=... ────────────────────────────────────
router.get('/summaries', async (req, res) => {
    try {
        const { clientId } = req.query;
        if (!clientId) return res.status(400).json({ error: 'clientId query param required' });

        const summaries = await getFamilySummaries(clientId, 30);
        res.json({ clientId, summaries });
    } catch (err) {
        console.error('[family/summaries] error:', err);
        res.status(500).json({ error: err.message || 'Failed to fetch summaries' });
    }
});

router.post('/draft', async (req, res) => {
    try {
        const { clientId, context } = req.body || {};
        if (!clientId) {
            return res.status(400).json({ error: 'clientId required' });
        }

        const assistantId = backboard.getAssistantId('family');
        if (!assistantId) {
            return res.status(503).json({ error: 'Family agent not configured — set BACKBOARD_FAMILY_AGENT_ID' });
        }

        const client = await getClientById(clientId);
        if (!client) {
            return res.status(404).json({ error: 'Client not found' });
        }

        // Get or provision a persistent family thread
        let threadId = await getClientThread(clientId, 'family');
        const isNewThread = !threadId;

        // Use per-client family members if the client record has them, else defaults
        const familyMembers = client.family_members
            ? JSON.parse(client.family_members)
            : DEFAULT_FAMILY_MEMBERS;

        if (isNewThread) {
            const created = await backboard.createThread(assistantId);
            threadId = created.thread_id;
            await setClientThread(clientId, 'family', threadId);

            // Seed family profiles into memory so all future drafts have context
            const familyProfile = [
                `FAMILY CONTACTS for ${client.name}:`,
                ...familyMembers.map(m => `- ${m.name}: ${m.role}`),
                '',
                'Always address each message to the correct family member by name.',
                'Keep messages professional, empathetic, and focused on the client\'s wellbeing.',
            ].join('\n');

            await backboard.writeMemory(threadId, familyProfile);

            // Also write the client's care context if available
            if (client.conditions || client.medications || client.notes) {
                const careContext = [
                    `CARE CONTEXT for ${client.name}:`,
                    client.conditions ? `Conditions: ${client.conditions}` : null,
                    client.medications ? `Medications: ${client.medications}` : null,
                    client.notes ? `Notes: ${client.notes}` : null,
                ].filter(Boolean).join('\n');
                await backboard.writeMemory(threadId, careContext);
            }
        }

        // Generate one draft per family member
        const extraContext = context ? `\n\nAdditional context for today: ${context}` : '';

        const drafts = await Promise.all(
            familyMembers.map(async (member) => {
                const prompt = [
                    `Draft a ${member.tone} message addressed to ${member.name} (${member.role}).`,
                    `The message should update them on ${client.name}'s recent care and wellbeing.`,
                    'Keep it under 150 words. Sign off as "The WardRound Care Team".',
                    extraContext,
                ].filter(Boolean).join(' ');

                const { content } = await backboard.runAgent(threadId, prompt);
                return { recipient: member.name, role: member.role, message: content };
            })
        );

        res.json({ clientId, clientName: client.name, drafts });
    } catch (err) {
        console.error('[family/draft] error:', err);
        res.status(500).json({ error: err.message || 'Failed to generate drafts' });
    }
});

export default router;
