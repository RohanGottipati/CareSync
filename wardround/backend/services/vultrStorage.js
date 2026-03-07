/**
 * Vultr Object Storage (S3-compatible) service for WardRound document storage.
 *
 * WHY VULTR OBJECT STORAGE:
 * - S3-compatible API: use standard AWS SDK, no lock-in; same code works with AWS if needed.
 * - Data residency: Vultr offers regions; we use the closest to Toronto (New Jersey / EWR)
 *   since Object Storage is not yet in Toronto. Keeping compute + Redis on a Toronto VPS
 *   keeps most operational data in Canada; object storage in EWR is a common choice for
 *   Canadian apps until a Canadian bucket region exists.
 * - 24/7 availability: Object storage is highly durable and available for PSW uploads
 *   (care plans, PDFs) at any time, independent of our Node process.
 * - Cost-effective: Pay for storage and egress without managing disks on the VPS.
 *
 * Endpoint format: https://<region>.vultrobjects.com (e.g. ewr1.vultrobjects.com).
 * Credentials: from Vultr Customer Portal → Object Storage → S3 Credentials.
 */

import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const bucket = process.env.VULTR_STORAGE_BUCKET || 'wardround-documents';
const region = process.env.VULTR_STORAGE_REGION || 'ewr1';

const s3 = new S3Client({
  region,
  endpoint: process.env.VULTR_STORAGE_ENDPOINT || `https://${region}.vultrobjects.com`,
  credentials: process.env.VULTR_STORAGE_ACCESS_KEY && process.env.VULTR_STORAGE_SECRET_KEY
    ? {
        accessKeyId: process.env.VULTR_STORAGE_ACCESS_KEY,
        secretAccessKey: process.env.VULTR_STORAGE_SECRET_KEY,
      }
    : undefined,
  forcePathStyle: true,
});

/**
 * Upload a file buffer (e.g. PDF) to Vultr Object Storage.
 * @param {Buffer} fileBuffer - Raw file content
 * @param {string} key - Object key (path) in the bucket, e.g. "clients/abc123/visit-notes.pdf"
 * @param {string} [contentType] - MIME type, e.g. "application/pdf"
 * @returns {Promise<{ url: string, key: string }>} Public URL (if bucket is public) or key for later signed URL
 */
export async function uploadToVultr(fileBuffer, key, contentType = 'application/pdf') {
  const command = new PutObjectCommand({
    Bucket: bucket,
    Key: key,
    Body: fileBuffer,
    ContentType: contentType,
  });
  await s3.send(command);
  const baseUrl = (process.env.VULTR_STORAGE_ENDPOINT || `https://${region}.vultrobjects.com`).replace(/^https?:\/\//, '');
  const url = `https://${bucket}.${baseUrl}/${key}`;
  return { url, key };
}

/**
 * Generate a signed (temporary) URL to download a private object. Use when bucket is not public.
 * @param {string} key - Object key
 * @param {number} [expiresIn = 3600] - URL validity in seconds
 */
export async function getSignedDownloadUrl(key, expiresIn = 3600) {
  const command = new GetObjectCommand({ Bucket: bucket, Key: key });
  return getSignedUrl(s3, command, { expiresIn });
}

/**
 * Download an object from the bucket (e.g. for worker to send to Backboard).
 * @param {string} key - Object key
 * @returns {Promise<Buffer>}
 */
export async function getFromVultr(key) {
  const command = new GetObjectCommand({ Bucket: bucket, Key: key });
  const response = await s3.send(command);
  const chunks = [];
  for await (const chunk of response.Body) chunks.push(chunk);
  return Buffer.concat(chunks);
}

/**
 * Delete an object from the bucket.
 * @param {string} key - Object key
 */
export async function deleteFromVultr(key) {
  const command = new DeleteObjectCommand({ Bucket: bucket, Key: key });
  await s3.send(command);
}
