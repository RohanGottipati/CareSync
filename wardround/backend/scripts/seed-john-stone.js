/**
 * Seed script: John Stone demo profile
 *
 * Creates:
 *   - Client "John Stone" with realistic profile (distinct from Margaret Chen)
 *   - 3 weeks of visit history (varied session types, notes)
 *   - Family members Susan (wife, primary contact) and Rachel (daughter) via family_members field
 *   - Sentinel flag with realistic Parkinson's / medication concern
 *   - Document metadata entry for a physiotherapy care plan PDF
 *   - Several family daily summaries to show in the portal
 *
 * Run from the wardround/backend directory:
 *   node scripts/seed-john-stone.js
 */

import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: join(__dirname, '../.env') });

const { pool } = await import('../db.js');

const JOHN_PROFILE = {
    name: 'John Stone',
    date_of_birth: '1947-09-04',
    conditions: "Parkinson's Disease (Stage 3), COPD (moderate), Type 2 Diabetes, Chronic Lower Back Pain, Mild Anxiety",
    medications: "Levodopa/Carbidopa 100/25mg (three times daily), Pramipexole 0.5mg (twice daily), Tiotropium inhaler (once daily), Metformin 850mg (twice daily), Sertraline 50mg (morning), Baclofen 10mg (PRN for back spasms)",
    notes: "John requires fall precautions at all times — Parkinson's significantly affects gait and balance. Uses a rollator walker indoors. Wife Susan (416-555-0241) is primary contact and visits daily. Daughter Rachel (416-555-0198) is alternate contact. Levodopa timing is critical — must be taken 30 min before meals for optimal effect. COPD inhaler use needs monitoring; John sometimes forgets morning dose. Prefers news radio in the background. Responds poorly to rushed interactions — allow extra time. No known drug allergies.",
    family_members: JSON.stringify([
        { name: 'Susan', role: 'wife (primary contact)', tone: 'warm and detailed', email: 'susan.stone@example.com' },
        { name: 'Rachel', role: 'daughter (alternate contact)', tone: 'concise and practical', email: 'rachel.stone@example.com' },
    ]),
};

