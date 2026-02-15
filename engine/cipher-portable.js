// ============================================================
// 0nMCP — Engine: Portable Cipher
// ============================================================
// AES-256-GCM encryption with PBKDF2 key derivation.
// PASSPHRASE-ONLY — no machine fingerprint binding.
// This makes bundles portable across different machines.
//
// For machine-bound encryption, use vault/cipher.js instead.
// Zero external dependencies — Node.js built-in `crypto` only.
//
// Patent Pending: US Provisional Patent Application #63/968,814
// ============================================================

import { randomBytes, createCipheriv, createDecipheriv, pbkdf2Sync } from "crypto";

const ALGORITHM = "aes-256-gcm";
const KEY_LENGTH = 32;
const IV_LENGTH = 16;
const SALT_LENGTH = 32;
const TAG_LENGTH = 16;
const PBKDF2_ITERATIONS = 100000;
const PBKDF2_DIGEST = "sha512";

/**
 * Derive encryption key from passphrase only (no fingerprint).
 * This is the key difference from vault/cipher.js — bundles are portable.
 */
function deriveKey(passphrase, salt) {
  return pbkdf2Sync(passphrase, salt, PBKDF2_ITERATIONS, KEY_LENGTH, PBKDF2_DIGEST);
}

/**
 * Encrypt data with passphrase-only AES-256-GCM (portable).
 * @param {string} plaintext
 * @param {string} passphrase
 * @returns {{ sealed: string }}
 */
export function sealPortable(plaintext, passphrase) {
  const salt = randomBytes(SALT_LENGTH);
  const iv = randomBytes(IV_LENGTH);
  const key = deriveKey(passphrase, salt);

  const cipher = createCipheriv(ALGORITHM, key, iv);
  const encrypted = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  const authTag = cipher.getAuthTag();

  const combined = Buffer.concat([salt, iv, authTag, encrypted]);
  return { sealed: combined.toString("base64") };
}

/**
 * Decrypt portable-sealed data.
 * @param {string} sealedData - Base64 sealed data
 * @param {string} passphrase
 * @returns {string} Decrypted plaintext
 */
export function unsealPortable(sealedData, passphrase) {
  const combined = Buffer.from(sealedData, "base64");

  if (combined.length < SALT_LENGTH + IV_LENGTH + TAG_LENGTH + 1) {
    throw new Error("Invalid sealed data: too short");
  }

  const salt = combined.subarray(0, SALT_LENGTH);
  const iv = combined.subarray(SALT_LENGTH, SALT_LENGTH + IV_LENGTH);
  const authTag = combined.subarray(SALT_LENGTH + IV_LENGTH, SALT_LENGTH + IV_LENGTH + TAG_LENGTH);
  const ciphertext = combined.subarray(SALT_LENGTH + IV_LENGTH + TAG_LENGTH);

  const key = deriveKey(passphrase, salt);
  const decipher = createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);

  try {
    const decrypted = Buffer.concat([decipher.update(ciphertext), decipher.final()]);
    return decrypted.toString("utf8");
  } catch {
    throw new Error("Unseal failed — wrong passphrase.");
  }
}

/**
 * Verify sealed data can be decrypted with given passphrase.
 * @param {string} sealedData
 * @param {string} passphrase
 * @returns {{ valid: boolean, error?: string }}
 */
export function verifyPortable(sealedData, passphrase) {
  try {
    unsealPortable(sealedData, passphrase);
    return { valid: true };
  } catch (err) {
    return { valid: false, error: err.message };
  }
}
