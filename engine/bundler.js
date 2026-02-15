// ============================================================
// 0nMCP — Engine: Bundle Creator/Opener
// ============================================================
// Creates and opens portable .0n bundle files — the "Alpha
// AI Brain" format. Bundles contain encrypted connections,
// platform configs, and optional include files.
//
// Portable encryption: passphrase-only (no machine binding).
// After import, optionally re-seal with vault for machine lock.
//
// Patent Pending: US Provisional Patent Application #63/968,814
// ============================================================

import { readFileSync, writeFileSync, existsSync, mkdirSync } from "fs";
import { join, basename } from "path";
import { createHash } from "crypto";
import { homedir } from "os";
import { sealPortable, unsealPortable } from "./cipher-portable.js";
import { generateAllPlatformConfigs } from "./platforms.js";
import { CONNECTIONS_PATH } from "../connections.js";

const BUNDLES_DIR = join(homedir(), ".0n", "bundles");

/**
 * Compute SHA-256 checksum of a string.
 */
function sha256(data) {
  return createHash("sha256").update(data).digest("hex");
}

/**
 * Create a .0n bundle file.
 *
 * @param {object} options
 * @param {Record<string, { credentials: Record<string, string>, authType?: string }>} options.connections
 * @param {string} options.passphrase
 * @param {string} [options.outputPath]
 * @param {string} [options.name]
 * @param {string} [options.description]
 * @param {string[]|"all"} [options.platforms] - Platform keys or "all"
 * @param {Array<{ path: string, type?: string, name?: string }>} [options.includes]
 * @param {boolean} [options.seal] - Default true
 * @returns {{ bundle: object, path: string, manifest: object }}
 */
export function createBundle(options) {
  const {
    connections,
    passphrase,
    outputPath,
    name = "0n Bundle",
    description = "",
    platforms = "all",
    includes = [],
    seal = true,
  } = options;

  const now = new Date().toISOString();

  // Build connections array
  const bundleConnections = [];
  for (const [service, conn] of Object.entries(connections)) {
    const credJson = JSON.stringify(conn.credentials);

    if (seal) {
      const { sealed } = sealPortable(credJson, passphrase);
      bundleConnections.push({
        service,
        name: conn.name || service,
        environment: conn.environment || "production",
        auth_type: conn.authType || "api_key",
        credential_keys: Object.keys(conn.credentials),
        sealed: true,
        vault: {
          data: sealed,
          algorithm: "aes-256-gcm",
          kdf: "pbkdf2-sha512-100k",
          portable: true,
        },
      });
    } else {
      bundleConnections.push({
        service,
        name: conn.name || service,
        environment: conn.environment || "production",
        auth_type: conn.authType || "api_key",
        credential_keys: Object.keys(conn.credentials),
        sealed: false,
        credentials: conn.credentials,
      });
    }
  }

  // Generate platform configs
  let platformConfigs = {};
  if (platforms === "all" || (Array.isArray(platforms) && platforms.length > 0)) {
    const allConfigs = generateAllPlatformConfigs({});
    if (platforms === "all") {
      platformConfigs = {};
      for (const [key, cfg] of Object.entries(allConfigs)) {
        platformConfigs[key] = {
          format: cfg.format,
          config_path: cfg.path,
          config: cfg.config,
        };
      }
    } else {
      for (const key of platforms) {
        if (allConfigs[key]) {
          platformConfigs[key] = {
            format: allConfigs[key].format,
            config_path: allConfigs[key].path,
            config: allConfigs[key].config,
          };
        }
      }
    }
  }

  // Process include files
  const bundleIncludes = [];
  for (const inc of includes) {
    if (!existsSync(inc.path)) continue;
    const content = readFileSync(inc.path);
    const data = content.toString("base64");
    bundleIncludes.push({
      name: inc.name || basename(inc.path),
      type: inc.type || detectIncludeType(inc.path),
      target: inc.target || detectTarget(inc.path),
      data,
      checksum: `sha256:${sha256(content.toString())}`,
      size: content.length,
    });
  }

  // Build manifest
  const connectionsStr = JSON.stringify(bundleConnections);
  const platformsStr = JSON.stringify(platformConfigs);
  const includesStr = JSON.stringify(bundleIncludes);

  const manifest = {
    bundle_version: "1.0.0",
    generator: "0nmcp-engine/1.6.0",
    connection_count: bundleConnections.length,
    platform_count: Object.keys(platformConfigs).length,
    include_count: bundleIncludes.length,
    services: bundleConnections.map(c => c.service),
    encryption: seal
      ? { method: "portable", algorithm: "aes-256-gcm", kdf: "pbkdf2-sha512-100k" }
      : { method: "none" },
    checksums: {
      connections: `sha256:${sha256(connectionsStr)}`,
      platforms: `sha256:${sha256(platformsStr)}`,
      includes: `sha256:${sha256(includesStr)}`,
    },
  };

  // Assemble bundle
  const bundle = {
    $0n: {
      type: "bundle",
      version: "1.0.0",
      created: now,
      updated: now,
      name,
      description,
    },
    connections: bundleConnections,
    platforms: platformConfigs,
    includes: bundleIncludes,
    manifest,
  };

  // Write to file
  if (!existsSync(BUNDLES_DIR)) mkdirSync(BUNDLES_DIR, { recursive: true });
  const ts = now.replace(/[:.]/g, "-").slice(0, 19);
  const outPath = outputPath || join(BUNDLES_DIR, `bundle-${ts}.0n`);
  const outDir = join(outPath, "..");
  if (!existsSync(outDir)) mkdirSync(outDir, { recursive: true });

  writeFileSync(outPath, JSON.stringify(bundle, null, 2));

  return { bundle, path: outPath, manifest };
}

