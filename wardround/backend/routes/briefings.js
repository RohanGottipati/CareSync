import express from 'express';
const router = express.Router();

router.get('/:clientId', (req, res) => {
    // GET /:clientId → triggers Handoff Agent
    res.json({ message: 'Briefing for client', clientId: req.params.clientId });
});

export default router;
