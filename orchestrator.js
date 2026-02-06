// ============================================================
// 0nMCP — AI Orchestrator (.0n Standard)
// ============================================================
// The brain. Takes natural language tasks, plans execution
// across connected services, and executes the plan.
//
// Uses Anthropic Claude for intelligent planning when
// ANTHROPIC_API_KEY is set. Falls back to keyword matching.
//
// Logs all executions to ~/.0n/history/ per the .0n spec.
// ============================================================

import { SERVICE_CATALOG } from "./catalog.js";
import { logExecution } from "./connections.js";

// ── Capability keywords for fallback matching ─────────────
const CAPABILITY_KEYWORDS = {
  send_email:       ["email", "send email", "mail", "message to", "notify via email"],
  send_sms:         ["sms", "text", "send text", "text message", "send sms"],
  create_customer:  ["create customer", "new customer", "add customer"],
  create_charge:    ["charge", "payment", "pay", "bill"],
  create_invoice:   ["invoice", "send invoice", "bill for"],
  get_balance:      ["balance", "how much", "account balance"],
  send_message:     ["slack", "post to", "send message", "notify channel", "discord"],
  create_contact:   ["create contact", "new contact", "add contact", "new lead"],
  manage_pipelines: ["pipeline", "create pipeline", "sales pipeline"],
  manage_tags:      ["tag", "create tag", "add tag"],
  create_issue:     ["issue", "bug", "create issue", "github issue"],
  generate_text:    ["generate", "write", "compose", "draft", "ai generate"],
  generate_image:   ["image", "picture", "generate image", "create image"],
  manage_records:   ["airtable", "record", "add record", "create record"],
  search:           ["search", "find", "look up", "query"],
  manage_events:    ["calendar", "event", "meeting", "appointment", "schedule", "book"],
  manage_orders:    ["order", "orders", "shopify order"],
  manage_products:  ["product", "products", "create product"],
};

export class Orchestrator {
  /**
   * @param {import("./connections.js").ConnectionManager} connectionManager
   */
  constructor(connectionManager) {
    this.connections = connectionManager;
    this.anthropic = null;

    // Dynamically import Anthropic SDK if key is available
    if (process.env.ANTHROPIC_API_KEY) {
      import("@anthropic-ai/sdk").then(({ default: Anthropic }) => {
        this.anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
      }).catch(() => {
        // SDK not installed — fallback mode
      });
    }
  }

  // ── Main entry point ──────────────────────────────────
  /**
   * Execute a natural language task across connected services.
   * @param {string} task - Natural language description of what to do
   * @returns {Promise<object>} Execution result with summary
   */
  async execute(task) {
    const connected = this.connections.list();
    if (connected.length === 0) {
      return {
        success: false,
        error: "No services connected. Use connect_service to add integrations first.",
        suggestion: "Try: connect_service with service='stripe' and your API key.",
      };
    }

    const startTime = Date.now();

    try {
      // Build execution plan
      const plan = this.anthropic
        ? await this._aiPlan(task, connected)
        : this._fallbackPlan(task, connected);

      if (!plan || !plan.steps || plan.steps.length === 0) {
        return {
          success: false,
          error: "Could not determine how to accomplish this task with connected services.",
          connected_services: connected.map(c => c.name),
          suggestion: "Try being more specific, or connect additional services.",
        };
      }

      // Execute each step
      const results = [];
      const context = {}; // Pass data between steps

      for (const step of plan.steps) {
        const result = await this._executeStep(step, context);
        results.push(result);

        // Store result in context for subsequent steps
        if (result.success && result.data) {
          context[step.label || step.endpoint || `step_${results.length}`] = result.data;
        }

        // Stop on critical failure
        if (!result.success && step.critical !== false) {
          break;
        }
      }

      const duration = Date.now() - startTime;
      const successful = results.filter(r => r.success).length;
      const servicesUsed = [...new Set(results.map(r => r.service))];

      // Generate summary
      const summary = this.anthropic
        ? await this._aiSummarize(task, results)
        : this._fallbackSummarize(task, results);

      const result = {
        success: successful === results.length,
        message: summary,
        details: {
          stepsExecuted: results.length,
          stepsSuccessful: successful,
          duration,
          servicesUsed,
          plan: plan.steps.map(s => `${s.service}:${s.endpoint}`),
        },
        results,
      };

      // Log to ~/.0n/history/
      logExecution({
        success: result.success,
        task,
        startedAt: new Date(Date.now() - duration).toISOString(),
        duration,
        steps: results.map(r => ({
          service: r.service,
          endpoint: r.endpoint,
          status: r.success ? "completed" : "failed",
          error: r.error || null,
        })),
        servicesUsed,
      });

      return result;

    } catch (err) {
      logExecution({
        success: false,
        task,
        startedAt: new Date(startTime).toISOString(),
        duration: Date.now() - startTime,
        error: err.message,
      });

      return {
        success: false,
        error: err.message,
        duration: Date.now() - startTime,
      };
    }
  }

