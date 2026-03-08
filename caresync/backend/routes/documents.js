/**
 * Document upload and listing.
 * POST /api/documents/upload (multipart: file, clientId?, threadId?)
 * GET  /api/documents?clientId=...
 */

import express from 'express';
import multer from 'multer';
import { uploadToVultr } from '../services/vultrStorage.js';
import { addDocumentJob } from '../queue.js';
import { insertDocument, getDocumentsByClient } from '../db.js';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } }); // 10 MB

const ALLOWED_MIMES = new Set([
  'application/pdf',
  'image/jpeg',
  'image/png',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
]);
const ALLOWED_EXTENSIONS = new Set(['.pdf', '.jpg', '.jpeg', '.png', '.docx']);

function isAllowedUpload(file) {
  const ext = file.originalname ? file.originalname.toLowerCase().slice(file.originalname.lastIndexOf('.')) : '';
  return ALLOWED_MIMES.has(file.mimetype) || ALLOWED_EXTENSIONS.has(ext);
}

router.post('/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    if (!isAllowedUpload(req.file)) {
      return res.status(400).json({ error: 'Only PDF, JPG, JPEG, PNG, and DOCX files are allowed.' });
    }
    const clientId = req.body?.clientId || req.user?.id || 'unknown';
    const threadId = req.body?.threadId || null;
    const key = `clients/${clientId}/${Date.now()}-${req.file.originalname || 'file.pdf'}`;
    const contentType = req.file.mimetype || 'application/pdf';
    const { url, key: storedKey } = await uploadToVultr(req.file.buffer, key, contentType);

    // Save document metadata to DB (non-fatal)
    if (clientId !== 'unknown') {
      try {
        await insertDocument({
          clientId,
          filename: req.file.originalname || 'file.pdf',
          storageKey: storedKey,
          storageUrl: url,
          uploadedBy: req.user?.id || null,
        });
      } catch (dbErr) {
        console.warn('[documents] Could not save metadata (non-fatal):', dbErr.message);
      }
    }

    // Queue job for background processing (Backboard RAG). Fire-and-forget so we don't block the response.
    addDocumentJob({ key: storedKey, clientId, threadId }).catch((queueErr) => {
      console.error('Documents queue error (Redis/Bull):', queueErr.message);
    });

    res.json({ message: 'Document uploaded', url, key: storedKey });
  } catch (err) {
    console.error('Documents upload error:', err);
    const message = err.message || 'Upload failed';
    res.status(500).json({ error: message });
  }
});

// GET /api/documents?clientId=...
router.get('/', async (req, res) => {
  try {
    const { clientId } = req.query;
    if (!clientId) return res.status(400).json({ error: 'clientId query param required' });
    const docs = await getDocumentsByClient(clientId);
    res.json({ documents: docs });
  } catch (err) {
    console.error('GET /documents error:', err);
    res.status(500).json({ error: err.message || 'Failed to fetch documents' });
  }
});

export default router;
