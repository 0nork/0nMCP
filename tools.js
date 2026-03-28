// ============================================================
// 0nMCP — Tool Registration
// ============================================================
// All MCP tool definitions in one place. Shared by both
// stdio (index.js) and HTTP (server.js) transports.
// ============================================================

import { z } from "zod";
import { SERVICE_CATALOG, listServices, getService } from "./catalog.js";
import { registerRedditTools } from "./reddit.js";

/**
 * Register all universal + workflow tools on an MCP server instance.
 *
 * @param {import("@modelcontextprotocol/sdk/server/mcp.js").McpServer} server
 * @param {import("./connections.js").ConnectionManager} connections
 * @param {import("./orchestrator.js").Orchestrator} orchestrator
 * @param {import("./workflow.js").WorkflowRunner} [workflowRunner]
 */
export function registerAllTools(server, connections, orchestrator, workflowRunner, proxy) {
  // ─── execute ───────────────────────────────────────────
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

  // ─── connect_service ───────────────────────────────────
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
- Supabase: { "apiKey": "...", "projectRef": "..." }
- Gmail: { "access_token": "..." }
- Google Sheets: { "access_token": "..." }
- Google Drive: { "access_token": "..." }
- Jira: { "email": "...", "apiToken": "...", "domain": "mycompany" }
- Zendesk: { "email": "...", "apiToken": "...", "subdomain": "mycompany" }
- Mailchimp: { "apiKey": "...-us21" }
- Zoom: { "access_token": "..." }
- Microsoft 365: { "access_token": "..." }
- MongoDB: { "apiKey": "...", "appId": "..." }`,
    {
      service: z.string().describe("Service key (e.g., stripe, sendgrid, twilio, slack, crm, github, notion, airtable, openai, shopify, hubspot, supabase, discord, linear, resend, calendly, google_calendar, gmail, google_sheets, google_drive, jira, zendesk, mailchimp, zoom, microsoft, mongodb)"),
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

  // ─── disconnect_service ────────────────────────────────
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

  // ─── list_connections ──────────────────────────────────
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

  // ─── list_available_services ───────────────────────────
  server.tool(
    "list_available_services",
    "List all services that can be connected, grouped by category.",
    {},
    async () => {
      const services = listServices();
      const connected = new Set(connections.keys());

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

  // ─── get_service_info ──────────────────────────────────
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

  // ─── api_call ──────────────────────────────────────────
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
        // Execute through capability proxy (rate-limited, audited, zero-knowledge)
        const { response, data } = await proxy.call(service, endpoint, params || {});

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
  // WORKFLOW TOOLS (only if WorkflowRunner is available)
  // ============================================================

  if (workflowRunner) {
    // ─── run_workflow ──────────────────────────────────────
    server.tool(
      "run_workflow",
      `Execute a pre-defined .0n workflow file. Workflows are deterministic, step-by-step automations stored in ~/.0n/workflows/.

Unlike the 'execute' tool (which uses AI to interpret natural language), run_workflow executes a specific, pre-built automation with defined inputs and steps.

Examples:
- run_workflow({ workflow: "invoice-notify", inputs: { customer_email: "test@x.com", amount: 100 } })
- run_workflow({ workflow: "lead-scoring", inputs: { contactSource: "google", projectType: "kitchen" } })`,
      {
        workflow: z.string().describe("Workflow name (without .0n extension) or full file path"),
        inputs: z.record(z.any()).optional().describe("Input values for the workflow"),
      },
      async ({ workflow, inputs }) => {
        try {
          const result = await workflowRunner.run({ workflowPath: workflow, inputs: inputs || {} });

          return {
            content: [{
              type: "text",
              text: JSON.stringify({
                status: result.success ? "completed" : "failed",
                workflow: result.workflow,
                execution_id: result.executionId,
                steps_executed: result.stepsExecuted,
                steps_successful: result.stepsSuccessful,
                duration_ms: result.duration,
                outputs: result.outputs,
                errors: result.errors.length > 0 ? result.errors : undefined,
              }, null, 2),
            }],
          };
        } catch (err) {
          return {
            content: [{
              type: "text",
              text: JSON.stringify({ status: "failed", error: err.message }, null, 2),
            }],
          };
        }
      }
    );

    // ─── list_workflows ────────────────────────────────────
    server.tool(
      "list_workflows",
      "List all .0n workflow files deployed to ~/.0n/workflows/.",
      {},
      async () => {
        try {
          const workflows = workflowRunner.listWorkflows();
          return {
            content: [{
              type: "text",
              text: JSON.stringify({
                count: workflows.length,
                workflows,
              }, null, 2),
            }],
          };
        } catch (err) {
          return {
            content: [{
              type: "text",
              text: JSON.stringify({ error: err.message }, null, 2),
            }],
          };
        }
      }
    );
  }

  // ─── Reddit ────────────────────────────────────────────
  registerRedditTools(server, z, connections);
}
