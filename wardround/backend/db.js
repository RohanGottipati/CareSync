// Simple JSON file DB (fine for hackathon)
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_FILE = path.join(__dirname, 'database.json');

export function readDb() {
    if (!fs.existsSync(DB_FILE)) {
        return { clients: [], visits: [], messages: [] };
    }
    return JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
}

export function writeDb(data) {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
}
