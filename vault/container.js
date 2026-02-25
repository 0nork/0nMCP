// ============================================================
// 0nMCP — Vault: Container Assembly
// ============================================================
// Binary .0nv container format per patent specification.
// Assembles/disassembles 7 semantic layers with Seal of Truth
// and Ed25519 signatures into a portable binary file.
//
// Binary Format:
//   [Magic: 0x304E5350 (4B)]
//   [Version: uint8 (1B)]
//   [Transfer ID: UUID v4 (16B)]
//   [Creator PubKey: Ed25519 (32B)]
//   [Timestamp: uint64 BE (8B)]
//   [Seal of Truth: SHA3-256 (32B)]
//   [Layer Count: uint8 (1B)]
//   [Layer Entries: variable]
//   [Escrow Block: variable]
//   [Signature: Ed25519 (64B)]
//
// File extension: .0nv (0n Vault)
//
// Patent Pending: US Provisional Patent Application #63/990,046
// ============================================================

import { readFileSync, writeFileSync } from "fs";
import {
  generateTransferId,
  generateSigningKeyPair,
  generateEscrowKeyPair,
  sign,
  verifySignature,
  IV_LENGTH,
  TAG_LENGTH,
  SALT_LENGTH,
} from "./crypto-container.js";
import { sealLayer, unsealLayer, sealCredentials, unsealCredentials, LAYER_NAMES } from "./layers.js";
import { createSeal, verifySeal } from "./seal.js";
import { createEscrowShares, serializeEscrowBlock, deserializeEscrowBlock, unwrapEscrowShare } from "./escrow.js";
import { registerTransfer, isTransferUsed } from "./registry.js";

// ── Constants ────────────────────────────────────────────────

export const MAGIC = Buffer.from([0x30, 0x4E, 0x53, 0x50]); // "0NSP"
export const VERSION = 1;
export const FILE_EXTENSION = ".0nv";

// ── Container Assembly ───────────────────────────────────────

/**
 * Assemble a vault container from layer data.
 *
 * @param {Object} options
 * @param {Object<string, any>} options.layers - { layerName: data }
 * @param {string} options.passphrase - Encryption passphrase
 * @param {Array} [options.escrowParties] - Escrow party definitions
 * @param {Object} [options.accessMatrix] - Per-party layer access
 * @param {Object} [options.metadata] - Additional metadata
 * @returns {Promise<{ buffer: Buffer, transferId: string, sealHex: string, publicKey: Buffer }>}
 */
