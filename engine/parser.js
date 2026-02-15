// ============================================================
// 0nMCP — Engine: Credential File Parser
// ============================================================
// Parses .env, CSV, and JSON credential files into a
// normalized array of { key, value } entries.
// ============================================================

import { readFileSync } from "fs";
import { extname } from "path";

/**
 * Parse a .env file into key-value entries.
 * Handles: comments (#), blank lines, quoted values, `export` prefix.
 * @param {string} filePath
 * @returns {Array<{ key: string, value: string }>}
 */
export function parseEnvFile(filePath) {
  const content = readFileSync(filePath, "utf-8");
  return parseEnvString(content);
}

/**
 * Parse .env content from a string.
 * @param {string} content
 * @returns {Array<{ key: string, value: string }>}
 */
export function parseEnvString(content) {
  const entries = [];
  const lines = content.split(/\r?\n/);

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;

    // Strip `export ` prefix
    const clean = trimmed.startsWith("export ") ? trimmed.slice(7) : trimmed;

    const eqIdx = clean.indexOf("=");
    if (eqIdx === -1) continue;

    const key = clean.slice(0, eqIdx).trim();
    let value = clean.slice(eqIdx + 1).trim();

    // Strip surrounding quotes
    if ((value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }

    // Strip inline comments (only for unquoted values)
    if (!clean.slice(eqIdx + 1).trim().startsWith('"') &&
        !clean.slice(eqIdx + 1).trim().startsWith("'")) {
      const commentIdx = value.indexOf(" #");
      if (commentIdx > -1) value = value.slice(0, commentIdx).trim();
    }

    if (key) entries.push({ key, value });
  }

  return entries;
}

/**
 * Parse a CSV file into key-value entries.
 * Expects columns: key,value (with optional header row).
 * @param {string} filePath
 * @returns {Array<{ key: string, value: string }>}
 */
export function parseCsvFile(filePath) {
  const content = readFileSync(filePath, "utf-8");
  return parseCsvString(content);
}

/**
 * Parse CSV content from a string.
 * @param {string} content
 * @returns {Array<{ key: string, value: string }>}
 */
export function parseCsvString(content) {
  const entries = [];
  const lines = content.split(/\r?\n/).filter(l => l.trim());
  if (lines.length === 0) return entries;

  // Auto-detect and skip header row
  const first = lines[0].toLowerCase();
  const startIdx = (first.includes("key") && first.includes("value")) ? 1 : 0;

  for (let i = startIdx; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    // Simple CSV parse (handles quoted fields)
    const fields = parseCsvLine(line);
    if (fields.length >= 2) {
      entries.push({ key: fields[0].trim(), value: fields[1].trim() });
    }
  }

  return entries;
}

/**
 * Parse a single CSV line, handling quoted fields.
 */
function parseCsvLine(line) {
  const fields = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (ch === "," && !inQuotes) {
      fields.push(current);
      current = "";
    } else {
      current += ch;
    }
  }
  fields.push(current);
  return fields;
}

/**
 * Parse a JSON file into key-value entries.
 * Supports flat objects, nested service objects, and array format.
 * @param {string} filePath
 * @returns {Array<{ key: string, value: string }>}
 */
export function parseJsonFile(filePath) {
  const content = readFileSync(filePath, "utf-8");
  return parseJsonString(content);
}

/**
 * Parse JSON content from a string.
 * @param {string} content
 * @returns {Array<{ key: string, value: string }>}
 */
export function parseJsonString(content) {
  const data = JSON.parse(content);
  const entries = [];

  if (Array.isArray(data)) {
    // Array format: [{ service: "stripe", credentials: { apiKey: "..." } }]
    for (const item of data) {
      if (item.service && item.credentials) {
        for (const [field, val] of Object.entries(item.credentials)) {
          entries.push({ key: `${item.service}.${field}`, value: String(val) });
        }
      }
    }
  } else if (typeof data === "object") {
    for (const [key, val] of Object.entries(data)) {
      if (typeof val === "object" && val !== null) {
        // Nested: { stripe: { apiKey: "..." } }
        for (const [field, v] of Object.entries(val)) {
          if (typeof v === "string" || typeof v === "number") {
            entries.push({ key: `${key}.${field}`, value: String(v) });
          }
        }
      } else if (typeof val === "string" || typeof val === "number") {
        // Flat: { STRIPE_SECRET_KEY: "sk_..." }
        entries.push({ key, value: String(val) });
      }
    }
  }

  return entries;
}

/**
 * Auto-detect file format from extension or content.
 * @param {string} filePath
 * @returns {"env" | "csv" | "json" | "unknown"}
 */
export function detectFormat(filePath) {
  const ext = extname(filePath).toLowerCase();
  if (ext === ".env") return "env";
  if (ext === ".csv") return "csv";
  if (ext === ".json") return "json";

  // Check filename patterns
  const name = filePath.split("/").pop() || "";
  if (name.startsWith(".env")) return "env";

  // Inspect content
  try {
    const content = readFileSync(filePath, "utf-8").trim();
    if (content.startsWith("{") || content.startsWith("[")) return "json";
    if (content.includes(",") && content.split("\n")[0].split(",").length >= 2) return "csv";
    if (/^[A-Z_]+=/.test(content)) return "env";
  } catch {
    // Fall through
  }

  return "unknown";
}

/**
 * Auto-detect format and parse any supported file.
 * @param {string} filePath
 * @returns {{ format: string, entries: Array<{ key: string, value: string }> }}
 */
export function parseFile(filePath) {
  const format = detectFormat(filePath);

  switch (format) {
    case "env": return { format, entries: parseEnvFile(filePath) };
    case "csv": return { format, entries: parseCsvFile(filePath) };
    case "json": return { format, entries: parseJsonFile(filePath) };
    default:
      throw new Error(`Unknown file format for: ${filePath}. Supported: .env, .csv, .json`);
  }
}
