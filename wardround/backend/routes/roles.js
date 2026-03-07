import { Router } from 'express';

const router = Router();

const ALLOWED_ROLES = ['psw', 'family', 'coordinator'];

let managementTokenCache = { token: null, expiresAt: 0 };

async function getManagementToken() {
    if (managementTokenCache.token && Date.now() < managementTokenCache.expiresAt) {
        return managementTokenCache.token;
    }

    const res = await fetch(`https://${process.env.AUTH0_DOMAIN}/oauth/token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            client_id: process.env.AUTH0_M2M_CLIENT_ID,
            client_secret: process.env.AUTH0_M2M_CLIENT_SECRET,
            audience: `https://${process.env.AUTH0_DOMAIN}/api/v2/`,
            grant_type: 'client_credentials',
        }),
    });

    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(`Failed to get Management API token: ${err.error_description || res.statusText}`);
    }

    const data = await res.json();
    managementTokenCache = {
        token: data.access_token,
        expiresAt: Date.now() + (data.expires_in - 60) * 1000,
    };
    return data.access_token;
}

async function findRoleId(mgmtToken, roleName) {
    const res = await fetch(
        `https://${process.env.AUTH0_DOMAIN}/api/v2/roles?name_filter=${encodeURIComponent(roleName)}`,
        { headers: { Authorization: `Bearer ${mgmtToken}` } }
    );

    if (!res.ok) {
        throw new Error(`Failed to look up role "${roleName}": ${res.statusText}`);
    }

    const roles = await res.json();
    const match = roles.find(r => r.name === roleName);
    if (!match) {
        throw new Error(`Role "${roleName}" not found in Auth0`);
    }
    return match.id;
}

async function assignRoleToUser(mgmtToken, userId, roleId) {
    const res = await fetch(
        `https://${process.env.AUTH0_DOMAIN}/api/v2/users/${encodeURIComponent(userId)}/roles`,
        {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${mgmtToken}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ roles: [roleId] }),
        }
    );

    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(`Failed to assign role: ${err.message || res.statusText}`);
    }
}

router.post('/', async (req, res) => {
    try {
        const { role } = req.body;

        if (!role || !ALLOWED_ROLES.includes(role)) {
            return res.status(400).json({ error: `Invalid role. Must be one of: ${ALLOWED_ROLES.join(', ')}` });
        }

        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ error: 'User ID not found in token' });
        }

        const mgmtToken = await getManagementToken();
        const roleId = await findRoleId(mgmtToken, role);
        await assignRoleToUser(mgmtToken, userId, roleId);

        res.json({ success: true, role });
    } catch (err) {
        console.error('Role assignment error:', err.message);
        res.status(500).json({ error: 'Failed to assign role', details: err.message });
    }
});

export default router;
