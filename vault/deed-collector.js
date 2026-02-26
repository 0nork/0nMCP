// ============================================================
// 0nMCP — Vault: Deed Credential Collector
// ============================================================
// Collects credentials from multiple sources (files, dirs,
// manual entry) and auto-detects services using the engine
// mapper. Feeds into BusinessDeed.create().
//
// Patent Pending: US Provisional Patent Application #63/990,046
// ============================================================

import { existsSync, readdirSync, readFileSync } from "fs";
import { join, extname } from "path";
import { homedir } from "os";
import { parseFile, parseEnvString, parseJsonString, parseCsvString } from "../engine/parser.js";
import { mapEnvVars, groupByService } from "../engine/mapper.js";
import { verifyCredentials } from "../engine/validator.js";

const CONNECTIONS_DIR = join(homedir(), ".0n", "connections");

// ── Collect from .0n connection files ───────────────────────

/**
 * Load credentials from ~/.0n/connections/*.0n files.
 *
 * @param {string} [dir] - Connections directory (default: ~/.0n/connections/)
 * @returns {{ credentials: Object, services: string[] }}
 */
export function collectFromConnections(dir = CONNECTIONS_DIR) {
  const credentials = {};
  const services = [];

  if (!existsSync(dir)) return { credentials, services };

  const files = readdirSync(dir).filter(f => f.endsWith(".0n"));

  for (const file of files) {
    try {
      const content = readFileSync(join(dir, file), "utf-8");
      const data = JSON.parse(content);

      // .0n connection file format: { $0n: { type, service }, credentials: { ... } }
      const service = data?.$0n?.service || file.replace(".0n", "");
      if (data.credentials && typeof data.credentials === "object") {
        credentials[service] = data.credentials;
        services.push(service);
      }
    } catch {
      // Skip invalid files
    }
  }

  return { credentials, services };
}

// ── Collect from file (auto-detect format) ──────────────────

/**
 * Collect credentials from a file (.env, .json, .csv).
 *
 * @param {string} filePath
 * @returns {{ credentials: Object, envVars: Object, services: string[], unmapped: Array }}
 */
export function collectFromFile(filePath) {
  const { entries } = parseFile(filePath);
  return processEntries(entries);
}

// ── Collect from string content ─────────────────────────────

/**
 * Collect from raw .env string content.
 * @param {string} content
 * @returns {{ credentials: Object, envVars: Object, services: string[], unmapped: Array }}
 */
export function collectFromEnvString(content) {
  const entries = parseEnvString(content);
  return processEntries(entries);
}

/**
 * Collect from raw JSON string content.
 * @param {string} content
 * @returns {{ credentials: Object, envVars: Object, services: string[], unmapped: Array }}
 */
export function collectFromJsonString(content) {
  const entries = parseJsonString(content);
  return processEntries(entries);
}

/**
 * Collect from raw CSV string content.
 * @param {string} content
 * @returns {{ credentials: Object, envVars: Object, services: string[], unmapped: Array }}
 */
export function collectFromCsvString(content) {
  const entries = parseCsvString(content);
  return processEntries(entries);
}

// ── Collect from manual key-value pairs ─────────────────────

/**
 * Collect from manual key-value pairs.
 *
 * @param {Array<{ key: string, value: string }>} pairs
 * @returns {{ credentials: Object, envVars: Object, services: string[], unmapped: Array }}
 */
export function collectFromManual(pairs) {
  return processEntries(pairs);
}

// ── Collect from pre-structured service credentials ─────────

/**
 * Collect from already-structured credentials object.
 * Format: { stripe: { apiKey: "sk_..." }, github: { token: "ghp_..." } }
 *
 * @param {Object} structured
 * @returns {{ credentials: Object, services: string[] }}
 */
export function collectFromStructured(structured) {
  const services = Object.keys(structured);
  return { credentials: structured, services };
}

// ── Process entries through mapper ──────────────────────────

/**
 * Process raw key-value entries through the mapper pipeline.
 *
 * @param {Array<{ key: string, value: string }>} entries
 * @returns {{ credentials: Object, envVars: Object, services: string[], unmapped: Array }}
 */
function processEntries(entries) {
  const { mapped, unmapped } = mapEnvVars(entries);
  const grouped = groupByService(mapped);

  // Build credentials and envVars
  const credentials = {};
  const envVars = {};
  const services = [];

  for (const [service, group] of Object.entries(grouped)) {
    credentials[service] = group.credentials;
    services.push(service);
    for (const envVar of group.envVars) {
      const entry = entries.find(e => e.key === envVar);
      if (entry) envVars[entry.key] = entry.value;
    }
  }

  // Unmapped entries go to envVars
  for (const entry of unmapped) {
    envVars[entry.key] = entry.value;
  }

  return { credentials, envVars, services, unmapped };
}

