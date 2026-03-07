// backend/services/vultrStorage.js
// Vultr Object Storage S3 client

export async function uploadToVultr(fileBuffer, fileName) {
    return `https://vultr.storage.mock/${fileName}`;
}
