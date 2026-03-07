/**
 * Family Comms Agent: draft two messages to family members.
 * POST /api/family/draft { clientId, context? }
 *
 * On the first call for a client, seeds two family member profiles
 * into the thread memory so the agent has realistic context.
 *
 * Returns:
 *   { clientId, drafts: [{ recipient, role, message }, ...] }
 */

import express from 'express';
import * as backboard from '../services/backboard.js';
import { getClientThread, setClientThread, getClientById } from '../db.js';

const router = express.Router();

// Two default family contacts seeded into every new family thread
const FAMILY_MEMBERS = [
    { name: 'Margaret', role: 'daughter (primary contact)', tone: 'warm and detailed' },
    { name: 'James', role: 'son (power of attorney)', tone: 'concise and factual' },
];

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

        if (isNewThread) {
            const created = await backboard.createThread(assistantId);
            threadId = created.thread_id;
            await setClientThread(clientId, 'family', threadId);

            // Seed family profiles into memory so all future drafts have context
            const familyProfile = [
                `FAMILY CONTACTS for ${client.name}:`,
                ...FAMILY_MEMBERS.map(m => `- ${m.name}: ${m.role}`),
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
            FAMILY_MEMBERS.map(async (member) => {
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
