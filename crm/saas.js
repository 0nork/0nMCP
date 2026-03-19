// ============================================================
// 0nMCP — CRM SaaS API Tool Definitions
// ============================================================
// Manage SaaS subscriptions, plans, rebilling, and sub-account
// provisioning. This is how 0nMCP sells products on the
// CRM marketplace — enable SaaS per location, manage plans,
// handle billing through Stripe integration.
// ============================================================

export default [
  // ── Plans ──────────────────────────────────────────────────

  {
    name: "crm_get_saas_agency_plans",
    description: "Get all SaaS plans for an agency/company. These are the subscription tiers offered to sub-accounts.",
    method: "GET",
    path: "/saas-api/public-api/agency-plans/:companyId",
    params: {
      companyId: { type: "string", description: "Agency/company ID", required: true, in: "path" },
    },
  },

  {
    name: "crm_get_saas_plan",
    description: "Get details of a specific SaaS plan by ID.",
    method: "GET",
    path: "/saas-api/public-api/saas-plan/:planId",
    params: {
      planId: { type: "string", description: "SaaS plan ID", required: true, in: "path" },
    },
  },

  // ── Enable/Disable SaaS ────────────────────────────────────

  {
    name: "crm_enable_saas_location",
    description: "Enable SaaS for a sub-account/location. This activates billing and plan management for that location.",
    method: "POST",
    path: "/saas-api/public-api/enable-saas/:locationId",
    params: {
      locationId: { type: "string", description: "Location/sub-account ID to enable SaaS for", required: true, in: "path" },
      planId: { type: "string", description: "SaaS plan ID to assign", required: true, in: "body" },
      stripeCustomerId: { type: "string", description: "Stripe customer ID for billing", required: false, in: "body" },
    },
    body: ["planId", "stripeCustomerId"],
  },

  {
    name: "crm_bulk_enable_saas",
    description: "Enable SaaS for multiple locations at once.",
    method: "POST",
    path: "/saas-api/public-api/bulk-enable-saas/:companyId",
    params: {
      companyId: { type: "string", description: "Agency/company ID", required: true, in: "path" },
      locationIds: { type: "array", description: "Array of location IDs to enable", required: true, in: "body" },
      planId: { type: "string", description: "SaaS plan ID to assign to all", required: true, in: "body" },
    },
    body: ["locationIds", "planId"],
  },

  {
    name: "crm_bulk_disable_saas",
    description: "Disable SaaS for multiple locations.",
    method: "POST",
    path: "/saas-api/public-api/bulk-disable-saas/:companyId",
    params: {
      companyId: { type: "string", description: "Agency/company ID", required: true, in: "path" },
      locationIds: { type: "array", description: "Array of location IDs to disable", required: true, in: "body" },
    },
    body: ["locationIds"],
  },

  // ── Subscriptions ──────────────────────────────────────────

  {
    name: "crm_get_saas_subscription",
    description: "Get SaaS subscription details for a location including plan, status, and billing info.",
    method: "GET",
    path: "/saas-api/public-api/get-saas-subscription/:locationId",
    params: {
      locationId: { type: "string", description: "Location ID", required: true, in: "path" },
    },
  },

  {
    name: "crm_update_saas_subscription",
    description: "Update a location's SaaS subscription — change plan, update billing, modify features.",
    method: "PUT",
    path: "/saas-api/public-api/update-saas-subscription/:locationId",
    params: {
      locationId: { type: "string", description: "Location ID", required: true, in: "path" },
      planId: { type: "string", description: "New plan ID", required: false, in: "body" },
      status: { type: "string", description: "Subscription status", required: false, in: "body" },
    },
    body: ["planId", "status"],
  },

  // ── Location Management ────────────────────────────────────

  {
    name: "crm_list_saas_locations",
    description: "List all SaaS-enabled locations for a company with their subscription status.",
    method: "GET",
    path: "/saas-api/public-api/saas-locations/:companyId",
    params: {
      companyId: { type: "string", description: "Agency/company ID", required: true, in: "path" },
    },
  },

  {
    name: "crm_get_saas_locations_by_stripe",
    description: "Get locations by Stripe customer ID with company ID.",
    method: "GET",
    path: "/saas-api/public-api/locations",
    params: {
      companyId: { type: "string", description: "Agency/company ID", required: true, in: "query" },
      stripeCustomerId: { type: "string", description: "Stripe customer ID", required: false, in: "query" },
    },
  },

  {
    name: "crm_pause_saas_location",
    description: "Pause a SaaS location — temporarily suspend billing and access.",
    method: "POST",
    path: "/saas-api/public-api/pause/:locationId",
    params: {
      locationId: { type: "string", description: "Location ID to pause", required: true, in: "path" },
      paused: { type: "boolean", description: "Whether to pause (true) or unpause (false)", required: true, in: "body" },
    },
    body: ["paused"],
  },

  // ── Rebilling ──────────────────────────────────────────────

  {
    name: "crm_update_saas_rebilling",
    description: "Update rebilling configuration for an agency — controls how sub-accounts are charged.",
    method: "POST",
    path: "/saas-api/public-api/update-rebilling/:companyId",
    params: {
      companyId: { type: "string", description: "Agency/company ID", required: true, in: "path" },
      enabled: { type: "boolean", description: "Enable/disable rebilling", required: false, in: "body" },
      markup: { type: "number", description: "Markup percentage on costs", required: false, in: "body" },
    },
    body: ["enabled", "markup"],
  },
]