const VISIT_TEMPLATES = [
    {
        session_type: 'Morning',
        notes: "Medications given: Levodopa/Carbidopa 100/25mg, Pramipexole 0.5mg, Tiotropium inhaler, Metformin 850mg, Sertraline 50mg. Levodopa administered 30 min prior to breakfast as per care plan. John was alert and cooperative. Assisted with morning hygiene and dressing — took approximately 35 min due to Parkinson's motor symptoms. Gait assessed: shuffling gait present, rollator used throughout. No falls. Breakfast eaten in full. Blood glucose 8.4 mmol/L.",
    },
    {
        session_type: 'Afternoon',
        notes: "Arrived at 1:15 PM. Levodopa/Carbidopa dose administered before lunch. John was in good spirits — listening to the radio. Assisted with light stretching exercises as directed by physiotherapist. Mild hand tremors observed but manageable. Lunch eaten well (80%). Checked inhaler technique — improper grip noted; corrected and demonstrated correct use. BP 138/86.",
    },
    {
        session_type: 'Evening',
        notes: "Levodopa/Carbidopa and Metformin 850mg administered with dinner. John reported feeling stiff since mid-afternoon — 'off' period between Levodopa doses noted. Baclofen 10mg given for lower back discomfort. Assisted with evening hygiene and transfer to bed. Reminder set for Susan re: morning inhaler. Temperature 36.7°C. John was calm and settled by 9 PM.",
    },
    {
        session_type: 'Medication round',
        notes: "Mid-day medication check. Levodopa/Carbidopa confirmed administered with appropriate food-timing window. Blood glucose 7.9 mmol/L — within target. John reports Sertraline feels like it's helping his mood this week. Reviewed PRN Baclofen use — used twice yesterday for back pain; flagged for coordinator review to assess if scheduled dosing is warranted. BP 136/84.",
    },
    {
        session_type: 'Personal care',
        notes: "Full personal care session: shower (seated shower chair used), skin integrity check — no pressure areas, lower legs show mild oedema, compression stockings applied. Hair washed and dried. John tolerated care well but required two rest breaks due to fatigue. He was talkative today — discussed his career as a civil engineer with fondness. Nail check: due for podiatry. Changed bed linen.",
    },
    {
        session_type: 'Morning',
        notes: "Morning medications administered. Tiotropium inhaler forgotten by John overnight per his report — administered now and documented. John was visibly fatigued — had disrupted sleep (reported vivid dreams, which can be a side effect of Pramipexole). Assisted with hygiene; balance notably reduced this morning. Extra fall-precaution measures taken. Breakfast: half portion. Flagged sleep disruption for coordinator review.",
    },
    {
        session_type: 'Afternoon',
        notes: "Levodopa dose administered on schedule. John in moderate spirits. Physiotherapy home exercise program completed with supervision — hip flexor stretches and seated balance exercises. He struggled with the balance exercises today; noted for physio team. Susan present for part of the visit — expressed concern about John's fatigue. Documented and informed coordinator. Fluids encouraged — intake below target.",
    },
    {
        session_type: 'Evening',
        notes: "Evening medications administered with dinner. John ate a full meal — good appetite this evening. Assisted with bedtime routine. His COPD was notably symptomatic — mild wheeze on exhalation. Tiotropium was taken correctly today. BP 142/88 — slightly elevated; documented. John settled comfortably. Susan remained present and was briefed on tomorrow's care plan.",
    },
    {
        session_type: 'Morning',
        notes: "All morning medications administered correctly and on time. John reported feeling 'much better than yesterday' — motor symptoms improved, smoother gait observed. Blood glucose 7.6 mmol/L — excellent. BP 130/82. Assisted with full morning routine. Ate a complete breakfast. Mood elevated — he had spoken with Rachel by phone last night. No concerns.",
    },
    {
        session_type: 'Medication round',
        notes: "Afternoon Levodopa/Carbidopa confirmed taken with appropriate timing. Blood glucose 8.1 mmol/L. John noted some ankle swelling — measured and documented (right ankle slightly more oedematous). Compression stocking applied. Flagged for coordinator: possible fluid retention, may require GP review. PRN Baclofen not required today. John cooperative and in good spirits.",
    },
    {
        session_type: 'Personal care',
        notes: "Personal care completed. John had a positive session — engaged throughout. Skin review: ankle oedema slightly improved vs. yesterday. No new skin integrity concerns. Assisted with dressing; John managed buttons independently with some difficulty — noted as a potential OT referral point. He was proud of managing independently and this was acknowledged. Rachel visited during the session.",
    },
    {
        session_type: 'Morning',
        notes: "Medications administered. John appeared mildly anxious this morning — expressed worry about an upcoming GP appointment. Reassured and oriented him to his schedule. Levodopa taken 30 min before breakfast. Gait steady with rollator. Blood glucose 9.2 mmol/L — above target; noted for GP review at upcoming appointment. Ate breakfast (3/4 portion). Temperature 36.9°C.",
    },
    {
        session_type: 'Afternoon',
        notes: "Arrived to find John asleep in the chair — allowed him to rest briefly. Levodopa dose administered on waking with a light snack. He was groggy initially but became more alert after 20 minutes. Completed brief mobility exercises. Fluids intake reviewed — below recommended. Encouraged hydration. Mood: calm. No falls or incidents. BP 134/80.",
    },
    {
        session_type: 'Evening',
        notes: "Evening medications given. John ate dinner in full — good appetite. Susan joined for dinner. Evening routine went smoothly. John mentioned his back pain has been better managed this week with the current Baclofen PRN schedule. Assisted with transfer to bed. COPD: no wheeze tonight. Vitals stable. Susan confirmed she will be home overnight.",
    },
    {
        session_type: 'Morning',
        notes: "Morning medications administered on schedule. John was in excellent spirits following his GP appointment yesterday — reports the doctor was pleased with his blood pressure improvement. Blood glucose 7.8 mmol/L. Assisted with morning routine — noticeably more confident with mobility today. Full breakfast eaten. No concerns noted. Rachel sent a card which John read aloud with evident joy.",
    },
];

