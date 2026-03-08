/**
 * Bull queue for async document processing on a local Redis instance.
 *
 * WHY REDIS + BULL ON THE VPS:
 * - 24/7 background tasks: PSWs upload PDFs at any time; processing (e.g. sending to
 *   Backboard for RAG indexing) can be slow. Offloading to a worker keeps API responses
 *   fast and avoids timeouts. Redis on the same Toronto VPS keeps job data in Canada.
 * - Reliability: Bull retries failed jobs and persists to Redis, so a server restart
 *   doesn't lose pending work. Critical for care documents.
 * - Scalability: Later you can run multiple worker processes or move Redis to a managed
 *   service (e.g. Vultr Managed Redis when available) without changing this API.
 *
 * Redis URL: set REDIS_URL (e.g. redis://localhost:6379) in .env. Run Redis on the
 * same VPS or use a managed instance for production.
 */

import Queue from 'bull';

const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';

/**
 * Queue for document processing: after a PDF is uploaded to Vultr, we add a job here.
 * The worker (workers/documentWorker.js) picks it up and e.g. uploads to Backboard for RAG.
 */
export const documentQueue = new Queue('wardround:documents', {
  redis: REDIS_URL,
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: 'exponential', delay: 2000 },
    removeOnComplete: 100,
  },
});

/**
 * Add a document job (call after storing file in Vultr).
 * @param {{ key: string, clientId?: string, threadId?: string }} data - key = Vultr object key; optional client/thread for Backboard
 */
export async function addDocumentJob(data) {
  return documentQueue.add(data);
}
