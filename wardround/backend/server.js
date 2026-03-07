import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { authMiddleware, extractUser, requireRole } from './middleware/auth.js';

import briefingsRouter from './routes/briefings.js';
import visitsRouter from './routes/visits.js';
import familyRouter from './routes/family.js';
import documentsRouter from './routes/documents.js';
import clientsRouter from './routes/clients.js';
import rolesRouter from './routes/roles.js';

const app = express();
app.use(cors({ origin: process.env.CORS_ORIGIN || 'http://localhost:3000' }));
app.use(express.json());

app.use('/api/briefings', authMiddleware, extractUser, requireRole('psw', 'coordinator'), briefingsRouter);
app.use('/api/visits', authMiddleware, extractUser, requireRole('psw'), visitsRouter);
app.use('/api/family', authMiddleware, extractUser, requireRole('psw', 'family', 'coordinator'), familyRouter);
app.use('/api/documents', authMiddleware, extractUser, requireRole('psw', 'family', 'coordinator'), documentsRouter);
app.use('/api/clients', authMiddleware, extractUser, requireRole('coordinator'), clientsRouter);
app.use('/api/assign-role', authMiddleware, extractUser, rolesRouter);

app.get('/health', (req, res) => res.json({ status: 'ok' }));

if (process.env.NODE_ENV === 'production') {
    import('./cron.js');
}

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`WardRound backend running on port ${PORT}`));