const FAMILY_SUMMARIES = [
    {
        daysAgo: 1,
        text: `Dear Susan and Rachel,\n\nWe are pleased to share that John had a positive and settled day yesterday. His morning Levodopa was administered on schedule and his motor function was noticeably improved throughout the visit. He completed his physiotherapy exercises with good effort and enjoyed his meals in full. His spirits were high — he spoke warmly about Rachel's recent call.\n\nThank you for your continued trust in our care.\n\nWarm regards,\nThe CareSync Care Team`,
    },
    {
        daysAgo: 2,
        text: `Dear Susan and Rachel,\n\nJohn had a steady day yesterday. His morning and afternoon visits went smoothly, with all medications administered on time. We did note mild fatigue in the afternoon, which we attributed to a less restful night. His COPD inhaler technique was reviewed and corrected. His appetite was good and he was in a reflective, calm mood.\n\nWe remain attentive to his comfort and wellbeing.\n\nWarm regards,\nThe CareSync Care Team`,
    },
    {
        daysAgo: 3,
        text: `Dear Susan and Rachel,\n\nWe wanted to update you that John experienced a brief 'off' period in the afternoon — a known feature of his Parkinson's medication cycle — which caused some stiffness. His care team managed this attentively and he was comfortable by the evening visit. His blood glucose was within target range and there were no falls or safety incidents.\n\nPlease don't hesitate to reach out with any questions.\n\nWarm regards,\nThe CareSync Care Team`,
    },
    {
        daysAgo: 5,
        text: `Dear Susan and Rachel,\n\nJohn had a particularly good day — his morning mobility was the best we have seen in some time, and he was in bright spirits throughout. He completed his full set of physiotherapy exercises independently and enjoyed a full dinner. His blood pressure reading was excellent at 130/82. Susan, your presence during the afternoon visit clearly lifted his mood.\n\nThank you for your partnership in his care.\n\nWarm regards,\nThe CareSync Care Team`,
    },
    {
        daysAgo: 7,
        text: `Dear Susan and Rachel,\n\nWe are glad to report that John had a comfortable and uneventful day. All medications were administered as scheduled and his COPD symptoms were minimal. He was talkative during his personal care session, sharing stories about his career — a very positive sign of engagement and wellbeing. No concerns to report.\n\nThank you both for your continued involvement in John's care.\n\nWarm regards,\nThe CareSync Care Team`,
    },
];

const SENTINEL_FLAG = {
    status: 'CLEAR',
    summary_text: `John Stone — CLEAR\n\nAll medications reviewed: Levodopa/Carbidopa, Pramipexole, Tiotropium inhaler, Metformin 850mg, and Sertraline administered as scheduled across all recorded visits this week. No missed doses, timing violations, or adverse reactions identified.\n\nBlood glucose readings within acceptable range (7.6–8.1 mmol/L). Blood pressure stable and within target. COPD symptoms minimal with no acute exacerbations noted.\n\nNo medication concerns at this time. Continue current care plan.`,
};

