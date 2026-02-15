// ============================================================
// 0nMCP — Vault Module
// ============================================================
// Machine-bound encrypted credential storage for .0n files.
// Seals credentials using AES-256-GCM with PBKDF2 key derivation
// from passphrase + hardware fingerprint.
//
// Zero external dependencies — Node.js built-in `crypto` only.
// Backward compatible — plaintext .0n files keep working.
//
// 4 MCP Tools:
//   vault_seal        — Encrypt a service's credentials on disk
//   vault_unseal      — Decrypt credentials into memory only
//   vault_verify      — Check machine binding + file integrity
//   vault_fingerprint — Show your machine's hardware fingerprint
//
// Patent Pending: US Provisional Patent Application #63/968,814
// ============================================================

import { readFileSync, writeFileSync, existsSync, readdirSync } from "fs";
import { join } from "path";
import { seal, unseal, verify } from "./cipher.js";
import { generateFingerprint, getFingerprint } from "./fingerprint.js";
import { CONNECTIONS_PATH } from "../connections.js";
import { unsealedCache, getUnsealedCredentials, isUnsealed } from "./cache.js";

// Auto-unseal passphrase from environment
const AUTO_PASSPHRASE = process.env.ON_VAULT_PASSPHRASE || null;

/**
 * Seal a service's .0n connection file — encrypts credentials on disk.
 *
 * @param {string} service - Service key (e.g., "stripe", "openai")
 * @param {string} passphrase - Encryption passphrase
 * @returns {{ success: boolean, service?: string, error?: string }}
 */
export function sealConnection(service, passphrase) {
  const filePath = join(CONNECTIONS_PATH, `${service}.0n`);

  if (!existsSync(filePath)) {
    return { success: false, error: `No connection file found for service: ${service}` };
  }

  try {
    const raw = readFileSync(filePath, "utf-8");
    const data = JSON.parse(raw);

    // Already sealed?
    if (data.$0n?.sealed) {
      return { success: false, error: `Service "${service}" is already sealed. Unseal first to re-seal.` };
    }

    if (!data.auth?.credentials) {
      return { success: false, error: `No credentials found in ${service}.0n to seal.` };
    }

    // Seal only the credentials
    const credentialsJson = JSON.stringify(data.auth.credentials);
    const { sealed, fingerprint } = seal(credentialsJson, passphrase);

    // Replace credentials with sealed envelope
    data.auth.credentials = {};
    data.$0n.sealed = true;
    data.$0n.vault = {
      sealed_at: new Date().toISOString(),
      fingerprint,
      algorithm: "aes-256-gcm",
      kdf: "pbkdf2-sha512-100k",
    };
    data.vault = { data: sealed };

    writeFileSync(filePath, JSON.stringify(data, null, 2));

    return {
      success: true,
      service,
      fingerprint,
      message: `Credentials for "${service}" have been sealed. They can only be unsealed on this machine.`,
    };
  } catch (err) {
    return { success: false, error: `Failed to seal ${service}: ${err.message}` };
  }
}

/**
 * Unseal a service's credentials — decrypts into memory only.
 * The .0n file on disk remains encrypted.
 *
 * @param {string} service - Service key
 * @param {string} passphrase - Decryption passphrase
 * @returns {{ success: boolean, service?: string, error?: string }}
 */
