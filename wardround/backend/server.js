import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { authMiddleware, extractUser, requireRole } from './middleware/auth.js';

import briefingsRouter from './routes/briefings.js';
import visitsRouter from './routes/visits.js';
import familyRouter from './routes/family.js';
import documentsRouter from './routes/documents.js';
import clientsRouter from './routes/clients.js';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/briefings', authMiddleware, extractUser, requireRole('psw', 'coordinator'), briefingsRouter);
app.use('/api/visits', authMiddleware, extractUser, requireRole('psw'), visitsRouter);
app.use('/api/family', authMiddleware, extractUser, requireRole('psw', 'family', 'coordinator'), familyRouter);
app.use('/api/documents', authMiddleware, extractUser, requireRole('psw', 'family', 'coordinator'), documentsRouter);
app.use('/api/clients', authMiddleware, extractUser, requireRole('coordinator'), clientsRouter);

app.get('/health', (req, res) => res.json({ status: 'ok' }));

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Wardround Backend running on port ${PORT}`);
});