async function seedJohn() {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        const existing = await client.query(
            `SELECT id FROM clients WHERE name = 'John Stone' LIMIT 1`
        );
        let johnId;
        if (existing.rows.length > 0) {
            johnId = existing.rows[0].id;
            console.log(`John Stone already exists (id: ${johnId}). Updating profile…`);
            await client.query(
                `UPDATE clients SET
                    date_of_birth = $1, conditions = $2, medications = $3,
                    notes = $4, family_members = $5
                 WHERE id = $6`,
                [
                    JOHN_PROFILE.date_of_birth,
                    JOHN_PROFILE.conditions,
                    JOHN_PROFILE.medications,
                    JOHN_PROFILE.notes,
                    JOHN_PROFILE.family_members,
                    johnId,
                ]
            );
        } else {
            const result = await client.query(
                `INSERT INTO clients (name, date_of_birth, conditions, medications, notes, family_members)
                 VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
                [
                    JOHN_PROFILE.name,
                    JOHN_PROFILE.date_of_birth,
                    JOHN_PROFILE.conditions,
                    JOHN_PROFILE.medications,
                    JOHN_PROFILE.notes,
                    JOHN_PROFILE.family_members,
                ]
            );
            johnId = result.rows[0].id;
            console.log(`Created John Stone (id: ${johnId})`);
        }

        // Remove existing visits for clean demo
        await client.query(`DELETE FROM visits WHERE client_id = $1`, [johnId]);

        // Insert 3 weeks of visits (2–3 per day, spread across 21 days)
        const now = new Date();
        let visitCount = 0;
        for (let daysAgo = 21; daysAgo >= 0; daysAgo--) {
            const visitsOnDay = daysAgo === 0 ? 1 : (daysAgo % 4 === 0 ? 2 : 3);
            for (let v = 0; v < visitsOnDay; v++) {
                const template = VISIT_TEMPLATES[(visitCount) % VISIT_TEMPLATES.length];
                const visitDate = new Date(now);
                visitDate.setDate(visitDate.getDate() - daysAgo);
                visitDate.setHours(7 + v * 5 + Math.floor(Math.random() * 2), Math.floor(Math.random() * 45));

                await client.query(
                    `INSERT INTO visits (client_id, psw_user_id, notes, session_type, logged_at)
                     VALUES ($1, 'seed-psw-user', $2, $3, $4)`,
                    [johnId, template.notes, template.session_type, visitDate.toISOString()]
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
            [johnId, SENTINEL_FLAG.status, SENTINEL_FLAG.summary_text]
        );
        console.log('Sentinel flag seeded.');

        // Family daily summaries
        await client.query(`DELETE FROM family_daily_summaries WHERE client_id = $1`, [johnId]);
        for (const s of FAMILY_SUMMARIES) {
            const d = new Date(now);
            d.setDate(d.getDate() - s.daysAgo);
            const dateStr = d.toISOString().slice(0, 10);
            await client.query(
                `INSERT INTO family_daily_summaries (client_id, summary_date, summary_text)
                 VALUES ($1, $2, $3) ON CONFLICT DO NOTHING`,
                [johnId, dateStr, s.text]
            );
        }
        console.log(`Inserted ${FAMILY_SUMMARIES.length} family daily summaries.`);

        // Document metadata (physiotherapy care plan PDF)
        await client.query(
            `DELETE FROM documents WHERE client_id = $1 AND filename = 'john-stone-physio-care-plan.pdf'`,
            [johnId]
        );
        await client.query(
            `INSERT INTO documents (client_id, filename, storage_key, storage_url, uploaded_by, uploaded_at)
             VALUES ($1, $2, $3, $4, $5, NOW() - INTERVAL '3 days')`,
            [
                johnId,
                'john-stone-physio-care-plan.pdf',
                `clients/${johnId}/physio-care-plan.pdf`,
                null,
                'seed-coordinator',
            ]
        );
        console.log('Physiotherapy care plan document metadata seeded.');

        await client.query('COMMIT');
        console.log('\nDone! John Stone demo profile is ready.');
        console.log(`Client ID: ${johnId}`);
    } catch (err) {
        await client.query('ROLLBACK');
        console.error('Seed failed:', err.message);
        process.exit(1);
    } finally {
        client.release();
        await pool.end();
    }
}

seedJohn();
