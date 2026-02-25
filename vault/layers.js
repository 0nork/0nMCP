// ============================================================
// 0nMCP — Vault: Semantic Layer Manager
// ============================================================
// 7 named layers, each independently encrypted with AES-256-GCM.
// The credentials layer (layer 2) uses double-encryption via
// Argon2id for maximum protection of API keys and secrets.
//
// Patent Pending: US Provisional Patent Application #63/990,046
// ============================================================

import { encryptAES, decryptAES, deriveKeyArgon2, encryptAESRaw, decryptAESRaw, SALT_LENGTH } from "./crypto-container.js";
import { randomBytes } from "crypto";

// ── Layer Definitions ────────────────────────────────────────

export const LAYER_NAMES = [
  "workflows",      // 1: .0n workflow definitions
  "credentials",    // 2: API keys, tokens, secrets (double-encrypted)
  "env_vars",       // 3: Environment variables
  "mcp_configs",    // 4: MCP server configurations
  "site_profiles",  // 5: CRO9/site configs
  "ai_brain",       // 6: AI agent data, prompts, memory
  "audit_trail",    // 7: Execution logs, timestamps (append-only)
];

export const LAYER_COUNT = LAYER_NAMES.length;

/**
 * Check if a layer name is valid.
 * @param {string} name
 * @returns {boolean}
 */
export function isValidLayer(name) {
  return LAYER_NAMES.includes(name);
}

/**
 * Get the index of a layer by name.
 * @param {string} name
 * @returns {number} 0-based index, or -1 if not found
 */
export function getLayerIndex(name) {
  return LAYER_NAMES.indexOf(name);
}

// ── Layer Encryption ─────────────────────────────────────────

/**
 * Seal (encrypt) a single layer's data.
 *
 * @param {string} name - Layer name
 * @param {any} data - Data to encrypt (will be JSON.stringify'd)
 * @param {string} passphrase - Encryption passphrase
 * @returns {{ name: string, ciphertext: Buffer, iv: Buffer, salt: Buffer, tag: Buffer }}
 */
export function sealLayer(name, data, passphrase) {
  if (!isValidLayer(name)) {
    throw new Error(`Invalid layer name: "${name}". Valid: ${LAYER_NAMES.join(", ")}`);
  }

  const plaintext = JSON.stringify(data);
  const result = encryptAES(plaintext, passphrase);

  return {
    name,
    ciphertext: result.ciphertext,
    iv: result.iv,
    salt: result.salt,
    tag: result.tag,
  };
}

/**
 * Unseal (decrypt) a single layer's data.
 *
 * @param {string} name - Layer name
 * @param {Buffer} ciphertext
 * @param {string} passphrase
 * @param {Buffer} iv
 * @param {Buffer} salt
 * @param {Buffer} tag
 * @returns {any} Parsed JSON data
 */
export function unsealLayer(name, ciphertext, passphrase, iv, salt, tag) {
  if (!isValidLayer(name)) {
    throw new Error(`Invalid layer name: "${name}"`);
  }

  const decrypted = decryptAES(ciphertext, passphrase, iv, salt, tag);
  return JSON.parse(decrypted.toString("utf8"));
}

// ── Credentials Double-Encryption ────────────────────────────

/**
 * Seal credentials with double encryption:
 * 1. First layer: AES-256-GCM with passphrase
 * 2. Second layer: AES-256-GCM with Argon2id-derived key
 *
 * @param {any} data - Credentials data
 * @param {string} passphrase - Encryption passphrase
 * @returns {Promise<{ ciphertext: Buffer, iv: Buffer, salt: Buffer, tag: Buffer, argonSalt: Buffer, innerIv: Buffer, innerTag: Buffer }>}
 */
export async function sealCredentials(data, passphrase) {
  const plaintext = Buffer.from(JSON.stringify(data), "utf8");

  // Inner layer: Argon2id-derived key
  const argonSalt = randomBytes(SALT_LENGTH);
  const argonKey = await deriveKeyArgon2(passphrase, argonSalt);
  const inner = encryptAESRaw(plaintext, argonKey);

  // Outer layer: standard AES-256-GCM with passphrase
  // Combine inner ciphertext + iv + tag for outer encryption
  const innerPayload = Buffer.concat([inner.iv, inner.tag, inner.ciphertext]);
  const outer = encryptAES(innerPayload, passphrase);

  return {
    ciphertext: outer.ciphertext,
    iv: outer.iv,
    salt: outer.salt,
    tag: outer.tag,
    argonSalt,
    innerIv: inner.iv,
    innerTag: inner.tag,
  };
}

