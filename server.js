// ============================================================
// 0nMCP — HTTP Server
// ============================================================
// Express server exposing MCP over HTTP, REST API endpoints,
// and webhook receivers for workflow triggers.
//
// Routes:
//   POST/GET/DELETE /mcp    — MCP protocol over HTTP
//   GET  /api/health        — Health check
//   POST /api/execute       — Natural language execution
//   POST /api/run           — Workflow execution
//   GET  /api/workflows     — List deployed workflows
//   POST /webhooks/:id      — Webhook trigger → workflow execution
// ============================================================

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { ConnectionManager } from "./connections.js";
import { Orchestrator } from "./orchestrator.js";
import { WorkflowRunner } from "./workflow.js";
import { registerAllTools } from "./tools.js";
import { registerCrmTools } from "./crm/index.js";
import { registerVaultTools, autoUnseal } from "./vault/index.js";
import { unsealedCache } from "./vault/cache.js";
import { registerEngineTools } from "./engine/index.js";
import { z } from "zod";
import {
  verifyStripeSignature,
  verifyCrmSignature,
  verifySlackSignature,
  verifyGitHubSignature,
  verifyShopifySignature,
  verifyHmac,
} from "./webhooks.js";

/**
 * Create a fully configured Express app (for embedding or testing).
 * @returns {{ app: Express, connections, orchestrator, workflowRunner }}
 */
