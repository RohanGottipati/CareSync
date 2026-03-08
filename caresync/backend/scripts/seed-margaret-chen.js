/**
 * Seed script: Margaret Chen demo profile
 *
 * Creates:
 *   - Client "Margaret Chen" with realistic profile
 *   - 3 weeks of visit history (varied session types, notes, moods)
 *   - Family members Linda (daughter) and David (son) via family_members field
 *   - Sentinel flag with realistic medication concern
 *   - Document metadata entry for a care plan PDF
 *   - Several family daily summaries to show in the portal
 *
 * Run from the caresync/backend directory:
 *   node scripts/seed-margaret-chen.js
 */

import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: join(__dirname, '../.env') });

// Dynamic import so the pool is created after dotenv has set process.env
const { pool } = await import('../db.js');

const MARGARET_PROFILE = {
    name: 'Margaret Chen',
    date_of_birth: '1942-03-15',
    conditions: 'Type 2 Diabetes, Early-stage Vascular Dementia, Hypertension, Osteoarthritis (knees)',
    medications: 'Metformin 500mg (twice daily), Donepezil 10mg (nightly), Lisinopril 10mg (morning), Amlodipine 5mg (morning), Acetaminophen 500mg (PRN for pain)',
    notes: 'Margaret prefers routine. Responds well to gentle reminders. Enjoys listening to classical music and feeding birds on the balcony. Daughter Linda Chen (416-555-0182) is primary contact. Son David Chen (416-555-0173) holds POA. Allergic to penicillin. Keep environment low-stimulation in the evenings to reduce sundowning.',
    family_members: JSON.stringify([
        { name: 'Linda', role: 'daughter (primary contact)', tone: 'warm and detailed', email: 'linda.chen@example.com' },
        { name: 'David', role: 'son (power of attorney)', tone: 'concise and factual', email: 'david.chen@example.com' },
    ]),
};

const SESSION_TYPES = ['Morning', 'Afternoon', 'Evening', 'Medication round', 'Personal care'];

const VISIT_TEMPLATES = [
    {
        session_type: 'Morning',
        notes: 'Medications given: Metformin 500mg, Lisinopril 10mg, Amlodipine 5mg. Mood: Good. Margaret was alert and ate a full breakfast. Blood pressure 128/82. Assisted with morning hygiene and dressing. She mentioned her knees were sore — applied heat pack. No concerns.',
        mood: 'Good',
    },
    {
        session_type: 'Afternoon',
        notes: 'Arrived at 1:30 PM. Margaret had lunch (half portion). Mood: Calm. Assisted with short walk to balcony — she enjoyed feeding the pigeons. Mild confusion around 3 PM — re-oriented her to day/time gently. Temperature 36.8°C.',
        mood: 'Calm',
    },
    {
        session_type: 'Evening',
        notes: 'Medications given: Metformin 500mg, Donepezil 10mg. Prepared light dinner (soup and toast). Margaret was slightly agitated at bedtime — played Chopin softly which helped her settle. Assisted with evening hygiene. Weight 58.4 kg. Sundowning was mild tonight.',
        mood: 'Anxious',
    },
    {
        session_type: 'Medication round',
        notes: 'Confirmed Metformin 500mg administered with food. Blood glucose reading: 7.2 mmol/L (within target range). Margaret cooperative. Blood pressure 132/84. No adverse reactions noted. Reminded about fluid intake.',
        mood: 'Calm',
    },
    {
        session_type: 'Personal care',
        notes: 'Assisted with bath and personal care. Skin in good condition — no pressure areas noted. Margaret was talkative and in good spirits — spoke about her garden. Changed bed linen. Toe nails observed to be long; noted for podiatry referral.',
        mood: 'Good',
    },
    {
        session_type: 'Morning',
        notes: 'Medications given: Metformin 500mg, Lisinopril 10mg, Amlodipine 5mg. Margaret slept poorly overnight per her report — slightly fatigued. Ate half of breakfast. BP 142/88 — slightly elevated; noted for coordinator review. Assisted with hygiene.',
        mood: 'Withdrawn',
    },
    {
        session_type: 'Evening',
        notes: 'Medications given: Metformin 500mg, Donepezil 10mg. Dinner eaten in full — good appetite today. Reminisced about her late husband during visit; emotional but composed. Assisted with bedtime routine. No incidents. Vitals stable.',
        mood: 'Calm',
    },
    {
        session_type: 'Morning',
        notes: 'Medications given: Metformin 500mg, Lisinopril 10mg, Amlodipine 5mg. Margaret asked about Linda — reminded her Linda visited last Sunday. Mood improved after reassurance. Blood glucose 8.1 mmol/L — borderline high; flagged for review. Temperature 37.1°C.',
        mood: 'Good',
    },
    {
        session_type: 'Afternoon',
        notes: 'Margaret was found sitting in the hallway looking confused — redirected back to apartment gently. She settled quickly with music. No fall or injury. Flagged wandering episode for care plan review. Mood stable after redirection. Called Linda to inform.',
        mood: 'Anxious',
    },
    {
        session_type: 'Medication round',
        notes: 'Metformin 500mg administered with afternoon snack. Client mentioned she did not take her morning Lisinopril — confirmed pill not in organiser. Administered Lisinopril 10mg now. Blood pressure 138/86. Reported to coordinator.',
        mood: 'Calm',
    },
    {
        session_type: 'Morning',
        notes: 'Medications given: Metformin 500mg, Lisinopril 10mg, Amlodipine 5mg. Good night reported. Margaret was cheerful — remembered Linda was coming to visit. Full breakfast eaten. BP 126/80 — excellent. Assisted with dressing. No concerns.',
        mood: 'Good',
    },
    {
        session_type: 'Evening',
        notes: 'Medications given: Metformin 500mg, Donepezil 10mg. Family visit (Linda) today — Margaret in excellent spirits. Dinner eaten in full. Minimal sundowning. Linda raised concern about increasing confusion on some afternoons — documented for care team.',
        mood: 'Good',
    },
    {
        session_type: 'Personal care',
        notes: 'Personal care completed. Small area of redness noted on left heel — padded and elevated; reported to coordinator. Margaret tolerated care well. New compression stockings applied per care plan. Acetaminophen 500mg given for knee pain.',
        mood: 'Calm',
    },
    {
        session_type: 'Morning',
        notes: 'Medications given: Metformin 500mg, Lisinopril 10mg, Amlodipine 5mg. Margaret was confused about the day of week — re-oriented with calendar. Ate breakfast slowly but finished. BP 130/82. Expressed sadness about missing her garden — validated feelings.',
        mood: 'Withdrawn',
    },
    {
        session_type: 'Afternoon',
        notes: 'Arrived to find Margaret napping — allowed rest until 2:30 PM. Offered afternoon snack (yogurt and crackers). Good appetite. Walked to common room for 20 minutes — socialized with neighbour. Mood much improved after outing. Temperature 36.9°C.',
        mood: 'Good',
    },
];

