// ============================================================
// 0nMCP — Capability Proxy
// ============================================================
// Zero-knowledge API execution layer. Tools call capabilities,
// not accounts. Credentials are borrowed from vault/connections,
// held in memory only for the duration of the call, then wiped.
//
// Wires in rate limiting (ratelimit.js) and audit logging.
// Credentials NEVER appear in logs, errors, or tool responses.
// ============================================================

import { appendFileSync, existsSync, mkdirSync } from "fs";
import { join } from "path";
import { homedir } from "os";
import { getLimiter, retryWithBackoff } from "./ratelimit.js";

const AUDIT_DIR = join(homedir(), ".0n", "history");
const AUDIT_FILE = join(AUDIT_DIR, "audit.jsonl");

export class CapabilityProxy {
  /**
   * @param {import("./connections.js").ConnectionManager} connectionManager
   * @param {Record<string, any>} catalog - SERVICE_CATALOG from catalog.js
   */
  constructor(connectionManager, catalog) {
    this.connections = connectionManager;
    this.catalog = catalog;

    // Ensure audit directory exists
    if (!existsSync(AUDIT_DIR)) {
      mkdirSync(AUDIT_DIR, { recursive: true });
    }
  }

  // ── Primary method — tools call this instead of fetch() ──────
  /**
   * Execute an API call through the proxy.
   * Borrows credentials, enforces rate limits, executes, wipes credentials, logs audit.
   *
   * @param {string} service - Service key (e.g., "stripe", "sendgrid")
   * @param {string} endpoint - Endpoint name from service catalog
   * @param {Object} params - Request parameters
   * @returns {Promise<{response: Response, data: any}>}
   */
  async call(service, endpoint, params = {}) {
    const start = Date.now();
    let creds = null;
    let status = 0;

    try {
      // 1. Borrow credentials (in-memory only)
      creds = this._borrowCredentials(service);
      if (!creds) {
        throw new Error(`Service ${service} not connected`);
      }

      // 2. Resolve catalog entry
      const svc = this.catalog[service];
      if (!svc) throw new Error(`Unknown service: ${service}`);

      const ep = svc.endpoints?.[endpoint];
      if (!ep) throw new Error(`Unknown endpoint: ${service}.${endpoint}`);

      // 3. Build request from catalog
      const { url, method, headers, body } = this._buildRequest(svc, ep, params, creds);

      // 4. Enforce rate limit
      await this._enforceRateLimit(service);

      // 5. Execute with retry on 429/5xx
      const response = await retryWithBackoff(
        () => fetch(url, { method, headers, body }),
        { maxRetries: 2, initialDelayMs: 500 }
      );

      status = response.status;
      const data = await response.json().catch(() => ({
        status: response.status,
        statusText: response.statusText,
      }));

      return { response, data };
    } finally {
      // 6. Wipe credentials from local scope
      creds = null;

      // 7. Log audit entry (NO credentials)
      this._logAudit(service, endpoint, status, Date.now() - start);
    }
  }

  // ── CRM variant — credentials provided per-call ──────────────
  /**
   * Execute with externally-provided credentials (CRM pattern).
   * Used when access_token comes from the MCP tool argument, not ConnectionManager.
   * Still provides rate limiting and audit logging.
   *
   * @param {string} service - Service key (typically "crm")
   * @param {string} endpoint - Endpoint/tool name
   * @param {string} url - Pre-built URL
   * @param {Object} options - Fetch options (method, headers, body)
   * @returns {Promise<{response: Response, data: any}>}
   */
  async callWithCredentials(service, endpoint, url, options) {
    const start = Date.now();
    let status = 0;

    try {
      // Enforce rate limit
      await this._enforceRateLimit(service);

      // Execute with retry
      const response = await retryWithBackoff(
        () => fetch(url, options),
        { maxRetries: 2, initialDelayMs: 500 }
      );

      status = response.status;
      const data = await response.json().catch(() => ({
        status: response.status,
        statusText: response.statusText,
      }));

      return { response, data };
    } finally {
      this._logAudit(service, endpoint, status, Date.now() - start);
    }
  }

  // ── Internal: borrow credentials ─────────────────────────────
  _borrowCredentials(service) {
    const creds = this.connections.getCredentials(service);
    // Return a shallow copy; original ref released after call
    return creds ? { ...creds } : null;
  }

  // ── Internal: enforce rate limit ─────────────────────────────
  async _enforceRateLimit(service) {
    const limiter = getLimiter(service);
    await limiter.acquire();
  }

  // ── Internal: build request from catalog entry ───────────────
  _buildRequest(svc, ep, params, creds) {
    // URL with path param substitution
    const allParams = { ...creds, ...params };
    let url = svc.baseUrl + ep.path;
    url = url.replace(/\{(\w+)\}/g, (_, key) => allParams[key] || `{${key}}`);

    // Headers from catalog auth
    const headers = svc.authHeader(creds);
    const method = ep.method;
    let body = undefined;

    // Body for non-GET
    if (method !== "GET" && params && Object.keys(params).length > 0) {
      const contentType = ep.contentType || "application/json";
      if (contentType === "application/x-www-form-urlencoded") {
        headers["Content-Type"] = "application/x-www-form-urlencoded";
        const flat = {};
        for (const [k, v] of Object.entries(params)) {
          if (typeof v !== "object") flat[k] = String(v);
        }
        body = new URLSearchParams(flat).toString();
      } else {
        headers["Content-Type"] = "application/json";
        body = JSON.stringify(params);
      }
    }

    // Query string for GET
    if (method === "GET" && params && Object.keys(params).length > 0) {
      const flat = {};
      for (const [k, v] of Object.entries(params)) {
        if (typeof v !== "object") flat[k] = String(v);
      }
      const qs = new URLSearchParams(flat).toString();
      if (qs) url += (url.includes("?") ? "&" : "?") + qs;
    }

    return { url, method, headers, body };
  }

  // ── Internal: audit log (NEVER contains credentials) ─────────
  _logAudit(service, endpoint, status, durationMs) {
    try {
      const entry = {
        ts: new Date().toISOString(),
        service,
        endpoint,
        status,
        durationMs,
      };
      appendFileSync(AUDIT_FILE, JSON.stringify(entry) + "\n");
    } catch {
      // Audit logging should never break execution
    }
  }
}
