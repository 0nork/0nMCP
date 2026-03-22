// ============================================================
// 0nMCP — Plugin Builder (0nEngine Core)
// ============================================================
// The factory that reads catalog.js + fields.js and auto-generates
// fully operational service plugins. Each plugin gets:
//   - .0n field resolution (canonical → service-specific)
//   - All catalog endpoints as executable methods
//   - Auth header injection
//   - Rate limiting
//   - MCP tool schema generation
//
// This is the 0nEngine — the bridge between the .0n Field Standard
// and the Service Catalog. Write once in .0n, run on any service.
//
// Usage:
//   import { PluginBuilder } from './plugin-builder.js'
//
//   const builder = new PluginBuilder()
//   const stripe = builder.build('stripe')
//   stripe.connect({ apiKey: 'sk_live_...' })
//   const result = await stripe.execute('create_customer', {
//     'email.0n': 'mike@rocketopp.com',
//     'fullname.0n': 'Mike Mento'
//   })
//
//   // Build ALL catalog services at once
//   const plugins = builder.buildAll()
//
//   // Build a custom plugin from a .0n plugin definition
//   const custom = builder.buildFromSpec(pluginSpec)
//
//   // Generate a plugin spec for a new service
//   const spec = builder.generate({
//     key: 'acme',
//     name: 'Acme API',
//     type: 'crm',
//     baseUrl: 'https://api.acme.com/v1',
//     authType: 'api_key',
//     credentialKeys: ['apiKey'],
//     endpoints: { ... }
//   })
// ============================================================

import { SERVICE_CATALOG } from "../catalog.js";
import { resolveFields, reverseResolve, CANONICAL_FIELDS, listFields, getServiceMappings } from "../fields.js";
import { Plugin } from "./plugin.js";
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "fs";
import { join } from "path";
import { homedir } from "os";

const PLUGINS_DIR = join(homedir(), ".0n", "plugins");

export class PluginBuilder {
  /**
   * @param {object} [options]
   * @param {object} [options.catalog] — Override SERVICE_CATALOG
   * @param {object} [options.fields] — Override CANONICAL_FIELDS
   * @param {number} [options.defaultRateLimit] — Default requests/sec per plugin
   */
  constructor(options = {}) {
    this.catalog = options.catalog || SERVICE_CATALOG;
    this.fields = options.fields || CANONICAL_FIELDS;
    this.defaultRateLimit = options.defaultRateLimit || 10;

    // Cache built plugins
    this._cache = new Map();
  }

  // ── Build from Catalog ────────────────────────────────────

  /**
   * Build a Plugin from a catalog entry.
   *
   * @param {string} serviceKey — Service key from SERVICE_CATALOG
   * @param {object} [options]
   * @param {object} [options.credentials] — Pre-load credentials
   * @param {number} [options.rateLimit] — Override rate limit
   * @returns {Plugin}
   */
  build(serviceKey, options = {}) {
    // Check cache first
    const cacheKey = `catalog:${serviceKey}`;
    if (this._cache.has(cacheKey) && !options.credentials) {
      return this._cache.get(cacheKey);
    }

    const entry = this.catalog[serviceKey];
    if (!entry) {
      throw new Error(
        `Unknown service: "${serviceKey}". Available: ${Object.keys(this.catalog).join(", ")}`
      );
    }

    const plugin = new Plugin(serviceKey, entry, {
      resolveFields,
      reverseResolve,
      credentials: options.credentials || null,
      rateLimit: options.rateLimit || this.defaultRateLimit,
    });

    if (!options.credentials) {
      this._cache.set(cacheKey, plugin);
    }

    return plugin;
  }

  /**
   * Build ALL catalog services as plugins.
   *
   * @param {object} [options]
   * @param {object} [options.connections] — Map of { serviceKey: credentials }
   * @returns {Map<string, Plugin>}
   */
  buildAll(options = {}) {
    const plugins = new Map();
    const connections = options.connections || {};

    for (const serviceKey of Object.keys(this.catalog)) {
      const plugin = this.build(serviceKey, {
        credentials: connections[serviceKey] || null,
      });
      plugins.set(serviceKey, plugin);
    }

    return plugins;
  }

  /**
   * Build plugins only for connected services.
   *
   * @param {object} connections — Map of { serviceKey: credentials }
   * @returns {Map<string, Plugin>}
   */
  buildConnected(connections) {
    const plugins = new Map();

    for (const [serviceKey, credentials] of Object.entries(connections)) {
      if (!this.catalog[serviceKey]) continue;
      const plugin = this.build(serviceKey, { credentials });
      plugins.set(serviceKey, plugin);
    }

    return plugins;
  }

