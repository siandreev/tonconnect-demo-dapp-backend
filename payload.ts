import * as crypto from 'crypto';

export const db: { payloads: string[] } = {
    payloads: []
}

export function generatePayload() {
    const buffer = Buffer.alloc(16);

    return crypto.getRandomValues(buffer).toString('hex');
}
