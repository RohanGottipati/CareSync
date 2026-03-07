// backend/services/backboard.js
// Backboard API service — all interactions with the Backboard memory/agent platform.

import axios from 'axios';
import FormData from 'form-data';
import dotenv from 'dotenv';
dotenv.config();

const BASE_URL = process.env.BACKBOARD_BASE_URL || 'https://app.backboard.io/api';
const API_KEY = process.env.BACKBOARD_API_KEY;

const headers = () => ({
    'X-API-Key': API_KEY,
});

/**
 * Create a new Backboard thread under the given assistant.
 * Each client gets one persistent thread per agent.
 *
 * @param {string} assistantId - The Backboard assistant ID.
 * @returns {Promise<string>} The newly created thread_id.
 */
export async function createClientThread(assistantId) {
    const res = await axios.post(
        `${BASE_URL}/assistants/${assistantId}/threads`,
        {},
        { headers: headers() }
    );
    return res.data.thread_id;
}

/**
 * Run an agent by sending a message to a given thread.
 * Blocks until the agent responds (stream: false).
 *
 * @param {string} threadId - The Backboard thread ID.
 * @param {string} prompt - The message to send.
 * @returns {Promise<string>} The agent's text response.
 */
export async function runAgent(threadId, prompt) {
    const res = await axios.post(
        `${BASE_URL}/threads/${threadId}/messages`,
        { content: prompt, stream: false },
        { headers: headers() }
    );
    return res.data.content;
}

/**
 * Write a memory entry to the given assistant's shared memory pool.
 * All threads under this assistant will have access to this memory.
 *
 * @param {string} assistantId - The Backboard assistant ID.
 * @param {string} content - The memory string to store.
 * @returns {Promise<object>} The created memory object.
 */
export async function writeMemory(assistantId, content) {
    const res = await axios.post(
        `${BASE_URL}/assistants/${assistantId}/memories`,
        { content },
        { headers: headers() }
    );
    return res.data;
}

/**
 * Upload a document to the assistant's RAG knowledge base.
 * Documents uploaded to the assistant are shared across all threads.
 *
 * @param {string} assistantId - The Backboard assistant ID.
 * @param {Buffer} fileBuffer - The raw file buffer.
 * @param {string} filename - The file name (e.g. "care-plan.pdf").
 * @returns {Promise<object>} The document object with document_id and status.
 */
export async function uploadDocumentToRAG(assistantId, fileBuffer, filename) {
    const form = new FormData();
    form.append('file', fileBuffer, { filename });

    const res = await axios.post(
        `${BASE_URL}/assistants/${assistantId}/documents`,
        form,
        {
            headers: {
                ...headers(),
                ...form.getHeaders(),
            },
        }
    );
    return res.data;
}
