/**
 * Backboard.io integration: persistent "Client Memory Threads" and agents.
 *
 * We use Backboard for:
 * - Handoff Agent: pre-visit briefings (runAgent on a client's thread).
 * - Sentinel Agent: 2 AM medication checks (runAgent with Sentinel assistant).
 * - Family Comms Agent: draft messages to families (runAgent with Family assistant).
 *
 * Threads are persisted by Backboard; we create one thread per client (for Handoff/memory)
 * and optionally use shared threads for Sentinel. All requests use X-API-Key.
 */

const BASE = process.env.BACKBOARD_BASE_URL || 'https://app.backboard.io/api';
const API_KEY = process.env.BACKBOARD_API_KEY;

const headers = () => ({
  'X-API-Key': API_KEY || '',
  'Content-Type': 'application/json',
});

function agentId(agentType) {
  const map = {
    handoff: process.env.BACKBOARD_HANDOFF_AGENT_ID,
    sentinel: process.env.BACKBOARD_SENTINEL_AGENT_ID,
    family: process.env.BACKBOARD_FAMILY_AGENT_ID,
  };
  return map[agentType] || map.handoff;
}

/**
 * Create a new thread for an assistant (e.g. one thread per client for Handoff/memory).
 * @param {string} assistantId - Backboard assistant ID (from env or pass explicitly)
 * @returns {Promise<{ thread_id: string }>}
 */
export async function createThread(assistantId) {
  if (!API_KEY) throw new Error('BACKBOARD_API_KEY is required');
  const res = await fetch(`${BASE}/assistants/${assistantId}/threads`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify({}),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Backboard createThread failed: ${res.status} ${err}`);
  }
  return res.json();
}

/**
 * Write a fact into the thread's persistent memory (memory mode "On").
 * Use after a visit or when recording client info so future Handoff/Sentinel runs have context.
 * @param {string} threadId - Backboard thread ID
 * @param {string} content - Message content to store (e.g. "Visit completed. Client reported no pain.")
 */
export async function writeMemory(threadId, content) {
  if (!API_KEY) throw new Error('BACKBOARD_API_KEY is required');
  const res = await fetch(`${BASE}/threads/${threadId}/messages`, {
    method: 'POST',
    headers: { ...headers(), 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      content,
      stream: 'false',
      memory: 'On',
    }),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Backboard writeMemory failed: ${res.status} ${err}`);
  }
  return res.json();
}

/**
 * Run an agent: send a message to a thread and return the assistant's reply.
 * Used for Handoff (briefing), Sentinel (medication check), and Family (draft message).
 * @param {string} threadId - Backboard thread ID (for that assistant)
 * @param {string} content - User message / prompt (e.g. "Generate today's pre-visit briefing.")
 * @param {{ stream?: boolean }} [opts] - stream: true for SSE (default false for simple response)
 * @returns {Promise<{ content: string }>}
 */
export async function runAgent(threadId, content, opts = {}) {
  if (!API_KEY) throw new Error('BACKBOARD_API_KEY is required');
  const res = await fetch(`${BASE}/threads/${threadId}/messages`, {
    method: 'POST',
    headers: { ...headers(), 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      content,
      stream: opts.stream ? 'true' : 'false',
      memory: 'Auto',
    }),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Backboard runAgent failed: ${res.status} ${err}`);
  }
  const data = await res.json();
  return { content: data.content ?? '' };
}

/**
 * Get assistant ID by type (handoff | sentinel | family). Used by routes to create or target threads.
 */
export function getAssistantId(agentType) {
  return agentId(agentType);
}

/**
 * Upload a document to a thread for RAG. Backboard will chunk and index it.
 * @param {string} threadId - Backboard thread ID
 * @param {Buffer} fileBuffer - File contents
 * @param {string} filename - Original filename (e.g. "care-plan.pdf")
 * @returns {Promise<{ document_id: string, status: string }>}
 */
export async function uploadDoc(threadId, fileBuffer, filename) {
  if (!API_KEY) throw new Error('BACKBOARD_API_KEY is required');
  const form = new FormData();
  form.append('file', new Blob([fileBuffer]), filename);
  const res = await fetch(`${BASE}/threads/${threadId}/documents`, {
    method: 'POST',
    headers: { 'X-API-Key': API_KEY },
    body: form,
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Backboard uploadDoc failed: ${res.status} ${err}`);
  }
  return res.json();
}
