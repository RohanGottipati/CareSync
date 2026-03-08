import { auth } from 'express-oauth2-jwt-bearer';
import dotenv from 'dotenv';
dotenv.config();

const ROLES_CLAIM = 'https://wardround.app/roles';

// Accept both with and without trailing slash so tokens from Auth0 match regardless of format
const rawAudience = process.env.AUTH0_AUDIENCE;
const baseAudience = (rawAudience || '').replace(/\/$/, '');
const audienceList = baseAudience ? [baseAudience, `${baseAudience}/`] : [];

export const authMiddleware = auth({
    audience: audienceList.length ? audienceList : rawAudience,
    issuerBaseURL: `https://${process.env.AUTH0_DOMAIN}`,
    tokenSigningAlg: 'RS256',
});

export function extractUser(req, res, next) {
    const payload = req.auth?.payload;
    if (!payload) {
        return res.status(401).json({ error: 'No token payload' });
    }

    const roles = payload[ROLES_CLAIM] || [];
    let role = 'unknown';
    if (roles.includes('coordinator')) role = 'coordinator';
    else if (roles.includes('psw')) role = 'psw';
    else if (roles.includes('family')) role = 'family';

    req.user = {
        id: payload.sub,
        role,
        roles,
    };
    next();
}

export function requireRole(...allowedRoles) {
    return (req, res, next) => {
        if (!req.user || !allowedRoles.includes(req.user.role)) {
            return res.status(403).json({
                error: 'Forbidden',
                message: `This endpoint requires one of: ${allowedRoles.join(', ')}`,
            });
        }
        next();
    };
}