export async function assembleContainer(options) {
  const { layers, passphrase, escrowParties = [], accessMatrix = {}, metadata = {} } = options;

  // Generate identity
  const transferId = generateTransferId();
  const signingPair = generateSigningKeyPair();
  const timestamp = Date.now();

  // Seal each layer
  const sealedLayers = new Map();
  const layerCiphertexts = [];

  for (const [name, data] of Object.entries(layers)) {
    if (name === "credentials") {
      const sealed = await sealCredentials(data, passphrase);
      sealedLayers.set(name, { ...sealed, doubleEncrypted: true });
      layerCiphertexts.push(sealed.ciphertext);
    } else {
      const sealed = sealLayer(name, data, passphrase);
      sealedLayers.set(name, sealed);
      layerCiphertexts.push(sealed.ciphertext);
    }
  }

  // Create Seal of Truth
  const { seal, sealHex } = createSeal(transferId, timestamp, signingPair.publicKey, layerCiphertexts);

  // Build escrow block
  let escrowBlock = Buffer.alloc(0);
  if (escrowParties.length > 0) {
    const escrowKeyPair = generateEscrowKeyPair();
    const layerKeys = new Map();
    // Generate per-layer keys for escrow (these wrap the passphrase-derived access)
    for (const name of Object.keys(layers)) {
      layerKeys.set(name, Buffer.from(passphrase, "utf8").subarray(0, 32));
    }
    const shares = createEscrowShares(layerKeys, escrowKeyPair.secretKey, escrowParties, accessMatrix);
    escrowBlock = serializeEscrowBlock(shares, escrowKeyPair.publicKey);
  }

  // Build binary container
  const parts = [];

  // Header
  parts.push(MAGIC);
  parts.push(Buffer.from([VERSION]));

  // Transfer ID (as raw bytes from UUID string — store as UTF-8, 36 bytes)
  const tidBuf = Buffer.alloc(36);
  tidBuf.write(transferId, "utf8");
  parts.push(tidBuf);

  // Creator public key (32 bytes)
  parts.push(signingPair.publicKey);

  // Timestamp (8 bytes, uint64 BE)
  const tsBuf = Buffer.alloc(8);
  tsBuf.writeBigUInt64BE(BigInt(timestamp));
  parts.push(tsBuf);

  // Seal of Truth (32 bytes)
  parts.push(seal);

  // Layer count (1 byte)
  parts.push(Buffer.from([sealedLayers.size]));

  // Layer entries
  for (const [name, layerInfo] of sealedLayers) {
    // Layer name (2 bytes length + UTF-8)
    const nameBuf = Buffer.from(name, "utf8");
    const nameLen = Buffer.alloc(2);
    nameLen.writeUInt16BE(nameBuf.length);
    parts.push(nameLen, nameBuf);

    // Flags (1 byte): bit 0 = doubleEncrypted
    const flags = Buffer.alloc(1);
    flags.writeUInt8(layerInfo.doubleEncrypted ? 1 : 0);
    parts.push(flags);

    // Salt (32 bytes)
    parts.push(layerInfo.salt);

    // IV (12 bytes)
    parts.push(layerInfo.iv);

    // Auth tag (16 bytes)
    parts.push(layerInfo.tag);

    // Argon salt (32 bytes, only for credentials)
    if (layerInfo.doubleEncrypted && layerInfo.argonSalt) {
      parts.push(layerInfo.argonSalt);
    }

    // Ciphertext (4 bytes length + data)
    const ctLen = Buffer.alloc(4);
    ctLen.writeUInt32BE(layerInfo.ciphertext.length);
    parts.push(ctLen, layerInfo.ciphertext);
  }

  // Escrow block length (4 bytes) + escrow block
  const escrowLen = Buffer.alloc(4);
  escrowLen.writeUInt32BE(escrowBlock.length);
  parts.push(escrowLen, escrowBlock);

  // Combine everything except signature
  const unsigned = Buffer.concat(parts);

  // Ed25519 signature over entire container
  const signature = sign(unsigned, signingPair.secretKey);
  const container = Buffer.concat([unsigned, signature]);

  // Register transfer
  registerTransfer(transferId, sealHex, {
    layerCount: sealedLayers.size,
    layers: Array.from(sealedLayers.keys()),
    creatorPubKey: signingPair.publicKey.toString("hex"),
    ...metadata,
  });

  return {
    buffer: container,
    transferId,
    sealHex,
    publicKey: signingPair.publicKey,
    timestamp,
    layerCount: sealedLayers.size,
    layers: Array.from(sealedLayers.keys()),
  };
}

/**
 * Disassemble a vault container and decrypt layers.
 *
 * @param {Buffer} buffer - Container binary data
 * @param {string} passphrase - Decryption passphrase
 * @param {string[]} [onlyLayers] - Optional: only decrypt these layers
 * @returns {Promise<{ layers: Object, metadata: Object, seal: Object }>}
 */
