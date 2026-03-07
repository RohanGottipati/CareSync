// Simple JSON file DB (fine for hackathon)
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_FILE = path.join(__dirname, 'database.json');

export function readDb() {
    if (!fs.existsSync(DB_FILE)) {
        return { clients: [], visits: [], messages: [], clientThreads: {} };
    }
    const data = JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
    if (!data.clientThreads) data.clientThreads = {};
    return data;
}

export function writeDb(data) {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
}

/** Get or create Backboard thread ID for a client and agent type. Caller must create thread in Backboard and pass threadId when creating. */
export function getClientThread(clientId, agentType) {
    const db = readDb();
    const key = `${clientId}:${agentType}`;
    return db.clientThreads?.[key] ?? null;
}

export function setClientThread(clientId, agentType, threadId) {
    const db = readDb();
    if (!db.clientThreads) db.clientThreads = {};
    db.clientThreads[`${clientId}:${agentType}`] = threadId;
    writeDb(db);
}
