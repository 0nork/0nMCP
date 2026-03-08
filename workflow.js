// ============================================================
// 0nMCP — Workflow Runtime
// ============================================================
// Loads .0n workflow files and executes them step-by-step.
// Uses the 0n-spec template engine for variable resolution.
// ============================================================

import { readFileSync, readdirSync, existsSync } from "fs";
import { join } from "path";
import { randomUUID } from "crypto";
import { SERVICE_CATALOG } from "./catalog.js";
import { logExecution, WORKFLOWS_PATH } from "./connections.js";

// ── Template resolver (loaded dynamically) ───────────────

let resolveTemplate;

/**
 * Load the template resolver from 0n-spec (optional dependency).
 * Falls back to a minimal inline resolver if not available.
 */
async function loadResolver() {
  if (resolveTemplate) return;

  try {
    const spec = await import("0n-spec");
    if (spec.resolve) {
      resolveTemplate = spec.resolve;
      return;
    }
  } catch {
    // 0n-spec not installed as dependency — try local path
  }

  try {
    const { createRequire } = await import("module");
    const require = createRequire(import.meta.url);
    const spec = require("0n-spec");
    if (spec.resolve) {
      resolveTemplate = spec.resolve;
      return;
    }
  } catch {
    // Not available via require either
  }

  // Try loading resolve.js directly from sibling 0n-spec repo (development)
  try {
    const { createRequire } = await import("module");
    const { join } = await import("path");
    const { homedir } = await import("os");
    const require = createRequire(import.meta.url);
    const specResolve = require(join(homedir(), "Github", "0n-spec", "resolve.js"));
    if (specResolve.resolve) {
      resolveTemplate = specResolve.resolve;
      return;
    }
  } catch {
    // Local 0n-spec repo not available
  }

  // Minimal inline fallback — handles basic {{ref}} but no math/conditions
  resolveTemplate = function minimalResolve(template, context) {
    if (template == null) return template;
    if (Array.isArray(template)) return template.map(item => minimalResolve(item, context));
    if (typeof template === 'object') {
      const result = {};
      for (const [k, v] of Object.entries(template)) result[k] = minimalResolve(v, context);
      return result;
    }
    if (typeof template !== 'string') return template;

    const singleMatch = template.match(/^\{\{(.+?)\}\}$/);
    if (singleMatch) return resolveRef(singleMatch[1].trim(), context);

    return template.replace(/\{\{(.+?)\}\}/g, (_, expr) => {
      const val = resolveRef(expr.trim(), context);
      return val == null ? '' : String(val);
    });
  };

  function resolveRef(ref, ctx) {
    if (ref === 'now') return new Date().toISOString();
    if (ref === 'uuid') return randomUUID();
    if (ref.startsWith('env.')) return deepGet(ctx.env || process.env, ref.slice(4));
    if (ref.startsWith('inputs.')) return deepGet(ctx.inputs, ref.slice(7));
    const val = deepGet(ctx.steps, ref);
    if (val !== undefined) return val;
    return deepGet(ctx, ref);
  }

  function deepGet(obj, path) {
    if (!obj || !path) return undefined;
    const segs = path.replace(/\[(\d+)\]/g, '.$1').split('.');
    let cur = obj;
    for (const s of segs) {
      if (cur == null) return undefined;
      cur = cur[s];
    }
    return cur;
  }
}

// ── Compute expression evaluator ─────────────────────────

/**
 * Evaluate a compute expression. Handles:
 * - Numbers: 42 → 42
 * - Simple math strings: "30 + 35 + 25" → 90
 * - Ternary patterns: "((x ? 10 : 0) + (y ? 15 : 0))" → 25
 * - Passthrough: anything else returns as-is
 */
