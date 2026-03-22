// ============================================================
// 0nMCP — Plugin Class
// ============================================================
// A Plugin wraps a catalog service entry and provides:
//   - .0n field resolution (canonical → service-specific)
//   - Endpoint execution with path params, query, body
//   - Auth header injection
//   - Rate limiting
//   - MCP tool schema generation
//
// Usage:
//   const plugin = new Plugin('stripe', catalogEntry, fieldResolver)
//   const result = await plugin.execute('create_customer', {
//     'email.0n': 'mike@rocketopp.com',
//     'fullname.0n': 'Mike Mento'
//   })
// ============================================================

import { RateLimiter } from "../ratelimit.js";

/**
 * Extract path parameters from a URL template.
 * e.g., "/contacts/{contactId}" → ["contactId"]
 */
function extractPathParams(pathTemplate) {
  const matches = pathTemplate.match(/\{(\w+)\}/g);
  return matches ? matches.map(m => m.slice(1, -1)) : [];
}

/**
 * Interpolate path parameters into a URL template.
 */
function interpolatePath(pathTemplate, params) {
  let path = pathTemplate;
  for (const [key, value] of Object.entries(params)) {
    path = path.replace(`{${key}}`, encodeURIComponent(value));
  }
  return path;
}

export class Plugin {
  /**
   * @param {string} key — Service key (e.g., 'stripe', 'crm')
   * @param {object} catalogEntry — Raw catalog entry from SERVICE_CATALOG
   * @param {object} [options]
   * @param {Function} [options.resolveFields] — Field resolver from fields.js
   * @param {Function} [options.reverseResolve] — Reverse resolver from fields.js
   * @param {object} [options.credentials] — Pre-loaded credentials
   * @param {number} [options.rateLimit] — Requests per second (default: 10)
   */
  constructor(key, catalogEntry, options = {}) {
    this.key = key;
    this.name = catalogEntry.name;
    this.type = catalogEntry.type;
    this.description = catalogEntry.description;
    this.baseUrl = catalogEntry.baseUrl;
    this.authType = catalogEntry.authType;
    this.credentialKeys = catalogEntry.credentialKeys || [];
    this.capabilities = catalogEntry.capabilities || [];
    this.endpoints = catalogEntry.endpoints || {};
    this.authHeaderFn = catalogEntry.authHeader;

    // Field resolution
    this._resolveFields = options.resolveFields || null;
    this._reverseResolve = options.reverseResolve || null;

    // Credentials
    this.credentials = options.credentials || null;

    // Rate limiting
    this.rateLimiter = new RateLimiter(options.rateLimit || 10, 1000);

    // Execution stats
    this.stats = {
      totalCalls: 0,
      successCalls: 0,
      failedCalls: 0,
      lastCallAt: null,
      totalDurationMs: 0,
    };
  }

  // ── Connection ────────────────────────────────────────────

  /**
   * Set credentials for this plugin.
   */
  connect(credentials) {
    this.credentials = credentials;
    return this;
  }

  /**
   * Check if this plugin has valid credentials.
   */
  get isConnected() {
    if (!this.credentials) return false;
    return this.credentialKeys.every(k => this.credentials[k]);
  }

  /**
   * Get auth headers using the catalog's authHeader function.
   */
  getAuthHeaders() {
    if (!this.credentials || !this.authHeaderFn) return {};
    return this.authHeaderFn(this.credentials);
  }

  // ── Field Resolution ──────────────────────────────────────

  /**
   * Resolve .0n canonical fields to service-specific fields.
   * Pass-through for non-.0n keys.
   */
  resolveFields(data) {
    if (!this._resolveFields) return data;
    return this._resolveFields(data, this.key);
  }

  /**
   * Reverse-resolve a service field back to .0n canonical.
   */
  reverseResolve(serviceField) {
    if (!this._reverseResolve) return null;
    return this._reverseResolve(serviceField, this.key);
  }

  /**
   * Normalize response data — reverse-resolve service fields to .0n canonical.
   */
  normalizeResponse(data) {
    if (!this._reverseResolve || !data || typeof data !== "object") return data;

    if (Array.isArray(data)) {
      return data.map(item => this.normalizeResponse(item));
    }

    const normalized = {};
    for (const [key, value] of Object.entries(data)) {
      const canonical = this._reverseResolve(key, this.key);
      normalized[canonical || key] = value;
      if (canonical && canonical !== key) {
        normalized[key] = value; // Keep original too
      }
    }
    return normalized;
  }

