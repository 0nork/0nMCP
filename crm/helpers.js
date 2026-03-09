// ============================================================
// 0nMCP — CRM Tool Factory
// ============================================================
// Data-driven helper to create MCP tools from config objects.
// Reduces boilerplate across 200+ CRM API tools.
// ============================================================

const CRM_API_BASE = "https://services.leadconnectorhq.com";
const API_VERSION = "2021-07-28";

export function crmHeaders(accessToken) {
  return {
    Authorization: `Bearer ${accessToken}`,
    "Content-Type": "application/json",
    Version: API_VERSION,
  };
}

/**
 * Register an array of tool definitions on the MCP server.
 *
 * Each definition is a plain object:
 * {
 *   name: "crm_get_contact",
 *   description: "Get a contact by ID.",
 *   method: "GET",
 *   path: "/contacts/:contactId",
 *   params: {
 *     contactId: { type: "string", description: "Contact ID", required: true },
 *   },
 *   query: ["locationId"],      // keys forwarded as ?key=val for GET
 *   body: ["email", "phone"],   // keys sent in JSON body for POST/PUT/PATCH
 * }
 *
 * Every tool automatically receives `access_token` (required) and
 * `location_id` (optional) parameters.
 */
export function registerTools(server, z, definitions, proxy) {
  for (const def of definitions) {
    const schema = buildSchema(z, def);

    server.tool(def.name, def.description, schema, async (args) => {
      try {
        const headers = crmHeaders(args.access_token);
        let url = CRM_API_BASE + def.path;

        // Substitute path params — :contactId, :id, etc.
        url = url.replace(/:(\w+)/g, (_, key) => {
          // Check camelCase param first, then snake_case
          return args[key] ?? args[toSnake(key)] ?? `:${key}`;
        });

        // Query string
        if (def.method === "GET" || def.query) {
          const qKeys = def.query || [];
          // For GET, also include location_id if path doesn't contain it
          if (args.location_id && !url.includes(args.location_id)) {
            qKeys.push("locationId");
          }
          const qs = new URLSearchParams();
          for (const key of qKeys) {
            const val = args[key] ?? args[toCamel(key)] ?? args[toSnake(key)];
            if (val !== undefined && val !== null) qs.append(key, String(val));
          }
          // Also forward locationId
          if (args.location_id && !qs.has("locationId")) {
            qs.append("locationId", args.location_id);
          }
          const qsStr = qs.toString();
          if (qsStr) url += (url.includes("?") ? "&" : "?") + qsStr;
        }

        const options = { method: def.method, headers };

        // Body for non-GET
        if (def.method !== "GET") {
          const bodyKeys = def.body || [];
          const bodyObj = {};
          // Include location_id / locationId in body if specified
          if (args.location_id) bodyObj.locationId = args.location_id;
          for (const key of bodyKeys) {
            const val = args[key] ?? args[toCamel(key)] ?? args[toSnake(key)];
            if (val !== undefined) bodyObj[key] = val;
          }
          // Also include any params marked as body-eligible
          for (const [pKey, pDef] of Object.entries(def.params || {})) {
            if (pDef.in === "body" && args[pKey] !== undefined) {
              bodyObj[pKey] = args[pKey];
            }
          }
          if (Object.keys(bodyObj).length > 0) {
            options.body = JSON.stringify(bodyObj);
          }
        }

        // Execute through capability proxy (rate-limited, audited)
        // CRM tools receive access_token per-call from AI client, not from ConnectionManager
        const { response: res, data } = proxy
          ? await proxy.callWithCredentials("crm", def.name, url, options)
          : await fetch(url, options).then(async r => ({
              response: r,
              data: await r.json().catch(() => ({ status: r.status, statusText: r.statusText })),
            }));

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(
                { success: res.ok, status: res.status, data },
                null,
                2
              ),
            },
          ],
        };
      } catch (err) {
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({ error: err.message }, null, 2),
            },
          ],
        };
      }
    });
  }
}

// ── Schema builder ──────────────────────────────────────────

function buildSchema(z, def) {
  const schema = {
    access_token: z.string().describe("CRM access token"),
  };

  // Most tools need location_id
  if (def.needsLocation !== false) {
    schema.location_id = z
      .string()
      .optional()
      .describe("CRM sub-account location ID");
  }

  for (const [key, pDef] of Object.entries(def.params || {})) {
    let field;
    switch (pDef.type) {
      case "number":
        field = z.number();
        break;
      case "boolean":
        field = z.boolean();
        break;
      case "object":
        field = z.record(z.any());
        break;
      case "array":
        field = z.array(z.any());
        break;
      case "array_string":
        field = z.array(z.string());
        break;
      default:
        field = z.string();
    }
    if (pDef.description) field = field.describe(pDef.description);
    if (!pDef.required) field = field.optional();
    schema[key] = field;
  }

  return schema;
}

// ── Utility ─────────────────────────────────────────────────

function toCamel(str) {
  return str.replace(/_([a-z])/g, (_, c) => c.toUpperCase());
}

function toSnake(str) {
  return str.replace(/[A-Z]/g, (c) => "_" + c.toLowerCase());
}

export { CRM_API_BASE, API_VERSION };
