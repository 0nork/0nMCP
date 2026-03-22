// ============================================================
// 0nMCP — Plugin Registry
// ============================================================
// Central registry for all plugins — catalog-generated and custom.
// Loads custom plugins from ~/.0n/plugins/, provides discovery,
// search, and bulk operations.
//
// Usage:
//   import { PluginRegistry } from './plugin-registry.js'
//
//   const registry = new PluginRegistry()
//   registry.loadCatalog()          // Load all 26+ catalog services
//   registry.loadCustomPlugins()     // Load from ~/.0n/plugins/
//
//   const stripe = registry.get('stripe')
//   const emailPlugins = registry.findByType('email')
//   const allTools = registry.generateAllMcpTools()
// ============================================================

import { PluginBuilder, getPluginBuilder } from "./plugin-builder.js";
import { Plugin } from "./plugin.js";
import { SERVICE_CATALOG } from "../catalog.js";
import { existsSync, readdirSync, readFileSync } from "fs";
import { join } from "path";
import { homedir } from "os";

const PLUGINS_DIR = join(homedir(), ".0n", "plugins");
const CONNECTIONS_DIR = join(homedir(), ".0n", "connections");

export class PluginRegistry {
  /**
   * @param {object} [options]
   * @param {PluginBuilder} [options.builder] — Custom builder instance
   * @param {boolean} [options.autoLoad] — Auto-load catalog + custom plugins
   */
  constructor(options = {}) {
    this.builder = options.builder || getPluginBuilder();

    /** @type {Map<string, Plugin>} */
    this.plugins = new Map();

    /** @type {Map<string, object>} */
    this.specs = new Map();

    if (options.autoLoad) {
      this.loadCatalog();
      this.loadCustomPlugins();
    }
  }

  // ── Loading ───────────────────────────────────────────────

  /**
   * Load all SERVICE_CATALOG entries as plugins.
   */
  loadCatalog() {
    for (const key of Object.keys(SERVICE_CATALOG)) {
      const plugin = this.builder.build(key);
      this.plugins.set(key, plugin);
    }
    return this;
  }

  /**
   * Load custom plugins from ~/.0n/plugins/.
   */
  loadCustomPlugins() {
    if (!existsSync(PLUGINS_DIR)) return this;

    const files = readdirSync(PLUGINS_DIR);
    for (const file of files) {
      if (!file.endsWith(".0n") && !file.endsWith(".0n.json") && !file.endsWith(".json")) continue;

      try {
        const filePath = join(PLUGINS_DIR, file);
        const raw = readFileSync(filePath, "utf-8");
        const spec = JSON.parse(raw);

        if (spec.$0n?.type !== "plugin") continue;

        const plugin = this.builder.buildFromSpec(spec);
        this.plugins.set(spec.service, plugin);
        this.specs.set(spec.service, spec);
      } catch {
        // Skip invalid plugin files
      }
    }

    return this;
  }

  /**
   * Auto-connect plugins using credentials from ~/.0n/connections/.
   */
  connectFromDisk() {
    if (!existsSync(CONNECTIONS_DIR)) return this;

    const files = readdirSync(CONNECTIONS_DIR);
    for (const file of files) {
      if (!file.endsWith(".0n") && !file.endsWith(".0n.json")) continue;

      try {
        const data = JSON.parse(readFileSync(join(CONNECTIONS_DIR, file), "utf-8"));
        if (data.$0n?.type !== "connection") continue;
        if (data.$0n?.sealed) continue; // Skip vault-sealed

        const service = data.service;
        const plugin = this.plugins.get(service);
        if (plugin && data.auth?.credentials) {
          plugin.connect(data.auth.credentials);
        }
      } catch {
        // Skip invalid
      }
    }

    return this;
  }

  /**
   * Connect specific plugins with provided credentials.
   */
  connectAll(connections) {
    for (const [key, credentials] of Object.entries(connections)) {
      const plugin = this.plugins.get(key);
      if (plugin) {
        plugin.connect(credentials);
      }
    }
    return this;
  }

  // ── Registration ──────────────────────────────────────────

  /**
   * Register a plugin instance directly.
   */
  register(plugin) {
    if (!(plugin instanceof Plugin)) {
      throw new Error("register() requires a Plugin instance");
    }
    this.plugins.set(plugin.key, plugin);
    return this;
  }

  /**
   * Register a plugin from a spec object.
   */
  registerFromSpec(spec, options) {
    const plugin = this.builder.buildFromSpec(spec, options);
    this.plugins.set(spec.service, plugin);
    this.specs.set(spec.service, spec);
    return plugin;
  }

  /**
   * Unregister a plugin.
   */
  unregister(key) {
    this.plugins.delete(key);
    this.specs.delete(key);
    return this;
  }

  // ── Lookup ────────────────────────────────────────────────

  /**
   * Get a plugin by service key.
   */
  get(key) {
    return this.plugins.get(key) || null;
  }

  /**
   * Check if a plugin exists.
   */
  has(key) {
    return this.plugins.has(key);
  }

  /**
   * Get all plugin keys.
   */
  keys() {
    return [...this.plugins.keys()];
  }

  /**
   * Get all plugins as an array.
   */
  all() {
    return [...this.plugins.values()];
  }

  /**
   * Count plugins.
   */
  get size() {
    return this.plugins.size;
  }

  // ── Search & Discovery ────────────────────────────────────

