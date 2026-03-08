import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: join(__dirname, '../.env') });

const { initSchema } = await import('../schema.js');
await initSchema();
console.log('Schema migrations complete.');
process.exit(0);