  // ── Endpoint Discovery ────────────────────────────────────

  /**
   * List all available endpoints.
   */
  listEndpoints() {
    return Object.entries(this.endpoints).map(([name, def]) => ({
      name,
      method: def.method,
      path: def.path,
      pathParams: extractPathParams(def.path),
      queryParams: def.query || [],
      hasBody: !!def.body,
      contentType: def.contentType || "application/json",
    }));
  }

  /**
   * Get a specific endpoint definition.
   */
  getEndpoint(name) {
    return this.endpoints[name] || null;
  }

  /**
   * Find endpoints matching a capability action.
   * e.g., findEndpoints('create', 'customer') → ['create_customer']
   */
  findEndpoints(action, entity) {
    const search = entity
      ? `${action}_${entity}`.toLowerCase()
      : action.toLowerCase();

    return Object.keys(this.endpoints).filter(name =>
      name.toLowerCase().includes(search)
    );
  }

  // ── Execution ─────────────────────────────────────────────

  /**
   * Build a fetch request for an endpoint.
   * Resolves .0n fields, interpolates path params, builds query string.
   *
   * @param {string} endpointName — Endpoint key from catalog
   * @param {object} params — Mixed .0n canonical + raw params
   * @returns {{ url: string, options: RequestInit, endpoint: object }}
   */
  buildRequest(endpointName, params = {}) {
    const endpoint = this.endpoints[endpointName];
    if (!endpoint) {
      throw new Error(`Unknown endpoint: ${endpointName} (service: ${this.key})`);
    }

    // Resolve .0n fields to service-specific
    const resolved = this.resolveFields(params);

    // Interpolate base URL (some services like MongoDB have {appId} in baseUrl)
    let baseUrl = this.baseUrl;
    if (this.credentials) {
      for (const [key, value] of Object.entries(this.credentials)) {
        baseUrl = baseUrl.replace(`{${key}}`, encodeURIComponent(value));
      }
    }

    // Extract path params from resolved data
    const pathParams = extractPathParams(endpoint.path);
    const pathValues = {};
    const remaining = { ...resolved };

    for (const param of pathParams) {
      if (remaining[param] !== undefined) {
        pathValues[param] = remaining[param];
        delete remaining[param];
      } else if (this.credentials && this.credentials[param] !== undefined) {
        pathValues[param] = this.credentials[param];
      }
    }

    const path = interpolatePath(endpoint.path, pathValues);

    // Build query string
    const queryParams = endpoint.query || [];
    const queryParts = [];
    for (const qp of queryParams) {
      if (remaining[qp] !== undefined) {
        queryParts.push(`${encodeURIComponent(qp)}=${encodeURIComponent(remaining[qp])}`);
        delete remaining[qp];
      }
    }

    const queryString = queryParts.length > 0 ? `?${queryParts.join("&")}` : "";
    const url = `${baseUrl}${path}${queryString}`;

    // Build request options
    const headers = this.getAuthHeaders();
    const options = {
      method: endpoint.method,
      headers,
    };

    // Build body for POST/PUT/PATCH
    if (["POST", "PUT", "PATCH"].includes(endpoint.method) && Object.keys(remaining).length > 0) {
      const contentType = endpoint.contentType || headers["Content-Type"] || "application/json";

      if (contentType === "application/x-www-form-urlencoded") {
        options.body = new URLSearchParams(remaining).toString();
        options.headers["Content-Type"] = "application/x-www-form-urlencoded";
      } else {
        // Merge with endpoint body template
        const body = endpoint.body ? { ...endpoint.body, ...remaining } : remaining;
        options.body = JSON.stringify(body);
        if (!options.headers["Content-Type"]) {
          options.headers["Content-Type"] = "application/json";
        }
      }
    }

    return { url, options, endpoint };
  }