export function unsealConnection(service, passphrase) {
  const filePath = join(CONNECTIONS_PATH, `${service}.0n`);

  if (!existsSync(filePath)) {
    return { success: false, error: `No connection file found for service: ${service}` };
  }

  try {
    const raw = readFileSync(filePath, "utf-8");
    const data = JSON.parse(raw);

    if (!data.$0n?.sealed || !data.vault?.data) {
      return { success: false, error: `Service "${service}" is not sealed. Nothing to unseal.` };
    }

    const decrypted = unseal(data.vault.data, passphrase);
    const credentials = JSON.parse(decrypted);

    // Store in memory only — never write back to disk
    unsealedCache.set(service, credentials);

    return {
      success: true,
      service,
      message: `Credentials for "${service}" unsealed into memory. File on disk remains encrypted.`,
      credential_keys: Object.keys(credentials),
    };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

/**
 * Verify a sealed connection's integrity and machine binding.
 *
 * @param {string} service - Service key
 * @param {string} passphrase - Passphrase to verify
 * @returns {{ success: boolean, valid?: boolean, machineBound?: boolean, error?: string }}
 */
export function verifyConnection(service, passphrase) {
  const filePath = join(CONNECTIONS_PATH, `${service}.0n`);

  if (!existsSync(filePath)) {
    return { success: false, error: `No connection file found for service: ${service}` };
  }

  try {
    const raw = readFileSync(filePath, "utf-8");
    const data = JSON.parse(raw);

    if (!data.$0n?.sealed || !data.vault?.data) {
      return {
        success: true,
        sealed: false,
        message: `Service "${service}" is not sealed — credentials are stored in plaintext.`,
      };
    }

    const storedFingerprint = data.$0n.vault?.fingerprint;
    const result = verify(data.vault.data, storedFingerprint, passphrase);

    return {
      success: true,
      sealed: true,
      valid: result.valid,
      machineBound: result.machineBound,
      algorithm: data.$0n.vault?.algorithm,
      sealed_at: data.$0n.vault?.sealed_at,
      error: result.error,
    };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

/**
 * Auto-unseal all sealed connections using ON_VAULT_PASSPHRASE env var.
 * Called during MCP server startup when env var is set.
 *
 * @returns {{ unsealed: string[], failed: string[], skipped: string[] }}
 */
export function autoUnseal() {
  if (!AUTO_PASSPHRASE) {
    return { unsealed: [], failed: [], skipped: [], message: "ON_VAULT_PASSPHRASE not set" };
  }

  const results = { unsealed: [], failed: [], skipped: [] };

  if (!existsSync(CONNECTIONS_PATH)) return results;

  const files = readdirSync(CONNECTIONS_PATH);

  for (const file of files) {
    if (!file.endsWith(".0n") && !file.endsWith(".0n.json")) continue;

    const service = file.replace(/\.0n(\.json)?$/, "");

    try {
      const raw = readFileSync(join(CONNECTIONS_PATH, file), "utf-8");
      const data = JSON.parse(raw);

      if (!data.$0n?.sealed || !data.vault?.data) {
        results.skipped.push(service);
        continue;
      }

      const result = unsealConnection(service, AUTO_PASSPHRASE);
      if (result.success) {
        results.unsealed.push(service);
      } else {
        results.failed.push(service);
      }
    } catch {
      results.failed.push(service);
    }
  }

  return results;
}

/**
 * Register vault tools on an MCP server instance.
 *
 * @param {import("@modelcontextprotocol/sdk/server/mcp.js").McpServer} server
 * @param {import("zod").ZodType} z - Zod instance for parameter validation
 */
export function registerVaultTools(server, z) {
  // ─── vault_seal ──────────────────────────────────────────
  server.tool(
    "vault_seal",
    `Encrypt a service's credentials on disk using AES-256-GCM.
The sealed file is machine-bound — it can ONLY be unsealed on the same hardware.
Credentials are replaced with an encrypted envelope in the .0n file.

Example: vault_seal({ service: "stripe", passphrase: "my-secret-phrase" })`,
    {
      service: z.string().describe("Service key to seal (e.g., stripe, openai, slack)"),
      passphrase: z.string().describe("Passphrase for encryption — remember this to unseal later"),
    },
    async ({ service, passphrase }) => {
      const result = sealConnection(service, passphrase);
      return {
        content: [{
          type: "text",
          text: JSON.stringify(result, null, 2),
        }],
      };
    }
  );

  // ─── vault_unseal ────────────────────────────────────────
  server.tool(
    "vault_unseal",
    `Decrypt a service's sealed credentials into memory only.
The .0n file on disk remains encrypted — credentials exist only in process memory.
Must be run on the same machine where the file was sealed.

Example: vault_unseal({ service: "stripe", passphrase: "my-secret-phrase" })`,
    {
      service: z.string().describe("Service key to unseal"),
      passphrase: z.string().describe("Passphrase used when sealing"),
    },
    async ({ service, passphrase }) => {
      const result = unsealConnection(service, passphrase);
      return {
        content: [{
          type: "text",
          text: JSON.stringify(result, null, 2),
        }],
      };
    }
  );

  // ─── vault_verify ────────────────────────────────────────
  server.tool(
    "vault_verify",
    `Check a sealed connection's integrity and machine binding.
Verifies the passphrase is correct AND the file was sealed on this machine.

Example: vault_verify({ service: "stripe", passphrase: "my-secret-phrase" })`,
    {
      service: z.string().describe("Service key to verify"),
      passphrase: z.string().describe("Passphrase to test"),
    },
    async ({ service, passphrase }) => {
      const result = verifyConnection(service, passphrase);
      return {
        content: [{
          type: "text",
          text: JSON.stringify(result, null, 2),
        }],
      };
    }
  );

  // ─── vault_fingerprint ──────────────────────────────────
  server.tool(
    "vault_fingerprint",
    `Show your machine's hardware fingerprint.
This is the unique identifier used for machine-binding sealed vault files.
The fingerprint is a SHA-256 hash of: hostname, CPU model, cores, platform, arch, and total memory.`,
    {},
    async () => {
      const { fingerprint, components } = generateFingerprint();
      return {
        content: [{
          type: "text",
          text: JSON.stringify({
            fingerprint,
            components,
            message: "This fingerprint is used to bind sealed vault files to this machine.",
          }, null, 2),
        }],
      };
    }
  );
}

// ── Exports ────────────────────────────────────────────────
export { generateFingerprint, getFingerprint } from "./fingerprint.js";
export { seal, unseal, verify } from "./cipher.js";
export { getUnsealedCredentials, isUnsealed } from "./cache.js";
