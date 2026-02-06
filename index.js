#!/usr/bin/env node
// ============================================================
//
//   ██████╗ ███╗   ██╗███╗   ███╗ ██████╗██████╗
//  ██╔═████╗████╗  ██║████╗ ████║██╔════╝██╔══██╗
//  ██║██╔██║██╔██╗ ██║██╔████╔██║██║     ██████╔╝
//  ████╔╝██║██║╚██╗██║██║╚██╔╝██║██║     ██╔═══╝
//  ╚██████╔╝██║ ╚████║██║ ╚═╝ ██║╚██████╗██║
//   ╚═════╝ ╚═╝  ╚═══╝╚═╝     ╚═╝ ╚═════╝╚═╝
//
//  Universal AI-Powered API Orchestrator
//  Connect services. Describe tasks. AI handles the rest.
//
//  Implements the .0n Standard: https://github.com/0nork/0n-spec
//  Config: ~/.0n/ | Connections: ~/.0n/connections/*.0n
//
//  https://github.com/0nork/0nMCP
//  MIT License — Open Source
//
// ============================================================

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

import { SERVICE_CATALOG, listServices, getService } from "./catalog.js";
import { ConnectionManager } from "./connections.js";
import { Orchestrator } from "./orchestrator.js";
import { registerCrmTools } from "./crm.js";

// ── Initialize ─────────────────────────────────────────────
const connections = new ConnectionManager();
const orchestrator = new Orchestrator(connections);

const server = new McpServer({
  name: "0nMCP",
  version: "1.0.0",
});

// ============================================================
// UNIVERSAL TOOLS
// ============================================================

// ─── execute ───────────────────────────────────────────────
server.tool(
  "execute",
  `Execute any task using connected services. The AI orchestrator automatically:
1. Parses your intent from natural language
2. Finds the best services to use
3. Creates an execution plan
4. Executes all necessary API calls
5. Returns results

Examples:
- "Send an email to john@example.com about the meeting tomorrow"
- "Create a Stripe customer for sarah@test.com"
- "Post to #sales on Slack: We just closed a deal!"
- "Get my Stripe balance"
- "Add a record to Airtable: Name=John, Status=Active"
- "Send an SMS to +1234567890: Your order shipped"
- "Create a GitHub issue: Bug in login page"`,
  {
    task: z.string().describe("Natural language description of what you want to accomplish"),
  },
  async ({ task }) => {
    const result = await orchestrator.execute(task);

    if (result.success) {
      return {
        content: [{
          type: "text",
          text: JSON.stringify({
            status: "completed",
            message: result.message,
            steps_executed: result.details?.stepsExecuted || 0,
            steps_successful: result.details?.stepsSuccessful || 0,
            duration_ms: result.details?.duration || 0,
            services_used: result.details?.servicesUsed || [],
            plan: result.details?.plan || [],
          }, null, 2),
        }],
      };
    } else {
      return {
        content: [{
          type: "text",
          text: JSON.stringify({
            status: "failed",
            error: result.error,
            suggestion: result.suggestion,
            connected_services: result.connected_services,
          }, null, 2),
        }],
      };
    }
  }
);

// ─── connect_service ───────────────────────────────────────
server.tool(
  "connect_service",
  `Connect a service so the orchestrator can use it. Each service requires specific credentials.

Examples:
- Stripe: { "apiKey": "sk_live_..." }
- SendGrid: { "apiKey": "SG..." }
- Twilio: { "accountSid": "AC...", "authToken": "..." }
- Slack: { "botToken": "xoxb-..." }
- OpenAI: { "apiKey": "sk-..." }
- GitHub: { "token": "ghp_..." }
- Notion: { "apiKey": "ntn_..." }
- Airtable: { "apiKey": "pat..." }
- CRM: { "access_token": "..." }
- HubSpot: { "accessToken": "..." }
- Shopify: { "accessToken": "...", "store": "mystore" }
- Supabase: { "apiKey": "...", "projectRef": "..." }`,
  {
    service: z.string().describe("Service key (e.g., stripe, sendgrid, twilio, slack, crm, github, notion, airtable, openai, shopify, hubspot, supabase, discord, linear, resend, calendly, google_calendar)"),
    credentials: z.record(z.string()).describe("Service credentials as key-value pairs"),
  },
  async ({ service, credentials }) => {
    const result = connections.connect(service, credentials);

    if (result.success) {
      return {
        content: [{
          type: "text",
          text: JSON.stringify({
            status: "connected",
            service: result.service.name,
            capabilities: result.service.capabilities,
            message: `Connected to ${result.service.name}. You now have ${result.service.capabilities} capabilities available.`,
          }, null, 2),
        }],
      };
    } else {
      return {
        content: [{
          type: "text",
          text: JSON.stringify({ status: "failed", error: result.error }, null, 2),
        }],
      };
    }
  }
);

// ─── disconnect_service ────────────────────────────────────
server.tool(
  "disconnect_service",
  "Disconnect a connected service. Removes stored credentials.",
  {
    service: z.string().describe("Service key to disconnect (e.g., stripe, sendgrid)"),
  },
  async ({ service }) => {
    const result = connections.disconnect(service);
    return {
      content: [{
        type: "text",
        text: JSON.stringify({
          status: result.success ? "disconnected" : "failed",
          error: result.error,
        }, null, 2),
      }],
    };
  }
);

