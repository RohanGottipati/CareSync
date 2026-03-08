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

/** Return a YYYY-MM-DD string from a Date or existing date string/object, using local time. */
function toYYYYMMDD(value) {
    if (!value) return null;
    if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
    const d = new Date(value);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
}

/** Generate a YYYY-MM-DD date for `daysAgo` days before today. */
function daysAgo(n) {
    const d = new Date();
    d.setDate(d.getDate() - n);
    return toYYYYMMDD(d);
}

/** Mock family summaries for Margaret Chen demo. Keyed to today's date so dates are always current. */
const MARGARET_MOCK_SUMMARIES = [
    {
        id: 'mock-summary-1',
        summary_date: daysAgo(1),
        summary_text: `Dear Linda and David,\n\nWe are pleased to share that Margaret had a settled and comfortable day yesterday. She enjoyed her meals, and her morning walk to the balcony to feed the birds brought her great joy. Her vitals were stable throughout the day, and her evening routine went smoothly with only mild agitation, which was quickly resolved with her favourite music.\n\nThank you for your continued trust in our care.\n\nWarm regards,\nThe CareSync Care Team`,
    },
    {
        id: 'mock-summary-2',
        summary_date: daysAgo(2),
        summary_text: `Dear Linda and David,\n\nYesterday was a positive day for Margaret. She was alert and in good spirits during both morning and afternoon visits. Her blood glucose was within target range, and her blood pressure readings were reassuring. She spoke warmly about family and enjoyed a full dinner.\n\nWe remain attentive to her comfort and wellbeing.\n\nWarm regards,\nThe CareSync Care Team`,
    },
    {
        id: 'mock-summary-3',
        summary_date: daysAgo(3),
        summary_text: `Dear Linda and David,\n\nWe wanted to update you that Margaret had a slightly fatigued morning but improved significantly through the afternoon. She participated in a short social outing to the common room and interacted warmly with her neighbour. Her appetite was good and all medications were administered as scheduled.\n\nPlease don't hesitate to reach out with any questions.\n\nWarm regards,\nThe CareSync Care Team`,
    },
    {
        id: 'mock-summary-4',
        summary_date: daysAgo(5),
        summary_text: `Dear Linda and David,\n\nMargaret's day was broadly positive, though we did observe a brief period of afternoon confusion. She was gently re-oriented and quickly settled with familiar music. There were no falls or safety incidents. We have noted this pattern for the care team's review.\n\nThank you for your partnership in her care.\n\nWarm regards,\nThe CareSync Care Team`,
    },
    {
        id: 'mock-summary-5',
        summary_date: daysAgo(7),
        summary_text: `Dear Linda and David,\n\nWe are pleased to report that the day following your visit, Margaret was in excellent spirits. She spoke fondly of the visit and her engagement and appetite were notably improved. All medications were administered as planned and her blood pressure was particularly good.\n\nThank you both for your warm visits — they mean so much to her.\n\nWarm regards,\nThe CareSync Care Team`,
    },
];

/** Mock family summaries for John Stone demo. */
const JOHN_MOCK_SUMMARIES = [
    {
        id: 'mock-john-1',
        summary_date: daysAgo(1),
        summary_text: `Dear Susan and Rachel,\n\nWe are pleased to share that John had a positive and settled day yesterday. His morning Levodopa was administered on schedule and his motor function was noticeably improved throughout the visit. He completed his physiotherapy exercises with good effort and enjoyed his meals in full. His spirits were high — he spoke warmly about Rachel's recent call.\n\nThank you for your continued trust in our care.\n\nWarm regards,\nThe CareSync Care Team`,
    },
    {
        id: 'mock-john-2',
        summary_date: daysAgo(2),
        summary_text: `Dear Susan and Rachel,\n\nJohn had a steady day yesterday. His morning and afternoon visits went smoothly, with all medications administered on time. We did note mild fatigue in the afternoon, which we attributed to a less restful night. His COPD inhaler technique was reviewed and corrected. His appetite was good and he was in a reflective, calm mood.\n\nWe remain attentive to his comfort and wellbeing.\n\nWarm regards,\nThe CareSync Care Team`,
    },
    {
        id: 'mock-john-3',
        summary_date: daysAgo(3),
        summary_text: `Dear Susan and Rachel,\n\nWe wanted to update you that John experienced a brief 'off' period in the afternoon — a known feature of his Parkinson's medication cycle — which caused some stiffness. His care team managed this attentively and he was comfortable by the evening visit. His blood glucose was within target range and there were no falls or safety incidents.\n\nPlease don't hesitate to reach out with any questions.\n\nWarm regards,\nThe CareSync Care Team`,
    },
    {
        id: 'mock-john-4',
        summary_date: daysAgo(5),
        summary_text: `Dear Susan and Rachel,\n\nJohn had a particularly good day — his morning mobility was the best we have seen in some time, and he was in bright spirits throughout. He completed his full set of physiotherapy exercises independently and enjoyed a full dinner. His blood pressure reading was excellent at 130/82. Susan, your presence during the afternoon visit clearly lifted his mood.\n\nThank you for your partnership in his care.\n\nWarm regards,\nThe CareSync Care Team`,
    },
    {
        id: 'mock-john-5',
        summary_date: daysAgo(7),
        summary_text: `Dear Susan and Rachel,\n\nWe are glad to report that John had a comfortable and uneventful day. All medications were administered as scheduled and his COPD symptoms were minimal. He was talkative during his personal care session, sharing stories about his career as a civil engineer — a very positive sign of engagement and wellbeing. No concerns to report.\n\nThank you both for your continued involvement in John's care.\n\nWarm regards,\nThe CareSync Care Team`,
    },
];

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

        let summaries = await getFamilySummaries(clientId, 30);

        // Normalise summary_date to YYYY-MM-DD so the frontend never gets a UTC-shifted timestamp
        summaries = summaries.map(s => ({
            ...s,
            summary_date: toYYYYMMDD(s.summary_date),
        }));

        // For demo / sparse data: inject mock summaries for known demo clients when real data is thin.
        if (summaries.length < 3) {
            try {
                const client = await getClientById(clientId);
                const nameLower = client?.name?.toLowerCase() ?? '';
                let mockPool = null;
                if (nameLower.includes('margaret')) mockPool = MARGARET_MOCK_SUMMARIES;
                else if (nameLower.includes('john stone') || nameLower.includes('john')) mockPool = JOHN_MOCK_SUMMARIES;

                if (mockPool) {
                    const realDates = new Set(summaries.map(s => s.summary_date));
                    const mockToAdd = mockPool.filter(m => !realDates.has(m.summary_date));
                    summaries = [...summaries, ...mockToAdd];
                    summaries.sort((a, b) => (a.summary_date < b.summary_date ? 1 : -1));
                }
            } catch {
                // non-fatal — just return what we have
            }
        }

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
                    'Keep it under 150 words. Sign off as "The CareSync Care Team".',
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
