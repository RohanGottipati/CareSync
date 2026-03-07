import dotenv from 'dotenv';
dotenv.config();

import { writeMemory } from './services/backboard.js';

async function test() {
    try {
        console.log('Testing writeMemory...');
        const res = await writeMemory(process.env.BACKBOARD_HANDOFF_AGENT_ID, 'TEST MEMORY ENTRY');
        console.log('Success:', res);
    } catch (e) {
        console.error('Error:', e.response?.data || e.message);
    }
}

test();
