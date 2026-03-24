// ============================================================
// 0nMCP — Engine Module
// ============================================================
// The .0n Conversion Engine — import credentials, verify keys,
// generate platform configs, create portable AI Brain bundles,
// build/run application bundles, and the 0nEngine Plugin System.
//
// 16 MCP Tools:
//   engine_import    — Import credentials from .env/CSV/JSON
//   engine_verify    — Verify API keys with test calls
//   engine_platforms — Generate platform configs
//   engine_export    — Export .0n bundle from connections
//   engine_bundle    — Full pipeline: import → map → bundle
//   engine_open      — Open a .0n bundle file
//   app_build        — Build a .0n application bundle
//   app_open         — Open/extract a .0n application
//   app_inspect      — Show application metadata (no passphrase)
//   app_validate     — Validate application cross-references
//   app_list         — List installed applications
//   plugin_list      — List all plugins (catalog + custom)
//   plugin_build     — Build a plugin from service key or spec
//   plugin_execute   — Execute a plugin endpoint with .0n fields
//   plugin_inspect   — Inspect a plugin's capabilities & endpoints
//   plugin_create    — Generate a new custom plugin spec
//
// Patent Pending: US Provisional Patent Application #63/968,814
// ============================================================

// ── Re-exports ─────────────────────────────────────────────
export { sealPortable, unsealPortable, verifyPortable } from "./cipher-portable.js";
export { parseFile, parseEnvFile, parseCsvFile, parseJsonFile, parseEnvString, parseCsvString, parseJsonString, detectFormat } from "./parser.js";
export { mapEnvVars, groupByService, validateMapping } from "./mapper.js";
export { verifyCredentials, verifyAll } from "./validator.js";
export { generatePlatformConfig, generateAllPlatformConfigs, installPlatformConfig, getPlatformInfo, listPlatforms } from "./platforms.js";
export { createBundle, openBundle, inspectBundle, verifyBundle } from "./bundler.js";
export { OperationRegistry, validateOperations } from "./operations.js";
export { parseCron, CronScheduler } from "./scheduler.js";
export { Application } from "./application.js";
export { createApplication, openApplication, inspectApplication, validateApplication } from "./app-builder.js";
export { ApplicationServer } from "./app-server.js";

// ── 0nEngine Plugin System ──────────────────────────────────
export { Plugin } from "./plugin.js";
export { PluginBuilder, getPluginBuilder, buildPlugin, buildAllPlugins, buildFromSpec, generatePluginSpec } from "./plugin-builder.js";
export { PluginRegistry, getPluginRegistry } from "./plugin-registry.js";

// ── 0nAI Training Center ────────────────────────────────────
export { registerTrainingTools } from "./training.js";
export { TrainingFeedEngine, registerFeedTools, FEED_SOURCES } from "./training-feed.js";

// ── Multi-AI Council ────────────────────────────────────────
export { registerCouncilTools, getAvailableProviders, askAll, PROVIDERS } from "./multi-ai.js";

// ── SXO Blog Writer Engine ──────────────────────────────────
export { registerSxoWriterTools, scoreContent, SXO_SYSTEM_PROMPT } from "./sxo-writer.js";

// ── Imports for tool handlers ──────────────────────────────
import { parseFile } from "./parser.js";
import { mapEnvVars, groupByService, validateMapping } from "./mapper.js";
import { verifyCredentials, verifyAll } from "./validator.js";
import { generatePlatformConfig, generateAllPlatformConfigs, getPlatformInfo, listPlatforms } from "./platforms.js";
import { createBundle, openBundle, inspectBundle, verifyBundle } from "./bundler.js";
import { createApplication, openApplication, inspectApplication, validateApplication } from "./app-builder.js";
import { PluginBuilder, getPluginBuilder } from "./plugin-builder.js";
import { PluginRegistry, getPluginRegistry } from "./plugin-registry.js";
import { existsSync, readFileSync, readdirSync } from "fs";
import { join } from "path";
import { homedir } from "os";

const CONNECTIONS_DIR = join(homedir(), ".0n", "connections");
const APPS_DIR = join(homedir(), ".0n", "apps");
const WORKFLOWS_DIR = join(homedir(), ".0n", "workflows");

/**
 * Load all connections from ~/.0n/connections/ for bundling.
 */
