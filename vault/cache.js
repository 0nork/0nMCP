// ============================================================
// 0nMCP — Vault: Shared Credential Cache
// ============================================================
// In-memory store for unsealed credentials. Shared between
// vault/index.js (writes) and connections.js (reads).
// Never written to disk — credentials exist only in memory.
// ============================================================

/** @type {Map<string, object>} */
export const unsealedCache = new Map();

/**
 * Get unsealed credentials from memory cache.
 * @param {string} service - Service key
 * @returns {object|null}
 */
export function getUnsealedCredentials(service) {
  return unsealedCache.get(service) || null;
}

/**
 * Check if a service has unsealed credentials.
 * @param {string} service - Service key
 * @returns {boolean}
 */
export function isUnsealed(service) {
  return unsealedCache.has(service);
}