// ── Validate credentials live ───────────────────────────────

/**
 * Validate collected credentials against live API endpoints.
 *
 * @param {Object} credentials - { service: { field: value } }
 * @returns {Promise<Object>} Validation results per service
 */
export async function validateCollected(credentials) {
  const results = {};
  const summary = { total: 0, valid: 0, invalid: 0, skipped: 0 };

  const entries = Object.entries(credentials);
  summary.total = entries.length;

  // Validate in parallel batches of 5
  const batchSize = 5;
  for (let i = 0; i < entries.length; i += batchSize) {
    const batch = entries.slice(i, i + batchSize);
    const promises = batch.map(([service, creds]) =>
      verifyCredentials(service, creds).then(r => ({ service, ...r }))
    );
    const batchResults = await Promise.allSettled(promises);

    for (const result of batchResults) {
      if (result.status === "fulfilled") {
        const r = result.value;
        results[r.service] = r;
        if (r.skipped) summary.skipped++;
        else if (r.valid) summary.valid++;
        else summary.invalid++;
      }
    }
  }

  return { results, summary };
}

// ── Master collection function ──────────────────────────────

/**
 * Collect credentials from multiple sources at once.
 *
 * @param {Object} sources
 * @param {string}  [sources.envFile] - Path to .env file
 * @param {string}  [sources.jsonFile] - Path to JSON file
 * @param {string}  [sources.csvFile] - Path to CSV file
 * @param {string}  [sources.connectionsDir] - Path to connections dir
 * @param {Array}   [sources.manual] - Manual key-value pairs
 * @param {Object}  [sources.structured] - Pre-structured credentials
 * @param {boolean} [sources.validate] - Validate credentials live
 * @returns {Promise<Object>}
 */
export async function collectCredentials(sources) {
  const allCredentials = {};
  const allEnvVars = {};
  const allServices = new Set();
  const allUnmapped = [];

  // Collect from each source
  if (sources.envFile && existsSync(sources.envFile)) {
    const result = collectFromFile(sources.envFile);
    mergeResults(allCredentials, allEnvVars, allServices, allUnmapped, result);
  }

  if (sources.jsonFile && existsSync(sources.jsonFile)) {
    const result = collectFromFile(sources.jsonFile);
    mergeResults(allCredentials, allEnvVars, allServices, allUnmapped, result);
  }

  if (sources.csvFile && existsSync(sources.csvFile)) {
    const result = collectFromFile(sources.csvFile);
    mergeResults(allCredentials, allEnvVars, allServices, allUnmapped, result);
  }

  if (sources.connectionsDir || existsSync(CONNECTIONS_DIR)) {
    const dir = sources.connectionsDir || CONNECTIONS_DIR;
    const result = collectFromConnections(dir);
    for (const [svc, creds] of Object.entries(result.credentials)) {
      allCredentials[svc] = { ...allCredentials[svc], ...creds };
      allServices.add(svc);
    }
  }

  if (sources.manual && Array.isArray(sources.manual)) {
    const result = collectFromManual(sources.manual);
    mergeResults(allCredentials, allEnvVars, allServices, allUnmapped, result);
  }

  if (sources.structured && typeof sources.structured === "object") {
    const result = collectFromStructured(sources.structured);
    for (const [svc, creds] of Object.entries(result.credentials)) {
      allCredentials[svc] = { ...allCredentials[svc], ...creds };
      allServices.add(svc);
    }
  }

  const output = {
    credentials: allCredentials,
    envVars: allEnvVars,
    services: Array.from(allServices),
    unmapped: allUnmapped,
    credentialCount: Object.values(allCredentials).reduce(
      (sum, svc) => sum + Object.keys(svc).length, 0
    ),
  };

  // Optional live validation
  if (sources.validate) {
    output.validation = await validateCollected(allCredentials);
  }

  return output;
}

// ── Merge helper ────────────────────────────────────────────

function mergeResults(allCreds, allEnv, allServices, allUnmapped, result) {
  for (const [svc, creds] of Object.entries(result.credentials || {})) {
    allCreds[svc] = { ...allCreds[svc], ...creds };
    allServices.add(svc);
  }
  for (const [k, v] of Object.entries(result.envVars || {})) {
    allEnv[k] = v;
  }
  if (result.unmapped) allUnmapped.push(...result.unmapped);
}
