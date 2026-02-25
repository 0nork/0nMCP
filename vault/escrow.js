// ============================================================
// 0nMCP — Vault: Multi-Party Escrow System
// ============================================================
// X25519 ECDH key agreement for up to 8 escrow parties.
// Each party receives encrypted shares for only the layers
// they're authorized to access via the access matrix.
//
// Patent Pending: US Provisional Patent Application #63/990,046
// ============================================================

import { randomBytes } from "crypto";
import {
  generateEscrowKeyPair,
  computeSharedSecret,
  encryptAESRaw,
  decryptAESRaw,
  KEY_LENGTH,
} from "./crypto-container.js";
import { LAYER_NAMES, isValidLayer } from "./layers.js";

const MAX_PARTIES = 8;

/**
 * Generate escrow keypair for a party.
 *
 * @returns {{ publicKey: Buffer, secretKey: Buffer, partyId: string }}
 */
export function generatePartyKeys() {
  const pair = generateEscrowKeyPair();
  const partyId = randomBytes(8).toString("hex");
  return { ...pair, partyId };
}

/**
 * Create per-layer encryption keys (one random 256-bit key per layer).
 *
 * @returns {Map<string, Buffer>} layerName → 32-byte AES key
 */
export function generateLayerKeys() {
  const keys = new Map();
  for (const name of LAYER_NAMES) {
    keys.set(name, randomBytes(KEY_LENGTH));
  }
  return keys;
}

/**
 * Create escrow shares for each party based on access matrix.
 * Each party's share is encrypted with a shared secret derived via X25519.
 *
 * @param {Map<string, Buffer>} layerKeys - Per-layer encryption keys
 * @param {Buffer} creatorSecretKey - Creator's X25519 secret key
 * @param {Array<{ partyId: string, publicKey: Buffer }>} parties - Escrow parties
 * @param {Object<string, Object<string, boolean>>} accessMatrix - Per-party, per-layer access
 * @returns {Array<{ partyId: string, encryptedShare: Buffer, iv: Buffer, tag: Buffer, authorizedLayers: string[] }>}
 */
export function createEscrowShares(layerKeys, creatorSecretKey, parties, accessMatrix) {
  if (parties.length > MAX_PARTIES) {
    throw new Error(`Maximum ${MAX_PARTIES} escrow parties allowed`);
  }

  const shares = [];

  for (const party of parties) {
    const partyAccess = accessMatrix[party.partyId];
    if (!partyAccess) {
      throw new Error(`No access matrix entry for party: ${party.partyId}`);
    }

    // Collect only the layer keys this party is authorized for
    const authorizedLayers = [];
    const shareData = {};

    for (const [layerName, hasAccess] of Object.entries(partyAccess)) {
      if (hasAccess && layerKeys.has(layerName)) {
        authorizedLayers.push(layerName);
        shareData[layerName] = layerKeys.get(layerName).toString("base64");
      }
    }

    if (authorizedLayers.length === 0) {
      continue; // Skip parties with no access
    }

    // Compute shared secret via X25519
    const sharedSecret = computeSharedSecret(creatorSecretKey, party.publicKey);

    // Encrypt the share data with the shared secret
    const plaintext = Buffer.from(JSON.stringify(shareData), "utf8");
    const { ciphertext, iv, tag } = encryptAESRaw(plaintext, sharedSecret);

    shares.push({
      partyId: party.partyId,
      encryptedShare: ciphertext,
      iv,
      tag,
      authorizedLayers,
    });
  }

  return shares;
}

/**
 * Unwrap an escrow share using a party's secret key.
 *
 * @param {{ encryptedShare: Buffer, iv: Buffer, tag: Buffer }} share - Encrypted share
 * @param {Buffer} partySecretKey - Party's X25519 secret key
 * @param {Buffer} creatorPublicKey - Creator's X25519 public key
 * @returns {Object<string, Buffer>} layerName → decrypted AES key
 */
