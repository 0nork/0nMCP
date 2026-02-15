// ============================================================
// 0nMCP — Vault: Cipher Engine
// ============================================================
// AES-256-GCM encryption with PBKDF2 key derivation.
// Keys are derived from passphrase + machine fingerprint,
// making sealed files machine-bound — they can ONLY be
// unsealed on the same hardware they were sealed on.
//
// Zero external dependencies — Node.js built-in `crypto` only.
//
// Patent Pending: US Provisional Patent Application #63/968,814
// ============================================================

import { randomBytes, createCipheriv, createDecipheriv, pbkdf2Sync } from "crypto";
import { getFingerprint } from "./fingerprint.js";

const ALGORITHM = "aes-256-gcm";
const KEY_LENGTH = 32; // 256 bits
const IV_LENGTH = 16; // 128 bits
const SALT_LENGTH = 32; // 256 bits
const TAG_LENGTH = 16; // 128 bits (GCM auth tag)
const PBKDF2_ITERATIONS = 100000;
const PBKDF2_DIGEST = "sha512";

/**
 * Derive an encryption key from passphrase + machine fingerprint.
 *
 * The fingerprint is mixed into the key derivation so that
 * the same passphrase on a different machine produces a
 * completely different key — making sealed files machine-bound.
 *
 * @param {string} passphrase - User-provided passphrase
 * @param {Buffer} salt - Random salt for PBKDF2
 * @returns {Buffer} 32-byte AES-256 key
 */
function deriveKey(passphrase, salt) {
  const fingerprint = getFingerprint();
  const material = `${passphrase}:${fingerprint}`;
  return pbkdf2Sync(material, salt, PBKDF2_ITERATIONS, KEY_LENGTH, PBKDF2_DIGEST);
}

/**
 * Encrypt plaintext data using AES-256-GCM.
 *
 * Output format (binary concat):
 *   [salt:32][iv:16][authTag:16][ciphertext:*]
 *
 * @param {string} plaintext - Data to encrypt (JSON string)
 * @param {string} passphrase - Encryption passphrase
 * @returns {{ sealed: string, fingerprint: string }}
 */
export function seal(plaintext, passphrase) {
  const salt = randomBytes(SALT_LENGTH);
  const iv = randomBytes(IV_LENGTH);
  const key = deriveKey(passphrase, salt);

  const cipher = createCipheriv(ALGORITHM, key, iv);
  const encrypted = Buffer.concat([
    cipher.update(plaintext, "utf8"),
    cipher.final(),
  ]);
  const authTag = cipher.getAuthTag();

  // Combine: salt + iv + authTag + ciphertext → base64
  const combined = Buffer.concat([salt, iv, authTag, encrypted]);
  const sealed = combined.toString("base64");

  return {
    sealed,
    fingerprint: getFingerprint(),
  };
}

/**
 * Decrypt sealed data using AES-256-GCM.
 *
 * @param {string} sealedData - Base64-encoded sealed data
 * @param {string} passphrase - Decryption passphrase
 * @returns {string} Decrypted plaintext
 * @throws {Error} If passphrase is wrong or file is not machine-bound to this hardware
 */
export function unseal(sealedData, passphrase) {
  const combined = Buffer.from(sealedData, "base64");

  if (combined.length < SALT_LENGTH + IV_LENGTH + TAG_LENGTH + 1) {
    throw new Error("Invalid sealed data: too short");
  }

  // Extract components
  const salt = combined.subarray(0, SALT_LENGTH);
  const iv = combined.subarray(SALT_LENGTH, SALT_LENGTH + IV_LENGTH);
  const authTag = combined.subarray(SALT_LENGTH + IV_LENGTH, SALT_LENGTH + IV_LENGTH + TAG_LENGTH);
  const ciphertext = combined.subarray(SALT_LENGTH + IV_LENGTH + TAG_LENGTH);

  const key = deriveKey(passphrase, salt);

  const decipher = createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);

  try {
    const decrypted = Buffer.concat([
      decipher.update(ciphertext),
      decipher.final(),
    ]);
    return decrypted.toString("utf8");
  } catch {
    throw new Error(
      "Unseal failed — wrong passphrase or file was sealed on a different machine. " +
      "Vault files are machine-bound and can only be unsealed on the same hardware."
    );
  }
}

/**
 * Verify that sealed data can be unsealed on this machine.
 * Also checks stored fingerprint against current hardware.
 *
 * @param {string} sealedData - Base64-encoded sealed data
 * @param {string} storedFingerprint - Fingerprint stored when file was sealed
 * @param {string} passphrase - Passphrase to test
 * @returns {{ valid: boolean, machineBound: boolean, error?: string }}
 */
export function verify(sealedData, storedFingerprint, passphrase) {
  const currentFingerprint = getFingerprint();
  const machineBound = currentFingerprint === storedFingerprint;

  if (!machineBound) {
    return {
      valid: false,
      machineBound: false,
      error: "Machine fingerprint mismatch — this file was sealed on a different machine.",
      currentFingerprint,
      storedFingerprint,
    };
  }

  try {
    unseal(sealedData, passphrase);
    return { valid: true, machineBound: true };
  } catch (err) {
    return {
      valid: false,
      machineBound: true,
      error: err.message,
    };
  }
}