export async function createApp() {
  // Dynamic import to keep express optional at module level
  let express;
  try {
    // Express is available as transitive dep from MCP SDK
    express = (await import("express")).default;
  } catch {
    throw new Error("express is required for HTTP server mode. Install with: npm install express");
  }

  const connections = new ConnectionManager();
  connections._vaultCache = unsealedCache;
  const orchestrator = new Orchestrator(connections);
  const workflowRunner = new WorkflowRunner(connections);

  const app = express();

  // Auto-unseal vault if passphrase is set
  const vaultResult = autoUnseal();
  if (vaultResult.unsealed.length > 0) {
    console.log(`Vault: auto-unsealed ${vaultResult.unsealed.length} connection(s)`);
  }

  // ── Raw body capture for webhooks (before json parsing) ──
  app.use("/webhooks", express.raw({ type: "*/*" }));
  app.use(express.json());

  // ── MCP over HTTP ─────────────────────────────────────────
  // Per-session transport map
  const sessions = new Map();

  app.all("/mcp", async (req, res) => {
    try {
      // Check for existing session
      const sessionId = req.headers["mcp-session-id"];

      if (req.method === "GET" || req.method === "DELETE") {
        const transport = sessions.get(sessionId);
        if (!transport) {
          res.status(400).json({ error: "No active session" });
          return;
        }
        await transport.handleRequest(req, res);
        if (req.method === "DELETE") sessions.delete(sessionId);
        return;
      }

      // POST — new or existing session
      if (sessionId && sessions.has(sessionId)) {
        await sessions.get(sessionId).handleRequest(req, res);
        return;
      }

      // New session
      const transport = new StreamableHTTPServerTransport({ sessionIdGenerator: () => crypto.randomUUID() });
      const server = new McpServer({ name: "0nMCP", version: "1.6.0" });
      registerAllTools(server, connections, orchestrator, workflowRunner);
      registerCrmTools(server, z);
      registerVaultTools(server, z);
      registerEngineTools(server, z);

      await server.connect(transport);

      // Store session after connection (transport now has sessionId)
      transport.onclose = () => {
        if (transport.sessionId) sessions.delete(transport.sessionId);
      };

      await transport.handleRequest(req, res);

      if (transport.sessionId) {
        sessions.set(transport.sessionId, transport);
      }
    } catch (err) {
      if (!res.headersSent) {
        res.status(500).json({ error: err.message });
      }
    }
  });

  // ── REST API ──────────────────────────────────────────────

  app.get("/api/health", (req, res) => {
    res.json({
      status: "ok",
      name: "0nMCP",
      version: "1.6.0",
      uptime: process.uptime(),
      connections: connections.count(),
      workflows: workflowRunner.listWorkflows().length,
      sessions: sessions.size,
    });
  });

  app.post("/api/execute", async (req, res) => {
    const { task } = req.body;
    if (!task) {
      res.status(400).json({ error: "Missing 'task' in request body" });
      return;
    }

    try {
      const result = await orchestrator.execute(task);
      res.json(result);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post("/api/run", async (req, res) => {
    const { workflow, inputs } = req.body;
    if (!workflow) {
      res.status(400).json({ error: "Missing 'workflow' in request body" });
      return;
    }

    try {
      const result = await workflowRunner.run({ workflowPath: workflow, inputs: inputs || {} });
      res.json(result);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get("/api/workflows", (req, res) => {
    try {
      const workflows = workflowRunner.listWorkflows();
      res.json({ count: workflows.length, workflows });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // ── Webhook Receiver ──────────────────────────────────────

  app.post("/webhooks/:workflowId", async (req, res) => {
    const { workflowId } = req.params;

    try {
      // Load the workflow to check trigger config
      const workflows = workflowRunner.listWorkflows();
      const meta = workflows.find(w =>
        w.name === workflowId ||
        w.file === `${workflowId}.0n` ||
        w.file === `${workflowId}.0n.json`
      );

      if (!meta) {
        res.status(404).json({ error: `Workflow not found: ${workflowId}` });
        return;
      }

      // Load full workflow for trigger config
      const { readFileSync } = await import("fs");
      const wfData = JSON.parse(readFileSync(meta.path, "utf8"));
      const trigger = wfData.trigger || {};

      // Verify webhook signature if configured
      if (trigger.config?.verify) {
        const rawBody = Buffer.isBuffer(req.body) ? req.body.toString("utf8") : JSON.stringify(req.body);
        const verified = verifyWebhook(trigger.config.verify, rawBody, req.headers, trigger.config.secret);

        if (!verified.verified) {
          res.status(401).json({ error: "Webhook signature verification failed", detail: verified.error });
          return;
        }
      }

      // Parse body if it was captured as raw buffer
      const inputs = Buffer.isBuffer(req.body) ? JSON.parse(req.body.toString("utf8")) : req.body;

      // Execute workflow with webhook payload as inputs
      const result = await workflowRunner.run({
        workflowPath: meta.path,
        inputs: inputs || {},
      });

      res.json({
        status: result.success ? "completed" : "failed",
        execution_id: result.executionId,
        workflow: result.workflow,
        steps_executed: result.stepsExecuted,
        duration_ms: result.duration,
        outputs: result.outputs,
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  return { app, connections, orchestrator, workflowRunner };
}

/**
 * Dispatch webhook verification based on provider type.
 */
function verifyWebhook(provider, rawBody, headers, secret) {
  if (!secret) return { verified: true }; // No secret configured = skip verification

  switch (provider) {
    case "stripe":
      return verifyStripeSignature(rawBody, headers["stripe-signature"] || "", secret);
    case "github":
      return verifyGitHubSignature(rawBody, headers["x-hub-signature-256"] || "", secret);
    case "slack":
      return verifySlackSignature(rawBody, headers["x-slack-signature"] || "", headers["x-slack-request-timestamp"] || "", secret);
    case "shopify":
      return verifyShopifySignature(rawBody, headers["x-shopify-hmac-sha256"] || "", secret);
    case "crm":
      return verifyCrmSignature(rawBody, headers["x-crm-signature"] || "", secret);
    case "generic":
    default:
      return verifyHmac(rawBody, headers["x-webhook-signature"] || headers["x-signature"] || "", secret);
  }
}

/**
 * Start the HTTP server.
 * @param {{ port?: number, host?: string }} options
 */
export async function startServer({ port = 3000, host = "0.0.0.0" } = {}) {
  const { app, connections, orchestrator, workflowRunner } = await createApp();

  return new Promise((resolve) => {
    const server = app.listen(port, host, () => {
      const addr = server.address();
      console.log(`
  ┌─────────────────────────────────────────────┐
  │             0nMCP HTTP Server                │
  │                                              │
  │  MCP:        http://${host}:${port}/mcp          │
  │  Health:     http://${host}:${port}/api/health   │
  │  Execute:    POST /api/execute               │
  │  Run:        POST /api/run                   │
  │  Workflows:  GET  /api/workflows             │
  │  Webhooks:   POST /webhooks/:id              │
  │                                              │
  │  Connections: ${String(connections.count()).padEnd(3)} services connected       │
  │  Workflows:   ${String(workflowRunner.listWorkflows().length).padEnd(3)} deployed                 │
  └─────────────────────────────────────────────┘
`);
      resolve({ server, app, connections, orchestrator, workflowRunner });
    });
  });
}
