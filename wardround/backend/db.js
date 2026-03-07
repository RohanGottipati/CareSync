// Simple JSON file DB (fine for hackathon)
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_FILE = path.join(__dirname, 'database.json');

const defaultDb = { clients: [], visits: [], messages: [], documents: [] };

export function readDb() {
    if (!fs.existsSync(DB_FILE)) return { ...defaultDb };
    try {
        return JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
    } catch {
        return { ...defaultDb };
    }
}

export function writeDb(data) {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
}
