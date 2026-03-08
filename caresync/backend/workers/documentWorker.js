/**
 * Bull worker: after a document is stored in Vultr, download it and push to Backboard for RAG.
 * Uploads the document to both the client's handoff thread (briefing agent) and their family
 * thread (family update agent) so both agents have patient-specific document context.
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

    // ── Handoff thread (briefing agent) ──────────────────────────────────────
    let handoffThreadId = jobThreadId;
    if (!handoffThreadId && clientId) {
        handoffThreadId = await getClientThread(clientId, 'handoff');
        if (!handoffThreadId && backboard.getAssistantId('handoff')) {
            const created = await backboard.createThread(backboard.getAssistantId('handoff'));
            handoffThreadId = created.thread_id;
            await setClientThread(clientId, 'handoff', handoffThreadId);
        }
    }

    if (handoffThreadId) {
        await backboard.uploadDoc(handoffThreadId, buffer, filename);
        console.log(`[documentWorker] Uploaded "${filename}" to handoff thread ${handoffThreadId}`);
    }

    // ── Family thread (family update agent) — patient-specific documents only ─
    if (clientId && backboard.getAssistantId('family')) {
        try {
            let familyThreadId = await getClientThread(clientId, 'family');
            if (!familyThreadId) {
                const created = await backboard.createThread(backboard.getAssistantId('family'));
                familyThreadId = created.thread_id;
                await setClientThread(clientId, 'family', familyThreadId);
            }
            await backboard.uploadDoc(familyThreadId, buffer, filename);
            console.log(`[documentWorker] Uploaded "${filename}" to family thread ${familyThreadId}`);
        } catch (familyErr) {
            // Non-fatal: handoff upload already succeeded; just log
            console.warn(`[documentWorker] Family thread upload failed (non-fatal): ${familyErr.message}`);
        }
    }
});

export function startWorker() {
    console.log('Document worker started (Bull + Redis).');
}