  // ── Build from Spec ───────────────────────────────────────

  /**
   * Build a Plugin from a .0n plugin spec (custom service definition).
   * This is how users define their own services beyond the catalog.
   *
   * @param {object} spec — Plugin specification
   * @param {string} spec.service — Service key
   * @param {string} spec.name — Display name
   * @param {string} spec.type — Category type
   * @param {string} spec.baseUrl — API base URL
   * @param {string} spec.authType — Auth type (api_key, oauth, basic)
   * @param {string[]} spec.credentialKeys — Required credential keys
   * @param {object} spec.endpoints — Endpoint definitions
   * @param {object[]} [spec.capabilities] — Capability list
   * @param {Function|string} [spec.authHeader] — Auth header builder
   * @param {object} [spec.fieldMappings] — Custom .0n field mappings
   * @returns {Plugin}
   */
  buildFromSpec(spec, options = {}) {
    if (!spec.service || !spec.baseUrl || !spec.endpoints) {
      throw new Error("Plugin spec requires: service, baseUrl, endpoints");
    }

    // Build auth header function
    let authHeaderFn;
    if (typeof spec.authHeader === "function") {
      authHeaderFn = spec.authHeader;
    } else if (spec.authType === "api_key") {
      const keyName = spec.credentialKeys?.[0] || "apiKey";
      authHeaderFn = (creds) => ({
        Authorization: `Bearer ${creds[keyName]}`,
        "Content-Type": "application/json",
      });
    } else if (spec.authType === "basic") {
      authHeaderFn = (creds) => ({
        Authorization: `Basic ${Buffer.from(`${creds.username}:${creds.password}`).toString("base64")}`,
        "Content-Type": "application/json",
      });
    } else if (spec.authType === "oauth") {
      authHeaderFn = (creds) => ({
        Authorization: `Bearer ${creds.access_token}`,
        "Content-Type": "application/json",
      });
    } else {
      authHeaderFn = () => ({ "Content-Type": "application/json" });
    }

    // Inject custom field mappings into the resolver
    const customResolver = spec.fieldMappings
      ? this._buildCustomResolver(spec.service, spec.fieldMappings)
      : resolveFields;

    const catalogEntry = {
      name: spec.name || spec.service,
      type: spec.type || "custom",
      description: spec.description || `Custom plugin: ${spec.service}`,
      baseUrl: spec.baseUrl,
      authType: spec.authType || "api_key",
      credentialKeys: spec.credentialKeys || [],
      capabilities: spec.capabilities || [],
      endpoints: spec.endpoints,
      authHeader: authHeaderFn,
    };

    return new Plugin(spec.service, catalogEntry, {
      resolveFields: customResolver,
      reverseResolve,
      credentials: options.credentials || null,
      rateLimit: options.rateLimit || this.defaultRateLimit,
    });
  }

  /**
   * Build a Plugin from a .0n plugin file on disk.
   */
  buildFromFile(filePath) {
    const raw = readFileSync(filePath, "utf-8");
    const spec = JSON.parse(raw);

    if (spec.$0n?.type !== "plugin") {
      throw new Error(`File is not a .0n plugin: ${filePath}`);
    }

    return this.buildFromSpec(spec);
  }

  // ── Plugin Generation ─────────────────────────────────────

  /**
   * Generate a new plugin spec from a minimal definition.
   * Auto-infers capabilities from endpoints, adds .0n field mappings.
   *
   * @param {object} def — Minimal service definition
   * @returns {object} — Complete .0n plugin spec
   */
  generate(def) {
    if (!def.key || !def.baseUrl || !def.endpoints) {
      throw new Error("generate() requires: key, baseUrl, endpoints");
    }

    // Auto-infer capabilities from endpoint names
    const capabilities = this._inferCapabilities(def.endpoints);

    // Auto-infer field mappings from endpoint body schemas
    const fieldMappings = def.fieldMappings || this._inferFieldMappings(def.endpoints);

    const spec = {
      $0n: {
        type: "plugin",
        version: "1.0.0",
        name: def.name || def.key,
        description: def.description || `Custom plugin for ${def.key}`,
        author: def.author || "0nEngine",
        created: new Date().toISOString(),
      },
      service: def.key,
      serviceType: def.type || "custom",
      description: def.description || `Custom plugin for ${def.key}`,
      baseUrl: def.baseUrl,
      authType: def.authType || "api_key",
      credentialKeys: def.credentialKeys || ["apiKey"],
      capabilities,
      endpoints: def.endpoints,
      fieldMappings,
    };

    return spec;
  }