function evaluateComputeExpression(expr) {
  if (typeof expr === 'number') return expr;
  if (typeof expr !== 'string') return expr;

  const trimmed = expr.trim();

  // Simple number
  if (/^-?\d+(\.\d+)?$/.test(trimmed)) return parseFloat(trimmed);

  // Ternary expressions: (value ? trueVal : falseVal)
  // Common in scoring: ((email ? 10 : 0) + (phone ? 15 : 0))
  const ternaryRe = /\(([^()]*?)\s*\?\s*(-?\d+(?:\.\d+)?)\s*:\s*(-?\d+(?:\.\d+)?)\)/g;
  if (ternaryRe.test(trimmed)) {
    ternaryRe.lastIndex = 0;
    let resolved = trimmed;
    resolved = resolved.replace(ternaryRe, (_, condition, trueVal, falseVal) => {
      const cond = condition.trim();
      // Truthy: non-empty, non-"false", non-"null", non-"undefined", non-"0"
      const isTruthy = cond && cond !== 'false' && cond !== 'null' && cond !== 'undefined' && cond !== '0' && cond !== '';
      return isTruthy ? trueVal : falseVal;
    });
    // Now try to evaluate the remaining math
    return evaluateComputeExpression(resolved);
  }

  // Simple math: "30 + 35 + 25" or "(10 + 15 + 0)"
  // Strip outer parens
  let mathStr = trimmed.replace(/^\(+|\)+$/g, '').trim();
  // Only allow numbers, operators, spaces, parens, and decimal points
  if (/^[\d\s+\-*/().]+$/.test(mathStr)) {
    try {
      // Safe evaluation using Function constructor with no scope access
      // Only processes pre-validated strings containing only math chars
      const fn = new Function(`return (${mathStr});`);
      const val = fn();
      if (typeof val === 'number' && isFinite(val)) return val;
    } catch {
      // Fall through
    }
  }

  return trimmed;
}

// ── Internal action handlers ─────────────────────────────

export const INTERNAL_ACTIONS = {
  lookup(params) {
    const { table, key, value } = params;
    if (!table || !key) return { matched: false };
    const entry = table[key];
    return entry !== undefined ? { matched: true, value: entry } : { matched: false, key, value };
  },

  set(params) {
    return { ...params };
  },

  transform(params) {
    const { value, operation, ...rest } = params;
    switch (operation) {
      case 'uppercase': return { value: String(value).toUpperCase() };
      case 'lowercase': return { value: String(value).toLowerCase() };
      case 'trim':      return { value: String(value).trim() };
      case 'round':     return { value: Math.round(Number(value)) };
      case 'floor':     return { value: Math.floor(Number(value)) };
      case 'ceil':      return { value: Math.ceil(Number(value)) };
      case 'to_number': return { value: Number(value) };
      case 'to_string': return { value: String(value) };
      case 'split':     return { value: String(value).split(rest.delimiter || ',') };
      case 'join':      return { value: Array.isArray(value) ? value.join(rest.delimiter || ',') : String(value) };
      default:          return { value };
    }
  },

  compute(params) {
    const result = { ...params };

    // ── Pattern 1: Lookup table ── { lookup: { google: 30, ... }, key: "google", default: 0 }
    if (params.lookup && params.key !== undefined) {
      const val = params.lookup[params.key];
      result.value = val !== undefined ? val : (params.default || 0);
    }

    // ── Pattern 2: Expression ── { expression: "((x ? 10 : 0) + (y ? 15 : 0))" }
    if (params.expression !== undefined) {
      result.value = evaluateComputeExpression(params.expression);
    }

    // ── Pattern 3: Grade thresholds ── { total: "30 + 35 + 25", grade_thresholds: {A:80,...}, ... }
    if (params.grade_thresholds) {
      // Evaluate total: could be a number, or a string like "30 + 35 + 25"
      const total = evaluateComputeExpression(params.total);
      result.total = total;

      // Find grade — sort thresholds descending, first one where total >= threshold wins
      const sorted = Object.entries(params.grade_thresholds).sort((a, b) => b[1] - a[1]);
      let grade = sorted[sorted.length - 1]?.[0] || 'D';
      for (const [g, threshold] of sorted) {
        if (total >= threshold) { grade = g; break; }
      }
      result.grade = grade;

      if (params.priority_map) result.priority = params.priority_map[grade] || 'UNKNOWN';
      if (params.action_map) result.action = params.action_map[grade] || '';
    }

    return result;
  },

  condition(params) {
    return { result: Boolean(params.test) };
  },

  map(params) {
    const { value, mapping } = params;
    if (!mapping) return { value };
    return { value: mapping[value] !== undefined ? mapping[value] : (mapping._default !== undefined ? mapping._default : value) };
  },
};

