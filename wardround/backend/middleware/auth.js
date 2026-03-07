import dotenv from 'dotenv';
dotenv.config();

export default function authMiddleware(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Missing or invalid token' });
    }

    // For hackathon, simple JWT validation or role extraction mock
    const token = authHeader.split(' ')[1];
    req.user = { id: 'mock-user-id', role: 'psw' }; // Mock user extraction
    next();
}