/**
 * Open a .0n bundle and extract connections.
 *
 * @param {string} bundlePath
 * @param {string} passphrase
 * @param {object} [options]
 * @param {boolean} [options.installConnections] - Write to ~/.0n/connections/ (default true)
 * @param {boolean} [options.dryRun] - Preview without writing (default false)
 * @returns {{ connections: string[], platforms: string[], includes: string[], errors: string[] }}
 */
export function openBundle(bundlePath, passphrase, options = {}) {
  const { installConnections = true, dryRun = false } = options;

  const raw = readFileSync(bundlePath, "utf-8");
  const bundle = JSON.parse(raw);

  if (!bundle.$0n || bundle.$0n.type !== "bundle") {
    throw new Error("Not a valid .0n bundle file.");
  }

  const results = { connections: [], platforms: [], includes: [], errors: [] };

  // Extract connections
  for (const conn of bundle.connections || []) {
    try {
      let credentials;

      if (conn.sealed && conn.vault?.data) {
        const decrypted = unsealPortable(conn.vault.data, passphrase);
        credentials = JSON.parse(decrypted);
      } else if (conn.credentials) {
        credentials = conn.credentials;
      } else {
        results.errors.push(`${conn.service}: No credentials found`);
        continue;
      }

      if (installConnections && !dryRun) {
        // Write as standard .0n connection file
        const connFile = {
          $0n: {
            type: "connection",
            version: "1.0.0",
            created: new Date().toISOString(),
            name: conn.name || conn.service,
          },
          service: conn.service,
          environment: conn.environment || "production",
          auth: {
            type: conn.auth_type || "api_key",
            credentials,
          },
          metadata: {
            imported_from: basename(bundlePath),
            imported_at: new Date().toISOString(),
          },
        };

        if (!existsSync(CONNECTIONS_PATH)) mkdirSync(CONNECTIONS_PATH, { recursive: true });
        const filePath = join(CONNECTIONS_PATH, `${conn.service}.0n`);
        writeFileSync(filePath, JSON.stringify(connFile, null, 2));
      }

      results.connections.push(conn.service);
    } catch (err) {
      results.errors.push(`${conn.service}: ${err.message}`);
    }
  }

  // Extract includes
  for (const inc of bundle.includes || []) {
    try {
      if (dryRun) {
        results.includes.push(inc.name);
        continue;
      }

      const target = inc.target
        ? inc.target.replace("~", homedir())
        : join(homedir(), ".0n", inc.type === "workflow" ? "workflows" : "plugins", inc.name);

      const dir = join(target, "..");
      if (!existsSync(dir)) mkdirSync(dir, { recursive: true });

      const data = Buffer.from(inc.data, "base64");

      // Verify checksum
      if (inc.checksum) {
        const expected = inc.checksum.replace("sha256:", "");
        const actual = sha256(data.toString());
        if (actual !== expected) {
          results.errors.push(`${inc.name}: Checksum mismatch`);
          continue;
        }
      }

      writeFileSync(target, data);
      results.includes.push(inc.name);
    } catch (err) {
      results.errors.push(`${inc.name}: ${err.message}`);
    }
  }

  // List platforms
  for (const key of Object.keys(bundle.platforms || {})) {
    results.platforms.push(key);
  }

  return results;
}