export async function disassembleContainer(buffer, passphrase, onlyLayers = null) {
  // Validate minimum size
  if (buffer.length < 4 + 1 + 36 + 32 + 8 + 32 + 1 + 64) {
    throw new Error("Invalid container: too short");
  }

  let offset = 0;

  // Magic bytes
  const magic = buffer.subarray(offset, offset + 4);
  offset += 4;
  if (Buffer.compare(magic, MAGIC) !== 0) {
    throw new Error("Invalid container: wrong magic bytes (expected 0x304E5350)");
  }

  // Version
  const version = buffer.readUInt8(offset);
  offset += 1;
  if (version !== VERSION) {
    throw new Error(`Unsupported container version: ${version} (expected ${VERSION})`);
  }

  // Transfer ID
  const transferId = buffer.subarray(offset, offset + 36).toString("utf8");
  offset += 36;

  // Creator public key
  const creatorPubKey = buffer.subarray(offset, offset + 32);
  offset += 32;

  // Timestamp
  const timestamp = Number(buffer.readBigUInt64BE(offset));
  offset += 8;

  // Seal of Truth
  const seal = buffer.subarray(offset, offset + 32);
  offset += 32;

  // Layer count
  const layerCount = buffer.readUInt8(offset);
  offset += 1;

  // Read layers
  const sealedLayers = new Map();
  const layerCiphertexts = [];

  for (let i = 0; i < layerCount; i++) {
    // Layer name
    const nameLen = buffer.readUInt16BE(offset);
    offset += 2;
    const name = buffer.subarray(offset, offset + nameLen).toString("utf8");
    offset += nameLen;

    // Flags
    const flags = buffer.readUInt8(offset);
    offset += 1;
    const doubleEncrypted = (flags & 1) !== 0;

    // Salt
    const salt = Buffer.from(buffer.subarray(offset, offset + SALT_LENGTH));
    offset += SALT_LENGTH;

    // IV
    const iv = Buffer.from(buffer.subarray(offset, offset + IV_LENGTH));
    offset += IV_LENGTH;

    // Auth tag
    const tag = Buffer.from(buffer.subarray(offset, offset + TAG_LENGTH));
    offset += TAG_LENGTH;

    // Argon salt (only for double-encrypted)
    let argonSalt = null;
    if (doubleEncrypted) {
      argonSalt = Buffer.from(buffer.subarray(offset, offset + SALT_LENGTH));
      offset += SALT_LENGTH;
    }

    // Ciphertext
    const ctLen = buffer.readUInt32BE(offset);
    offset += 4;
    const ciphertext = Buffer.from(buffer.subarray(offset, offset + ctLen));
    offset += ctLen;

    sealedLayers.set(name, { ciphertext, iv, salt, tag, doubleEncrypted, argonSalt });
    layerCiphertexts.push(ciphertext);
  }

  // Escrow block
  const escrowLen = buffer.readUInt32BE(offset);
  offset += 4;
  let escrowBlock = null;
  if (escrowLen > 0) {
    escrowBlock = buffer.subarray(offset, offset + escrowLen);
    offset += escrowLen;
  }

  // Signature (last 64 bytes)
  const signature = buffer.subarray(offset, offset + 64);
  const unsignedData = buffer.subarray(0, offset);

  // Verify Ed25519 signature
  const sigValid = verifySignature(unsignedData, signature, creatorPubKey);
  if (!sigValid) {
    throw new Error("Invalid container: Ed25519 signature verification failed");
  }

  // Verify Seal of Truth
  const sealValid = verifySeal(seal, transferId, timestamp, creatorPubKey, layerCiphertexts);

  // Decrypt requested layers
  const decrypted = {};
  for (const [name, layerInfo] of sealedLayers) {
    if (onlyLayers && !onlyLayers.includes(name)) continue;

    try {
      if (name === "credentials" && layerInfo.doubleEncrypted) {
        decrypted[name] = await unsealCredentials(
          layerInfo.ciphertext, passphrase,
          layerInfo.iv, layerInfo.salt, layerInfo.tag,
          layerInfo.argonSalt
        );
      } else {
        decrypted[name] = unsealLayer(
          name, layerInfo.ciphertext, passphrase,
          layerInfo.iv, layerInfo.salt, layerInfo.tag
        );
      }
    } catch (err) {
      decrypted[name] = { error: err.message };
    }
  }

  return {
    layers: decrypted,
    metadata: {
      version,
      transferId,
      timestamp,
      creatorPubKey: creatorPubKey.toString("hex"),
      layerCount,
      layerNames: Array.from(sealedLayers.keys()),
      hasEscrow: escrowBlock !== null,
    },
    seal: {
      hash: seal.toString("hex"),
      valid: sealValid,
    },
    signature: {
      valid: sigValid,
    },
  };
}

