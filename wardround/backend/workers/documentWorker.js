/**
 * Bull worker: after a document is stored in Vultr, download it and push to Backboard for RAG.
 * This keeps the upload API fast and lets Backboard index PDFs in the background (24/7 on the VPS).
 */

import { documentQueue } from '../queue.js';
import { getFromVultr } from '../services/vultrStorage.js';
import * as backboard from '../services/backboard.js';
import { getClientThread, setClientThread } from '../db.js';

documentQueue.process(async (job) => {
    const { key, clientId, threadId: jobThreadId } = job.data;
    const filename = key.split('/').pop() || 'document.pdf';

    const buffer = await getFromVultr(key);

    let threadId = jobThreadId;
    if (!threadId && clientId) {
        threadId = await getClientThread(clientId, 'handoff');
        if (!threadId && backboard.getAssistantId('handoff')) {
            const created = await backboard.createThread(backboard.getAssistantId('handoff'));
            threadId = created.thread_id;
            await setClientThread(clientId, 'handoff', threadId);
        }
    }

    if (threadId) {
        await backboard.uploadDoc(threadId, buffer, filename);
    }
});

export function startWorker() {
    console.log('Document worker started (Bull + Redis).');
}