// ── WorkflowRunner ───────────────────────────────────────

export class WorkflowRunner {
  /**
   * @param {import("./connections.js").ConnectionManager} connections
   */
  constructor(connections) {
    this.connections = connections;
    this._resolverReady = loadResolver();
  }

  /**
   * Run a .0n workflow.
   *
   * @param {object} opts
   * @param {string} [opts.workflowPath] — Name or full path to .0n file
   * @param {object} [opts.workflow] — Inline workflow definition
   * @param {object} [opts.inputs] — Input values
   * @returns {Promise<WorkflowResult>}
   */
  async run({ workflowPath, workflow, inputs = {} }) {
    await this._resolverReady;

    const startTime = Date.now();
    const executionId = `wf_${Date.now()}_${randomUUID().slice(0, 8)}`;

    // 1. Load workflow
    const wf = workflow || this._loadWorkflow(workflowPath);
    const workflowName = wf.$0n?.name || workflowPath || 'inline';

    // 2. Validate
    if (!wf.$0n || wf.$0n.type !== 'workflow') {
      throw new Error(`Invalid workflow: $0n.type must be "workflow", got "${wf.$0n?.type}"`);
    }
    if (!wf.steps || !Array.isArray(wf.steps) || wf.steps.length === 0) {
      throw new Error('Workflow has no steps');
    }

    // Validate required inputs
    if (wf.inputs) {
      for (const [key, schema] of Object.entries(wf.inputs)) {
        if (schema.required && (inputs[key] === undefined || inputs[key] === null)) {
          throw new Error(`Missing required input: ${key}`);
        }
      }
    }

    // 3. Build context
    const context = {
      inputs,
      steps: {},
      env: this._customEnv || process.env,
    };

    // 4. Execute steps
    const stepResults = [];
    const errors = [];

    for (const step of wf.steps) {
      const stepId = step.id || `step_${stepResults.length}`;

      // Evaluate conditions
      if (step.conditions) {
        const resolvedConditions = resolveTemplate(step.conditions, context);
        const shouldRun = Array.isArray(resolvedConditions)
          ? resolvedConditions.every(Boolean)
          : Boolean(resolvedConditions);

        if (!shouldRun) {
          stepResults.push({ id: stepId, status: 'skipped', service: step.service, action: step.action });
          continue;
        }
      }

      // Resolve params
      const resolvedParams = step.params ? resolveTemplate(step.params, context) : {};

      // Execute
      let result;
      try {
        if (step.operation && this._operations) {
          const opResult = await this._operations.execute(step.operation, resolvedParams, { connections: this.connections, env: context.env });
          result = { data: opResult };
        } else if (step.service === 'internal') {
          result = await this._executeInternal(step.action, resolvedParams);
        } else {
          result = await this._executeService(step.service, step.action, resolvedParams);
        }

        // Store output in context
        context.steps[stepId] = result.data || result;

        stepResults.push({
          id: stepId,
          status: 'completed',
          service: step.service,
          action: step.action,
          data: result.data || result,
        });
      } catch (err) {
        const errorInfo = { id: stepId, service: step.service, action: step.action, error: err.message };
        errors.push(errorInfo);

        // Honor error handling strategy
        const errorStrategy = step.error_handling?.on_error || wf.error_handling?.on_error || 'stop';

        if (errorStrategy === 'retry') {
          const maxRetries = step.error_handling?.retries || 3;
          const backoff = step.error_handling?.backoff_ms || 1000;
          let retrySuccess = false;

          for (let attempt = 1; attempt <= maxRetries; attempt++) {
            await new Promise(r => setTimeout(r, backoff * attempt));
            try {
              if (step.operation && this._operations) {
                const opResult = await this._operations.execute(step.operation, resolvedParams, { connections: this.connections, env: context.env });
                result = { data: opResult };
              } else if (step.service === 'internal') {
                result = await this._executeInternal(step.action, resolvedParams);
              } else {
                result = await this._executeService(step.service, step.action, resolvedParams);
              }
              context.steps[stepId] = result.data || result;
              stepResults.push({ id: stepId, status: 'completed', service: step.service, action: step.action, data: result.data || result });
              retrySuccess = true;
              errors.pop(); // Remove error since retry succeeded
              break;
            } catch {
              // Retry failed
            }
          }

          if (!retrySuccess) {
            stepResults.push({ id: stepId, status: 'failed', ...errorInfo });
            if (errorStrategy !== 'continue') break;
          }
        } else if (errorStrategy === 'continue') {
          stepResults.push({ id: stepId, status: 'failed', ...errorInfo });
          context.steps[stepId] = { error: err.message };
        } else {
          // stop (default)
          stepResults.push({ id: stepId, status: 'failed', ...errorInfo });
          break;
        }
      }
    }

    // 5. Resolve outputs
    const outputs = wf.outputs ? resolveTemplate(wf.outputs, context) : {};

    const duration = Date.now() - startTime;
    const successful = stepResults.filter(r => r.status === 'completed').length;

    // 6. Log execution
    logExecution({
      success: errors.length === 0,
      task: `workflow:${workflowName}`,
      startedAt: new Date(startTime).toISOString(),
      duration,
      steps: stepResults.map(r => ({
        service: r.service,
        endpoint: r.action,
        status: r.status,
        error: r.error || null,
      })),
      servicesUsed: [...new Set(stepResults.map(r => r.service).filter(Boolean))],
    });

    return {
      success: errors.length === 0,
      workflow: workflowName,
      executionId,
      stepsExecuted: stepResults.length,
      stepsSuccessful: successful,
      duration,
      outputs,
      steps: stepResults,
      errors,
    };
  }

