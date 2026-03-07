import express from 'express';
const router = express.Router();

router.post('/', (req, res) => {
    // POST / → logs visit, updates Backboard memory
    res.json({ message: 'Visit logged' });
});

export default router;