  /**
   * Find plugins by type (e.g., 'email', 'payments', 'crm').
   */
  findByType(type) {
    return this.all().filter(p => p.type === type);
  }

  /**
   * Find plugins that have a specific capability.
   */
  findByCapability(capabilityName) {
    return this.all().filter(p =>
      p.capabilities.some(c => c.name === capabilityName)
    );
  }

  /**
   * Find plugins that support a specific action on any capability.
   */
  findByAction(action) {
    return this.all().filter(p =>
      p.capabilities.some(c => c.actions.includes(action))
    );
  }

  /**
   * Find plugins that have a specific endpoint.
   */
  findByEndpoint(endpointName) {
    return this.all().filter(p => p.endpoints[endpointName]);
  }

  /**
   * Search plugins by keyword in name/description.
   */
  search(query) {
    const q = query.toLowerCase();
    return this.all().filter(p =>
      p.name.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q) ||
      p.key.toLowerCase().includes(q) ||
      p.type.toLowerCase().includes(q)
    );
  }

  /**
   * Get all connected plugins.
   */
  getConnected() {
    return this.all().filter(p => p.isConnected);
  }

  /**
   * Get all disconnected plugins.
   */
  getDisconnected() {
    return this.all().filter(p => !p.isConnected);
  }

  // ── Bulk Operations ───────────────────────────────────────

  /**
   * Execute an endpoint across all connected plugins that have it.
   * Returns results from all services.
   */
  async executeAll(endpointName, params = {}) {
    const plugins = this.findByEndpoint(endpointName).filter(p => p.isConnected);

    if (plugins.length === 0) {
      return {
        success: false,
        error: `No connected plugins have endpoint: ${endpointName}`,
        results: [],
      };
    }

    const results = await Promise.allSettled(
      plugins.map(p => p.execute(endpointName, params))
    );

    return {
      success: true,
      results: results.map((r, i) => ({
        service: plugins[i].key,
        ...(r.status === "fulfilled" ? r.value : { success: false, error: r.reason?.message }),
      })),
    };
  }

  // ── MCP Tool Generation ───────────────────────────────────

  /**
   * Generate MCP tool definitions for all plugins.
   * Returns a flat array ready for McpServer registration.
   */
  generateAllMcpTools(options = {}) {
    const serviceFilter = options.services
      ? new Set(options.services)
      : null;

    const tools = [];
    const services = [];

    for (const plugin of this.all()) {
      if (serviceFilter && !serviceFilter.has(plugin.key)) continue;
      const pluginTools = plugin.toMcpTools();
      tools.push(...pluginTools);
      services.push(plugin.key);
    }

    return {
      tools,
      count: tools.length,
      services,
    };
  }

  /**
   * Register all plugin tools on an MCP server instance.
   *
   * @param {import("@modelcontextprotocol/sdk/server/mcp.js").McpServer} server
   * @param {import("zod").ZodType} z
   * @param {object} [options]
   * @param {string[]} [options.services] — Only these services
   */
  registerMcpTools(server, z, options = {}) {
    const { tools } = this.generateAllMcpTools(options);

    for (const tool of tools) {
      const plugin = this.get(tool.service);
      if (!plugin) continue;

      // Build Zod schema from tool params
      const schemaFields = {};

      for (const p of tool.pathParams) {
        schemaFields[p] = z.string().describe(`Path parameter: ${p} (required)`);
      }
      for (const p of tool.queryParams) {
        schemaFields[p] = z.string().optional().describe(`Query parameter: ${p}`);
      }
      if (tool.hasBody) {
        for (const p of tool.bodyKeys) {
          schemaFields[p] = z.any().optional().describe(`Body parameter: ${p}`);
        }
        // Accept raw JSON body
        schemaFields._body = z.record(z.any()).optional().describe("Raw JSON body (merged with named params)");
      }

      server.tool(
        tool.name,
        tool.description,
        schemaFields,
        async (params) => {
          const { _body, ...rest } = params;
          const merged = _body ? { ...rest, ..._body } : rest;

          const result = await plugin.execute(tool.endpointName, merged);

          return {
            content: [{
              type: "text",
              text: JSON.stringify(result, null, 2),
            }],
          };
        }
      );
    }

    return tools.length;
  }

  // ── Introspection ─────────────────────────────────────────

  /**
   * Get a summary of the registry state.
   */
  inspect() {
    const byType = {};
    for (const plugin of this.all()) {
      if (!byType[plugin.type]) byType[plugin.type] = [];
      byType[plugin.type].push({
        key: plugin.key,
        name: plugin.name,
        connected: plugin.isConnected,
        endpoints: Object.keys(plugin.endpoints).length,
        capabilities: plugin.capabilities.length,
      });
    }

    return {
      total: this.size,
      connected: this.getConnected().length,
      disconnected: this.getDisconnected().length,
      customPlugins: this.specs.size,
      byType,
      totalEndpoints: this.all().reduce((s, p) => s + Object.keys(p.endpoints).length, 0),
      totalCapabilities: this.all().reduce((s, p) => s + p.capabilities.length, 0),
    };
  }
}

// ── Singleton ─────────────────────────────────────────────

let _defaultRegistry = null;

/**
 * Get the default PluginRegistry singleton.
 * Auto-loads catalog on first call.
 */
export function getPluginRegistry() {
  if (!_defaultRegistry) {
    _defaultRegistry = new PluginRegistry({ autoLoad: true });
  }
  return _defaultRegistry;
}
