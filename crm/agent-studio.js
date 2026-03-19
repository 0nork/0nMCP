// ============================================================
// 0nMCP — CRM Agent Studio API Tool Definitions
// ============================================================
// AI agents per location with knowledge base + MCP integration.
// Agents can call 0nMCP tools via MCP Server nodes.
// ============================================================

export default [
  {
    name: "crm_list_agents",
    description: "List all Agent Studio agents for a location with pagination.",
    method: "GET",
    path: "/agent-studio/agent",
    params: {
      locationId: { type: "string", description: "Location ID", required: true, in: "query" },
      limit: { type: "number", description: "Results per page", required: false, in: "query" },
      offset: { type: "number", description: "Pagination offset", required: false, in: "query" },
    },
  },

  {
    name: "crm_create_agent",
    description: "Create a new Agent Studio agent with a staging version. Can be connected to knowledge bases and MCP servers.",
    method: "POST",
    path: "/agent-studio/agent",
    params: {
      locationId: { type: "string", description: "Location ID", required: true, in: "body" },
      name: { type: "string", description: "Agent name", required: true, in: "body" },
      description: { type: "string", description: "Agent description", required: false, in: "body" },
    },
    body: ["locationId", "name", "description"],
  },

  {
    name: "crm_get_agent",
    description: "Get a specific Agent Studio agent by ID with all versions.",
    method: "GET",
    path: "/agent-studio/agent/:agentId",
    params: {
      agentId: { type: "string", description: "Agent ID", required: true, in: "path" },
      locationId: { type: "string", description: "Location ID", required: true, in: "query" },
    },
  },

  {
    name: "crm_update_agent",
    description: "Update an agent version — modify nodes, edges, variables, knowledge base connections, and MCP server nodes.",
    method: "PUT",
    path: "/agent-studio/agent/:agentId",
    params: {
      agentId: { type: "string", description: "Agent ID", required: true, in: "path" },
      locationId: { type: "string", description: "Location ID", required: true, in: "body" },
      versionId: { type: "string", description: "Version ID to update", required: true, in: "body" },
      nodes: { type: "array", description: "Array of workflow nodes (knowledge_base, mcp_server, action, condition, etc.)", required: false, in: "body" },
      edges: { type: "array", description: "Array of edges connecting nodes", required: false, in: "body" },
      variables: { type: "object", description: "Agent variables/context", required: false, in: "body" },
    },
    body: ["locationId", "versionId", "nodes", "edges", "variables"],
  },

  {
    name: "crm_update_agent_metadata",
    description: "Update agent name, description, and status (active/inactive).",
    method: "PATCH",
    path: "/agent-studio/agent/:agentId/metadata",
    params: {
      agentId: { type: "string", description: "Agent ID", required: true, in: "path" },
      locationId: { type: "string", description: "Location ID", required: true, in: "body" },
      name: { type: "string", description: "Agent name", required: false, in: "body" },
      description: { type: "string", description: "Description", required: false, in: "body" },
      status: { type: "string", description: "Agent status (active, inactive)", required: false, in: "body" },
    },
    body: ["locationId", "name", "description", "status"],
  },

  {
    name: "crm_delete_agent",
    description: "Delete an Agent Studio agent and all its versions.",
    method: "DELETE",
    path: "/agent-studio/agent/:agentId",
    params: {
      agentId: { type: "string", description: "Agent ID", required: true, in: "path" },
      locationId: { type: "string", description: "Location ID", required: true, in: "query" },
    },
  },

  {
    name: "crm_promote_agent",
    description: "Promote an agent's draft/staging version to production.",
    method: "POST",
    path: "/agent-studio/agent/:agentId/promote",
    params: {
      agentId: { type: "string", description: "Agent ID", required: true, in: "path" },
      locationId: { type: "string", description: "Location ID", required: true, in: "body" },
      versionId: { type: "string", description: "Version ID to promote", required: true, in: "body" },
    },
    body: ["locationId", "versionId"],
  },

  {
    name: "crm_execute_agent",
    description: "Execute an Agent Studio agent. Send a message and get a response. Use executionId to maintain conversation sessions.",
    method: "POST",
    path: "/agent-studio/agent/:agentId/execute",
    params: {
      agentId: { type: "string", description: "Agent ID", required: true, in: "path" },
      locationId: { type: "string", description: "Location ID", required: true, in: "body" },
      message: { type: "string", description: "User message to send to the agent", required: true, in: "body" },
      executionId: { type: "string", description: "Previous execution ID to continue a conversation session. Omit for new sessions.", required: false, in: "body" },
      contactId: { type: "string", description: "Contact ID for context", required: false, in: "body" },
    },
    body: ["locationId", "message", "executionId", "contactId"],
  },
]
