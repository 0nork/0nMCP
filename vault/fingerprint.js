// ============================================================
// 0nMCP — Vault: Machine Fingerprint
// ============================================================
// Generates a deterministic, machine-bound hardware fingerprint
// using SHA-256 hash of system identifiers. Zero dependencies —
// uses only Node.js built-in modules.
//
// Patent Pending: US Provisional Patent Application #63/968,814
// ============================================================

import { createHash } from "crypto";
import { hostname, cpus, platform, arch, totalmem } from "os";

/**
 * Generate a deterministic machine fingerprint.
 *
 * Components:
 *   - hostname
 *   - CPU model (first core)
 *   - CPU core count
 *   - OS platform
 *   - CPU architecture
 *   - Total system memory
 *
 * @returns {{ fingerprint: string, components: object }}
 */
export function generateFingerprint() {
  const cpuInfo = cpus();
  const components = {
    hostname: hostname(),
    cpuModel: cpuInfo.length > 0 ? cpuInfo[0].model : "unknown",
    cpuCores: cpuInfo.length,
    platform: platform(),
    arch: arch(),
    totalMemory: totalmem(),
  };

  const raw = [
    components.hostname,
    components.cpuModel,
    components.cpuCores,
    components.platform,
    components.arch,
    components.totalMemory,
  ].join("|");

  const fingerprint = createHash("sha256").update(raw).digest("hex");

  return { fingerprint, components };
}

/**
 * Get just the fingerprint string.
 * @returns {string} 64-char hex SHA-256 hash
 */
export function getFingerprint() {
  return generateFingerprint().fingerprint;
}
