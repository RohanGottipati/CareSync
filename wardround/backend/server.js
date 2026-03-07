import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { authMiddleware, extractUser, requireRole } from './middleware/auth.js';
import { runCron } from './cron.js';
import { startWorker } from './workers/documentWorker.js';
import { initSchema } from './schema.js';

import briefingsRouter from './routes/briefings.js';
import visitsRouter from './routes/visits.js';
import familyRouter from './routes/family.js';
import documentsRouter from './routes/documents.js';
import clientsRouter from './routes/clients.js';
import debugRouter from './routes/debug.js';

dotenv.config();

const app = express();
app.use(cors({ origin: process.env.CORS_ORIGIN || true }));
app.use(express.json());

app.use('/api/briefings', authMiddleware, extractUser, requireRole('psw', 'coordinator'), briefingsRouter);
app.use('/api/visits', authMiddleware, extractUser, requireRole('psw'), visitsRouter);
app.use('/api/family', authMiddleware, extractUser, requireRole('psw', 'family', 'coordinator'), familyRouter);
app.use('/api/documents', authMiddleware, extractUser, requireRole('psw', 'family', 'coordinator'), documentsRouter);
app.use('/api/clients', authMiddleware, extractUser, clientsRouter);

app.get('/health', (req, res) => res.json({ status: 'ok' }));

// Dev-only debug routes (never exposed in production)
if (process.env.NODE_ENV !== 'production') {
    app.use('/api/debug', debugRouter);
}

const PORT = process.env.PORT || 3001;

async function start() {
    await initSchema();
    app.listen(PORT, () => {
        console.log(`Wardround Backend running on port ${PORT}`);
        startWorker();
        runCron();
    });
}

start().catch((err) => {
    console.error('Failed to start server:', err);
    process.exit(1);
});
