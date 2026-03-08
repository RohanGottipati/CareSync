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
import adminRouter from './routes/admin.js';

dotenv.config();

const app = express();
// CORS: allow configured origin(s); in development allow any localhost (Vite may use 5173, 5174, etc.)
const allowedOrigins = [
    ...(process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',').map((o) => o.trim()) : []),
].filter(Boolean);
const isDev = process.env.NODE_ENV !== 'production';
const corsOptions = {
    origin: (origin, cb) => {
        if (!origin || allowedOrigins.length === 0) return cb(null, true);
        if (allowedOrigins.includes(origin)) return cb(null, true);
        if (isDev && /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) return cb(null, true);
        cb(null, false);
    },
};
app.use(cors(corsOptions));
app.use(express.json());

app.use('/api/briefings', authMiddleware, extractUser, requireRole('psw', 'coordinator'), briefingsRouter);
app.use('/api/visits', authMiddleware, extractUser, requireRole('psw', 'coordinator'), visitsRouter);
app.use('/api/family', authMiddleware, extractUser, requireRole('psw', 'family', 'coordinator'), familyRouter);
app.use('/api/documents', authMiddleware, extractUser, requireRole('psw', 'family', 'coordinator'), documentsRouter);
app.use('/api/clients', authMiddleware, extractUser, clientsRouter);
app.use('/api/admin', authMiddleware, extractUser, requireRole('coordinator'), adminRouter);

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