  /**
   * Run a workflow with an OperationRegistry and custom environment.
   * Used by the Application Engine for executing application workflows.
   *
   * @param {object} opts
   * @param {object} opts.workflow — Inline workflow definition
   * @param {object} [opts.inputs] — Input values
   * @param {import("./engine/operations.js").OperationRegistry} [opts.operations] — Operation registry
   * @param {object} [opts.env] — Custom environment variables
   * @returns {Promise<object>}
   */
  async runWithOperations({ workflow, inputs = {}, operations, env }) {
    // Temporarily set operations and env on instance
    const prevOps = this._operations;
    const prevEnv = this._customEnv;
    this._operations = operations || null;
    this._customEnv = env || null;

    try {
      return await this.run({ workflow, inputs });
    } finally {
      this._operations = prevOps;
      this._customEnv = prevEnv;
    }
  }

  /**
   * List all .0n workflows in ~/.0n/workflows/.
   */
  listWorkflows() {
    if (!existsSync(WORKFLOWS_PATH)) return [];

    const files = readdirSync(WORKFLOWS_PATH);
    const workflows = [];

    for (const file of files) {
      if (!file.endsWith('.0n') && !file.endsWith('.0n.json')) continue;

      try {
        const filePath = join(WORKFLOWS_PATH, file);
        const data = JSON.parse(readFileSync(filePath, 'utf8'));

        if (!data.$0n || data.$0n.type !== 'workflow') continue;

        workflows.push({
          name: data.$0n.name || file.replace(/\.0n(\.json)?$/, ''),
          file,
          path: filePath,
          description: data.$0n.description || '',
          version: data.$0n.version || '1.0.0',
          steps: data.steps?.length || 0,
          trigger: data.trigger?.type || 'manual',
          inputs: data.inputs ? Object.keys(data.inputs) : [],
        });
      } catch {
        // Skip invalid files
      }
    }

    return workflows;
  }

  // ── Private methods ────────────────────────────────────

