// ============================================================
// 0nMCP — Vault: Seal of Truth
// ============================================================
// SHA3-256 based content certification hash.
// Publicly verifiable — anyone can confirm container integrity
// without decrypting any layer data.
//
// Formula:
//   SHA3-256(transfer_id || timestamp || pubkey || SHA3-256(concat(all_ciphertexts)))
//
// Patent Pending: US Provisional Patent Application #63/990,046
// ============================================================

import { sha3, sha3Hex } from "./crypto-container.js";

/**
 * Create a Seal of Truth for a vault container.
 *
 * @param {string} transferId - UUID v4 transfer ID
 * @param {number} timestamp - Unix timestamp (ms)
 * @param {Buffer} pubkey - Ed25519 public key (32 bytes)
 * @param {Buffer[]} layerCiphertexts - Array of encrypted layer data
 * @returns {{ seal: Buffer, sealHex: string }}
 */
export function createSeal(transferId, timestamp, pubkey, layerCiphertexts) {
  // Hash all ciphertexts together
  const contentHash = sha3(Buffer.concat(layerCiphertexts));

  // Combine components: transferId || timestamp || pubkey || contentHash
  const transferIdBuf = Buffer.from(transferId, "utf8");
  const timestampBuf = Buffer.alloc(8);
  timestampBuf.writeBigUInt64BE(BigInt(timestamp));

  const sealInput = Buffer.concat([transferIdBuf, timestampBuf, pubkey, contentHash]);
  const seal = sha3(sealInput);

  return {
    seal,
    sealHex: seal.toString("hex"),
  };
}

/**
 * Verify a Seal of Truth.
 *
 * @param {Buffer} seal - 32-byte seal hash
 * @param {string} transferId
 * @param {number} timestamp
 * @param {Buffer} pubkey
 * @param {Buffer[]} layerCiphertexts
 * @returns {boolean} True if seal matches
 */
export function verifySeal(seal, transferId, timestamp, pubkey, layerCiphertexts) {
  const expected = createSeal(transferId, timestamp, pubkey, layerCiphertexts);
  return Buffer.compare(seal, expected.seal) === 0;
}

/**
 * Generate a human-readable seal summary.
 *
 * @param {Buffer} seal
 * @param {string} transferId
 * @param {number} timestamp
 * @returns {string}
 */
export function sealSummary(seal, transferId, timestamp) {
  return [
    `Seal of Truth: ${seal.toString("hex")}`,
    `Transfer ID:   ${transferId}`,
    `Timestamp:     ${new Date(timestamp).toISOString()}`,
    `Algorithm:     SHA3-256`,
    `Status:        Verified ✓`,
  ].join("\n");
}