  // ── AI Planning (Anthropic Claude) ────────────────────
  async _aiPlan(task, connected) {
    const serviceContext = connected.map(conn => {
      const catalog = SERVICE_CATALOG[conn.key];
      if (!catalog) return null;
      return {
        key: conn.key,
        name: catalog.name,
        type: catalog.type,
        capabilities: catalog.capabilities.map(c => c.name + ": " + c.description),
        endpoints: Object.keys(catalog.endpoints),
      };
    }).filter(Boolean);

    const prompt = `You are an API orchestrator. Given a user's task and available connected services, create an execution plan.

CONNECTED SERVICES:
${JSON.stringify(serviceContext, null, 2)}

USER TASK: "${task}"

Return a JSON object with this exact structure (no markdown, no code fences, just raw JSON):
{
  "steps": [
    {
      "service": "service_key",
      "endpoint": "endpoint_name",
      "params": { ... },
      "label": "short_description",
      "critical": true
    }
  ]
}

Rules:
- Only use services that are connected
- Only use endpoints that exist in the service
- Order steps logically (create before reference)
- Set critical=false for optional steps
- Include all necessary params for each endpoint
- If data from a previous step is needed, use {{step_label.field}} placeholder`;

    try {
      const response = await this.anthropic.messages.create({
        model: "claude-sonnet-4-20250514",
        max_tokens: 2048,
        messages: [{ role: "user", content: prompt }],
      });

      const text = response.content[0]?.text || "";
      // Extract JSON from response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    } catch (err) {
      console.error("AI planning failed, falling back:", err.message);
    }

    // Fallback
    return this._fallbackPlan(task, connected);
  }

  // ── Fallback Planning (keyword matching) ──────────────
  _fallbackPlan(task, connected) {
    const taskLower = task.toLowerCase();
    const steps = [];
    const connectedKeys = new Set(connected.map(c => c.key));

    for (const [capability, keywords] of Object.entries(CAPABILITY_KEYWORDS)) {
      const matched = keywords.some(kw => taskLower.includes(kw));
      if (!matched) continue;

      // Find a connected service with this capability
      for (const [serviceKey, service] of Object.entries(SERVICE_CATALOG)) {
        if (!connectedKeys.has(serviceKey)) continue;

        const hasCap = service.capabilities.some(c => c.name === capability || c.name.includes(capability));
        if (!hasCap) continue;

        // Find best endpoint
        const endpointKey = this._matchEndpoint(service.endpoints, capability, taskLower);
        if (endpointKey) {
          steps.push({
            service: serviceKey,
            endpoint: endpointKey,
            params: this._extractParams(taskLower, service.endpoints[endpointKey]),
            label: capability,
            critical: true,
          });
        }
        break; // Use first matching service
      }
    }

    return { steps };
  }