/**
 * Inspect a container without decrypting — metadata + seal only.
 *
 * @param {Buffer} buffer
 * @returns {{ metadata: Object, seal: Object, signature: Object }}
 */
export function inspectContainer(buffer) {
  if (buffer.length < 4 + 1 + 36 + 32 + 8 + 32 + 1 + 64) {
    throw new Error("Invalid container: too short");
  }

  let offset = 0;

  const magic = buffer.subarray(offset, offset + 4);
  offset += 4;
  if (Buffer.compare(magic, MAGIC) !== 0) {
    throw new Error("Invalid container: wrong magic bytes");
  }

  const version = buffer.readUInt8(offset);
  offset += 1;

  const transferId = buffer.subarray(offset, offset + 36).toString("utf8");
  offset += 36;

  const creatorPubKey = buffer.subarray(offset, offset + 32);
  offset += 32;

  const timestamp = Number(buffer.readBigUInt64BE(offset));
  offset += 8;

  const seal = buffer.subarray(offset, offset + 32);
  offset += 32;

  const layerCount = buffer.readUInt8(offset);
  offset += 1;

  // Read layer names only (skip data)
  const layerNames = [];
  const layerCiphertexts = [];

  for (let i = 0; i < layerCount; i++) {
    const nameLen = buffer.readUInt16BE(offset);
    offset += 2;
    const name = buffer.subarray(offset, offset + nameLen).toString("utf8");
    offset += nameLen;
    layerNames.push(name);

    const flags = buffer.readUInt8(offset);
    offset += 1;
    const doubleEncrypted = (flags & 1) !== 0;

    // Skip salt + iv + tag
    offset += SALT_LENGTH + IV_LENGTH + TAG_LENGTH;

    // Skip argon salt if double-encrypted
    if (doubleEncrypted) offset += SALT_LENGTH;

    // Skip ciphertext
    const ctLen = buffer.readUInt32BE(offset);
    offset += 4;
    layerCiphertexts.push(buffer.subarray(offset, offset + ctLen));
    offset += ctLen;
  }

  // Escrow block
  const escrowLen = buffer.readUInt32BE(offset);
  offset += 4;
  let escrowPartyCount = 0;
  if (escrowLen > 0) {
    escrowPartyCount = buffer.readUInt8(offset);
  }
  offset += escrowLen;

  // Verify signature
  const signature = buffer.subarray(offset, offset + 64);
  const unsignedData = buffer.subarray(0, offset);
  const sigValid = verifySignature(unsignedData, signature, creatorPubKey);

  // Verify seal
  const sealValid = verifySeal(seal, transferId, timestamp, creatorPubKey, layerCiphertexts);

  return {
    metadata: {
      version,
      transferId,
      timestamp,
      created: new Date(timestamp).toISOString(),
      creatorPubKey: creatorPubKey.toString("hex"),
      layerCount,
      layerNames,
      hasEscrow: escrowLen > 0,
      escrowPartyCount,
      containerSize: buffer.length,
    },
    seal: {
      hash: seal.toString("hex"),
      valid: sealValid,
      algorithm: "SHA3-256",
    },
    signature: {
      valid: sigValid,
      algorithm: "Ed25519",
    },
    patent: "US Provisional #63/990,046",
  };
}

/**
 * Save container to a .0nv file.
 *
 * @param {Buffer} container - Container buffer
 * @param {string} filePath - Output file path
 */
export function saveContainer(container, filePath) {
  const path = filePath.endsWith(FILE_EXTENSION) ? filePath : filePath + FILE_EXTENSION;
  writeFileSync(path, container);
  return path;
}

/**
 * Load container from a .0nv file.
 *
 * @param {string} filePath - Input file path
 * @returns {Buffer}
 */
export function loadContainer(filePath) {
  return readFileSync(filePath);
}
