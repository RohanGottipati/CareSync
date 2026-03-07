// backend/services/vultrStorage.js — Vultr Object Storage (S3-compatible)
import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const s3 = new S3Client({
    endpoint: process.env.VULTR_STORAGE_ENDPOINT,
    region: 'ewr1',
    credentials: {
        accessKeyId: process.env.VULTR_STORAGE_ACCESS_KEY,
        secretAccessKey: process.env.VULTR_STORAGE_SECRET_KEY
    },
    forcePathStyle: true
});

export async function uploadFile(fileBuffer, filename, mimeType) {
    const key = `documents/${Date.now()}-${filename}`;
    await s3.send(new PutObjectCommand({
        Bucket: process.env.VULTR_STORAGE_BUCKET,
        Key: key,
        Body: fileBuffer,
        ContentType: mimeType,
        ACL: 'private'
    }));
    return key;
}

export async function getSignedDownloadUrl(key) {
    return await getSignedUrl(s3, new GetObjectCommand({
        Bucket: process.env.VULTR_STORAGE_BUCKET,
        Key: key
    }), { expiresIn: 3600 });
}
