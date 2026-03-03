// ============================================================
// 0nMCP — Vault: Cross-Platform E2E Encrypted Sync
// ============================================================
// Syncs vault credentials across CLI, web console, and other
// platforms using Argon2id key derivation + AES-256-GCM.
//
// The server NEVER sees plaintext credentials — only encrypted
// blobs are stored/transmitted. The sync passphrase never
// leaves the user's device.
// ============================================================

import { readFileSync, writeFileSync, readdirSync, existsSync, mkdirSync } from "fs";
import { join } from "path";
import { homedir } from "os";
import { randomBytes, createCipheriv, createDecipheriv } from "crypto";
import { createRequire } from "module";

const require = createRequire(import.meta.url);

const DOT_ON = join(homedir(), ".0n");
const CONNECTIONS_DIR = join(DOT_ON, "connections");
const SYNC_SALT_FILE = join(DOT_ON, "sync-salt");
const API_BASE = "https://0nmcp.com";

// AES-256-GCM constants
const ALGORITHM = "aes-256-gcm";
const KEY_LENGTH = 32;
const IV_LENGTH = 12; // 96 bits (GCM recommended)
const TAG_LENGTH = 16;

// Argon2id parameters (same as crypto-container.js)
const ARGON2_MEMORY = 65536;     // 64MB
const ARGON2_ITERATIONS = 4;
const ARGON2_PARALLELISM = 2;
const ARGON2_HASH_LENGTH = 32;   // 256 bits

// ── Key Derivation ──────────────────────────────────────────

/**
 * Derive a 256-bit encryption key from passphrase using Argon2id.
 * Memory-hard and GPU-resistant.
 *
 * @param {string} passphrase - User's sync passphrase
 * @param {Buffer} salt - 32-byte salt
 * @returns {Promise<Buffer>} 32-byte AES-256 key
 */
async function deriveKey(passphrase, salt) {
  let argon2;
  try {
    argon2 = await import("argon2");
  } catch {
    throw new Error("argon2 package required for vault sync. Install: npm i argon2");
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

// ── Encryption / Decryption ─────────────────────────────────

/**
 * Encrypt data for cloud sync.
 * Uses Argon2id-derived key + AES-256-GCM.
 *
 * @param {string} plaintext - Data to encrypt
 * @param {string} passphrase - Sync passphrase
 * @returns {Promise<{ encrypted_data: string, iv: string, salt: string }>}
 */
export async function encryptForSync(plaintext, passphrase) {
  const salt = randomBytes(32);
  const iv = randomBytes(IV_LENGTH);
  const key = await deriveKey(passphrase, salt);

  const cipher = createCipheriv(ALGORITHM, key, iv);
  const encrypted = Buffer.concat([
    cipher.update(plaintext, "utf8"),
    cipher.final(),
  ]);
  const tag = cipher.getAuthTag();

  // Combine tag + ciphertext for storage
  const combined = Buffer.concat([tag, encrypted]);

  return {
    encrypted_data: combined.toString("base64"),
    iv: iv.toString("base64"),
    salt: salt.toString("base64"),
  };
}

/**
 * Decrypt data from cloud sync.
 *
 * @param {string} encryptedB64 - Base64 encoded [tag + ciphertext]
 * @param {string} ivB64 - Base64 encoded IV
 * @param {string} saltB64 - Base64 encoded salt
 * @param {string} passphrase - Sync passphrase
 * @returns {Promise<string>} Decrypted plaintext
 */
export async function decryptFromSync(encryptedB64, ivB64, saltB64, passphrase) {
  const combined = Buffer.from(encryptedB64, "base64");
  const iv = Buffer.from(ivB64, "base64");
  const salt = Buffer.from(saltB64, "base64");

  if (combined.length < TAG_LENGTH + 1) {
    throw new Error("Invalid encrypted data: too short");
  }

  const tag = combined.subarray(0, TAG_LENGTH);
  const ciphertext = combined.subarray(TAG_LENGTH);

  const key = await deriveKey(passphrase, salt);

  const decipher = createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(tag);

  try {
    const decrypted = Buffer.concat([
      decipher.update(ciphertext),
      decipher.final(),
    ]);
    return decrypted.toString("utf8");
  } catch {
    throw new Error("Decryption failed — wrong sync passphrase.");
  }
}

// ── Sync Operations ─────────────────────────────────────────

async function apiCall(method, path, token, body = null) {
  const headers = {
    "Authorization": `Bearer ${token}`,
    "Content-Type": "application/json",
  };

  const opts = { method, headers };
  if (body) opts.body = JSON.stringify(body);

  const res = await fetch(`${API_BASE}${path}`, opts);
  const data = await res.json();
  return { ok: res.ok, status: res.status, data };
}

/**
 * Push all local connections to cloud (E2E encrypted).
 *
 * @param {string} token - Access token
 * @param {string} passphrase - Sync passphrase
 * @returns {Promise<{ pushed: number, errors: string[] }>}
 */
export async function pushToCloud(token, passphrase) {
  if (!existsSync(CONNECTIONS_DIR)) {
    return { pushed: 0, errors: ["No connections directory found. Run: 0nmcp init"] };
  }

  const files = readdirSync(CONNECTIONS_DIR).filter(f => f.endsWith(".0n"));
  const errors = [];
  let pushed = 0;

  for (const file of files) {
    const serviceKey = file.replace(".0n", "");
    try {
      const content = readFileSync(join(CONNECTIONS_DIR, file), "utf8");
      const { encrypted_data, iv, salt } = await encryptForSync(content, passphrase);

      const { ok, data } = await apiCall("PUT", "/api/vault/sync", token, {
        service_key: serviceKey,
        encrypted_data,
        iv,
        salt,
      });

      if (ok) {
        pushed++;
      } else {
        errors.push(`${serviceKey}: ${data.error || "Unknown error"}`);
      }
    } catch (err) {
      errors.push(`${serviceKey}: ${err.message}`);
    }
  }

  return { pushed, errors };
}

/**
 * Pull all connections from cloud and write to local.
 *
 * @param {string} token - Access token
 * @param {string} passphrase - Sync passphrase
 * @returns {Promise<{ pulled: number, errors: string[] }>}
 */
export async function pullFromCloud(token, passphrase) {
  if (!existsSync(CONNECTIONS_DIR)) {
    mkdirSync(CONNECTIONS_DIR, { recursive: true });
  }

  const { ok, data } = await apiCall("GET", "/api/vault/sync", token);
  if (!ok) {
    return { pulled: 0, errors: [data.error || "Failed to fetch from cloud"] };
  }

  const entries = data.entries || [];
  const errors = [];
  let pulled = 0;

  for (const entry of entries) {
    try {
      const plaintext = await decryptFromSync(
        entry.encrypted_data,
        entry.iv,
        entry.salt,
        passphrase
      );

      const filePath = join(CONNECTIONS_DIR, `${entry.service_key}.0n`);
      writeFileSync(filePath, plaintext);
      pulled++;
    } catch (err) {
      errors.push(`${entry.service_key}: ${err.message}`);
    }
  }

  return { pulled, errors };
}

/**
 * Store sync salt locally (so the passphrase prompt
 * can remind the user they've set one up).
 */
export function hasSyncSetup() {
  return existsSync(SYNC_SALT_FILE);
}

/**
 * Mark that sync has been configured.
 */
export function markSyncSetup() {
  if (!existsSync(DOT_ON)) mkdirSync(DOT_ON, { recursive: true });
  writeFileSync(SYNC_SALT_FILE, new Date().toISOString());
}
