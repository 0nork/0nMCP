// ============================================================
// 0nMCP — CRM Tools Index
// ============================================================
// Orchestrates registration of all CRM API tools.
// ~240+ tools across 12 category modules.
//
// Architecture:
//   crm/helpers.js   — Data-driven tool factory
//   crm/auth.js      — OAuth & custom-logic tools
//   crm/*.js         — Category modules (export tool definitions)
//   crm/index.js     — This file (wires everything together)
// ============================================================

import { registerTools, crmHeaders, CRM_API_BASE, API_VERSION } from "./helpers.js";
import { registerAuthTools } from "./auth.js";

// Category modules — each exports a default array of tool definitions
import contacts from "./contacts.js";
import conversations from "./conversations.js";
import calendars from "./calendars.js";
import opportunities from "./opportunities.js";
import invoices from "./invoices.js";
import payments from "./payments.js";
import products from "./products.js";
import locations from "./locations.js";
import social from "./social.js";
import users from "./users.js";
import objects from "./objects.js";

// Re-export definitions + helpers for external consumers (e.g. CRM bridges)
export {
  contacts,
  conversations,
  calendars,
  opportunities,
  invoices,
  payments,
  products,
  locations,
  social,
  users,
  objects,
  crmHeaders,
  CRM_API_BASE,
  API_VERSION,
  registerTools,
};

/**
 * Register ALL CRM tools on the MCP server.
 * @param {import("@modelcontextprotocol/sdk/server/mcp.js").McpServer} server
 * @param {import("zod")} z
 * @param {import("../capability-proxy.js").CapabilityProxy} [proxy]
 */
export function registerCrmTools(server, z, proxy) {
  // 1. Auth & custom-logic tools (OAuth, snapshot deploy, workflow process)
  registerAuthTools(server, z);

  // 2. Data-driven tools by category
  const categories = [
    { name: "Contacts", defs: contacts },
    { name: "Conversations", defs: conversations },
    { name: "Calendars", defs: calendars },
    { name: "Opportunities", defs: opportunities },
    { name: "Invoices", defs: invoices },
    { name: "Payments", defs: payments },
    { name: "Products", defs: products },
    { name: "Locations", defs: locations },
    { name: "Social & Blogs", defs: social },
    { name: "Users & Forms", defs: users },
    { name: "Objects & Misc", defs: objects },
  ];

  let totalTools = 5; // auth tools count
  for (const cat of categories) {
    registerTools(server, z, cat.defs, proxy);
    totalTools += cat.defs.length;
  }

  // Log tool count on stderr (visible in MCP server logs, not in tool output)
  console.error(`[0nMCP] Registered ${totalTools} CRM tools across ${categories.length + 1} categories`);
}