  /**
   * Generate a plugin spec and save it as a .0n file.
   */
  generateAndSave(def, outputPath) {
    const spec = this.generate(def);

    const savePath = outputPath || join(PLUGINS_DIR, `${def.key}.0n.json`);
    const dir = join(savePath, "..");
    if (!existsSync(dir)) mkdirSync(dir, { recursive: true });

    writeFileSync(savePath, JSON.stringify(spec, null, 2));

    return { spec, path: savePath };
  }

  // ── Bulk MCP Tool Registration ────────────────────────────

  /**
   * Generate MCP tool definitions for all catalog services.
   * Returns a flat array of tool schemas ready for McpServer.tool().
   *
   * @param {object} [options]
   * @param {string[]} [options.services] — Only these services (default: all)
   * @returns {{ tools: object[], count: number, services: string[] }}
   */
  generateAllTools(options = {}) {
    const serviceKeys = options.services || Object.keys(this.catalog);
    const allTools = [];
    const includedServices = [];

    for (const key of serviceKeys) {
      if (!this.catalog[key]) continue;
      const plugin = this.build(key);
      const tools = plugin.toMcpTools();
      allTools.push(...tools);
      includedServices.push(key);
    }

    return {
      tools: allTools,
      count: allTools.length,
      services: includedServices,
    };
  }

  // ── Field Analysis ────────────────────────────────────────

  /**
   * Get field coverage report — which .0n fields are mapped for which services.
   */
  getFieldCoverage() {
    const fields = listFields();
    const services = Object.keys(this.catalog);

    const coverage = fields.map(f => {
      const mapped = services.filter(s => {
        const canonical = this.fields[f.field];
        return canonical?.mappings?.[s] !== undefined;
      });
      return {
        field: f.field,
        label: f.label,
        type: f.type,
        mappedServices: mapped.length,
        totalServices: services.length,
        coverage: Math.round((mapped.length / services.length) * 100),
        services: mapped,
      };
    });

    const totalMappings = coverage.reduce((sum, f) => sum + f.mappedServices, 0);
    const maxMappings = fields.length * services.length;

    return {
      fields: coverage,
      summary: {
        totalFields: fields.length,
        totalServices: services.length,
        totalMappings,
        maxPossibleMappings: maxMappings,
        overallCoverage: Math.round((totalMappings / maxMappings) * 100),
      },
    };
  }

  /**
   * Get all .0n field mappings for a specific service.
   */
  getServiceFields(serviceKey) {
    return getServiceMappings(serviceKey);
  }

  /**
   * Show what a .0n data object looks like after resolution for a service.
   * Useful for debugging field mappings.
   */
  previewResolution(data, serviceKey) {
    const resolved = resolveFields(data, serviceKey);
    return {
      input: data,
      service: serviceKey,
      resolved,
      fieldCount: Object.keys(data).filter(k => k.endsWith(".0n")).length,
      resolvedCount: Object.keys(resolved).length,
    };
  }

  // ── Stats ─────────────────────────────────────────────────

  /**
   * Get aggregated stats across all cached plugins.
   */
  getStats() {
    const stats = {
      cachedPlugins: this._cache.size,
      catalogServices: Object.keys(this.catalog).length,
      totalEndpoints: 0,
      totalCapabilities: 0,
      serviceBreakdown: {},
    };

    for (const [key, entry] of Object.entries(this.catalog)) {
      const endpointCount = Object.keys(entry.endpoints || {}).length;
      const capCount = entry.capabilities?.length || 0;
      stats.totalEndpoints += endpointCount;
      stats.totalCapabilities += capCount;
      stats.serviceBreakdown[key] = {
        name: entry.name,
        type: entry.type,
        endpoints: endpointCount,
        capabilities: capCount,
      };
    }

    return stats;
  }

  // ── Private Helpers ───────────────────────────────────────