// ─── list_connections ──────────────────────────────────────
server.tool(
  "list_connections",
  "List all connected services, their types, and capability counts.",
  {},
  async () => {
    const connected = connections.list();

    if (connected.length === 0) {
      return {
        content: [{
          type: "text",
          text: JSON.stringify({
            count: 0,
            services: [],
            message: "No services connected. Use connect_service to add integrations.",
          }, null, 2),
        }],
      };
    }

    return {
      content: [{
        type: "text",
        text: JSON.stringify({
          count: connected.length,
          services: connected,
        }, null, 2),
      }],
    };
  }
);

// ─── list_available_services ───────────────────────────────
server.tool(
  "list_available_services",
  "List all services that can be connected, grouped by category.",
  {},
  async () => {
    const services = listServices();
    const connected = new Set(connections.keys());

    // Group by type
    const grouped = {};
    for (const svc of services) {
      if (!grouped[svc.type]) grouped[svc.type] = [];
      grouped[svc.type].push({
        key: svc.key,
        name: svc.name,
        description: svc.description,
        capabilities: svc.capabilityCount,
        authType: svc.authType,
        credentialKeys: svc.credentialKeys,
        connected: connected.has(svc.key),
      });
    }

    return {
      content: [{
        type: "text",
        text: JSON.stringify({
          total: services.length,
          connected: connected.size,
          services: grouped,
        }, null, 2),
      }],
    };
  }
);

// ─── get_service_info ──────────────────────────────────────
server.tool(
  "get_service_info",
  "Get detailed information about a specific service — capabilities, endpoints, and required credentials.",
  {
    service: z.string().describe("Service key (e.g., stripe, crm)"),
  },
  async ({ service }) => {
    const catalog = getService(service);
    if (!catalog) {
      return {
        content: [{
          type: "text",
          text: JSON.stringify({ error: `Unknown service: ${service}`, available: listServices().map(s => s.key) }, null, 2),
        }],
      };
    }

    return {
      content: [{
        type: "text",
        text: JSON.stringify({
          key: service,
          name: catalog.name,
          type: catalog.type,
          description: catalog.description,
          authType: catalog.authType,
          credentialKeys: catalog.credentialKeys,
          connected: connections.isConnected(service),
          capabilities: catalog.capabilities,
          endpoints: Object.entries(catalog.endpoints).map(([key, ep]) => ({
            name: key,
            method: ep.method,
            path: ep.path,
          })),
        }, null, 2),
      }],
    };
  }
);

// ─── api_call ──────────────────────────────────────────────
server.tool(
  "api_call",
  "Make a direct API call to any connected service. For advanced use when you need fine-grained control beyond the execute tool.",
  {
    service: z.string().describe("Service key (e.g., stripe, sendgrid)"),
    endpoint: z.string().describe("Endpoint name from the service catalog"),
    params: z.record(z.any()).optional().describe("Parameters for the API call"),
  },
  async ({ service, endpoint, params }) => {
    const catalog = getService(service);
    if (!catalog) {
      return { content: [{ type: "text", text: JSON.stringify({ error: `Unknown service: ${service}` }, null, 2) }] };
    }

    const ep = catalog.endpoints[endpoint];
    if (!ep) {
      return {
        content: [{
          type: "text",
          text: JSON.stringify({ error: `Unknown endpoint: ${endpoint}`, available: Object.keys(catalog.endpoints) }, null, 2),
        }],
      };
    }

    const creds = connections.getCredentials(service);
    if (!creds) {
      return { content: [{ type: "text", text: JSON.stringify({ error: `Service ${service} not connected` }, null, 2) }] };
    }

    try {
      let url = catalog.baseUrl + ep.path;
      const allParams = { ...creds, ...(params || {}) };

      // Substitute path params
      url = url.replace(/\{(\w+)\}/g, (_, key) => allParams[key] || `{${key}}`);

      const headers = catalog.authHeader(creds);
      const options = { method: ep.method, headers };

      if (ep.method !== "GET" && params) {
        const contentType = ep.contentType || "application/json";
        if (contentType === "application/x-www-form-urlencoded") {
          headers["Content-Type"] = "application/x-www-form-urlencoded";
          const flat = {};
          for (const [k, v] of Object.entries(params)) {
            if (typeof v !== "object") flat[k] = String(v);
          }
          options.body = new URLSearchParams(flat).toString();
        } else {
          headers["Content-Type"] = "application/json";
          options.body = JSON.stringify(params);
        }
      }

      if (ep.method === "GET" && params) {
        const flat = {};
        for (const [k, v] of Object.entries(params)) {
          if (typeof v !== "object") flat[k] = String(v);
        }
        const qs = new URLSearchParams(flat).toString();
        if (qs) url += (url.includes("?") ? "&" : "?") + qs;
      }

      const response = await fetch(url, options);
      const data = await response.json().catch(() => ({ status: response.status, statusText: response.statusText }));

      return {
        content: [{
          type: "text",
          text: JSON.stringify({ success: response.ok, status: response.status, data }, null, 2),
        }],
      };
    } catch (err) {
      return { content: [{ type: "text", text: JSON.stringify({ error: err.message }, null, 2) }] };
    }
  }
);

// ============================================================
// SERVICE-SPECIFIC TOOLS
// ============================================================

// Register CRM tools (the first full integration)
registerCrmTools(server, z);

// Future: registerStripeTools(server, z);
// Future: registerSlackTools(server, z);
// Future: registerShopifyTools(server, z);

// ============================================================
// START SERVER
// ============================================================

const transport = new StdioServerTransport();
await server.connect(transport);