/**
 * Inspect a bundle without passphrase — shows metadata only, no credentials.
 * @param {string} bundlePath
 * @returns {object} Bundle metadata and service list
 */
export function inspectBundle(bundlePath) {
  const raw = readFileSync(bundlePath, "utf-8");
  const bundle = JSON.parse(raw);

  if (!bundle.$0n || bundle.$0n.type !== "bundle") {
    throw new Error("Not a valid .0n bundle file.");
  }

  return {
    name: bundle.$0n.name,
    description: bundle.$0n.description,
    created: bundle.$0n.created,
    version: bundle.$0n.version,
    services: (bundle.connections || []).map(c => ({
      service: c.service,
      name: c.name,
      sealed: c.sealed,
      credential_keys: c.credential_keys,
    })),
    platforms: Object.keys(bundle.platforms || {}),
    includes: (bundle.includes || []).map(i => ({
      name: i.name,
      type: i.type,
      size: i.size,
    })),
    manifest: bundle.manifest,
  };
}

/**
 * Verify bundle integrity: checksums + passphrase test.
 * @param {string} bundlePath
 * @param {string} passphrase
 * @returns {{ valid: boolean, errors: string[] }}
 */
export function verifyBundle(bundlePath, passphrase) {
  const raw = readFileSync(bundlePath, "utf-8");
  const bundle = JSON.parse(raw);
  const errors = [];

  if (!bundle.$0n || bundle.$0n.type !== "bundle") {
    return { valid: false, errors: ["Not a valid .0n bundle file."] };
  }

  // Verify manifest checksums
  const checksums = bundle.manifest?.checksums || {};
  if (checksums.connections) {
    const actual = sha256(JSON.stringify(bundle.connections));
    const expected = checksums.connections.replace("sha256:", "");
    if (actual !== expected) errors.push("Connections checksum mismatch");
  }
  if (checksums.platforms) {
    const actual = sha256(JSON.stringify(bundle.platforms));
    const expected = checksums.platforms.replace("sha256:", "");
    if (actual !== expected) errors.push("Platforms checksum mismatch");
  }

  // Try to unseal each connection
  for (const conn of bundle.connections || []) {
    if (conn.sealed && conn.vault?.data) {
      try {
        unsealPortable(conn.vault.data, passphrase);
      } catch {
        errors.push(`${conn.service}: Failed to unseal — wrong passphrase`);
      }
    }
  }

  return { valid: errors.length === 0, errors };
}

/**
 * Detect include file type from path.
 */
function detectIncludeType(filePath) {
  if (filePath.endsWith(".0n")) return "workflow";
  if (filePath.endsWith(".js") || filePath.endsWith(".mjs")) return "skill";
  if (filePath.endsWith(".json")) return "config";
  if (filePath.endsWith(".md")) return "doc";
  return "file";
}

/**
 * Detect target directory for include files.
 */
function detectTarget(filePath) {
  const type = detectIncludeType(filePath);
  const name = basename(filePath);
  switch (type) {
    case "workflow": return `~/.0n/workflows/${name}`;
    case "skill": return `~/.0n/plugins/${name}`;
    case "config": return `~/.0n/${name}`;
    default: return `~/.0n/includes/${name}`;
  }
}
