import express from 'express';
const router = express.Router();

router.post('/upload', (req, res) => {
    // POST /upload → Multer → Vultr Object Storage
    res.json({ message: 'Document uploaded' });
});

export default router;
