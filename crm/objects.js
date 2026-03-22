// ============================================================
// 0nMCP — CRM Objects, Associations, Email, Workflows,
//         Snapshots, Trigger Links, Campaigns, Courses & SaaS
// ============================================================
// Data-driven tool definitions for the CRM extended APIs.
// Covers custom objects & records, associations, email builder,
// workflows, snapshots, trigger links, campaigns, courses /
// memberships, and SaaS rebilling management.
// ============================================================

export default [
  // ── Custom Objects — Schemas ────────────────────────────────

  {
    name: "crm_list_object_schemas",
    description: "List all custom object schemas for a CRM location.",
    method: "GET",
    path: "/objects/schemas",
    params: {
      locationId: { type: "string", description: "Location / sub-account ID", required: true, in: "query" },
    },
    query: ["locationId"],
    body: [],
  },

  {
    name: "crm_get_object_schema",
    description: "Get a single custom object schema by its key.",
    method: "GET",
    path: "/objects/schemas/:schemaKey",
    params: {
      schemaKey: { type: "string", description: "Unique key identifying the custom object schema", required: true, in: "path" },
    },
    query: [],
    body: [],
  },

  {
    name: "crm_create_object_schema",
    description: "Create a new custom object schema. Define fields, searchable fields, primary display field, and icon.",
    method: "POST",
    path: "/objects/schemas",
    params: {
      locationId: { type: "string", description: "Location / sub-account ID", required: true, in: "body" },
      labels: { type: "object", description: "Label configuration object with singular and plural display names", required: true, in: "body" },
      key: { type: "string", description: "Unique key for the schema (lowercase, no spaces)", required: true, in: "body" },
      description: { type: "string", description: "Human-readable description of the custom object", required: false, in: "body" },
      fields: { type: "array", description: "Array of field definition objects for the schema", required: true, in: "body" },
      searchableFields: { type: "array", description: "Array of field keys that should be searchable", required: false, in: "body" },
      primaryDisplayField: { type: "string", description: "Field key used as the primary display value for records", required: false, in: "body" },
      icon: { type: "string", description: "Icon identifier for the custom object", required: false, in: "body" },
    },
    query: [],
    body: ["locationId", "labels", "key", "description", "fields", "searchableFields", "primaryDisplayField", "icon"],
  },

  {
    name: "crm_update_object_schema",
    description: "Update an existing custom object schema by its key.",
    method: "PUT",
    path: "/objects/schemas/:schemaKey",
    params: {
      schemaKey: { type: "string", description: "Unique key identifying the custom object schema", required: true, in: "path" },
      labels: { type: "object", description: "Label configuration object with singular and plural display names", required: false, in: "body" },
      description: { type: "string", description: "Human-readable description of the custom object", required: false, in: "body" },
      fields: { type: "array", description: "Array of field definition objects for the schema", required: false, in: "body" },
      searchableFields: { type: "array", description: "Array of field keys that should be searchable", required: false, in: "body" },
      primaryDisplayField: { type: "string", description: "Field key used as the primary display value for records", required: false, in: "body" },
      icon: { type: "string", description: "Icon identifier for the custom object", required: false, in: "body" },
    },
    query: [],
    body: ["labels", "description", "fields", "searchableFields", "primaryDisplayField", "icon"],
  },

  // ── Custom Objects — Records ────────────────────────────────

  {
    name: "crm_list_object_records",
    description: "List records for a custom object schema. Supports filtering, search, pagination, and sorting.",
    method: "GET",
    path: "/objects/:schemaKey/records",
    params: {
      schemaKey: { type: "string", description: "Custom object schema key", required: true, in: "path" },
      locationId: { type: "string", description: "Location / sub-account ID", required: true, in: "query" },
      query: { type: "string", description: "Free-text search query to filter records", required: false, in: "query" },
      limit: { type: "number", description: "Max number of records to return", required: false, in: "query" },
      offset: { type: "number", description: "Number of records to skip for pagination", required: false, in: "query" },
      order: { type: "string", description: "Sort order (asc or desc)", required: false, in: "query" },
      orderBy: { type: "string", description: "Field key to sort records by", required: false, in: "query" },
      startAfter: { type: "string", description: "Cursor value to start listing after (keyset pagination)", required: false, in: "query" },
      searchAfter: { type: "string", description: "Search-after cursor for deep pagination", required: false, in: "query" },
      filters: { type: "string", description: "JSON-encoded filter conditions for record properties", required: false, in: "query" },
    },
    query: ["locationId", "query", "limit", "offset", "order", "orderBy", "startAfter", "searchAfter", "filters"],
    body: [],
  },

  {
    name: "crm_get_object_record",
    description: "Get a single custom object record by schema key and record ID.",
    method: "GET",
    path: "/objects/:schemaKey/records/:recordId",
    params: {
      schemaKey: { type: "string", description: "Custom object schema key", required: true, in: "path" },
      recordId: { type: "string", description: "The record ID to retrieve", required: true, in: "path" },
    },
    query: [],
    body: [],
  },

  {
    name: "crm_create_object_record",
    description: "Create a new record for a custom object schema.",
    method: "POST",
    path: "/objects/:schemaKey/records",
    params: {
      schemaKey: { type: "string", description: "Custom object schema key", required: true, in: "path" },
      locationId: { type: "string", description: "Location / sub-account ID", required: true, in: "body" },
      properties: { type: "object", description: "Key-value map of field values for the record", required: true, in: "body" },
      associations: { type: "array", description: "Array of association objects linking this record to other records or contacts", required: false, in: "body" },
      owners: { type: "array", description: "Array of user IDs who own this record", required: false, in: "body" },
    },
    query: [],
    body: ["locationId", "properties", "associations", "owners"],
  },

  {
    name: "crm_update_object_record",
    description: "Update an existing custom object record by schema key and record ID.",
    method: "PUT",
    path: "/objects/:schemaKey/records/:recordId",
    params: {
      schemaKey: { type: "string", description: "Custom object schema key", required: true, in: "path" },
      recordId: { type: "string", description: "The record ID to update", required: true, in: "path" },
      properties: { type: "object", description: "Key-value map of field values to update", required: false, in: "body" },
      associations: { type: "array", description: "Array of association objects to set on this record", required: false, in: "body" },
      owners: { type: "array", description: "Array of user IDs who own this record", required: false, in: "body" },
    },
    query: [],
    body: ["properties", "associations", "owners"],
  },

  {
    name: "crm_delete_object_record",
    description: "Permanently delete a custom object record by schema key and record ID.",
    method: "DELETE",
    path: "/objects/:schemaKey/records/:recordId",
    params: {
      schemaKey: { type: "string", description: "Custom object schema key", required: true, in: "path" },
      recordId: { type: "string", description: "The record ID to delete", required: true, in: "path" },
    },
    query: [],
    body: [],
  },

  // ── Associations ────────────────────────────────────────────

  // crm_list_associations — defined in funnels.js
  // crm_create_association — defined in funnels.js

  // ── Email Builder ───────────────────────────────────────────

  {
    name: "crm_list_emails",
    description: "List saved emails with optional search, type filter, pagination, and date sorting.",
    method: "GET",
    path: "/emails/",
    params: {
      locationId: { type: "string", description: "Location / sub-account ID", required: true, in: "query" },
      limit: { type: "number", description: "Max number of emails to return", required: false, in: "query" },
      offset: { type: "number", description: "Number of emails to skip for pagination", required: false, in: "query" },
      search: { type: "string", description: "Search query to filter emails by name or subject", required: false, in: "query" },
      type: { type: "string", description: "Filter by email type (e.g. html, template)", required: false, in: "query" },
      sortByDate: { type: "string", description: "Sort direction by date (asc or desc)", required: false, in: "query" },
    },
    query: ["locationId", "limit", "offset", "search", "type", "sortByDate"],
    body: [],
  },

  {
    name: "crm_save_email",
    description: "Save or build a new email template in the CRM email builder.",
    method: "POST",
    path: "/emails/",
    params: {
      locationId: { type: "string", description: "Location / sub-account ID", required: true, in: "body" },
      name: { type: "string", description: "Internal name for the email", required: true, in: "body" },
      subject: { type: "string", description: "Email subject line", required: true, in: "body" },
      preheaderText: { type: "string", description: "Preview text shown in inbox before opening the email", required: false, in: "body" },
      html: { type: "string", description: "Full HTML content of the email", required: false, in: "body" },
      templateData: { type: "object", description: "Structured template data for the drag-and-drop email builder", required: false, in: "body" },
      source: { type: "string", description: "Source identifier for the email template", required: false, in: "body" },
      type: { type: "string", description: "Email type (e.g. html, template)", required: false, in: "body" },
    },
    query: [],
    body: ["locationId", "name", "subject", "preheaderText", "html", "templateData", "source", "type"],
  },

  {
    name: "crm_get_email",
    description: "Get a single email by its ID, including full HTML content and template data.",
    method: "GET",
    path: "/emails/:emailId",
    params: {
      emailId: { type: "string", description: "The email ID to retrieve", required: true, in: "path" },
    },
    query: [],
    body: [],
  },

  {
    name: "crm_update_email",
    description: "Update an existing email by its ID.",
    method: "PUT",
    path: "/emails/:emailId",
    params: {
      emailId: { type: "string", description: "The email ID to update", required: true, in: "path" },
      name: { type: "string", description: "Internal name for the email", required: false, in: "body" },
      subject: { type: "string", description: "Email subject line", required: false, in: "body" },
      preheaderText: { type: "string", description: "Preview text shown in inbox before opening the email", required: false, in: "body" },
      html: { type: "string", description: "Full HTML content of the email", required: false, in: "body" },
      templateData: { type: "object", description: "Structured template data for the drag-and-drop email builder", required: false, in: "body" },
      source: { type: "string", description: "Source identifier for the email template", required: false, in: "body" },
      type: { type: "string", description: "Email type (e.g. html, template)", required: false, in: "body" },
    },
    query: [],
    body: ["name", "subject", "preheaderText", "html", "templateData", "source", "type"],
  },

  {
    name: "crm_delete_email",
    description: "Delete an email by its ID.",
    method: "DELETE",
    path: "/emails/:emailId",
    params: {
      emailId: { type: "string", description: "The email ID to delete", required: true, in: "path" },
      locationId: { type: "string", description: "Location / sub-account ID", required: true, in: "query" },
    },
    query: ["locationId"],
    body: [],
  },

  {
    name: "crm_verify_email",
    description: "Verify an email address for sending within the CRM.",
    method: "POST",
    path: "/emails/verify",
    params: {
      locationId: { type: "string", description: "Location / sub-account ID", required: true, in: "body" },
      type: { type: "string", description: "Verification type", required: true, in: "body" },
      verify: { type: "string", description: "The email address to verify", required: true, in: "body" },
    },
    query: [],
    body: ["locationId", "type", "verify"],
  },

  // ── Workflows ───────────────────────────────────────────────

  {
    name: "crm_list_workflows",
    description: "List all workflows for a CRM location.",
    method: "GET",
    path: "/workflows/",
    params: {
      locationId: { type: "string", description: "Location / sub-account ID", required: true, in: "query" },
    },
    query: ["locationId"],
    body: [],
  },

  {
    name: "crm_get_workflow",
    description: "Get a single workflow by its ID, including trigger and action details.",
    method: "GET",
    path: "/workflows/:workflowId",
    params: {
      workflowId: { type: "string", description: "The workflow ID to retrieve", required: true, in: "path" },
    },
    query: [],
    body: [],
  },

  // ── Snapshots ───────────────────────────────────────────────

  // crm_list_snapshots — defined in funnels.js
  // crm_create_snapshot_share_link — defined in funnels.js
  // crm_get_snapshot_push_status — defined in funnels.js

  // ── Trigger Links ───────────────────────────────────────────

  {
    name: "crm_list_trigger_links",
    description: "List all trigger links for a CRM location.",
    method: "GET",
    path: "/links/",
    params: {
      locationId: { type: "string", description: "Location / sub-account ID", required: true, in: "query" },
    },
    query: ["locationId"],
    body: [],
  },

  {
    name: "crm_create_trigger_link",
    description: "Create a new trigger link that fires automations when clicked.",
    method: "POST",
    path: "/links/",
    params: {
      locationId: { type: "string", description: "Location / sub-account ID", required: true, in: "body" },
      name: { type: "string", description: "Display name for the trigger link", required: true, in: "body" },
      redirectTo: { type: "string", description: "URL to redirect the user to after clicking the link", required: true, in: "body" },
    },
    query: [],
    body: ["locationId", "name", "redirectTo"],
  },

  {
    name: "crm_update_trigger_link",
    description: "Update an existing trigger link by its ID.",
    method: "PUT",
    path: "/links/:linkId",
    params: {
      linkId: { type: "string", description: "The trigger link ID to update", required: true, in: "path" },
      name: { type: "string", description: "Display name for the trigger link", required: false, in: "body" },
      redirectTo: { type: "string", description: "URL to redirect the user to after clicking the link", required: false, in: "body" },
    },
    query: [],
    body: ["name", "redirectTo"],
  },

  {
    name: "crm_delete_trigger_link",
    description: "Delete a trigger link by its ID.",
    method: "DELETE",
    path: "/links/:linkId",
    params: {
      linkId: { type: "string", description: "The trigger link ID to delete", required: true, in: "path" },
    },
    query: [],
    body: [],
  },

  // ── Campaigns ───────────────────────────────────────────────

  {
    name: "crm_list_campaigns",
    description: "List all campaigns for a CRM location, optionally filtered by status.",
    method: "GET",
    path: "/campaigns/",
    params: {
      locationId: { type: "string", description: "Location / sub-account ID", required: true, in: "query" },
      status: { type: "string", description: "Filter by campaign status", required: false, in: "query" },
    },
    query: ["locationId", "status"],
    body: [],
  },

  // ── Courses / Memberships ───────────────────────────────────

  {
    name: "crm_list_courses_exporters",
    description: "Export all courses and membership data for a CRM location.",
    method: "POST",
    path: "/courses/courses-exporter",
    params: {
      locationId: { type: "string", description: "Location / sub-account ID", required: true, in: "body" },
    },
    query: [],
    body: ["locationId"],
  },

  {
    name: "crm_import_courses",
    description: "Import courses and membership data into a CRM location.",
    method: "POST",
    path: "/courses/courses-importer",
    params: {
      locationId: { type: "string", description: "Location / sub-account ID", required: true, in: "body" },
      courses: { type: "array", description: "Array of course objects to import", required: true, in: "body" },
    },
    query: [],
    body: ["locationId", "courses"],
  },

  // ── SaaS / Rebilling ────────────────────────────────────────

  {
    name: "crm_saas_get_locations",
    description: "Get SaaS-enabled locations for a CRM company, optionally filtered by customer or subscription.",
    method: "GET",
    path: "/saas-api/public-api/locations",
    params: {
      companyId: { type: "string", description: "Company / agency ID", required: true, in: "query" },
      customerId: { type: "string", description: "Stripe customer ID to filter by", required: false, in: "query" },
      subscriptionId: { type: "string", description: "Stripe subscription ID to filter by", required: false, in: "query" },
    },
    query: ["companyId", "customerId", "subscriptionId"],
    body: [],
  },

  {
    name: "crm_saas_update_rebilling",
    description: "Update rebilling configuration for a SaaS-enabled CRM location.",
    method: "PUT",
    path: "/saas-api/public-api/update-rebilling",
    params: {
      companyId: { type: "string", description: "Company / agency ID", required: true, in: "body" },
      locationId: { type: "string", description: "Location / sub-account ID", required: true, in: "body" },
      config: { type: "object", description: "Rebilling configuration object with pricing and billing settings", required: true, in: "body" },
    },
    query: [],
    body: ["companyId", "locationId", "config"],
  },

  {
    name: "crm_saas_enable",
    description: "Enable SaaS mode for a CRM location with Stripe billing details.",
    method: "POST",
    path: "/saas-api/public-api/enable",
    params: {
      companyId: { type: "string", description: "Company / agency ID", required: true, in: "body" },
      locationId: { type: "string", description: "Location / sub-account ID to enable SaaS for", required: true, in: "body" },
      stripeAccountId: { type: "string", description: "Connected Stripe account ID", required: true, in: "body" },
      name: { type: "string", description: "Name for the SaaS subscription", required: true, in: "body" },
      email: { type: "string", description: "Email address for billing", required: true, in: "body" },
      stripeCustomerId: { type: "string", description: "Stripe customer ID for the location", required: false, in: "body" },
      companyPlan: { type: "object", description: "Company plan configuration object", required: false, in: "body" },
    },
    query: [],
    body: ["companyId", "locationId", "stripeAccountId", "name", "email", "stripeCustomerId", "companyPlan"],
  },

  {
    name: "crm_saas_pause",
    description: "Pause or unpause a SaaS-enabled CRM location.",
    method: "POST",
    path: "/saas-api/public-api/pause",
    params: {
      companyId: { type: "string", description: "Company / agency ID", required: true, in: "body" },
      locationId: { type: "string", description: "Location / sub-account ID to pause or unpause", required: true, in: "body" },
      paused: { type: "boolean", description: "Set true to pause the location, false to unpause", required: true, in: "body" },
    },
    query: [],
    body: ["companyId", "locationId", "paused"],
  },

  {
    name: "crm_saas_bulk_disable",
    description: "Bulk disable SaaS mode for multiple CRM locations at once.",
    method: "PUT",
    path: "/saas-api/public-api/bulk-disable-saas",
    params: {
      companyId: { type: "string", description: "Company / agency ID", required: true, in: "body" },
      locationIds: { type: "array", description: "Array of location IDs to disable SaaS for", required: true, in: "body" },
    },
    query: [],
    body: ["companyId", "locationIds"],
  },
];