  /**
   * Load a .0n workflow file by name or path.
   */
  _loadWorkflow(nameOrPath) {
    if (!nameOrPath) throw new Error('No workflow specified');

    // Try as full path first
    if (nameOrPath.includes('/') || nameOrPath.includes('\\')) {
      if (!existsSync(nameOrPath)) {
        throw new Error(`Workflow file not found: ${nameOrPath}`);
      }
      return JSON.parse(readFileSync(nameOrPath, 'utf8'));
    }

    // Try in ~/.0n/workflows/ with various extensions
    const candidates = [
      join(WORKFLOWS_PATH, `${nameOrPath}.0n`),
      join(WORKFLOWS_PATH, `${nameOrPath}.0n.json`),
      join(WORKFLOWS_PATH, nameOrPath),
    ];

    for (const candidate of candidates) {
      if (existsSync(candidate)) {
        return JSON.parse(readFileSync(candidate, 'utf8'));
      }
    }

    throw new Error(`Workflow not found: ${nameOrPath}. Searched in ${WORKFLOWS_PATH}`);
  }

  /**
   * Execute an internal action (no API call).
   */
  async _executeInternal(action, params) {
    const handler = INTERNAL_ACTIONS[action];
    if (!handler) {
      throw new Error(`Unknown internal action: ${action}. Available: ${Object.keys(INTERNAL_ACTIONS).join(', ')}`);
    }
    return { data: handler(params) };
  }

  /**
   * Execute a service API call.
   * The conversion layer auto-enriches params from connection metadata.
   * If a CRM call needs locationId and the workflow didn't provide it,
   * we pull it from the .0n connection file. The connection IS the context.
   */
  async _executeService(service, action, params) {
    const catalog = SERVICE_CATALOG[service];
    if (!catalog) {
      throw new Error(`Unknown service: ${service}`);
    }

    // Resolve endpoint name via conversion layer
    const endpointKey = this._resolveEndpoint(catalog, action);
    const ep = catalog.endpoints[endpointKey];
    if (!ep) {
      throw new Error(`No endpoint found for ${service}.${action}. Available: ${Object.keys(catalog.endpoints).join(', ')}`);
    }

    const creds = this.connections.getCredentials(service);
    if (!creds) {
      throw new Error(`Service ${service} not connected. Use connect_service first.`);
    }

    // ── Auto-enrich: inject connection metadata into params ──
    // The .0n connection file has meta (locationId, pipelineId, etc.)
    // If the workflow didn't provide them, we fill them in automatically.
    // This is the universal connector — 0nMCP knows your context.
    const enrichedParams = this._enrichFromConnection(service, params, endpointKey);

    // Build URL
    let url = catalog.baseUrl + ep.path;
    const allParams = { ...creds, ...enrichedParams };
    url = url.replace(/\{(\w+)\}/g, (_, key) => allParams[key] || `{${key}}`);

    // Build headers
    const headers = catalog.authHeader(creds);
    const options = { method: ep.method, headers };

    // Build body
    if (ep.method !== "GET" && enrichedParams) {
      const contentType = ep.contentType || "application/json";
      if (contentType === "application/x-www-form-urlencoded") {
        headers["Content-Type"] = "application/x-www-form-urlencoded";
        const flat = {};
        for (const [k, v] of Object.entries(enrichedParams)) {
          if (typeof v !== "object") flat[k] = String(v);
        }
        options.body = new URLSearchParams(flat).toString();
      } else {
        headers["Content-Type"] = "application/json";
        options.body = JSON.stringify(enrichedParams);
      }
    }

    // Query string for GET
    if (ep.method === "GET" && enrichedParams) {
      const flat = {};
      for (const [k, v] of Object.entries(enrichedParams)) {
        if (typeof v !== "object") flat[k] = String(v);
      }
      const qs = new URLSearchParams(flat).toString();
      if (qs) url += (url.includes("?") ? "&" : "?") + qs;
    }

    const response = await fetch(url, options);
    const data = await response.json().catch(() => ({ status: response.status, statusText: response.statusText }));

    if (!response.ok) {
      throw new Error(`${service}.${action} failed (${response.status}): ${JSON.stringify(data)}`);
    }

    return { data, status: response.status };
  }

  /**
   * Read the raw .0n connection file to get the full meta block.
   * The ConnectionManager strips meta during load — we need it back.
   */
  _getConnectionMeta(service) {
    try {
      const conn = this.connections.get(service);
      if (!conn?._filePath) return {};
      const raw = JSON.parse(readFileSync(conn._filePath, 'utf8'));
      return raw.meta || raw.metadata || {};
    } catch {
      return {};
    }
  }

