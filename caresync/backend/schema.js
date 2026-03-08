/**
 * Database schema initializer.
 * Creates all CareSync tables if they don't exist.
 * Called once on server boot from server.js.
 *
 * Tables:
 *   clients                 — client profiles managed by coordinators
 *   client_threads          — Backboard thread IDs per client per agent type
 *   visits                  — visit logs from PSWs
 *   assignments             — PSW <-> client shift assignments set by coordinators
 *   client_sentinel_results — latest overnight sentinel result per client
 *   family_daily_summaries  — nightly family-friendly summaries generated from PSW logs
 *   documents               — metadata for uploaded care plan documents
 */

import { pool } from './db.js';

export async function initSchema() {
    await pool.query(`
        CREATE TABLE IF NOT EXISTS clients (
            id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            name           VARCHAR(255) NOT NULL,
            date_of_birth  DATE,
            medications    TEXT,
            conditions     TEXT,
            notes          TEXT,
            family_members TEXT,
            created_at     TIMESTAMPTZ DEFAULT NOW()
        );

        CREATE TABLE IF NOT EXISTS client_threads (
            client_id    UUID        NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
            agent_type   VARCHAR(50) NOT NULL,
            thread_id    VARCHAR(255) NOT NULL,
            PRIMARY KEY (client_id, agent_type)
        );

        CREATE TABLE IF NOT EXISTS visits (
            id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            client_id    UUID        NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
            psw_user_id  VARCHAR(255) NOT NULL,
            notes        TEXT,
            session_type VARCHAR(50),
            logged_at    TIMESTAMPTZ DEFAULT NOW()
        );

        CREATE TABLE IF NOT EXISTS assignments (
            id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            client_id    UUID        NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
            psw_user_id  VARCHAR(255) NOT NULL,
            psw_email    VARCHAR(255),
            shift_start  TIMESTAMPTZ NOT NULL,
            shift_end    TIMESTAMPTZ NOT NULL,
            set_by       VARCHAR(255) NOT NULL,
            created_at   TIMESTAMPTZ DEFAULT NOW()
        );

        CREATE TABLE IF NOT EXISTS client_sentinel_results (
            client_id    UUID        PRIMARY KEY REFERENCES clients(id) ON DELETE CASCADE,
            status       VARCHAR(20) NOT NULL DEFAULT 'UNKNOWN',
            summary_text TEXT,
            checked_at   TIMESTAMPTZ DEFAULT NOW()
        );

        CREATE TABLE IF NOT EXISTS family_daily_summaries (
            id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            client_id    UUID        NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
            summary_date DATE        NOT NULL,
            summary_text TEXT        NOT NULL,
            created_at   TIMESTAMPTZ DEFAULT NOW()
        );

        CREATE TABLE IF NOT EXISTS documents (
            id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            client_id    UUID        NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
            filename     VARCHAR(255) NOT NULL,
            storage_key  TEXT        NOT NULL,
            storage_url  TEXT,
            uploaded_by  VARCHAR(255),
            uploaded_at  TIMESTAMPTZ DEFAULT NOW()
        );
    `);

    // If psw_email was added with NOT NULL elsewhere, allow NULL so assignment by User ID works
    await pool.query(`
        DO $$
        BEGIN
            IF EXISTS (
                SELECT 1 FROM information_schema.columns
                WHERE table_schema = 'public' AND table_name = 'assignments' AND column_name = 'psw_email'
            ) THEN
                ALTER TABLE assignments ALTER COLUMN psw_email DROP NOT NULL;
            END IF;
        END $$;
    `);

    // Add family_members to clients if it doesn't exist yet (for existing DBs)
    await pool.query(`
        DO $$
        BEGIN
            IF NOT EXISTS (
                SELECT 1 FROM information_schema.columns
                WHERE table_schema = 'public' AND table_name = 'clients' AND column_name = 'family_members'
            ) THEN
                ALTER TABLE clients ADD COLUMN family_members TEXT;
            END IF;
        END $$;
    `);

    // Add session_type to visits if it doesn't exist yet (for existing DBs)
    await pool.query(`
        DO $$
        BEGIN
            IF NOT EXISTS (
                SELECT 1 FROM information_schema.columns
                WHERE table_schema = 'public' AND table_name = 'visits' AND column_name = 'session_type'
            ) THEN
                ALTER TABLE visits ADD COLUMN session_type VARCHAR(50);
            END IF;
        END $$;
    `);

    // Index for fast per-client summary lookups
    await pool.query(`
        CREATE INDEX IF NOT EXISTS idx_family_daily_summaries_client_date
            ON family_daily_summaries (client_id, summary_date DESC);
        CREATE INDEX IF NOT EXISTS idx_documents_client
            ON documents (client_id, uploaded_at DESC);
    `);

    console.log('Database schema initialised.');
}
