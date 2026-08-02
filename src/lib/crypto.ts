/**
 * X-PATH — Encryption helper
 * ------------------------------------------------------------------
 * Encrypts sensitive values at rest (currently: TOTP secrets) using
 * AES-256-GCM with the app ENCRYPTION_KEY.
 *
 * NOTE (honesty, per PROJECT_HEADER G5): this is strong per-value encryption
 * and strict access isolation — NOT zero-knowledge. The system can process
 * data to assist the pathologist; it simply is never browsed by other humans.
 */

import { createCipheriv, createDecipheriv, randomBytes } from "crypto";

const ALGO = "aes-256-gcm";

function key(): Buffer {
  const raw = process.env.ENCRYPTION_KEY;
  if (!raw) throw new Error("ENCRYPTION_KEY is not set");
  const k = Buffer.from(raw, "base64");
  if (k.length !== 32) {
    throw new Error("ENCRYPTION_KEY must be 32 bytes (base64 of 32 bytes)");
  }
  return k;
}

/** Returns "iv.tag.ciphertext", all base64. */
export function encrypt(plaintext: string): string {
  const iv = randomBytes(12);
  const cipher = createCipheriv(ALGO, key(), iv);
  const enc = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return [iv.toString("base64"), tag.toString("base64"), enc.toString("base64")].join(".");
}

export function decrypt(payload: string): string {
  const [ivB64, tagB64, dataB64] = payload.split(".");
  if (!ivB64 || !tagB64 || !dataB64) throw new Error("Malformed ciphertext");
  const decipher = createDecipheriv(ALGO, key(), Buffer.from(ivB64, "base64"));
  decipher.setAuthTag(Buffer.from(tagB64, "base64"));
  return Buffer.concat([
    decipher.update(Buffer.from(dataB64, "base64")),
    decipher.final(),
  ]).toString("utf8");
}
