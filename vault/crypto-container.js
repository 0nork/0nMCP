// ============================================================
// 0nMCP — Vault: Container Crypto Primitives
// ============================================================
// AES-256-GCM encryption, Argon2id key derivation, X25519 ECDH,
// Ed25519 signing, SHA3-256 hashing for the 0nVault container.
//
// Patent Pending: US Provisional Patent Application #63/990,046
// "System and Method for Semantically-Layered Encrypted Digital
//  Business Asset Transfer with Multi-Party Escrow Key Distribution
//  and Public-Verifiable State Certification"
// ============================================================

import { randomBytes, createCipheriv, createDecipheriv, randomUUID, pbkdf2Sync } from "crypto";
import { createRequire } from "module";

const require = createRequire(import.meta.url);

// ── Load optional dependencies ───────────────────────────────
let naclModule = null;
let sha3Module = null;

try { naclModule = require("tweetnacl"); } catch {}
try { sha3Module = require("js-sha3"); } catch {}

function requireNacl() {
  if (naclModule) return naclModule;
  throw new Error("tweetnacl package required. Install: npm i tweetnacl");
}

function requireSha3() {
  if (sha3Module) return sha3Module;
  throw new Error("js-sha3 package required. Install: npm i js-sha3");
}

// ── Constants ────────────────────────────────────────────────
const ALGORITHM = "aes-256-gcm";
const KEY_LENGTH = 32;  // 256 bits
const IV_LENGTH = 12;   // 96 bits (GCM recommended)
const SALT_LENGTH = 32; // 256 bits
const TAG_LENGTH = 16;  // 128 bits (GCM auth tag)

// Argon2id parameters for credentials double-encryption
const ARGON2_MEMORY = 65536;     // 64MB
const ARGON2_ITERATIONS = 4;
const ARGON2_PARALLELISM = 2;
const ARGON2_HASH_LENGTH = 32;   // 256 bits

// ── Key Derivation ───────────────────────────────────────────

/**
 * Derive key from passphrase using PBKDF2-SHA512.
 */
function deriveKeyPBKDF2(passphrase, salt) {
  return pbkdf2Sync(passphrase, salt, 100000, KEY_LENGTH, "sha512");
}

/**
 * Derive key using Argon2id for credentials double-encryption.
 *
 * @param {string} passphrase
 * @param {Buffer} salt
 * @returns {Promise<Buffer>} 32-byte key
 */
export async function deriveKeyArgon2(passphrase, salt) {
  let argon2;
  try { argon2 = await import("argon2"); } catch {
    throw new Error("argon2 package required for credentials layer. Install: npm i argon2");
  }
  const mod = argon2.default || argon2;
  const hash = await mod.hash(passphrase, {
    type: 2, // argon2id
    memoryCost: ARGON2_MEMORY,
    timeCost: ARGON2_ITERATIONS,
    parallelism: ARGON2_PARALLELISM,
    hashLength: ARGON2_HASH_LENGTH,
    salt,
    raw: true,
  });
  return hash;
}

// ── AES-256-GCM ──────────────────────────────────────────────

/**
 * Encrypt data with AES-256-GCM using a passphrase-derived key.
 * Each call generates a unique IV and salt.
 *
 * @param {Buffer|string} plaintext - Data to encrypt
 * @param {string} passphrase - Encryption passphrase
 * @returns {{ ciphertext: Buffer, iv: Buffer, salt: Buffer, tag: Buffer }}
 */
export function encryptAES(plaintext, passphrase) {
  const salt = randomBytes(SALT_LENGTH);
  const iv = randomBytes(IV_LENGTH);
  const key = deriveKeyPBKDF2(passphrase, salt);

  const cipher = createCipheriv(ALGORITHM, key, iv);
  const data = typeof plaintext === "string" ? Buffer.from(plaintext, "utf8") : plaintext;
  const encrypted = Buffer.concat([cipher.update(data), cipher.final()]);
  const tag = cipher.getAuthTag();

  return { ciphertext: encrypted, iv, salt, tag };
}

/**
 * Decrypt AES-256-GCM encrypted data.
 *
 * @param {Buffer} ciphertext - Encrypted data
 * @param {string} passphrase - Decryption passphrase
 * @param {Buffer} iv - Initialization vector
 * @param {Buffer} salt - PBKDF2 salt
 * @param {Buffer} tag - GCM auth tag
 * @returns {Buffer} Decrypted data
 */
export function decryptAES(ciphertext, passphrase, iv, salt, tag) {
  const key = deriveKeyPBKDF2(passphrase, salt);
  const decipher = createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(tag);

  try {
    return Buffer.concat([decipher.update(ciphertext), decipher.final()]);
  } catch {
    throw new Error("Decryption failed — wrong passphrase or corrupted data");
  }
}

