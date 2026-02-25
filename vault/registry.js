// ============================================================
// 0nMCP — Vault: Transfer Registry
// ============================================================
// In-memory + file-backed registry for tracking vault transfers.
// Prevents replay attacks by rejecting duplicate transfer IDs.
//
// Patent Pending: US Provisional Patent Application #63/990,046
// ============================================================

import { readFileSync, writeFileSync, existsSync, mkdirSync } from "fs";
import { join } from "path";
import { homedir } from "os";

const VAULT_DIR = join(homedir(), ".0n", "vault");
const REGISTRY_PATH = join(VAULT_DIR, "transfers.json");

// In-memory cache
let registry = null;

/**
 * Ensure vault directory exists and load registry from disk.
 */
function ensureRegistry() {
  if (registry !== null) return;

  if (!existsSync(VAULT_DIR)) {
    mkdirSync(VAULT_DIR, { recursive: true });
  }

  if (existsSync(REGISTRY_PATH)) {
    try {
      registry = JSON.parse(readFileSync(REGISTRY_PATH, "utf-8"));
    } catch {
      registry = { transfers: {} };
    }
  } else {
    registry = { transfers: {} };
  }
}

/**
 * Save registry to disk.
 */
function saveRegistry() {
  if (!existsSync(VAULT_DIR)) {
    mkdirSync(VAULT_DIR, { recursive: true });
  }
  writeFileSync(REGISTRY_PATH, JSON.stringify(registry, null, 2));
}

/**
 * Register a new transfer.
 *
 * @param {string} transferId - UUID v4
 * @param {string} sealHex - Seal of Truth hex string
 * @param {Object} metadata - Additional metadata
 * @returns {{ success: boolean, error?: string }}
 */
export function registerTransfer(transferId, sealHex, metadata = {}) {
  ensureRegistry();

  // Replay prevention
  if (registry.transfers[transferId]) {
    return {
      success: false,
      error: `Transfer ID "${transferId}" already registered — replay rejected`,
    };
  }

  registry.transfers[transferId] = {
    seal: sealHex,
    registered_at: new Date().toISOString(),
    status: "active",
    ...metadata,
  };

  saveRegistry();

  return { success: true, transferId };
}

/**
 * Look up a transfer by ID.
 *
 * @param {string} transferId
 * @returns {{ found: boolean, transfer?: Object }}
 */
export function lookupTransfer(transferId) {
  ensureRegistry();

  const transfer = registry.transfers[transferId];
  if (!transfer) {
    return { found: false };
  }

  return { found: true, transfer: { transferId, ...transfer } };
}

/**
 * Revoke a transfer.
 *
 * @param {string} transferId
 * @returns {{ success: boolean, error?: string }}
 */
export function revokeTransfer(transferId) {
  ensureRegistry();

  if (!registry.transfers[transferId]) {
    return { success: false, error: `Transfer ID "${transferId}" not found` };
  }

  if (registry.transfers[transferId].status === "revoked") {
    return { success: false, error: `Transfer "${transferId}" is already revoked` };
  }

  registry.transfers[transferId].status = "revoked";
  registry.transfers[transferId].revoked_at = new Date().toISOString();

  saveRegistry();

  return { success: true, transferId, message: `Transfer "${transferId}" has been revoked` };
}

/**
 * List all transfers.
 *
 * @param {string} [status] - Optional filter: "active", "revoked"
 * @returns {Array<Object>}
 */
export function listTransfers(status = null) {
  ensureRegistry();

  const transfers = [];
  for (const [id, data] of Object.entries(registry.transfers)) {
    if (status && data.status !== status) continue;
    transfers.push({ transferId: id, ...data });
  }

  return transfers;
}

/**
 * Check if a transfer ID has been used (for replay prevention).
 *
 * @param {string} transferId
 * @returns {boolean}
 */
export function isTransferUsed(transferId) {
  ensureRegistry();
  return !!registry.transfers[transferId];
}

/**
 * Reset registry (for testing only).
 */
export function resetRegistry() {
  registry = { transfers: {} };
  saveRegistry();
}
