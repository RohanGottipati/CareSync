import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authMiddleware from './middleware/auth.js';

// Route imports
import briefingsRouter from './routes/briefings.js';
import visitsRouter from './routes/visits.js';
import familyRouter from './routes/family.js';
import documentsRouter from './routes/documents.js';
import clientsRouter from './routes/clients.js';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/briefings', authMiddleware, briefingsRouter);
app.use('/api/visits', authMiddleware, visitsRouter);
app.use('/api/family', authMiddleware, familyRouter);
app.use('/api/documents', authMiddleware, documentsRouter);
app.use('/api/clients', authMiddleware, clientsRouter);

app.get('/health', (req, res) => res.json({ status: 'ok' }));

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Wardround Backend running on port ${PORT}`);
});