function loadLocalConnections(serviceFilter) {
  const connections = {};
  if (!existsSync(CONNECTIONS_DIR)) return connections;

  const files = readdirSync(CONNECTIONS_DIR);
  for (const file of files) {
    if (!file.endsWith(".0n") && !file.endsWith(".0n.json")) continue;
    try {
      const data = JSON.parse(readFileSync(join(CONNECTIONS_DIR, file), "utf-8"));
      if (!data.$0n || data.$0n.type !== "connection") continue;
      const service = data.service;
      if (serviceFilter && !serviceFilter.includes(service)) continue;
      if (data.$0n.sealed) continue; // Skip vault-sealed connections (can't read creds)
      connections[service] = {
        credentials: data.auth?.credentials || {},
        name: data.$0n.name || service,
        authType: data.auth?.type || "api_key",
        environment: data.environment || "production",
      };
    } catch { /* skip invalid */ }
  }
  return connections;
}

/**
 * Register engine tools on an MCP server instance.
 *
 * @param {import("@modelcontextprotocol/sdk/server/mcp.js").McpServer} server
 * @param {import("zod").ZodType} z
 */
export function registerEngineTools(server, z) {
  // ─── engine_import ──────────────────────────────────────
  server.tool(
    "engine_import",
    `Import and map credentials from a .env, CSV, or JSON file.
Auto-detects which of 26 supported services each credential belongs to.
Returns mapped services with confidence scores and any unmapped variables.

Example: engine_import({ source: "/path/to/.env" })`,
    {
      source: z.string().describe("Path to credential file (.env, .csv, or .json)"),
      format: z.enum(["env", "csv", "json", "auto"]).optional().describe("File format (default: auto-detect)"),
    },
    async ({ source, format }) => {
      try {
        const { format: detected, entries } = parseFile(source);
        const { mapped, unmapped } = mapEnvVars(entries);
        const groups = groupByService(mapped);

        // Validate each service
        const services = {};
        for (const [service, group] of Object.entries(groups)) {
          const validation = validateMapping(service, group.credentials);
          services[service] = {
            credentials: Object.keys(group.credentials),
            envVars: group.envVars,
            complete: validation.valid,
            missing: validation.missing,
          };
        }

        return {
          content: [{
            type: "text",
            text: JSON.stringify({
              status: "imported",
              format: format || detected,
              total_entries: entries.length,
              mapped_count: mapped.length,
              unmapped_count: unmapped.length,
              services,
              unmapped: unmapped.map(u => u.key),
              message: `Found ${Object.keys(services).length} services from ${entries.length} entries. Use engine_bundle to create a portable .0n file.`,
            }, null, 2),
          }],
        };
      } catch (err) {
        return { content: [{ type: "text", text: JSON.stringify({ status: "failed", error: err.message }, null, 2) }] };
      }
    }
  );

  // ─── engine_verify ──────────────────────────────────────
  server.tool(
    "engine_verify",
    `Verify API credentials by making lightweight test calls to each service.
All verification calls are read-only and non-destructive.

Example: engine_verify({ services: ["stripe", "openai"] })`,
    {
      services: z.array(z.string()).optional().describe("Service keys to verify (default: all connected)"),
    },
    async ({ services }) => {
      try {
        // Load connections
        const connections = loadLocalConnections(services);
        if (Object.keys(connections).length === 0) {
          return { content: [{ type: "text", text: JSON.stringify({ status: "no_connections", message: "No connections found to verify." }, null, 2) }] };
        }

        const { results, summary } = await verifyAll(connections);

        return {
          content: [{
            type: "text",
            text: JSON.stringify({ status: "verified", results, summary }, null, 2),
          }],
        };
      } catch (err) {
        return { content: [{ type: "text", text: JSON.stringify({ status: "failed", error: err.message }, null, 2) }] };
      }
    }
  );

  // ─── engine_platforms ────────────────────────────────────
  server.tool(
    "engine_platforms",
    `Generate MCP server configuration for AI platforms.
Supports: Claude Desktop, Cursor, Windsurf, Gemini, Continue, Cline, OpenAI.

Example: engine_platforms({ platform: "claude_desktop" })
Example: engine_platforms({}) — generates all 7 platforms`,
    {
      platform: z.string().optional().describe("Platform key (claude_desktop, cursor, windsurf, gemini, continue, cline, openai) — omit for all"),
      mode: z.enum(["stdio", "http"]).optional().describe("Transport mode (default: stdio)"),
    },
    async ({ platform, mode }) => {
      try {
        const options = { mode: mode || "stdio" };

        if (platform) {
          const config = generatePlatformConfig(platform, options);
          return {
            content: [{
              type: "text",
              text: JSON.stringify({
                platform: config.name,
                config_path: config.path,
                format: config.format,
                config: config.config,
              }, null, 2),
            }],
          };
        }

        const allConfigs = generateAllPlatformConfigs(options);
        const info = getPlatformInfo();

        return {
          content: [{
            type: "text",
            text: JSON.stringify({
              platforms: Object.entries(allConfigs).map(([key, cfg]) => ({
                key,
                name: cfg.name,
                config_path: cfg.path,
                format: cfg.format,
                installed: info.find(i => i.platform === key)?.installed || false,
                config: cfg.config,
              })),
              message: `Generated configs for ${Object.keys(allConfigs).length} platforms. Copy the config to the appropriate file path.`,
            }, null, 2),
          }],
        };
      } catch (err) {
        return { content: [{ type: "text", text: JSON.stringify({ status: "failed", error: err.message }, null, 2) }] };
      }
    }
  );

  // ─── engine_export ──────────────────────────────────────
  server.tool(
    "engine_export",
    `Export connected services as a portable .0n bundle file.
The bundle is encrypted with a passphrase (portable — works on any machine).
Includes platform configs for all major AI tools.

Example: engine_export({ passphrase: "my-secure-passphrase" })`,
    {
      passphrase: z.string().describe("Passphrase to encrypt the bundle"),
      services: z.array(z.string()).optional().describe("Service keys to include (default: all connected)"),
      output: z.string().optional().describe("Output file path (default: ~/.0n/bundles/)"),
      name: z.string().optional().describe("Bundle name"),
      platforms: z.array(z.string()).optional().describe("Platform configs to include (default: all)"),
    },
    async ({ passphrase, services, output, name, platforms }) => {
      try {
        const connections = loadLocalConnections(services);
        if (Object.keys(connections).length === 0) {
          return { content: [{ type: "text", text: JSON.stringify({ status: "no_connections", message: "No connections found to export." }, null, 2) }] };
        }

        const result = createBundle({
          connections,
          passphrase,
          outputPath: output,
          name: name || "0n AI Brain",
          platforms: platforms || "all",
        });

        return {
          content: [{
            type: "text",
            text: JSON.stringify({
              status: "exported",
              path: result.path,
              services: result.manifest.services,
              connection_count: result.manifest.connection_count,
              platform_count: result.manifest.platform_count,
              encryption: result.manifest.encryption.method,
              message: `Bundle created at ${result.path}. Share this file — recipient opens with: engine_open`,
            }, null, 2),
          }],
        };
      } catch (err) {
        return { content: [{ type: "text", text: JSON.stringify({ status: "failed", error: err.message }, null, 2) }] };
      }
    }
  );

  // ─── engine_bundle ──────────────────────────────────────
  server.tool(
    "engine_bundle",
    `Full pipeline: import credentials from file → map to services → create encrypted .0n bundle.
Combines engine_import + engine_export in one step.

Example: engine_bundle({ source: "/path/to/.env", passphrase: "my-passphrase" })`,
    {
      passphrase: z.string().describe("Passphrase to encrypt the bundle"),
      source: z.string().optional().describe("Path to credential file — if omitted, bundles existing connections"),
      output: z.string().optional().describe("Output file path"),
      name: z.string().optional().describe("Bundle name"),
    },
    async ({ passphrase, source, output, name }) => {
      try {
        let connections;

        if (source) {
          // Import from file
          const { entries } = parseFile(source);
          const { mapped, unmapped } = mapEnvVars(entries);
          const groups = groupByService(mapped);

          connections = {};
          for (const [service, group] of Object.entries(groups)) {
            const validation = validateMapping(service, group.credentials);
            if (validation.valid) {
              connections[service] = {
                credentials: group.credentials,
                name: service,
              };
            }
          }

          if (Object.keys(connections).length === 0) {
            return { content: [{ type: "text", text: JSON.stringify({ status: "no_services", message: "No complete service credentials found in source file.", unmapped: unmapped.map(u => u.key) }, null, 2) }] };
          }
        } else {
          connections = loadLocalConnections();
          if (Object.keys(connections).length === 0) {
            return { content: [{ type: "text", text: JSON.stringify({ status: "no_connections", message: "No connections found. Provide a source file or connect services first." }, null, 2) }] };
          }
        }

        const result = createBundle({
          connections,
          passphrase,
          outputPath: output,
          name: name || "0n AI Brain",
          platforms: "all",
        });

        return {
          content: [{
            type: "text",
            text: JSON.stringify({
              status: "bundled",
              path: result.path,
              services: result.manifest.services,
              connection_count: result.manifest.connection_count,
              platform_count: result.manifest.platform_count,
              encryption: result.manifest.encryption.method,
              message: `AI Brain created with ${result.manifest.connection_count} services. Portable across any machine.`,
            }, null, 2),
          }],
        };
      } catch (err) {
        return { content: [{ type: "text", text: JSON.stringify({ status: "failed", error: err.message }, null, 2) }] };
      }
    }
  );

  // ─── engine_open ────────────────────────────────────────
  server.tool(
    "engine_open",
    `Open a .0n bundle file and extract connections to this machine.
Decrypts credentials and saves as individual .0n connection files.
Optionally inspect without passphrase to see contents first.

Example: engine_open({ bundle: "/path/to/bundle.0n", passphrase: "my-passphrase" })`,
    {
      bundle: z.string().describe("Path to .0n bundle file"),
      passphrase: z.string().optional().describe("Passphrase to decrypt — omit to inspect only"),
    },
    async ({ bundle, passphrase }) => {
      try {
        if (!passphrase) {
          // Inspect only
          const info = inspectBundle(bundle);
          return {
            content: [{
              type: "text",
              text: JSON.stringify({
                status: "inspected",
                ...info,
                message: `Bundle contains ${info.services.length} services. Provide passphrase to extract.`,
              }, null, 2),
            }],
          };
        }

        // Verify first
        const verification = verifyBundle(bundle, passphrase);
        if (!verification.valid) {
          return { content: [{ type: "text", text: JSON.stringify({ status: "failed", errors: verification.errors }, null, 2) }] };
        }

        // Open and extract
        const result = openBundle(bundle, passphrase);

        return {
          content: [{
            type: "text",
            text: JSON.stringify({
              status: "opened",
              connections_imported: result.connections,
              platforms_available: result.platforms,
              includes_extracted: result.includes,
              errors: result.errors.length > 0 ? result.errors : undefined,
              message: `Imported ${result.connections.length} services. Use engine_platforms to install configs for your AI tools.`,
            }, null, 2),
          }],
        };
      } catch (err) {
        return { content: [{ type: "text", text: JSON.stringify({ status: "failed", error: err.message }, null, 2) }] };
      }
    }
  );

  // ═══════════════════════════════════════════════════════════
  // Application Engine Tools (v1.7.0)
  // ═══════════════════════════════════════════════════════════

  // ─── app_build ────────────────────────────────────────────
  server.tool(
    "app_build",
    `Build a .0n application bundle — a portable encrypted file containing
endpoints, workflows, operations, automations, and connections.
Deploy anywhere with: 0nmcp app run <file>

Example: app_build({ name: "Lead Scorer", passphrase: "secret", workflows: {...}, endpoints: {...} })`,
    {
      name: z.string().describe("Application name"),
      passphrase: z.string().describe("Passphrase to encrypt the bundle"),
      workflows: z.record(z.any()).optional().describe("Workflow definitions { id: workflowDef }"),
      connections: z.record(z.any()).optional().describe("Connections to include { service: { credentials } }"),
      endpoints: z.record(z.any()).optional().describe("Endpoint definitions { 'METHOD /path': def }"),
      operations: z.record(z.any()).optional().describe("Reusable operation definitions { id: def }"),
      automations: z.record(z.any()).optional().describe("Automation definitions { id: def }"),
      environment: z.object({
        variables: z.record(z.string()).optional(),
        secrets: z.record(z.string()).optional(),
        settings: z.record(z.any()).optional(),
        feature_flags: z.record(z.boolean()).optional(),
      }).optional().describe("Environment configuration"),
      output: z.string().optional().describe("Output file path"),
    },
    async ({ name, passphrase, workflows, connections, endpoints, operations, automations, environment, output }) => {
      try {
        // If no connections provided, load local connections
        const conns = connections || loadLocalConnections();

        const result = createApplication({
          name,
          passphrase,
          connections: conns,
          workflows: workflows || {},
          endpoints: endpoints || {},
          operations: operations || {},
          automations: automations || {},
          environment: environment || {},
          output,
        });

        return {
          content: [{
            type: "text",
            text: JSON.stringify({
              status: "built",
              path: result.path,
              manifest: result.manifest,
              message: `Application "${name}" built at ${result.path}. Run with: 0nmcp app run ${result.path}`,
            }, null, 2),
          }],
        };
      } catch (err) {
        return { content: [{ type: "text", text: JSON.stringify({ status: "failed", error: err.message }, null, 2) }] };
      }
    }
  );

  // ─── app_open ─────────────────────────────────────────────
  server.tool(
    "app_open",
    `Open a .0n application bundle file.
Decrypts and extracts the application for local use.

Example: app_open({ bundle: "/path/to/app.0n", passphrase: "secret" })`,
    {
      bundle: z.string().describe("Path to .0n application file"),
      passphrase: z.string().optional().describe("Passphrase to decrypt — omit to inspect only"),
    },
    async ({ bundle, passphrase }) => {
      try {
        if (!passphrase) {
          const info = inspectApplication(bundle);
          return {
            content: [{
              type: "text",
              text: JSON.stringify({
                status: "inspected",
                ...info,
                message: `Application "${info.name}" has ${info.workflows.length} workflows, ${info.endpoints.length} endpoints. Provide passphrase to extract.`,
              }, null, 2),
            }],
          };
        }

        const bundleData = openApplication(bundle, passphrase);
        return {
          content: [{
            type: "text",
            text: JSON.stringify({
              status: "opened",
              name: bundleData.$0n.name,
              workflows: Object.keys(bundleData.workflows || {}),
              endpoints: Object.keys(bundleData.endpoints || {}),
              operations: Object.keys(bundleData.operations || {}),
              automations: Object.keys(bundleData.automations || {}),
              connections: (bundleData.connections || []).map(c => c.service),
              message: `Application "${bundleData.$0n.name}" opened. Run with: 0nmcp app run ${bundle}`,
            }, null, 2),
          }],
        };
      } catch (err) {
        return { content: [{ type: "text", text: JSON.stringify({ status: "failed", error: err.message }, null, 2) }] };
      }
    }
  );

  // ─── app_inspect ──────────────────────────────────────────
  server.tool(
    "app_inspect",
    `Inspect a .0n application bundle without passphrase.
Shows metadata, endpoints, workflows, and automations.

Example: app_inspect({ bundle: "/path/to/app.0n" })`,
    {
      bundle: z.string().describe("Path to .0n application file"),
    },
    async ({ bundle }) => {
      try {
        const info = inspectApplication(bundle);
        return {
          content: [{
            type: "text",
            text: JSON.stringify({
              status: "inspected",
              ...info,
            }, null, 2),
          }],
        };
      } catch (err) {
        return { content: [{ type: "text", text: JSON.stringify({ status: "failed", error: err.message }, null, 2) }] };
      }
    }
  );

  // ─── app_validate ─────────────────────────────────────────
  server.tool(
    "app_validate",
    `Validate a .0n application bundle's structure and cross-references.
Checks that endpoints reference valid workflows, workflows reference valid operations, etc.

Example: app_validate({ bundle: "/path/to/app.0n", passphrase: "secret" })`,
    {
      bundle: z.string().describe("Path to .0n application file"),
      passphrase: z.string().optional().describe("Passphrase to decrypt for full validation"),
    },
    async ({ bundle, passphrase }) => {
      try {
        const raw = readFileSync(bundle, "utf-8");
        const bundleData = JSON.parse(raw);

        const result = validateApplication(bundleData);
        return {
          content: [{
            type: "text",
            text: JSON.stringify({
              status: result.valid ? "valid" : "invalid",
              ...result,
              message: result.valid
                ? "Application bundle is valid."
                : `Found ${result.errors.length} error(s).`,
            }, null, 2),
          }],
        };
      } catch (err) {
        return { content: [{ type: "text", text: JSON.stringify({ status: "failed", error: err.message }, null, 2) }] };
      }
    }
  );

  // ─── app_list ─────────────────────────────────────────────
  server.tool(
    "app_list",
    `List installed .0n applications from ~/.0n/apps/.

Example: app_list({})`,
    {},
    async () => {
      try {
        if (!existsSync(APPS_DIR)) {
          return {
            content: [{
              type: "text",
              text: JSON.stringify({
                status: "ok",
                count: 0,
                apps: [],
                message: "No applications installed. Build one with app_build.",
              }, null, 2),
            }],
          };
        }

        const files = readdirSync(APPS_DIR).filter(f => f.endsWith(".0n") || f.endsWith(".0n.json"));
        const apps = [];

        for (const file of files) {
          try {
            const filePath = join(APPS_DIR, file);
            const data = JSON.parse(readFileSync(filePath, "utf-8"));
            if (data.$0n?.type !== "application") continue;

            apps.push({
              name: data.$0n.name || file,
              version: data.$0n.version || "1.0.0",
              description: data.$0n.description || "",
              author: data.$0n.author || "",
              created: data.$0n.created,
              file,
              path: filePath,
              workflows: Object.keys(data.workflows || {}).length,
              endpoints: Object.keys(data.endpoints || {}).length,
              operations: Object.keys(data.operations || {}).length,
              automations: Object.keys(data.automations || {}).length,
              connections: (data.connections || []).length,
            });
          } catch { /* skip invalid */ }
        }

        return {
          content: [{
            type: "text",
            text: JSON.stringify({
              status: "ok",
              count: apps.length,
              apps,
              message: apps.length > 0
                ? `Found ${apps.length} application(s). Run with: 0nmcp app run <file>`
                : "No applications installed.",
            }, null, 2),
          }],
        };
      } catch (err) {
        return { content: [{ type: "text", text: JSON.stringify({ status: "failed", error: err.message }, null, 2) }] };
      }
    }
  );

  // ═══════════════════════════════════════════════════════════
  // 0nEngine Plugin Tools
  // ═══════════════════════════════════════════════════════════

  // ─── plugin_list ───────────────────────────────────────────
  server.tool(
    "plugin_list",
    `List all available plugins — catalog services + custom plugins from ~/.0n/plugins/.
Shows connection status, endpoint counts, capability counts, and field coverage.

Example: plugin_list({})
Example: plugin_list({ type: "email" })
Example: plugin_list({ connected: true })`,
    {
      type: z.string().optional().describe("Filter by service type (email, payments, crm, etc.)"),
      connected: z.boolean().optional().describe("Filter by connection status"),
      search: z.string().optional().describe("Search by keyword in name/description"),
    },
    async ({ type, connected, search }) => {
      try {
        const registry = getPluginRegistry();

        let plugins = registry.all();

        if (type) plugins = plugins.filter(p => p.type === type);
        if (connected !== undefined) plugins = plugins.filter(p => p.isConnected === connected);
        if (search) {
          const q = search.toLowerCase();
          plugins = plugins.filter(p =>
            p.name.toLowerCase().includes(q) ||
            p.description.toLowerCase().includes(q) ||
            p.key.toLowerCase().includes(q)
          );
        }

        const list = plugins.map(p => ({
          key: p.key,
          name: p.name,
          type: p.type,
          connected: p.isConnected,
          endpoints: Object.keys(p.endpoints).length,
          capabilities: p.capabilities.length,
        }));

        return {
          content: [{
            type: "text",
            text: JSON.stringify({
              status: "ok",
              total: list.length,
              plugins: list,
              types: [...new Set(plugins.map(p => p.type))],
            }, null, 2),
          }],
        };
      } catch (err) {
        return { content: [{ type: "text", text: JSON.stringify({ status: "failed", error: err.message }, null, 2) }] };
      }
    }
  );

  // ─── plugin_inspect ────────────────────────────────────────
  server.tool(
    "plugin_inspect",
    `Inspect a plugin's full details — capabilities, endpoints, field mappings, and stats.

Example: plugin_inspect({ service: "stripe" })`,
    {
      service: z.string().describe("Service key to inspect (e.g., stripe, crm, sendgrid)"),
    },
    async ({ service }) => {
      try {
        const builder = getPluginBuilder();
        const plugin = builder.build(service);

        const info = plugin.inspect();
        const fields = builder.getServiceFields(service);

        return {
          content: [{
            type: "text",
            text: JSON.stringify({
              status: "ok",
              ...info,
              fieldMappings: fields,
              fieldCount: Object.keys(fields).length,
            }, null, 2),
          }],
        };
      } catch (err) {
        return { content: [{ type: "text", text: JSON.stringify({ status: "failed", error: err.message }, null, 2) }] };
      }
    }
  );

  // ─── plugin_execute ────────────────────────────────────────
  server.tool(
    "plugin_execute",
    `Execute a plugin endpoint with automatic .0n field resolution.
Accepts canonical .0n fields (email.0n, fullname.0n, etc.) and auto-translates
to the service's native format. Handles auth, rate limiting, and response normalization.

Example: plugin_execute({
  service: "stripe",
  endpoint: "create_customer",
  params: { "email.0n": "mike@rocketopp.com", "fullname.0n": "Mike Mento" }
})`,
    {
      service: z.string().describe("Service key (e.g., stripe, crm, sendgrid)"),
      endpoint: z.string().describe("Endpoint name from the service catalog (e.g., create_customer, send_email)"),
      params: z.record(z.any()).optional().describe("Parameters — supports .0n canonical fields (email.0n) and raw service fields"),
      credentials: z.record(z.string()).optional().describe("One-time credentials override (otherwise uses ~/.0n/connections/)"),
    },
    async ({ service, endpoint, params, credentials }) => {
      try {
        const builder = getPluginBuilder();
        const plugin = builder.build(service);

        // Connect with provided or disk credentials
        if (credentials) {
          plugin.connect(credentials);
        } else {
          // Try to load from disk
          const connFile = join(CONNECTIONS_DIR, `${service}.0n`);
          const connFileJson = join(CONNECTIONS_DIR, `${service}.0n.json`);
          const connPath = existsSync(connFile) ? connFile : existsSync(connFileJson) ? connFileJson : null;

          if (connPath) {
            const data = JSON.parse(readFileSync(connPath, "utf-8"));
            if (data.auth?.credentials) {
              plugin.connect(data.auth.credentials);
            }
          }
        }

        if (!plugin.isConnected) {
          return {
            content: [{
              type: "text",
              text: JSON.stringify({
                status: "not_connected",
                service,
                message: `Plugin "${service}" has no credentials. Provide credentials or connect via connect_service.`,
                requiredKeys: plugin.credentialKeys,
              }, null, 2),
            }],
          };
        }

        const result = await plugin.execute(endpoint, params || {});

        return {
          content: [{
            type: "text",
            text: JSON.stringify(result, null, 2),
          }],
        };
      } catch (err) {
        return { content: [{ type: "text", text: JSON.stringify({ status: "failed", error: err.message }, null, 2) }] };
      }
    }
  );

  // ─── plugin_build ──────────────────────────────────────────
  server.tool(
    "plugin_build",
    `Build a plugin from a service key or custom spec.
If building from catalog, returns the plugin's full tool manifest.
If building from spec, creates a custom plugin and saves to ~/.0n/plugins/.

Example (catalog): plugin_build({ service: "stripe" })
Example (custom): plugin_build({
  spec: {
    service: "acme",
    name: "Acme CRM",
    baseUrl: "https://api.acme.com/v1",
    authType: "api_key",
    credentialKeys: ["apiKey"],
    endpoints: {
      list_contacts: { method: "GET", path: "/contacts" },
      create_contact: { method: "POST", path: "/contacts", body: { email: "", name: "" } }
    }
  }
})`,
    {
      service: z.string().optional().describe("Catalog service key (e.g., stripe) — builds from catalog"),
      spec: z.record(z.any()).optional().describe("Custom plugin spec — builds from definition"),
      save: z.boolean().optional().describe("Save custom plugin to ~/.0n/plugins/ (default: true)"),
    },
    async ({ service, spec, save }) => {
      try {
        const builder = getPluginBuilder();

        if (spec) {
          // Build from custom spec
          const generated = builder.generate(spec);
          const plugin = builder.buildFromSpec(generated);

          if (save !== false) {
            builder.generateAndSave(spec);
          }

          return {
            content: [{
              type: "text",
              text: JSON.stringify({
                status: "built",
                source: "custom_spec",
                plugin: plugin.inspect(),
                tools: plugin.toMcpTools().map(t => t.name),
                spec: generated,
                saved: save !== false,
                message: `Custom plugin "${spec.service || spec.key}" built with ${Object.keys(spec.endpoints || {}).length} endpoints.`,
              }, null, 2),
            }],
          };
        }

        if (service) {
          // Build from catalog
          const plugin = builder.build(service);
          const tools = plugin.toMcpTools();

          return {
            content: [{
              type: "text",
              text: JSON.stringify({
                status: "built",
                source: "catalog",
                plugin: plugin.inspect(),
                tools: tools.map(t => t.name),
                toolCount: tools.length,
                message: `Plugin "${service}" built from catalog with ${tools.length} tools.`,
              }, null, 2),
            }],
          };
        }

        return {
          content: [{
            type: "text",
            text: JSON.stringify({
              status: "failed",
              error: "Provide either 'service' (catalog key) or 'spec' (custom definition).",
            }, null, 2),
          }],
        };
      } catch (err) {
        return { content: [{ type: "text", text: JSON.stringify({ status: "failed", error: err.message }, null, 2) }] };
      }
    }
  );

  // ─── plugin_create ─────────────────────────────────────────
  server.tool(
    "plugin_create",
    `Generate a new custom plugin spec for a service not in the catalog.
Auto-infers capabilities from endpoints and maps .0n canonical fields.
Saves to ~/.0n/plugins/ for automatic loading.

Example: plugin_create({
  key: "acme",
  name: "Acme API",
  baseUrl: "https://api.acme.com/v1",
  authType: "api_key",
  credentialKeys: ["apiKey"],
  endpoints: {
    list_users: { method: "GET", path: "/users" },
    create_user: { method: "POST", path: "/users", body: { email: "", name: "" } },
    get_user: { method: "GET", path: "/users/{userId}" },
    update_user: { method: "PUT", path: "/users/{userId}", body: {} },
    delete_user: { method: "DELETE", path: "/users/{userId}" }
  }
})`,
    {
      key: z.string().describe("Service key (lowercase, no spaces)"),
      name: z.string().optional().describe("Display name"),
      baseUrl: z.string().describe("API base URL"),
      authType: z.enum(["api_key", "oauth", "basic", "none"]).optional().describe("Auth type (default: api_key)"),
      credentialKeys: z.array(z.string()).optional().describe("Required credential keys (default: ['apiKey'])"),
      type: z.string().optional().describe("Category type (e.g., crm, email, payments)"),
      description: z.string().optional().describe("Service description"),
      endpoints: z.record(z.any()).describe("Endpoint definitions { name: { method, path, body?, query? } }"),
      fieldMappings: z.record(z.any()).optional().describe("Custom .0n field mappings { 'email.0n': 'user_email' }"),
    },
    async ({ key, name, baseUrl, authType, credentialKeys, type, description, endpoints, fieldMappings }) => {
      try {
        const builder = getPluginBuilder();

        const def = { key, name, baseUrl, authType, credentialKeys, type, description, endpoints, fieldMappings };
        const { spec, path } = builder.generateAndSave(def);

        // Also register in the active registry
        const registry = getPluginRegistry();
        const plugin = registry.registerFromSpec(spec);

        return {
          content: [{
            type: "text",
            text: JSON.stringify({
              status: "created",
              service: key,
              path,
              endpoints: Object.keys(endpoints).length,
              capabilities: spec.capabilities?.length || 0,
              fieldMappings: spec.fieldMappings ? Object.keys(spec.fieldMappings).length : 0,
              tools: plugin.toMcpTools().map(t => t.name),
              message: `Plugin "${key}" created and saved to ${path}. It's now available in the registry.`,
            }, null, 2),
          }],
        };
      } catch (err) {
        return { content: [{ type: "text", text: JSON.stringify({ status: "failed", error: err.message }, null, 2) }] };
      }
    }
  );
}

/**
 * Load local workflows from ~/.0n/workflows/ for bundling into applications.
 * @param {string[]} [ids] — Specific workflow IDs to load (default: all)
 * @returns {Record<string, object>}
 */
export function loadLocalWorkflows(ids) {
  const workflows = {};
  if (!existsSync(WORKFLOWS_DIR)) return workflows;

  const files = readdirSync(WORKFLOWS_DIR);
  for (const file of files) {
    if (!file.endsWith(".0n") && !file.endsWith(".0n.json")) continue;
    try {
      const data = JSON.parse(readFileSync(join(WORKFLOWS_DIR, file), "utf-8"));
      if (!data.$0n || data.$0n.type !== "workflow") continue;
      const id = file.replace(/\.0n(\.json)?$/, "");
      if (ids && !ids.includes(id)) continue;
      workflows[id] = data;
    } catch { /* skip invalid */ }
  }
  return workflows;
}
