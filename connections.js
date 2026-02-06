// ============================================================
// 0nMCP — Connection Manager (.0n Standard)
// ============================================================
// Stores service connections as .0n files in ~/.0n/connections/
// Follows the .0n Standard: https://github.com/0nork/0n-spec
// ============================================================

import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync, unlinkSync, appendFileSync } from "fs";
import { homedir } from "os";
import { join } from "path";
import { SERVICE_CATALOG } from "./catalog.js";

// ── .0n Directory Structure ──────────────────────────────────
const DOT_ON = join(homedir(), ".0n");
const CONNECTIONS_DIR = join(DOT_ON, "connections");
const WORKFLOWS_DIR = join(DOT_ON, "workflows");
const SNAPSHOTS_DIR = join(DOT_ON, "snapshots");
const HISTORY_DIR = join(DOT_ON, "history");
const CACHE_DIR = join(DOT_ON, "cache");
const PLUGINS_DIR = join(DOT_ON, "plugins");
const CONFIG_FILE = join(DOT_ON, "config.json");

// Legacy path for migration
const LEGACY_DIR = join(homedir(), ".0nmcp");
const LEGACY_FILE = join(LEGACY_DIR, "connections.json");

/**
 * Initialize the ~/.0n/ directory structure.
 */
export function initDotOn() {
  const dirs = [DOT_ON, CONNECTIONS_DIR, WORKFLOWS_DIR, SNAPSHOTS_DIR, HISTORY_DIR, CACHE_DIR, PLUGINS_DIR];
  for (const dir of dirs) {
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
    }
  }

  // Create default config if missing
  if (!existsSync(CONFIG_FILE)) {
    const config = {
      $0n: {
        type: "config",
        version: "1.0.0",
        created: new Date().toISOString(),
      },
      settings: {
        ai_provider: "anthropic",
        fallback_mode: "keyword",
        history_enabled: true,
        cache_enabled: true,
      },
    };
    writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2));
  }
}

/**
 * Migrate legacy ~/.0nmcp/connections.json to ~/.0n/connections/*.0n
 */
function migrateLegacy() {
  if (!existsSync(LEGACY_FILE)) return;

  try {
    const legacy = JSON.parse(readFileSync(LEGACY_FILE, "utf-8"));
    let migrated = 0;

    for (const [key, conn] of Object.entries(legacy)) {
      const targetFile = join(CONNECTIONS_DIR, `${key}.0n`);
      if (existsSync(targetFile)) continue; // Already migrated

      const catalog = SERVICE_CATALOG[key];
      const dotOnFile = {
        $0n: {
          type: "connection",
          version: "1.0.0",
          created: conn.connectedAt || new Date().toISOString(),
          name: conn.name || (catalog ? catalog.name : key),
        },
        service: key,
        environment: "production",
        auth: {
          type: catalog?.authType || "api_key",
          credentials: conn.credentials || {},
        },
        metadata: {
          connected_at: conn.connectedAt || new Date().toISOString(),
          migrated_from: "~/.0nmcp/connections.json",
        },
      };

      writeFileSync(targetFile, JSON.stringify(dotOnFile, null, 2));
      migrated++;
    }

    if (migrated > 0) {
      console.error(`Migrated ${migrated} connection(s) from ~/.0nmcp/ to ~/.0n/connections/`);
    }
  } catch {
    // Migration failed silently — legacy data preserved
  }
}

export class ConnectionManager {
  constructor() {
    initDotOn();
    migrateLegacy();
    this.connections = this._loadAll();
  }

  /**
   * Load all .0n connection files from ~/.0n/connections/
   */
  _loadAll() {
    const connections = {};

    if (!existsSync(CONNECTIONS_DIR)) return connections;

    const files = readdirSync(CONNECTIONS_DIR);
    for (const file of files) {
      if (!file.endsWith(".0n") && !file.endsWith(".0n.json")) continue;

      try {
        const filePath = join(CONNECTIONS_DIR, file);
        const data = JSON.parse(readFileSync(filePath, "utf-8"));

        if (!data.$0n || data.$0n.type !== "connection" || !data.service) continue;

        const key = data.service;
        connections[key] = {
          serviceKey: key,
          name: data.$0n.name || key,
          type: SERVICE_CATALOG[key]?.type || "unknown",
          credentials: data.auth?.credentials || {},
          connectedAt: data.$0n.created || data.metadata?.connected_at,
          environment: data.environment || "production",
          _filePath: filePath,
        };
      } catch {
        // Skip invalid files
      }
    }

    return connections;
  }