  /**
   * Auto-enrich params from connection metadata.
   * The .0n connection file IS the context. If a workflow step needs
   * locationId, pipelineId, projectRef, etc. and didn't provide them,
   * we inject them from the connection. This is the universal connector.
   *
   * Smart injection: only adds fields the endpoint actually needs.
   * locationId goes everywhere for CRM. pipelineId/stageId only for opportunities.
   */
  _enrichFromConnection(service, params, endpointKey) {
    const meta = this._getConnectionMeta(service);
    if (!meta || Object.keys(meta).length === 0) return params;

    const enriched = { ...params };

    // ── CRM auto-injection ──
    if (service === 'crm') {
      // locationId is universal — every CRM endpoint needs it
      if (!enriched.locationId && meta.location_id) enriched.locationId = meta.location_id;

      // pipelineId ONLY for opportunity endpoints, stageId mapped to pipelineStageId
      const isOpportunity = endpointKey && (endpointKey.includes('opportunity') || endpointKey.includes('pipeline'));
      if (isOpportunity) {
        if (!enriched.pipelineId && meta.pipeline_id) enriched.pipelineId = meta.pipeline_id;
        if (!enriched.pipelineStageId && !enriched.stageId && meta.stages?.free) enriched.pipelineStageId = meta.stages.free;
        // CRM API uses pipelineStageId, not stageId — convert if workflow used stageId
        if (enriched.stageId && !enriched.pipelineStageId) {
          enriched.pipelineStageId = enriched.stageId;
          delete enriched.stageId;
        }
      }
    }

    // ── Supabase auto-injection ──
    if (service === 'supabase') {
      if (!enriched.projectRef && meta.project_ref) enriched.projectRef = meta.project_ref;
    }

    return enriched;
  }

  /**
   * Resolve a dot-notation action (e.g., "customers.search") to a catalog endpoint key.
   * Uses the ACTION_ALIASES conversion layer first, then falls back to fuzzy matching.
   * The .0n file format is the standard — our system converts to match.
   */
  _resolveEndpoint(catalog, action) {
    const endpoints = catalog.endpoints;

    // 0. Conversion layer: check ACTION_ALIASES first
    const alias = ACTION_ALIASES[action];
    if (alias && endpoints[alias]) return alias;

    // 1. Direct match: action === endpoint key
    if (endpoints[action]) return action;

    // 2. Dot notation: "customers.search" → "search_customers"
    if (action.includes('.')) {
      const [resource, verb] = action.split('.');
      const reversed = `${verb}_${resource}`;
      if (endpoints[reversed]) return reversed;

      // Try singular: "customers.create" → "create_customer"
      const singular = resource.endsWith('s') ? resource.slice(0, -1) : resource;
      const reversedSingular = `${verb}_${singular}`;
      if (endpoints[reversedSingular]) return reversedSingular;
    }

    // 3. Underscore join: "create_customer" from "create" + "customer"
    // Try action as-is with underscores
    const underscored = action.replace(/\./g, '_');
    if (endpoints[underscored]) return underscored;

    // 4. Substring match: find any endpoint containing the action
    for (const key of Object.keys(endpoints)) {
      if (key.includes(action) || action.includes(key)) return key;
    }

    // 5. No match
    return action;
  }
}

// ============================================================
// ACTION_ALIASES — Conversion Layer
// ============================================================
// Maps standard .0n action names to catalog endpoint keys.
// The .0n format is the standard — our catalog adapts to it.
// Partners write intuitive action names; this layer translates.
// ============================================================

