// ============================================================
// 0nMCP — CRM Knowledge Base API Tool Definitions
// ============================================================
// Personal AI knowledge bases per location. Each user gets up to
// 15 knowledge bases trained on their business data. Powers
// Voice AI, chat bots, and Agent Studio agents.
// ============================================================

export default [
  // ── Knowledge Base CRUD ────────────────────────────────────

  {
    name: "crm_list_knowledge_bases",
    description: "List all knowledge bases for a location (paginated). Each location can have up to 15 knowledge bases.",
    method: "GET",
    path: "/knowledge-bases/",
    params: {
      locationId: { type: "string", description: "Location ID", required: true, in: "query" },
      limit: { type: "number", description: "Number of results per page", required: false, in: "query" },
      offset: { type: "number", description: "Pagination offset", required: false, in: "query" },
    },
  },

  {
    name: "crm_create_knowledge_base",
    description: "Create a new knowledge base for a location. Max 15 per location. This becomes the user's personal AI trained on their business data.",
    method: "POST",
    path: "/knowledge-bases/",
    params: {
      locationId: { type: "string", description: "Location ID", required: true, in: "body" },
      name: { type: "string", description: "Name of the knowledge base (e.g., 'Company FAQ', 'Product Catalog', 'Sales Playbook')", required: true, in: "body" },
      description: { type: "string", description: "Description of what this knowledge base contains", required: false, in: "body" },
    },
    body: ["locationId", "name", "description"],
  },

  {
    name: "crm_get_knowledge_base",
    description: "Get a specific knowledge base by ID including its configuration and source count.",
    method: "GET",
    path: "/knowledge-bases/:knowledgeBaseId",
    params: {
      knowledgeBaseId: { type: "string", description: "Knowledge base ID", required: true, in: "path" },
    },
  },

  {
    name: "crm_update_knowledge_base",
    description: "Update a knowledge base's name or description.",
    method: "PUT",
    path: "/knowledge-bases/:knowledgeBaseId",
    params: {
      knowledgeBaseId: { type: "string", description: "Knowledge base ID", required: true, in: "path" },
      name: { type: "string", description: "Updated name", required: false, in: "body" },
      description: { type: "string", description: "Updated description", required: false, in: "body" },
    },
    body: ["name", "description"],
  },

  {
    name: "crm_delete_knowledge_base",
    description: "Delete a knowledge base and all its sources/content.",
    method: "DELETE",
    path: "/knowledge-bases/:knowledgeBaseId",
    params: {
      knowledgeBaseId: { type: "string", description: "Knowledge base ID", required: true, in: "path" },
    },
  },
]
