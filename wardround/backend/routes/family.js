import express from 'express';
const router = express.Router();

router.post('/draft', (req, res) => {
    // POST /draft → Family Comms Agent
    res.json({ message: 'Draft generated' });
});

export default router;