const ACTION_ALIASES = {

  // ── CRM ─────────────────────────────────────────────────
  // Contacts
  "contacts.create":        "create_contact",
  "contacts.upsert":        "create_contact",
  "contacts.search":        "search_contacts",
  "contacts.get":           "get_contact",
  "contacts.update":        "update_contact",
  "contacts.delete":        "delete_contact",
  "contacts.find":          "search_contacts",
  "contacts.lookup":        "search_contacts",
  "contacts.createTask":    "create_contact",      // TODO: add create_task endpoint to catalog
  "contacts.addToWorkflow": "list_workflows",       // TODO: add add_to_workflow endpoint to catalog
  "contacts.addTag":        "create_tag",
  "contacts.removeTag":     "delete_contact",       // TODO: add remove_tag endpoint

  // Opportunities / Deals
  "opportunities.create":   "create_opportunity",
  "opportunities.update":   "create_opportunity",   // TODO: add update_opportunity endpoint
  "opportunities.list":     "list_pipelines",
  "opportunities.get":      "list_pipelines",
  "deals.create":           "create_opportunity",
  "deals.update":           "create_opportunity",

  // Pipelines
  "pipelines.create":       "create_pipeline",
  "pipelines.list":         "list_pipelines",

  // Tags
  "tags.create":            "create_tag",
  "tags.list":              "list_tags",
  "tags.add":               "create_tag",

  // Custom Values / Fields
  "customValues.create":    "create_custom_value",
  "customValues.list":      "list_custom_values",
  "customFields.create":    "create_custom_value",
  "customFields.list":      "list_custom_values",

  // Workflows
  "workflows.list":         "list_workflows",
  "workflows.get":          "list_workflows",

  // Calendars
  "calendars.list":         "list_calendars",
  "calendars.get":          "list_calendars",

  // ── Stripe ──────────────────────────────────────────────
  "customers.create":       "create_customer",
  "customers.list":         "list_customers",
  "customers.get":          "get_customer",
  "charges.create":         "create_charge",
  "invoices.create":        "create_invoice",
  "invoices.send":          "send_invoice",
  "invoices.list":          "list_invoices",
  "subscriptions.create":   "create_subscription",
  "subscriptions.cancel":   "cancel_subscription",
  "subscriptions.list":     "list_subscriptions",
  "balance.get":            "get_balance",
  "payments.list":          "list_payments",
  "products.create":        "create_product",
  "products.list":          "list_products",
  "prices.create":          "create_price",
  "prices.list":            "list_prices",
  "checkout.create":        "create_checkout_session",
  "payment_intents.create": "create_payment_intent",

  // ── Supabase ────────────────────────────────────────────
  "insert":                 "insert_row",
  "select":                 "query_table",
  "update":                 "update_row",
  "delete":                 "delete_row",
  "query":                  "query_table",
  "table.insert":           "insert_row",
  "table.query":            "query_table",
  "table.select":           "query_table",
  "table.update":           "update_row",
  "table.delete":           "delete_row",
  "rows.insert":            "insert_row",
  "rows.query":             "query_table",
  "rows.update":            "update_row",
  "rows.delete":            "delete_row",
  "auth.listUsers":         "list_users",
  "storage.listBuckets":    "list_buckets",

  // ── Slack ───────────────────────────────────────────────
  "chat.postMessage":       "send_message",
  "chat.send":              "send_message",
  "post":                   "send_message",
  "postMessage":            "send_message",
  "channels.list":          "list_channels",
  "users.list":             "list_users",
  "channels.create":        "create_channel",

  // ── SendGrid ────────────────────────────────────────────
  "mail.send":              "send_email",
  "email.send":             "send_email",
  "contacts.add":           "add_contact",
  "lists.list":             "list_contacts",

  // ── Discord ─────────────────────────────────────────────
  "messages.send":          "send_message",
  "channels.get":           "list_channels",

  // ── Twilio ──────────────────────────────────────────────
  "sms.send":               "send_sms",
  "messages.create":        "send_sms",
  "calls.create":           "make_call",

  // ── GitHub ──────────────────────────────────────────────
  "repos.list":             "list_repos",
  "repos.get":              "get_repo",
  "repos.create":           "create_repo",
  "issues.create":          "create_issue",
  "issues.list":            "list_issues",
  "pulls.create":           "create_pull",
  "pulls.list":             "list_pulls",

  // ── Shopify ─────────────────────────────────────────────
  "products.list":          "list_products",
  "products.get":           "get_product",
  "products.create":        "create_product",
  "orders.list":            "list_orders",
  "orders.get":             "get_order",
  "customers.list":         "list_customers",

  // ── OpenAI ──────────────────────────────────────────────
  "chat.completions":       "create_completion",
  "completions.create":     "create_completion",
  "embeddings.create":      "create_embedding",
  "images.generate":        "create_image",

  // ── Anthropic ───────────────────────────────────────────
  "messages.create":        "create_message",
  "chat.create":            "create_message",

  // ── Gmail ───────────────────────────────────────────────
  "messages.send":          "send_email",
  "messages.list":          "list_emails",
  "messages.get":           "get_email",

  // ── Google Sheets ───────────────────────────────────────
  "sheets.get":             "get_sheet",
  "sheets.update":          "update_cells",
  "rows.append":            "append_row",
  "values.get":             "get_values",
  "values.update":          "update_cells",

  // ── Google Drive ────────────────────────────────────────
  "files.list":             "list_files",
  "files.get":              "get_file",
  "files.create":           "upload_file",
  "files.upload":           "upload_file",

  // ── Airtable ────────────────────────────────────────────
  "records.list":           "list_records",
  "records.create":         "create_record",
  "records.update":         "update_record",
  "records.delete":         "delete_record",

  // ── Notion ──────────────────────────────────────────────
  "pages.create":           "create_page",
  "pages.get":              "get_page",
  "databases.query":        "query_database",
  "blocks.get":             "get_block",

  // ── MongoDB ─────────────────────────────────────────────
  "documents.find":         "find_documents",
  "documents.insert":       "insert_document",
  "documents.update":       "update_document",
  "documents.delete":       "delete_document",
  "collections.list":       "list_collections",

  // ── HubSpot ─────────────────────────────────────────────
  "contacts.create":        "create_contact",
  "contacts.list":          "list_contacts",
  "contacts.get":           "get_contact",
  "contacts.search":        "search_contacts",
  "deals.create":           "create_deal",
  "companies.create":       "create_company",

  // ── Mailchimp ───────────────────────────────────────────
  "lists.list":             "list_audiences",
  "members.add":            "add_member",
  "members.list":           "list_members",
  "campaigns.create":       "create_campaign",
  "campaigns.send":         "send_campaign",

  // ── Google Calendar ─────────────────────────────────────
  "events.list":            "list_events",
  "events.create":          "create_event",
  "events.get":             "get_event",
  "calendars.list":         "list_calendars",

  // ── Calendly ────────────────────────────────────────────
  "events.list":            "list_events",
  "event_types.list":       "list_event_types",
  "invitees.list":          "list_invitees",

  // ── Zoom ────────────────────────────────────────────────
  "meetings.create":        "create_meeting",
  "meetings.list":          "list_meetings",
  "meetings.get":           "get_meeting",
  "users.list":             "list_users",

  // ── Zendesk ─────────────────────────────────────────────
  "tickets.create":         "create_ticket",
  "tickets.list":           "list_tickets",
  "tickets.update":         "update_ticket",
  "users.create":           "create_user",
  "users.list":             "list_users",

  // ── Jira ────────────────────────────────────────────────
  "issues.create":          "create_issue",
  "issues.get":             "get_issue",
  "issues.search":          "search_issues",
  "projects.list":          "list_projects",

  // ── Linear ──────────────────────────────────────────────
  "issues.create":          "create_issue",
  "issues.list":            "list_issues",
  "teams.list":             "list_teams",
  "projects.list":          "list_projects",

  // ── Microsoft ───────────────────────────────────────────
  "mail.send":              "send_email",
  "mail.list":              "list_emails",
  "calendar.events":        "list_events",
  "files.list":             "list_files",

  // ── ListKit (Partner) ───────────────────────────────────
  // ListKit has no API — these aliases map ListKit field
  // conventions to our CRM/Supabase actions so .0n files
  // written for ListKit data work seamlessly.
  "leads.import":           "create_contact",
  "leads.enrich":           "update_contact",
  "leads.score":            "create_contact",
  "leads.export":           "query_table",
  "list.complete":          "insert_row",
};

