/**
 * Database schema initializer.
 * Creates all WardRound tables if they don't exist.
 * Called once on server boot from server.js.
 *
 * Tables:
 *   clients        — client profiles managed by coordinators
 *   client_threads — Backboard thread IDs per client per agent type
 *   visits         — visit logs from PSWs
 *   assignments    — PSW <-> client shift assignments set by coordinators
 */

import { pool } from './db.js';

export async function initSchema() {
    await pool.query(`
        CREATE TABLE IF NOT EXISTS clients (
            id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            name         VARCHAR(255) NOT NULL,
            date_of_birth DATE,
            medications  TEXT,
            conditions   TEXT,
            notes        TEXT,
            created_at   TIMESTAMPTZ DEFAULT NOW()
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
            logged_at    TIMESTAMPTZ DEFAULT NOW()
        );

        CREATE TABLE IF NOT EXISTS assignments (
            id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            client_id    UUID        NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
            psw_user_id  VARCHAR(255) NOT NULL,
            shift_start  TIMESTAMPTZ NOT NULL,
            shift_end    TIMESTAMPTZ NOT NULL,
            set_by       VARCHAR(255) NOT NULL,
            created_at   TIMESTAMPTZ DEFAULT NOW()
        );
    `);

    console.log('Database schema initialised.');
}
