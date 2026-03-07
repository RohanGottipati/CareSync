import express from 'express';
import multer from 'multer';
import { uploadFile } from '../services/vultrStorage.js';
import { uploadDocumentToRAG } from '../services/backboard.js';
import { readDb, writeDb } from '../db.js';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// POST /api/documents/upload → Multer → Vultr Object Storage → Backboard RAG
router.post('/upload', upload.single('file'), async (req, res) => {
    try {
        const { clientId, docType } = req.body;
        const db = readDb();
        const client = db.clients.find(c => c.id === clientId);
        if (!client) return res.status(404).json({ error: 'Client not found' });

        // 1. Store file on Vultr Object Storage
        const storageKey = await uploadFile(
            req.file.buffer,
            req.file.originalname,
            req.file.mimetype
        );

        // 2. Upload to Backboard RAG for this client's thread
        await uploadDocumentToRAG(
            client.backboard_thread_id,
            req.file.buffer,
            req.file.originalname
        );

        // 3. Log document reference in local DB
        db.documents = db.documents || [];
        db.documents.push({
            id: Date.now().toString(),
            clientId,
            storageKey,
            filename: req.file.originalname,
            docType,
            uploadedAt: new Date().toISOString()
        });
        writeDb(db);

        res.json({ success: true, message: 'Document uploaded and indexed for RAG' });
    } catch (err) {
        console.error('Document upload error:', err.message);
        res.status(500).json({ error: 'Failed to upload document' });
    }
});

export default router;
