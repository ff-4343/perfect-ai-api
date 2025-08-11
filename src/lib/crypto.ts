// src/lib/crypto.ts
import crypto from 'node:crypto';

const ALGO = 'aes-256-gcm';
const KEY_HEX = process.env.APP_SECRET; // 64 hex chars (32 bytes)

if (!KEY_HEX || KEY_HEX.length !== 64) {
  console.warn('⚠️ APP_SECRET is missing/invalid. Generate: `openssl rand -hex 32`');
}

function key() {
  return Buffer.from(KEY_HEX as string, 'hex');
}

export function encrypt(plain: string) {
  const iv = crypto.randomBytes(12);
  const c = crypto.createCipheriv(ALGO, key(), iv);
  const ciphertext = Buffer.concat([c.update(plain, 'utf8'), c.final()]);
  const tag = c.getAuthTag();
  return {
    ciphertext: ciphertext.toString('base64'),
    iv: iv.toString('base64'),
    tag: tag.toString('base64'),
  };
}

export function decrypt(ciphertextB64: string, ivB64: string, tagB64: string) {
  const iv = Buffer.from(ivB64, 'base64');
  const tag = Buffer.from(tagB64, 'base64');
  const d = crypto.createDecipheriv(ALGO, key(), iv);
  d.setAuthTag(tag);
  const plain = Buffer.concat([d.update(Buffer.from(ciphertextB64, 'base64')), d.final()]);
  return plain.toString('utf8');
}