  // ── Step Execution ────────────────────────────────────
  async _executeStep(step, context) {
    const service = SERVICE_CATALOG[step.service];
    if (!service) {
      return { success: false, service: step.service, error: `Unknown service: ${step.service}` };
    }

    const endpoint = service.endpoints[step.endpoint];
    if (!endpoint) {
      return { success: false, service: step.service, error: `Unknown endpoint: ${step.endpoint}` };
    }

    const creds = this.connections.getCredentials(step.service);
    if (!creds) {
      return { success: false, service: step.service, error: `Service ${step.service} not connected` };
    }

    try {
      // Build URL
      let url = service.baseUrl + endpoint.path;

      // Substitute path params from step.params and credentials
      const allParams = { ...creds, ...step.params };
      url = url.replace(/\{(\w+)\}/g, (_, key) => allParams[key] || `{${key}}`);

      // Substitute context references {{label.field}}
      if (step.params) {
        const paramsStr = JSON.stringify(step.params);
        const resolved = paramsStr.replace(/\{\{(\w+)\.(\w+)\}\}/g, (_, label, field) => {
          return context[label]?.[field] || "";
        });
        step.params = JSON.parse(resolved);
      }

      // Build headers
      const headers = service.authHeader(creds);

      // Build request options
      const options = { method: endpoint.method, headers };

      if (endpoint.method !== "GET" && step.params) {
        const contentType = endpoint.contentType || "application/json";
        if (contentType === "application/x-www-form-urlencoded") {
          headers["Content-Type"] = "application/x-www-form-urlencoded";
          options.body = new URLSearchParams(this._flattenParams(step.params)).toString();
        } else {
          headers["Content-Type"] = "application/json";
          options.body = JSON.stringify(step.params);
        }
      }

      // Add query params for GET requests
      if (endpoint.method === "GET" && step.params) {
        const queryStr = new URLSearchParams(this._flattenParams(step.params)).toString();
        if (queryStr) url += (url.includes("?") ? "&" : "?") + queryStr;
      }

      // Execute
      const response = await fetch(url, options);
      const data = await response.json().catch(() => ({ status: response.status }));

      return {
        success: response.ok,
        service: step.service,
        endpoint: step.endpoint,
        label: step.label,
        statusCode: response.status,
        data,
      };

    } catch (err) {
      return {
        success: false,
        service: step.service,
        endpoint: step.endpoint,
        error: err.message,
      };
    }
  }

  // ── AI Summary ────────────────────────────────────────
  async _aiSummarize(task, results) {
    try {
      const response = await this.anthropic.messages.create({
        model: "claude-sonnet-4-20250514",
        max_tokens: 512,
        messages: [{
          role: "user",
          content: `Summarize the result of this task in 1-2 sentences. Be concise and direct.

Task: "${task}"
Results: ${JSON.stringify(results.map(r => ({ service: r.service, endpoint: r.endpoint, success: r.success, error: r.error })))}`,
        }],
      });
      return response.content[0]?.text || this._fallbackSummarize(task, results);
    } catch {
      return this._fallbackSummarize(task, results);
    }
  }

  // ── Fallback Summary ──────────────────────────────────
  _fallbackSummarize(task, results) {
    const successful = results.filter(r => r.success).length;
    const total = results.length;
    const services = [...new Set(results.map(r => r.service))].join(", ");

    if (successful === total) {
      return `Completed: ${total} step${total > 1 ? "s" : ""} executed successfully via ${services}.`;
    } else if (successful > 0) {
      return `Partially completed: ${successful}/${total} steps succeeded via ${services}.`;
    } else {
      const errors = results.map(r => r.error).filter(Boolean).join("; ");
      return `Failed: ${errors}`;
    }
  }

  // ── Helpers ───────────────────────────────────────────

  _matchEndpoint(endpoints, capability, task) {
    // Try exact match
    for (const key of Object.keys(endpoints)) {
      if (key.includes(capability) || capability.includes(key.replace(/_/g, " "))) {
        return key;
      }
    }
    // Try keyword match from task
    for (const key of Object.keys(endpoints)) {
      const words = key.split("_");
      if (words.some(w => task.includes(w) && w.length > 3)) {
        return key;
      }
    }
    return Object.keys(endpoints)[0]; // Default to first endpoint
  }

  _extractParams(task, endpoint) {
    const params = {};
    // Extract email addresses
    const emailMatch = task.match(/[\w.-]+@[\w.-]+\.\w+/);
    if (emailMatch) params.email = emailMatch[0];

    // Extract phone numbers
    const phoneMatch = task.match(/\+?[\d\s()-]{10,}/);
    if (phoneMatch) params.phone = phoneMatch[0].trim();

    // Extract dollar amounts
    const amountMatch = task.match(/\$[\d,.]+/);
    if (amountMatch) params.amount = parseFloat(amountMatch[0].replace(/[$,]/g, ""));

    // Extract names (capitalized words after "to" or "for")
    const nameMatch = task.match(/(?:to|for)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/);
    if (nameMatch) params.name = nameMatch[1];

    return params;
  }

  _flattenParams(obj, prefix = "") {
    const flat = {};
    for (const [key, value] of Object.entries(obj)) {
      const fullKey = prefix ? `${prefix}[${key}]` : key;
      if (typeof value === "object" && value !== null && !Array.isArray(value)) {
        Object.assign(flat, this._flattenParams(value, fullKey));
      } else {
        flat[fullKey] = String(value);
      }
    }
    return flat;
  }
}