export function unwrapEscrowShare(share, partySecretKey, creatorPublicKey) {
  // Compute shared secret via X25519 (reverse direction)
  const sharedSecret = computeSharedSecret(partySecretKey, creatorPublicKey);

  // Decrypt the share
  const decrypted = decryptAESRaw(share.encryptedShare, sharedSecret, share.iv, share.tag);
  const shareData = JSON.parse(decrypted.toString("utf8"));

  // Convert base64 keys back to Buffers
  const layerKeys = {};
  for (const [layerName, keyB64] of Object.entries(shareData)) {
    layerKeys[layerName] = Buffer.from(keyB64, "base64");
  }

  return layerKeys;
}

/**
 * Serialize escrow block for binary container format.
 *
 * @param {Array} shares - Escrow shares from createEscrowShares
 * @param {Buffer} creatorPublicKey - Creator's X25519 public key (for unwrap)
 * @returns {Buffer} Serialized escrow block
 */
export function serializeEscrowBlock(shares, creatorPublicKey) {
  const parts = [];

  // Party count (1 byte)
  const countBuf = Buffer.alloc(1);
  countBuf.writeUInt8(shares.length);
  parts.push(countBuf);

  // Creator escrow public key (32 bytes)
  parts.push(creatorPublicKey);

  for (const share of shares) {
    // Party ID length (1 byte) + Party ID
    const partyIdBuf = Buffer.from(share.partyId, "utf8");
    const partyIdLen = Buffer.alloc(1);
    partyIdLen.writeUInt8(partyIdBuf.length);
    parts.push(partyIdLen, partyIdBuf);

    // Authorized layer count (1 byte) + layer indices
    const layerCount = Buffer.alloc(1);
    layerCount.writeUInt8(share.authorizedLayers.length);
    parts.push(layerCount);

    for (const layerName of share.authorizedLayers) {
      const idx = Buffer.alloc(1);
      idx.writeUInt8(LAYER_NAMES.indexOf(layerName));
      parts.push(idx);
    }

    // IV (12 bytes) + Tag (16 bytes) + Share length (4 bytes) + Share ciphertext
    parts.push(share.iv);
    parts.push(share.tag);

    const shareLen = Buffer.alloc(4);
    shareLen.writeUInt32BE(share.encryptedShare.length);
    parts.push(shareLen, share.encryptedShare);
  }

  return Buffer.concat(parts);
}

/**
 * Deserialize escrow block from binary.
 *
 * @param {Buffer} data - Serialized escrow block
 * @returns {{ creatorPublicKey: Buffer, shares: Array }}
 */
export function deserializeEscrowBlock(data) {
  let offset = 0;

  const partyCount = data.readUInt8(offset);
  offset += 1;

  const creatorPublicKey = data.subarray(offset, offset + 32);
  offset += 32;

  const shares = [];

  for (let i = 0; i < partyCount; i++) {
    // Party ID
    const partyIdLen = data.readUInt8(offset);
    offset += 1;
    const partyId = data.subarray(offset, offset + partyIdLen).toString("utf8");
    offset += partyIdLen;

    // Authorized layers
    const layerCount = data.readUInt8(offset);
    offset += 1;
    const authorizedLayers = [];
    for (let j = 0; j < layerCount; j++) {
      const idx = data.readUInt8(offset);
      offset += 1;
      authorizedLayers.push(LAYER_NAMES[idx]);
    }

    // IV (12) + Tag (16) + Share
    const iv = data.subarray(offset, offset + 12);
    offset += 12;
    const tag = data.subarray(offset, offset + 16);
    offset += 16;
    const shareLen = data.readUInt32BE(offset);
    offset += 4;
    const encryptedShare = data.subarray(offset, offset + shareLen);
    offset += shareLen;

    shares.push({ partyId, authorizedLayers, encryptedShare, iv, tag });
  }

  return { creatorPublicKey, shares };
}

export { MAX_PARTIES };
