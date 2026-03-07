import express from 'express';
const router = express.Router();

// CRUD for client profiles (coordinator only)
router.get('/', (req, res) => res.json({ clients: [] }));
router.post('/', (req, res) => res.json({ message: 'Client created' }));

export default router;
