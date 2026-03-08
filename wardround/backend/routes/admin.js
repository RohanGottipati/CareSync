/**
 * Admin routes — coordinator-only endpoints for Auth0 user/role management.
 *
 * Uses the Auth0 Management API (M2M client credentials) to:
 *   1. List users who have NO Auth0 role assigned.
 *   2. Assign a role to a user by Auth0 user ID.
 *
 * Required env vars:
 *   AUTH0_DOMAIN, AUTH0_M2M_CLIENT_ID, AUTH0_M2M_CLIENT_SECRET
 */

import { Router } from 'express';

const router = Router();

const AUTH0_DOMAIN = process.env.AUTH0_DOMAIN;
const M2M_CLIENT_ID = process.env.AUTH0_M2M_CLIENT_ID;
const M2M_CLIENT_SECRET = process.env.AUTH0_M2M_CLIENT_SECRET;

// ── M2M token cache ──────────────────────────────────────────────────────────

let cachedToken = null;
let tokenExpiresAt = 0;

async function getManagementToken() {
    if (cachedToken && Date.now() < tokenExpiresAt) return cachedToken;

    const res = await fetch(`https://${AUTH0_DOMAIN}/oauth/token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            grant_type: 'client_credentials',
            client_id: M2M_CLIENT_ID,
            client_secret: M2M_CLIENT_SECRET,
            audience: `https://${AUTH0_DOMAIN}/api/v2/`,
        }),
    });

    if (!res.ok) {
        const body = await res.text();
        throw new Error(`Auth0 M2M token request failed (${res.status}): ${body}`);
    }

    const data = await res.json();
    cachedToken = data.access_token;
    // Expire 5 min early to be safe
    tokenExpiresAt = Date.now() + (data.expires_in - 300) * 1000;
    return cachedToken;
}

// ── Helpers ──────────────────────────────────────────────────────────────────

async function mgmtFetch(path, options = {}) {
    const token = await getManagementToken();
    const res = await fetch(`https://${AUTH0_DOMAIN}/api/v2${path}`, {
        ...options,
        headers: {
            ...options.headers,
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
    });
    if (!res.ok) {
        const body = await res.text();
        throw new Error(`Auth0 API error (${res.status}): ${body}`);
    }
    return res.json();
}

/** Fetch ALL users (handles pagination). */
async function fetchAllUsers() {
    const users = [];
    let page = 0;
    const perPage = 100;
    let hasMore = true;

    while (hasMore) {
        const batch = await mgmtFetch(`/users?per_page=${perPage}&page=${page}&include_totals=false`);
        users.push(...batch);
        hasMore = batch.length === perPage;
        page++;
    }
    return users;
}

/** Fetch all Auth0 roles. */
async function fetchRoles() {
    return mgmtFetch('/roles');
}

/** Fetch members of a specific role. */
async function fetchRoleMembers(roleId) {
    const members = [];
    let page = 0;
    const perPage = 100;
    let hasMore = true;

    while (hasMore) {
        const batch = await mgmtFetch(`/roles/${roleId}/users?per_page=${perPage}&page=${page}`);
        members.push(...batch);
        hasMore = batch.length === perPage;
        page++;
    }
    return members;
}

// ── Routes ───────────────────────────────────────────────────────────────────

/**
 * GET /api/admin/users/unassigned
 * Returns users that have no Auth0 role.
 */
router.get('/users/unassigned', async (req, res) => {
    try {
        if (!M2M_CLIENT_ID || !M2M_CLIENT_SECRET) {
            return res.status(500).json({ error: 'Auth0 M2M credentials not configured in .env' });
        }

        const [allUsers, roles] = await Promise.all([
            fetchAllUsers(),
            fetchRoles(),
        ]);

        // Collect user IDs that belong to at least one role
        const assignedUserIds = new Set();
        for (const role of roles) {
            const members = await fetchRoleMembers(role.id);
            for (const m of members) {
                assignedUserIds.add(m.user_id);
            }
        }

        // Filter to users with NO roles
        const unassigned = allUsers
            .filter(u => !assignedUserIds.has(u.user_id))
            .map(u => ({
                user_id: u.user_id,
                email: u.email,
                name: u.name || u.nickname || u.email,
                provider: u.user_id.split('|')[0] || 'unknown',
                created_at: u.created_at,
            }));

        res.json({ users: unassigned });
    } catch (err) {
        console.error('Admin /users/unassigned error:', err.message);
        res.status(500).json({ error: err.message });
    }
});

/**
 * POST /api/admin/users/:userId/role
 * Body: { "role": "coordinator" | "psw" | "family" }
 * Assigns the given Auth0 role to the user.
 */
router.post('/users/:userId/role', async (req, res) => {
    try {
        if (!M2M_CLIENT_ID || !M2M_CLIENT_SECRET) {
            return res.status(500).json({ error: 'Auth0 M2M credentials not configured in .env' });
        }

        const { userId } = req.params;
        const { role } = req.body;

        if (!role || !['coordinator', 'psw', 'family'].includes(role)) {
            return res.status(400).json({ error: 'role must be one of: coordinator, psw, family' });
        }

        // Look up role ID from Auth0
        const roles = await fetchRoles();
        const target = roles.find(r => r.name === role);
        if (!target) {
            return res.status(404).json({ error: `Auth0 role "${role}" not found. Create it in the Auth0 Dashboard first.` });
        }

        // Assign user to role
        const token = await getManagementToken();
        const assignRes = await fetch(`https://${AUTH0_DOMAIN}/api/v2/roles/${target.id}/users`, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ users: [userId] }),
        });

        if (!assignRes.ok) {
            const body = await assignRes.text();
            throw new Error(`Failed to assign role (${assignRes.status}): ${body}`);
        }

        console.log(`Admin: assigned role "${role}" to user ${userId}`);
        res.json({ ok: true });
    } catch (err) {
        console.error('Admin /users/:userId/role error:', err.message);
        res.status(500).json({ error: err.message });
    }
});

export default router;
