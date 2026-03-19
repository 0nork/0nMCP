// ============================================================
// 0nMCP — CRM Funnels & Forms & Surveys Tool Definitions
// ============================================================

export default [
  // ── Funnels ────────────────────────────────────────────────

  { name: "crm_list_funnels", description: "List all funnels for a location.", method: "GET", path: "/funnels/funnel/list",
    params: { locationId: { type: "string", description: "Location ID", required: true, in: "query" }, limit: { type: "number", description: "Results per page", required: false, in: "query" }, offset: { type: "number", description: "Offset", required: false, in: "query" } } },

  { name: "crm_list_funnel_pages", description: "List all pages across funnels for a location.", method: "GET", path: "/funnels/page",
    params: { locationId: { type: "string", description: "Location ID", required: true, in: "query" }, funnelId: { type: "string", description: "Filter by funnel ID", required: false, in: "query" }, limit: { type: "number", description: "Results per page", required: false, in: "query" }, offset: { type: "number", description: "Offset", required: false, in: "query" } } },

  { name: "crm_count_funnel_pages", description: "Get count of funnel pages for a location.", method: "GET", path: "/funnels/page/count",
    params: { locationId: { type: "string", description: "Location ID", required: true, in: "query" }, funnelId: { type: "string", description: "Filter by funnel ID", required: false, in: "query" } } },

  { name: "crm_create_redirect", description: "Create a URL redirect/trigger link.", method: "POST", path: "/funnels/lookup/redirect",
    params: { locationId: { type: "string", description: "Location ID", required: true, in: "body" }, target: { type: "string", description: "Target URL", required: true, in: "body" }, domain: { type: "string", description: "Domain", required: false, in: "body" }, path: { type: "string", description: "Path slug", required: false, in: "body" } },
    body: ["locationId", "target", "domain", "path"] },

  { name: "crm_list_redirects", description: "List all redirects for a location.", method: "GET", path: "/funnels/lookup/redirect/list",
    params: { locationId: { type: "string", description: "Location ID", required: true, in: "query" }, limit: { type: "number", description: "Results", required: false, in: "query" }, offset: { type: "number", description: "Offset", required: false, in: "query" } } },

  { name: "crm_update_redirect", description: "Update a redirect by ID.", method: "PATCH", path: "/funnels/lookup/redirect/:id",
    params: { id: { type: "string", description: "Redirect ID", required: true, in: "path" }, target: { type: "string", description: "New target URL", required: false, in: "body" } },
    body: ["target"] },

  { name: "crm_delete_redirect", description: "Delete a redirect by ID.", method: "DELETE", path: "/funnels/lookup/redirect/:id",
    params: { id: { type: "string", description: "Redirect ID", required: true, in: "path" } } },

  // ── Forms ──────────────────────────────────────────────────

  { name: "crm_list_forms", description: "List all forms for a location.", method: "GET", path: "/forms/",
    params: { locationId: { type: "string", description: "Location ID", required: true, in: "query" }, limit: { type: "number", description: "Results", required: false, in: "query" }, skip: { type: "number", description: "Skip", required: false, in: "query" }, type: { type: "string", description: "Form type filter", required: false, in: "query" } } },

  { name: "crm_list_form_submissions", description: "List form submissions with filters.", method: "GET", path: "/forms/submissions",
    params: { locationId: { type: "string", description: "Location ID", required: true, in: "query" }, formId: { type: "string", description: "Filter by form ID", required: false, in: "query" }, startAt: { type: "string", description: "Start date ISO", required: false, in: "query" }, endAt: { type: "string", description: "End date ISO", required: false, in: "query" }, limit: { type: "number", description: "Results", required: false, in: "query" }, page: { type: "number", description: "Page", required: false, in: "query" } } },

  // ── Surveys ────────────────────────────────────────────────

  { name: "crm_list_surveys", description: "List all surveys for a location.", method: "GET", path: "/surveys/",
    params: { locationId: { type: "string", description: "Location ID", required: true, in: "query" }, limit: { type: "number", description: "Results", required: false, in: "query" }, skip: { type: "number", description: "Skip", required: false, in: "query" }, type: { type: "string", description: "Survey type filter", required: false, in: "query" } } },

  { name: "crm_list_survey_submissions", description: "List survey submissions with filters.", method: "GET", path: "/surveys/submissions",
    params: { locationId: { type: "string", description: "Location ID", required: true, in: "query" }, surveyId: { type: "string", description: "Filter by survey ID", required: false, in: "query" }, startAt: { type: "string", description: "Start date ISO", required: false, in: "query" }, endAt: { type: "string", description: "End date ISO", required: false, in: "query" }, limit: { type: "number", description: "Results", required: false, in: "query" }, page: { type: "number", description: "Page", required: false, in: "query" } } },

  // ── Associations ───────────────────────────────────────────

  { name: "crm_list_associations", description: "List all associations for a location.", method: "GET", path: "/associations/",
    params: { locationId: { type: "string", description: "Location ID", required: true, in: "query" } } },

  { name: "crm_create_association", description: "Create a new association between object types.", method: "POST", path: "/associations/",
    params: { locationId: { type: "string", description: "Location ID", required: true, in: "body" }, key: { type: "string", description: "Association key name", required: true, in: "body" }, fromObjectKey: { type: "string", description: "Source object key", required: true, in: "body" }, toObjectKey: { type: "string", description: "Target object key", required: true, in: "body" } },
    body: ["locationId", "key", "fromObjectKey", "toObjectKey"] },

  { name: "crm_get_association", description: "Get association by ID.", method: "GET", path: "/associations/:associationId",
    params: { associationId: { type: "string", description: "Association ID", required: true, in: "path" } } },

  { name: "crm_update_association", description: "Update an association.", method: "PUT", path: "/associations/:associationId",
    params: { associationId: { type: "string", description: "Association ID", required: true, in: "path" }, key: { type: "string", description: "Association key", required: false, in: "body" } },
    body: ["key"] },

  { name: "crm_delete_association", description: "Delete an association.", method: "DELETE", path: "/associations/:associationId",
    params: { associationId: { type: "string", description: "Association ID", required: true, in: "path" } } },

  { name: "crm_create_relation", description: "Create a relation between two records.", method: "POST", path: "/associations/relations",
    params: { locationId: { type: "string", description: "Location ID", required: true, in: "body" }, associationId: { type: "string", description: "Association ID", required: true, in: "body" }, fromRecordId: { type: "string", description: "Source record ID", required: true, in: "body" }, toRecordId: { type: "string", description: "Target record ID", required: true, in: "body" } },
    body: ["locationId", "associationId", "fromRecordId", "toRecordId"] },

  { name: "crm_list_relations", description: "Get all relations for a record.", method: "GET", path: "/associations/relations/:recordId",
    params: { recordId: { type: "string", description: "Record ID", required: true, in: "path" } } },

  { name: "crm_delete_relation", description: "Delete a relation.", method: "DELETE", path: "/associations/relations/:relationId",
    params: { relationId: { type: "string", description: "Relation ID", required: true, in: "path" } } },

  // ── Snapshots ──────────────────────────────────────────────

  { name: "crm_list_snapshots", description: "List all account snapshots/templates.", method: "GET", path: "/snapshots/",
    params: { companyId: { type: "string", description: "Company ID", required: true, in: "query" } } },

  { name: "crm_create_snapshot_share_link", description: "Create a shareable link for a snapshot.", method: "POST", path: "/snapshots/share/link",
    params: { companyId: { type: "string", description: "Company ID", required: true, in: "body" }, snapshotId: { type: "string", description: "Snapshot ID", required: true, in: "body" }, shareType: { type: "string", description: "Share type (link, permanent)", required: false, in: "body" } },
    body: ["companyId", "snapshotId", "shareType"] },

  { name: "crm_get_snapshot_push_status", description: "Get snapshot push status between dates.", method: "GET", path: "/snapshots/snapshot-status/:snapshotId",
    params: { snapshotId: { type: "string", description: "Snapshot ID", required: true, in: "path" }, from: { type: "string", description: "From date", required: false, in: "query" }, to: { type: "string", description: "To date", required: false, in: "query" } } },

  { name: "crm_get_snapshot_last_push", description: "Get last snapshot push status for a specific location.", method: "GET", path: "/snapshots/snapshot-status/:snapshotId/location/:locationId",
    params: { snapshotId: { type: "string", description: "Snapshot ID", required: true, in: "path" }, locationId: { type: "string", description: "Location ID", required: true, in: "path" } } },
]
