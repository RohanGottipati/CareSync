/**
 * Document upload: Multer → Vultr Object Storage → Bull job for Backboard RAG (async).
 * POST /api/documents/upload (multipart: file, clientId?, threadId?).
 */

import express from 'express';
import multer from 'multer';
import { uploadToVultr } from '../services/vultrStorage.js';
import { addDocumentJob } from '../queue.js';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } }); // 10 MB

router.post('/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    const clientId = req.body?.clientId || req.user?.id || 'unknown';
    const threadId = req.body?.threadId || null;
    const key = `clients/${clientId}/${Date.now()}-${req.file.originalname || 'file.pdf'}`;
    const contentType = req.file.mimetype || 'application/pdf';
    const { url, key: storedKey } = await uploadToVultr(req.file.buffer, key, contentType);
    await addDocumentJob({ key: storedKey, clientId, threadId });
    res.json({ message: 'Document uploaded', url, key: storedKey });
  } catch (err) {
    console.error('Documents upload error:', err);
    res.status(500).json({ error: err.message || 'Upload failed' });
  }
});

export default router;
