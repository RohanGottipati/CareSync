/**
 * Vultr Managed PostgreSQL connection pool.
 *
 * All database access goes through this file. Uses the `pg` Pool so connections
 * are reused across requests (efficient and safe under concurrent load).
 *
 * Set DATABASE_URL in .env:
 *   postgresql://vultradmin:PASSWORD@HOST.vultrdb.com:PORT/defaultdb?sslmode=require
 *
 * Every exported function is async — callers must await them.
 */

import pg from 'pg';
const { Pool } = pg;

export const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : false,
    max: 10,
    idleTimeoutMillis: 30000,
});

pool.on('error', (err) => {
    console.error('Unexpected PostgreSQL pool error:', err.message);
});

// ── Client threads ────────────────────────────────────────────────────────────

/**
 * Get the Backboard thread ID for a client + agent type combination.
 * @param {string} clientId
 * @param {string} agentType - 'handoff' | 'sentinel' | 'family'
 * @returns {Promise<string|null>}
 */
export async function getClientThread(clientId, agentType) {
    const { rows } = await pool.query(
        'SELECT thread_id FROM client_threads WHERE client_id = $1 AND agent_type = $2',
        [clientId, agentType]
    );
    return rows[0]?.thread_id ?? null;
}

/**
 * Save or update the Backboard thread ID for a client + agent type.
 * @param {string} clientId
 * @param {string} agentType
 * @param {string} threadId
 */
export async function setClientThread(clientId, agentType, threadId) {
    await pool.query(
        `INSERT INTO client_threads (client_id, agent_type, thread_id)
         VALUES ($1, $2, $3)
         ON CONFLICT (client_id, agent_type) DO UPDATE SET thread_id = EXCLUDED.thread_id`,
        [clientId, agentType, threadId]
    );
}

// ── Clients ───────────────────────────────────────────────────────────────────

/** Return all clients. */
export async function getAllClients() {
    const { rows } = await pool.query('SELECT * FROM clients ORDER BY name');
    return rows;
}

/** Return a single client by ID. */
export async function getClientById(clientId) {
    const { rows } = await pool.query('SELECT * FROM clients WHERE id = $1', [clientId]);
    return rows[0] ?? null;
}

/** Create a new client (coordinator only). */
export async function createClient({ name, dateOfBirth, medications, conditions, notes }) {
    const { rows } = await pool.query(
        `INSERT INTO clients (name, date_of_birth, medications, conditions, notes)
         VALUES ($1, $2, $3, $4, $5) RETURNING *`,
        [name, dateOfBirth || null, medications || null, conditions || null, notes || null]
    );
    return rows[0];
}

/** Update a client. */
export async function updateClient(clientId, { name, dateOfBirth, medications, conditions, notes }) {
    const { rows } = await pool.query(
        `UPDATE clients SET name = $1, date_of_birth = $2, medications = $3,
         conditions = $4, notes = $5 WHERE id = $6 RETURNING *`,
        [name, dateOfBirth || null, medications || null, conditions || null, notes || null, clientId]
    );
    return rows[0] ?? null;
}

// ── Visits ────────────────────────────────────────────────────────────────────

/** Save a visit log entry. */
export async function createVisit({ clientId, pswUserId, notes }) {
    const { rows } = await pool.query(
        `INSERT INTO visits (client_id, psw_user_id, notes)
         VALUES ($1, $2, $3) RETURNING *`,
        [clientId, pswUserId, notes || '']
    );
    return rows[0];
}

/** Get all visits for a client. */
export async function getVisitsByClient(clientId) {
    const { rows } = await pool.query(
        'SELECT * FROM visits WHERE client_id = $1 ORDER BY logged_at DESC',
        [clientId]
    );
    return rows;
}

// ── Assignments ───────────────────────────────────────────────────────────────

/**
 * Assign a client to a PSW for a shift (coordinator only).
 */
export async function createAssignment({ clientId, pswUserId, shiftStart, shiftEnd, setBy }) {
    const { rows } = await pool.query(
        `INSERT INTO assignments (client_id, psw_user_id, shift_start, shift_end, set_by)
         VALUES ($1, $2, $3, $4, $5) RETURNING *`,
        [clientId, pswUserId, shiftStart, shiftEnd, setBy]
    );
    return rows[0];
}

/**
 * Get all active assignments for a PSW right now (shift covers current time).
 * @param {string} pswUserId - Auth0 user ID
 */
export async function getActiveAssignmentsForPsw(pswUserId) {
    const { rows } = await pool.query(
        `SELECT a.*, c.name AS client_name, c.medications, c.conditions, c.notes AS client_notes
         FROM assignments a
         JOIN clients c ON c.id = a.client_id
         WHERE a.psw_user_id = $1
           AND a.shift_start <= NOW()
           AND a.shift_end >= NOW()
         ORDER BY a.shift_start`,
        [pswUserId]
    );
    return rows;
}

/**
 * Get current and upcoming assignments for a PSW (shift has not ended yet).
 * Lets PSWs see today's and future shifts, not only the one active this moment.
 */
export async function getCurrentAndUpcomingAssignmentsForPsw(pswUserId) {
    const { rows } = await pool.query(
        `SELECT a.*, c.name AS client_name, c.medications, c.conditions, c.notes AS client_notes,
                (a.shift_start <= NOW() AND a.shift_end >= NOW()) AS is_active_now
         FROM assignments a
         JOIN clients c ON c.id = a.client_id
         WHERE a.psw_user_id = $1
           AND a.shift_end >= NOW()
         ORDER BY a.shift_start`,
        [pswUserId]
    );
    return rows;
}

/** Get all assignments (coordinator view). */
export async function getAllAssignments() {
    const { rows } = await pool.query(
        `SELECT a.*, c.name AS client_name
         FROM assignments a
         JOIN clients c ON c.id = a.client_id
         ORDER BY a.shift_start DESC`
    );
    return rows;
}

/** Delete an assignment by ID. */
export async function deleteAssignment(assignmentId) {
    await pool.query('DELETE FROM assignments WHERE id = $1', [assignmentId]);
}

/**
 * Check whether a PSW is currently assigned to a specific client.
 * Used to gate visit access (shift must be active now).
 */
export async function isPswAssignedToClient(pswUserId, clientId) {
    const { rows } = await pool.query(
        `SELECT 1 FROM assignments
         WHERE psw_user_id = $1 AND client_id = $2
           AND shift_start <= NOW() AND shift_end >= NOW()
         LIMIT 1`,
        [pswUserId, clientId]
    );
    return rows.length > 0;
}

/**
 * Check whether a PSW can access the pre-visit briefing for a client.
 * Allowed for any current or upcoming assignment (shift not ended yet).
 */
export async function canPswAccessBriefingForClient(pswUserId, clientId) {
    const { rows } = await pool.query(
        `SELECT 1 FROM assignments
         WHERE psw_user_id = $1 AND client_id = $2
           AND shift_end >= NOW()
         LIMIT 1`,
        [pswUserId, clientId]
    );
    return rows.length > 0;
}