const FAMILY_SUMMARIES = [
    {
        daysAgo: 1,
        text: `Dear Linda and David,\n\nWe are pleased to share that Margaret had a settled and comfortable day yesterday. She enjoyed her meals, and her morning walk to the balcony to feed the birds brought her great joy. Her vitals were stable throughout the day, and her evening routine went smoothly with only mild agitation, which was quickly resolved with her favourite music.\n\nThank you for your continued trust in our care.\n\nWarm regards,\nThe CareSync Care Team`,
    },
    {
        daysAgo: 2,
        text: `Dear Linda and David,\n\nYesterday was a positive day for Margaret. She was alert and in good spirits during both morning and afternoon visits. Her blood glucose was within target range, and her blood pressure readings were reassuring. She spoke warmly about family and enjoyed a full dinner.\n\nWe remain attentive to her comfort and wellbeing.\n\nWarm regards,\nThe CareSync Care Team`,
    },
    {
        daysAgo: 3,
        text: `Dear Linda and David,\n\nWe wanted to update you that Margaret had a slightly fatigued morning but improved significantly through the afternoon. She participated in a short social outing to the common room and interacted warmly with her neighbour. Her appetite was good and all medications were administered as scheduled.\n\nPlease don't hesitate to reach out with any questions.\n\nWarm regards,\nThe CareSync Care Team`,
    },
    {
        daysAgo: 5,
        text: `Dear Linda and David,\n\nMargaret's day was broadly positive, though we did observe a brief period of afternoon confusion. She was gently re-oriented and quickly settled with familiar music. There were no falls or safety incidents. We have noted this pattern for the care team's review.\n\nThank you for your partnership in her care.\n\nWarm regards,\nThe CareSync Care Team`,
    },
    {
        daysAgo: 7,
        text: `Dear Linda and David,\n\nWe are pleased to report that the day following your visit, Margaret was in excellent spirits. She spoke fondly of the visit and her engagement and appetite were notably improved. All medications were administered as planned and her blood pressure was particularly good.\n\nThank you both for your warm visits — they mean so much to her.\n\nWarm regards,\nThe CareSync Care Team`,
    },
];

const SENTINEL_FLAG = {
    status: 'FLAGGED',
    summary_text: `Margaret Chen — FLAGGED\n\nConcern: Lisinopril 10mg was missed during morning medication round on one occasion this week (client self-reported; not in pill organiser). Dose was administered later in the day. Blood pressure reading of 142/88 noted the same morning — potentially related.\n\nAdditionally, blood glucose of 8.1 mmol/L recorded (above target range of ≤7.8 mmol/L). Monitor closely over next 48 hours.\n\nRecommendation: Review medication administration schedule; consider locked pill organiser. Family notified. Coordinator follow-up advised.`,
};