  /**
   * Execute an endpoint with automatic field resolution, auth, and rate limiting.
   *
   * @param {string} endpointName — Endpoint key from catalog
   * @param {object} params — Mixed .0n canonical + raw params
   * @returns {Promise<{ success: boolean, data?: any, error?: string, meta: object }>}
   */
  async execute(endpointName, params = {}) {
    if (!this.isConnected) {
      return {
        success: false,
        error: `Plugin "${this.key}" is not connected. Call plugin.connect(credentials) first.`,
        meta: { service: this.key, endpoint: endpointName },
      };
    }

    // Rate limit check
    if (!this.rateLimiter.tryAcquire()) {
      return {
        success: false,
        error: `Rate limit exceeded for ${this.key}. Try again shortly.`,
        meta: { service: this.key, endpoint: endpointName, rateLimited: true },
      };
    }

    const startTime = Date.now();
    this.stats.totalCalls++;
    this.stats.lastCallAt = new Date().toISOString();

    try {
      const { url, options } = this.buildRequest(endpointName, params);

      const response = await fetch(url, options);
      const duration = Date.now() - startTime;
      this.stats.totalDurationMs += duration;

      let data;
      const contentType = response.headers.get("content-type") || "";
      if (contentType.includes("application/json")) {
        data = await response.json();
      } else {
        data = await response.text();
      }

      if (response.ok) {
        this.stats.successCalls++;
        return {
          success: true,
          data: this.normalizeResponse(data),
          meta: {
            service: this.key,
            endpoint: endpointName,
            status: response.status,
            durationMs: duration,
          },
        };
      } else {
        this.stats.failedCalls++;
        return {
          success: false,
          error: typeof data === "object" ? JSON.stringify(data) : data,
          meta: {
            service: this.key,
            endpoint: endpointName,
            status: response.status,
            durationMs: duration,
          },
        };
      }
    } catch (err) {
      const duration = Date.now() - startTime;
      this.stats.totalDurationMs += duration;
      this.stats.failedCalls++;

      return {
        success: false,
        error: err.message,
        meta: {
          service: this.key,
          endpoint: endpointName,
          durationMs: duration,
          errorType: err.constructor.name,
        },
      };
    }
  }

  // ── MCP Tool Generation ───────────────────────────────────

  /**
   * Generate MCP tool schemas for every endpoint in this plugin.
   * Returns an array of { name, description, schema, handler } objects
   * ready to register on a McpServer.
   */
  toMcpTools() {
    const tools = [];

    for (const [endpointName, endpointDef] of Object.entries(this.endpoints)) {
      const pathParams = extractPathParams(endpointDef.path);
      const queryParams = endpointDef.query || [];
      const hasBody = ["POST", "PUT", "PATCH"].includes(endpointDef.method);
      const bodyKeys = endpointDef.body ? Object.keys(endpointDef.body) : [];

      // Build tool name: service_endpoint (e.g., stripe_create_customer)
      const toolName = `${this.key}_${endpointName}`;

      // Build description
      const methodLabel = endpointDef.method;
      const desc = `[${this.name}] ${methodLabel} ${endpointDef.path}`;

      // Build parameter list for documentation
      const allParams = [
        ...pathParams.map(p => `${p} (path, required)`),
        ...queryParams.map(p => `${p} (query)`),
        ...bodyKeys.map(p => `${p} (body)`),
      ];

      tools.push({
        name: toolName,
        description: `${desc}\nParams: ${allParams.join(", ") || "none"}\nSupports .0n canonical fields (email.0n, fullname.0n, etc.)`,
        pathParams,
        queryParams,
        bodyKeys,
        hasBody,
        endpointName,
        service: this.key,
      });
    }

    return tools;
  }

  // ── Introspection ─────────────────────────────────────────

  /**
   * Get plugin metadata for inspection.
   */
  inspect() {
    return {
      key: this.key,
      name: this.name,
      type: this.type,
      description: this.description,
      baseUrl: this.baseUrl,
      authType: this.authType,
      credentialKeys: this.credentialKeys,
      connected: this.isConnected,
      capabilities: this.capabilities.map(c => ({
        name: c.name,
        actions: c.actions,
        description: c.description,
      })),
      endpoints: this.listEndpoints(),
      stats: { ...this.stats },
    };
  }

  /**
   * Serialize plugin to a portable .0n format.
   */
  toJSON() {
    return {
      $0n: {
        type: "plugin",
        version: "1.0.0",
        name: this.name,
        created: new Date().toISOString(),
      },
      service: this.key,
      serviceType: this.type,
      description: this.description,
      baseUrl: this.baseUrl,
      authType: this.authType,
      credentialKeys: this.credentialKeys,
      capabilities: this.capabilities,
      endpoints: this.endpoints,
    };
  }
}