  /**
   * Save a single connection as a .0n file.
   */
  _saveConnection(serviceKey, conn) {
    const catalog = SERVICE_CATALOG[serviceKey];
    const now = new Date().toISOString();

    const dotOnFile = {
      $0n: {
        type: "connection",
        version: "1.0.0",
        created: conn.connectedAt || now,
        updated: now,
        name: conn.name || (catalog ? catalog.name : serviceKey),
      },
      service: serviceKey,
      environment: conn.environment || "production",
      auth: {
        type: catalog?.authType || "api_key",
        credentials: conn.credentials || {},
      },
      options: {},
      metadata: {
        connected_at: conn.connectedAt || now,
        last_updated: now,
      },
    };

    const filePath = join(CONNECTIONS_DIR, `${serviceKey}.0n`);
    writeFileSync(filePath, JSON.stringify(dotOnFile, null, 2));
    return filePath;
  }

  /**
   * Connect a service by storing its credentials as a .0n file.
   */
  connect(serviceKey, credentials, meta = {}) {
    const catalog = SERVICE_CATALOG[serviceKey];
    if (!catalog) {
      return { success: false, error: `Unknown service: ${serviceKey}. Use list_available_services to see options.` };
    }

    const missing = catalog.credentialKeys.filter(k => !credentials[k]);
    if (missing.length > 0) {
      return {
        success: false,
        error: `Missing credentials: ${missing.join(", ")}. Required: ${catalog.credentialKeys.join(", ")}`,
      };
    }

    const now = new Date().toISOString();
    const conn = {
      serviceKey,
      name: catalog.name,
      type: catalog.type,
      credentials,
      connectedAt: now,
      ...meta,
    };

    this.connections[serviceKey] = conn;
    this._saveConnection(serviceKey, conn);

    return {
      success: true,
      service: {
        key: serviceKey,
        name: catalog.name,
        type: catalog.type,
        capabilities: catalog.capabilities.length,
      },
    };
  }

  /**
   * Disconnect (remove) a service — deletes the .0n file.
   */
  disconnect(serviceKey) {
    if (!this.connections[serviceKey]) {
      return { success: false, error: `Service "${serviceKey}" is not connected.` };
    }

    // Delete .0n file
    const filePath = join(CONNECTIONS_DIR, `${serviceKey}.0n`);
    if (existsSync(filePath)) {
      unlinkSync(filePath);
    }

    delete this.connections[serviceKey];
    return { success: true };
  }

  /**
   * Get a single connection with credentials.
   */
  get(serviceKey) {
    return this.connections[serviceKey] || null;
  }

  /**
   * Get credentials for a service.
   */
  getCredentials(serviceKey) {
    return this.connections[serviceKey]?.credentials || null;
  }

  /**
   * List all connections (credentials redacted).
   */
  list() {
    return Object.entries(this.connections).map(([key, conn]) => ({
      key,
      name: conn.name,
      type: conn.type,
      connectedAt: conn.connectedAt,
      capabilities: SERVICE_CATALOG[key]?.capabilities?.length || 0,
    }));
  }

  /**
   * Check if a service is connected.
   */
  isConnected(serviceKey) {
    return !!this.connections[serviceKey];
  }

  /**
   * Get count of connected services.
   */
  count() {
    return Object.keys(this.connections).length;
  }

  /**
   * Get all connected service keys.
   */
  keys() {
    return Object.keys(this.connections);
  }
}

// ── Execution History ──────────────────────────────────────

/**
 * Log an execution to ~/.0n/history/ as a JSONL entry.
 */
export function logExecution(execution) {
  const now = new Date();
  const dateStr = now.toISOString().split("T")[0]; // YYYY-MM-DD
  const historyFile = join(HISTORY_DIR, `${dateStr}.jsonl`);

  const record = {
    $0n: {
      type: "execution",
      version: "1.0.0",
      created: now.toISOString(),
    },
    execution_id: `exec_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    status: execution.success ? "completed" : "failed",
    task: execution.task,
    timing: {
      started_at: execution.startedAt,
      completed_at: now.toISOString(),
      duration_ms: execution.duration,
    },
    steps: execution.steps || [],
    services_used: execution.servicesUsed || [],
    error: execution.error || null,
  };

  try {
    appendFileSync(historyFile, JSON.stringify(record) + "\n");
  } catch {
    // History logging is non-critical
  }
}

// ── Exports ────────────────────────────────────────────────

export const DOT_ON_DIR = DOT_ON;
export const CONNECTIONS_PATH = CONNECTIONS_DIR;
export const HISTORY_PATH = HISTORY_DIR;
export const WORKFLOWS_PATH = WORKFLOWS_DIR;
export const SNAPSHOTS_PATH = SNAPSHOTS_DIR;
