import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { auth } from 'express-oauth2-jwt-bearer';
import briefingsRouter from './routes/briefings.js';
import visitsRouter from './routes/visits.js';
import familyRouter from './routes/family.js';
import documentsRouter from './routes/documents.js';
import clientsRouter from './routes/clients.js';

const app = express();
app.use(cors({ origin: process.env.CORS_ORIGIN || 'http://localhost:3000' }));
app.use(express.json());

// Auth0 JWT validation
const checkJwt = auth({
    audience: process.env.AUTH0_AUDIENCE,
    issuerBaseURL: `https://${process.env.AUTH0_DOMAIN}/`
});

// Role checker — use after checkJwt on any route
const requireRole = (...roles) => (req, res, next) => {
    const userRoles = req.auth?.payload['https://wardround.app/roles'] || [];
    if (!roles.some(r => userRoles.includes(r)))
        return res.status(403).json({ error: 'Insufficient role' });
    next();
};

// Routes — each role-gated appropriately
app.use('/api/briefings', checkJwt, requireRole('psw', 'coordinator'), briefingsRouter);
app.use('/api/visits', checkJwt, requireRole('psw'), visitsRouter);
app.use('/api/family', checkJwt, requireRole('psw', 'family', 'coordinator'), familyRouter);
app.use('/api/documents', checkJwt, requireRole('psw', 'family', 'coordinator'), documentsRouter);
app.use('/api/clients', checkJwt, requireRole('coordinator'), clientsRouter);

app.get('/health', (req, res) => res.json({ status: 'ok' }));

if (process.env.NODE_ENV === 'production') {
    import('./cron.js');
}

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`WardRound backend running on port ${PORT}`));