/**
 * Encrypt data with a raw 256-bit key (for escrow layer keys).
 *
 * @param {Buffer} plaintext - Data to encrypt
 * @param {Buffer} key - 32-byte AES key
 * @returns {{ ciphertext: Buffer, iv: Buffer, tag: Buffer }}
 */
export function encryptAESRaw(plaintext, key) {
  const iv = randomBytes(IV_LENGTH);
  const cipher = createCipheriv(ALGORITHM, key, iv);
  const encrypted = Buffer.concat([cipher.update(plaintext), cipher.final()]);
  const tag = cipher.getAuthTag();
  return { ciphertext: encrypted, iv, tag };
}

/**
 * Decrypt with a raw 256-bit key.
 *
 * @param {Buffer} ciphertext
 * @param {Buffer} key - 32-byte AES key
 * @param {Buffer} iv
 * @param {Buffer} tag
 * @returns {Buffer}
 */
export function decryptAESRaw(ciphertext, key, iv, tag) {
  const decipher = createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(tag);
  try {
    return Buffer.concat([decipher.update(ciphertext), decipher.final()]);
  } catch {
    throw new Error("Decryption failed — wrong key or corrupted data");
  }
}

// ── Ed25519 Signing ──────────────────────────────────────────

/**
 * Generate Ed25519 signing keypair.
 * @returns {{ publicKey: Buffer, secretKey: Buffer }}
 */
export function generateSigningKeyPair() {
  const nacl = requireNacl();
  const pair = nacl.sign.keyPair();
  return {
    publicKey: Buffer.from(pair.publicKey),
    secretKey: Buffer.from(pair.secretKey),
  };
}

/**
 * Sign data with Ed25519.
 * @param {Buffer} data - Data to sign
 * @param {Buffer} secretKey - 64-byte Ed25519 secret key
 * @returns {Buffer} 64-byte signature
 */
export function sign(data, secretKey) {
  const nacl = requireNacl();
  const sig = nacl.sign.detached(new Uint8Array(data), new Uint8Array(secretKey));
  return Buffer.from(sig);
}

/**
 * Verify Ed25519 signature.
 * @param {Buffer} data
 * @param {Buffer} signature - 64-byte signature
 * @param {Buffer} publicKey - 32-byte public key
 * @returns {boolean}
 */
export function verifySignature(data, signature, publicKey) {
  const nacl = requireNacl();
  return nacl.sign.detached.verify(
    new Uint8Array(data),
    new Uint8Array(signature),
    new Uint8Array(publicKey)
  );
}

// ── X25519 ECDH ──────────────────────────────────────────────

/**
 * Generate X25519 keypair for escrow key exchange.
 * @returns {{ publicKey: Buffer, secretKey: Buffer }}
 */
export function generateEscrowKeyPair() {
  const nacl = requireNacl();
  const pair = nacl.box.keyPair();
  return {
    publicKey: Buffer.from(pair.publicKey),
    secretKey: Buffer.from(pair.secretKey),
  };
}

/**
 * Compute shared secret via X25519 ECDH.
 * @param {Buffer} mySecretKey - 32-byte secret key
 * @param {Buffer} theirPublicKey - 32-byte public key
 * @returns {Buffer} 32-byte shared secret
 */
export function computeSharedSecret(mySecretKey, theirPublicKey) {
  const nacl = requireNacl();
  const shared = nacl.box.before(
    new Uint8Array(theirPublicKey),
    new Uint8Array(mySecretKey)
  );
  return Buffer.from(shared);
}

// ── SHA3-256 ─────────────────────────────────────────────────

/**
 * Compute SHA3-256 hash.
 * @param {Buffer|string} data
 * @returns {Buffer} 32-byte hash
 */
export function sha3(data) {
  const sha3Lib = requireSha3();
  const input = typeof data === "string" ? data : new Uint8Array(data);
  const hash = sha3Lib.sha3_256.create().update(input).digest();
  return Buffer.from(hash);
}

/**
 * Compute SHA3-256 hash and return hex string.
 * @param {Buffer|string} data
 * @returns {string} 64-char hex hash
 */
export function sha3Hex(data) {
  return sha3(data).toString("hex");
}

// ── UUID ─────────────────────────────────────────────────────

/**
 * Generate a UUID v4 transfer ID.
 * @returns {string}
 */
export function generateTransferId() {
  return randomUUID();
}

// ── Exports ──────────────────────────────────────────────────
export {
  ALGORITHM,
  KEY_LENGTH,
  IV_LENGTH,
  SALT_LENGTH,
  TAG_LENGTH,
  ARGON2_MEMORY,
  ARGON2_ITERATIONS,
  ARGON2_PARALLELISM,
  ARGON2_HASH_LENGTH,
};