  /**
   * Build a custom field resolver that merges spec-defined mappings
   * with the canonical CANONICAL_FIELDS.
   */
  _buildCustomResolver(serviceKey, fieldMappings) {
    return (data, service) => {
      if (service !== serviceKey) return resolveFields(data, service);

      const resolved = {};
      for (const [key, value] of Object.entries(data)) {
        if (!key.endsWith(".0n")) {
          resolved[key] = value;
          continue;
        }

        // Check custom mappings first
        if (fieldMappings[key]) {
          const target = fieldMappings[key];
          if (typeof target === "string") {
            resolved[target] = value;
          } else if (Array.isArray(target) && typeof value === "string") {
            const parts = value.split(" ");
            resolved[target[0]] = parts[0] || "";
            if (target[1]) resolved[target[1]] = parts.slice(1).join(" ") || "";
          }
          continue;
        }

        // Fall back to canonical resolver
        const canonical = CANONICAL_FIELDS[key];
        if (canonical?.mappings?.[serviceKey]) {
          const mapping = canonical.mappings[serviceKey];
          if (typeof mapping === "string") {
            resolved[mapping] = value;
          }
        } else {
          // Strip .0n suffix as fallback
          resolved[key.replace(".0n", "")] = value;
        }
      }
      return resolved;
    };
  }

  /**
   * Infer capabilities from endpoint names.
   * Groups by entity and extracts actions.
   */
  _inferCapabilities(endpoints) {
    const groups = {};

    for (const name of Object.keys(endpoints)) {
      // Pattern: action_entity (e.g., create_customer, list_orders)
      const parts = name.split("_");
      if (parts.length < 2) continue;

      const action = parts[0];
      let entity = parts.slice(1).join("_");
      // Normalize plural → singular for grouping (contacts → contact, etc.)
      if (entity.endsWith("ies")) {
        entity = entity.slice(0, -3) + "y"; // e.g., entries → entry
      } else if (entity.endsWith("ses") || entity.endsWith("xes") || entity.endsWith("zes")) {
        entity = entity.slice(0, -2); // e.g., boxes → box
      } else if (entity.endsWith("s") && !entity.endsWith("ss") && !entity.endsWith("us")) {
        entity = entity.slice(0, -1); // e.g., contacts → contact
      }
      const capName = `manage_${entity}`;

      if (!groups[capName]) {
        groups[capName] = { name: capName, actions: [], description: "" };
      }

      if (!groups[capName].actions.includes(action)) {
        groups[capName].actions.push(action);
      }
    }

    // Build descriptions
    for (const cap of Object.values(groups)) {
      cap.description = `${cap.actions.join(", ")} ${cap.name.replace("manage_", "")}`;
    }

    return Object.values(groups);
  }

  /**
   * Infer .0n field mappings from endpoint body schemas.
   * Tries to match body keys to known canonical fields.
   */
  _inferFieldMappings(endpoints) {
    const mappings = {};
    const knownFields = new Set();

    // Collect all body keys
    for (const def of Object.values(endpoints)) {
      if (!def.body) continue;
      for (const key of Object.keys(def.body)) {
        knownFields.add(key);
      }
    }

    // Try to match against canonical fields
    for (const [canonical, fieldDef] of Object.entries(CANONICAL_FIELDS)) {
      // Check if any service mapping value matches a body key
      for (const mapping of Object.values(fieldDef.mappings)) {
        if (typeof mapping === "string" && knownFields.has(mapping)) {
          mappings[canonical] = mapping;
          break;
        }
      }

      // Also check the stripped canonical name
      const stripped = canonical.replace(".0n", "");
      if (knownFields.has(stripped)) {
        mappings[canonical] = stripped;
      }
    }

    return Object.keys(mappings).length > 0 ? mappings : undefined;
  }
}

// ── Singleton convenience ─────────────────────────────────

let _defaultBuilder = null;

/**
 * Get the default PluginBuilder singleton.
 */
export function getPluginBuilder() {
  if (!_defaultBuilder) {
    _defaultBuilder = new PluginBuilder();
  }
  return _defaultBuilder;
}

/**
 * Quick-build a plugin from catalog.
 */
export function buildPlugin(serviceKey, options) {
  return getPluginBuilder().build(serviceKey, options);
}

/**
 * Quick-build all catalog plugins.
 */
export function buildAllPlugins(options) {
  return getPluginBuilder().buildAll(options);
}

/**
 * Quick-build from a .0n spec.
 */
export function buildFromSpec(spec, options) {
  return getPluginBuilder().buildFromSpec(spec, options);
}

/**
 * Quick-generate a plugin spec.
 */
export function generatePluginSpec(def) {
  return getPluginBuilder().generate(def);
}