async function seedMargaret() {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        // Check if Margaret Chen already exists
        const existing = await client.query(
            `SELECT id FROM clients WHERE name = 'Margaret Chen' LIMIT 1`
        );
        let margaretId;
        if (existing.rows.length > 0) {
            margaretId = existing.rows[0].id;
            console.log(`Margaret Chen already exists (id: ${margaretId}). Updating profile…`);
            await client.query(
                `UPDATE clients SET
                    date_of_birth = $1, conditions = $2, medications = $3,
                    notes = $4, family_members = $5
                 WHERE id = $6`,
                [
                    MARGARET_PROFILE.date_of_birth,
                    MARGARET_PROFILE.conditions,
                    MARGARET_PROFILE.medications,
                    MARGARET_PROFILE.notes,
                    MARGARET_PROFILE.family_members,
                    margaretId,
                ]
            );
        } else {
            const result = await client.query(
                `INSERT INTO clients (name, date_of_birth, conditions, medications, notes, family_members)
                 VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
                [
                    MARGARET_PROFILE.name,
                    MARGARET_PROFILE.date_of_birth,
                    MARGARET_PROFILE.conditions,
                    MARGARET_PROFILE.medications,
                    MARGARET_PROFILE.notes,
                    MARGARET_PROFILE.family_members,
                ]
            );
            margaretId = result.rows[0].id;
            console.log(`Created Margaret Chen (id: ${margaretId})`);
        }

        // Remove existing visits for clean demo
        await client.query(`DELETE FROM visits WHERE client_id = $1`, [margaretId]);

        // Insert 3 weeks of visits (2–3 per day, spread across 21 days)
        const now = new Date();
        let visitCount = 0;
        for (let daysAgo = 21; daysAgo >= 0; daysAgo--) {
            const visitsOnDay = daysAgo === 0 ? 1 : (daysAgo % 3 === 0 ? 2 : 3);
            for (let v = 0; v < visitsOnDay; v++) {
                const template = VISIT_TEMPLATES[(visitCount) % VISIT_TEMPLATES.length];
                const visitDate = new Date(now);
                visitDate.setDate(visitDate.getDate() - daysAgo);
                visitDate.setHours(8 + v * 5 + Math.floor(Math.random() * 2), Math.floor(Math.random() * 45));

                await client.query(
                    `INSERT INTO visits (client_id, psw_user_id, notes, session_type, logged_at)
                     VALUES ($1, 'seed-psw-user', $2, $3, $4)`,
                    [margaretId, template.notes, template.session_type, visitDate.toISOString()]
                );
                visitCount++;
            }
        }
        console.log(`Inserted ${visitCount} visit records.`);

        // Sentinel flag
        await client.query(
            `INSERT INTO client_sentinel_results (client_id, status, summary_text, checked_at)
             VALUES ($1, $2, $3, NOW())
             ON CONFLICT (client_id) DO UPDATE
               SET status = EXCLUDED.status,
                   summary_text = EXCLUDED.summary_text,
                   checked_at = NOW()`,
            [margaretId, SENTINEL_FLAG.status, SENTINEL_FLAG.summary_text]
        );
        console.log('Sentinel flag seeded.');

        // Family daily summaries
        await client.query(`DELETE FROM family_daily_summaries WHERE client_id = $1`, [margaretId]);
        for (const s of FAMILY_SUMMARIES) {
            const d = new Date(now);
            d.setDate(d.getDate() - s.daysAgo);
            const dateStr = d.toISOString().slice(0, 10);
            await client.query(
                `INSERT INTO family_daily_summaries (client_id, summary_date, summary_text)
                 VALUES ($1, $2, $3) ON CONFLICT DO NOTHING`,
                [margaretId, dateStr, s.text]
            );
        }
        console.log(`Inserted ${FAMILY_SUMMARIES.length} family daily summaries.`);

        // Document metadata (care plan PDF)
        await client.query(`DELETE FROM documents WHERE client_id = $1 AND filename = 'margaret-chen-care-plan.pdf'`, [margaretId]);
        await client.query(
            `INSERT INTO documents (client_id, filename, storage_key, storage_url, uploaded_by, uploaded_at)
             VALUES ($1, $2, $3, $4, $5, NOW() - INTERVAL '5 days')`,
            [
                margaretId,
                'margaret-chen-care-plan.pdf',
                `clients/${margaretId}/care-plan.pdf`,
                null,
                'seed-coordinator',
            ]
        );
        console.log('Care plan document metadata seeded.');

        await client.query('COMMIT');
        console.log('\nDone! Margaret Chen demo profile is ready.');
        console.log(`Client ID: ${margaretId}`);
    } catch (err) {
        await client.query('ROLLBACK');
        console.error('Seed failed:', err.message);
        process.exit(1);
    } finally {
        client.release();
        await pool.end();
    }
}

seedMargaret();
