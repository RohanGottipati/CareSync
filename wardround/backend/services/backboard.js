// backend/services/backboard.js
// createClientThread, runAgent, writeMemory, uploadDocumentToRAG
import 'dotenv/config';
import axios from 'axios';
import FormData from 'form-data';

const BASE = process.env.BACKBOARD_BASE_URL || 'https://app.backboard.io/api';
const headers = () => ({
    'X-API-Key': process.env.BACKBOARD_API_KEY,
    'Content-Type': 'application/json'
});

// Create a new persistent memory thread for a client.
// Call once on enrollment. Store the returned thread_id in your DB.
export async function createClientThread(clientId, clientName) {
    const assistantId = process.env.BACKBOARD_HANDOFF_AGENT_ID;
    const res = await axios.post(
        `${BASE}/assistants/${assistantId}/threads`,
        { metadata: { client_id: clientId, client_name: clientName } },
        { headers: headers() }
    );
    return res.data.thread_id;
}

// Run a specific agent on a client's thread.
// Returns the agent's text response when complete.
export async function runAgent(assistantId, threadId, userMessage) {
    const res = await axios.post(
        `${BASE}/threads/${threadId}/messages`,
        {
            content: userMessage,
            stream: false,
            memory: 'Auto'
        },
        { headers: { 'X-API-Key': process.env.BACKBOARD_API_KEY, 'Content-Type': 'application/json' } }
    );
    return res.data.content;
}

// Write a structured note to the client's memory.
// Use after every PSW visit log.
export async function writeMemory(threadId, content) {
    await axios.post(
        `${BASE}/threads/${threadId}/messages`,
        { content, stream: false, memory: 'On' },
        { headers: { 'X-API-Key': process.env.BACKBOARD_API_KEY, 'Content-Type': 'application/json' } }
    );
}

// Upload a document (PDF) to the thread's RAG store.
export async function uploadDocumentToRAG(threadId, fileBuffer, filename) {
    const form = new FormData();
    form.append('file', fileBuffer, filename);
    await axios.post(`${BASE}/threads/${threadId}/documents`, form, {
        headers: {
            'X-API-Key': process.env.BACKBOARD_API_KEY,
            ...form.getHeaders()
        }
    });
}
