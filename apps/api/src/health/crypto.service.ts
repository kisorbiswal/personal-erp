import { Injectable } from '@nestjs/common';
import { createCipheriv, createDecipheriv, randomBytes } from 'crypto';

const ALGO = 'aes-256-gcm';
const IV_LEN = 12;
const TAG_LEN = 16;

@Injectable()
export class CryptoService {
  private key: Buffer;

  constructor() {
    const raw = process.env.ENCRYPTION_KEY;
    // Fall back to a zeroed key if not set — health routes won't work but the
    // rest of the app continues. Set ENCRYPTION_KEY to enable Fitbit OAuth.
    const keyStr = (raw && raw.length >= 32) ? raw.slice(0, 32) : '0'.repeat(32);
    this.key = Buffer.from(keyStr, 'utf-8');
  }

  encrypt(plaintext: string): string {
    const iv = randomBytes(IV_LEN);
    const cipher = createCipheriv(ALGO, this.key, iv);
    const encrypted = Buffer.concat([cipher.update(plaintext, 'utf-8'), cipher.final()]);
    const tag = cipher.getAuthTag();
    // Format: base64(iv + authTag + ciphertext)
    return Buffer.concat([iv, tag, encrypted]).toString('base64');
  }

  decrypt(ciphertext: string): string {
    const buf = Buffer.from(ciphertext, 'base64');
    const iv = buf.subarray(0, IV_LEN);
    const tag = buf.subarray(IV_LEN, IV_LEN + TAG_LEN);
    const encrypted = buf.subarray(IV_LEN + TAG_LEN);
    const decipher = createDecipheriv(ALGO, this.key, iv);
    decipher.setAuthTag(tag);
    return Buffer.concat([decipher.update(encrypted), decipher.final()]).toString('utf-8');
  }
}
