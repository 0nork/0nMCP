// ============================================================
// 0nMCP — Connection Manager
// ============================================================
// Stores and retrieves service connections locally.
// Connections persist at ~/.0nmcp/connections.json
// ============================================================

import { readFileSync, writeFileSync, mkdirSync, existsSync } from "fs";
import { homedir } from "os";
import { join } from "path";
import { SERVICE_CATALOG } from "./catalog.js";

const STORE_DIR = join(homedir(), ".0nmcp");
const STORE_FILE = join(STORE_DIR, "connections.json");

export class ConnectionManager {
  constructor() {
    if (!existsSync(STORE_DIR)) {
      mkdirSync(STORE_DIR, { recursive: true });
    }
    this.connections = this._load();
  }

  _load() {
    try {
      if (existsSync(STORE_FILE)) {
        return JSON.parse(readFileSync(STORE_FILE, "utf-8"));
      }
    } catch {
      // Corrupted file — start fresh
    }
    return {};
  }

  _save() {
    writeFileSync(STORE_FILE, JSON.stringify(this.connections, null, 2));
  }

  /**
   * Connect a service by storing its credentials.
   * @param {string} serviceKey - Key from SERVICE_CATALOG (e.g. "stripe")
   * @param {object} credentials - Service-specific credentials
   * @param {object} [meta] - Optional metadata (label, notes, etc.)
   * @returns {{ success: boolean, service: object }}
   */
  connect(serviceKey, credentials, meta = {}) {
    const catalog = SERVICE_CATALOG[serviceKey];
    if (!catalog) {
      return { success: false, error: `Unknown service: ${serviceKey}. Use list_available_services to see options.` };
    }

    // Validate required credential keys
    const missing = catalog.credentialKeys.filter(k => !credentials[k]);
    if (missing.length > 0) {
      return {
        success: false,
        error: `Missing credentials: ${missing.join(", ")}. Required: ${catalog.credentialKeys.join(", ")}`,
      };
    }

    this.connections[serviceKey] = {
      serviceKey,
      name: catalog.name,
      type: catalog.type,
      credentials,
      connectedAt: new Date().toISOString(),
      ...meta,
    };

    this._save();

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
   * Disconnect (remove) a service.
   */
  disconnect(serviceKey) {
    if (!this.connections[serviceKey]) {
      return { success: false, error: `Service "${serviceKey}" is not connected.` };
    }
    delete this.connections[serviceKey];
    this._save();
    return { success: true };
  }

  /**
   * Get a single connection with credentials.
   */
  get(serviceKey) {
    return this.connections[serviceKey] || null;
  }

  /**
   * Get credentials for a service (shortcut).
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