/**
 * Unseal double-encrypted credentials.
 *
 * @param {Buffer} ciphertext
 * @param {string} passphrase
 * @param {Buffer} iv
 * @param {Buffer} salt
 * @param {Buffer} tag
 * @param {Buffer} argonSalt
 * @returns {Promise<any>} Parsed credentials
 */
export async function unsealCredentials(ciphertext, passphrase, iv, salt, tag, argonSalt) {
  // Outer layer: decrypt with passphrase
  const innerPayload = decryptAES(ciphertext, passphrase, iv, salt, tag);

  // Extract inner components (iv:12 + tag:16 + ciphertext:rest)
  const innerIv = innerPayload.subarray(0, 12);
  const innerTag = innerPayload.subarray(12, 28);
  const innerCiphertext = innerPayload.subarray(28);

  // Inner layer: Argon2id-derived key
  const argonKey = await deriveKeyArgon2(passphrase, argonSalt);
  const decrypted = decryptAESRaw(innerCiphertext, argonKey, innerIv, innerTag);

  return JSON.parse(decrypted.toString("utf8"));
}

// ── Bulk Layer Operations ────────────────────────────────────

/**
 * Seal multiple layers at once.
 *
 * @param {Object<string, any>} layerData - { layerName: data }
 * @param {string} passphrase
 * @returns {Promise<Map<string, object>>} Sealed layers
 */
export async function sealAllLayers(layerData, passphrase) {
  const sealed = new Map();

  for (const [name, data] of Object.entries(layerData)) {
    if (!isValidLayer(name)) {
      throw new Error(`Invalid layer: "${name}"`);
    }

    if (name === "credentials") {
      const result = await sealCredentials(data, passphrase);
      sealed.set(name, { ...result, doubleEncrypted: true });
    } else {
      const result = sealLayer(name, data, passphrase);
      sealed.set(name, result);
    }
  }

  return sealed;
}

/**
 * Unseal multiple layers at once.
 *
 * @param {Map<string, object>} sealedLayers
 * @param {string} passphrase
 * @param {string[]} [onlyLayers] - Optional filter: only unseal these layers
 * @returns {Promise<Object<string, any>>} Unsealed layer data
 */
export async function unsealAllLayers(sealedLayers, passphrase, onlyLayers = null) {
  const result = {};

  for (const [name, layerInfo] of sealedLayers) {
    if (onlyLayers && !onlyLayers.includes(name)) continue;

    if (name === "credentials" && layerInfo.doubleEncrypted) {
      result[name] = await unsealCredentials(
        layerInfo.ciphertext, passphrase,
        layerInfo.iv, layerInfo.salt, layerInfo.tag,
        layerInfo.argonSalt
      );
    } else {
      result[name] = unsealLayer(
        name, layerInfo.ciphertext, passphrase,
        layerInfo.iv, layerInfo.salt, layerInfo.tag
      );
    }
  }

  return result;
}

// ── Layer Access Matrix ──────────────────────────────────────

/**
 * Create a layer access matrix for escrow parties.
 *
 * @param {Object<string, string[]>} partyAccess - { partyId: [layerNames] }
 * @returns {Object<string, Object<string, boolean>>} Full matrix
 */
export function createAccessMatrix(partyAccess) {
  const matrix = {};

  for (const [partyId, layers] of Object.entries(partyAccess)) {
    matrix[partyId] = {};
    for (const layerName of LAYER_NAMES) {
      matrix[partyId][layerName] = layers.includes(layerName);
    }
  }

  return matrix;
}

/**
 * Validate an access matrix.
 *
 * @param {Object} matrix
 * @returns {{ valid: boolean, errors: string[] }}
 */
export function validateAccessMatrix(matrix) {
  const errors = [];

  for (const [partyId, access] of Object.entries(matrix)) {
    for (const layerName of Object.keys(access)) {
      if (!isValidLayer(layerName)) {
        errors.push(`Party "${partyId}": invalid layer "${layerName}"`);
      }
    }
  }

  return { valid: errors.length === 0, errors };
}
