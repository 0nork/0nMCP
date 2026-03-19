// ============================================================
// 0nMCP — CRM Voice AI API Tool Definitions
// ============================================================
// AI-powered phone agents. Create agents, define actions,
// manage call logs. Each agent can use Knowledge Bases.
// ============================================================

export default [
  // ── Agents ─────────────────────────────────────────────────

  {
    name: "crm_list_voice_agents",
    description: "List all Voice AI agents for a location.",
    method: "GET",
    path: "/voice-ai/agents",
    params: {
      locationId: { type: "string", description: "Location ID", required: true, in: "query" },
    },
  },

  {
    name: "crm_create_voice_agent",
    description: "Create a new Voice AI agent. Can be configured with knowledge bases, actions, and personality settings.",
    method: "POST",
    path: "/voice-ai/agents",
    params: {
      locationId: { type: "string", description: "Location ID", required: true, in: "body" },
      name: { type: "string", description: "Agent name", required: true, in: "body" },
      personality: { type: "string", description: "Agent personality/system prompt", required: false, in: "body" },
      knowledgeBases: { type: "array", description: "Array of knowledge base IDs to attach", required: false, in: "body" },
      actions: { type: "array", description: "Array of action IDs the agent can perform", required: false, in: "body" },
      greeting: { type: "string", description: "Initial greeting message", required: false, in: "body" },
      voiceId: { type: "string", description: "Voice ID for text-to-speech", required: false, in: "body" },
    },
    body: ["locationId", "name", "personality", "knowledgeBases", "actions", "greeting", "voiceId"],
  },

  {
    name: "crm_get_voice_agent",
    description: "Get a Voice AI agent by ID with full configuration.",
    method: "GET",
    path: "/voice-ai/agents/:agentId",
    params: {
      agentId: { type: "string", description: "Agent ID", required: true, in: "path" },
    },
  },

  {
    name: "crm_update_voice_agent",
    description: "Update a Voice AI agent's configuration.",
    method: "PATCH",
    path: "/voice-ai/agents/:agentId",
    params: {
      agentId: { type: "string", description: "Agent ID", required: true, in: "path" },
      name: { type: "string", description: "Agent name", required: false, in: "body" },
      personality: { type: "string", description: "Agent personality/system prompt", required: false, in: "body" },
      knowledgeBases: { type: "array", description: "Array of knowledge base IDs", required: false, in: "body" },
      actions: { type: "array", description: "Array of action IDs", required: false, in: "body" },
      greeting: { type: "string", description: "Initial greeting", required: false, in: "body" },
      voiceId: { type: "string", description: "Voice ID", required: false, in: "body" },
      active: { type: "boolean", description: "Whether agent is active", required: false, in: "body" },
    },
    body: ["name", "personality", "knowledgeBases", "actions", "greeting", "voiceId", "active"],
  },

  {
    name: "crm_delete_voice_agent",
    description: "Delete a Voice AI agent.",
    method: "DELETE",
    path: "/voice-ai/agents/:agentId",
    params: {
      agentId: { type: "string", description: "Agent ID", required: true, in: "path" },
    },
  },

  // ── Actions ────────────────────────────────────────────────

  {
    name: "crm_create_voice_action",
    description: "Create an action that a Voice AI agent can perform (e.g., book appointment, transfer call, query knowledge base).",
    method: "POST",
    path: "/voice-ai/actions",
    params: {
      locationId: { type: "string", description: "Location ID", required: true, in: "body" },
      name: { type: "string", description: "Action name", required: true, in: "body" },
      type: { type: "string", description: "Action type (e.g., 'knowledge_base', 'book_appointment', 'transfer_call', 'webhook')", required: true, in: "body" },
      config: { type: "object", description: "Action-specific configuration (e.g., knowledgeBaseId, calendarId, phoneNumber, webhookUrl)", required: false, in: "body" },
    },
    body: ["locationId", "name", "type", "config"],
  },

  {
    name: "crm_get_voice_action",
    description: "Get a Voice AI action by ID.",
    method: "GET",
    path: "/voice-ai/actions/:actionId",
    params: {
      actionId: { type: "string", description: "Action ID", required: true, in: "path" },
    },
  },

  {
    name: "crm_update_voice_action",
    description: "Update a Voice AI action.",
    method: "PUT",
    path: "/voice-ai/actions/:actionId",
    params: {
      actionId: { type: "string", description: "Action ID", required: true, in: "path" },
      name: { type: "string", description: "Action name", required: false, in: "body" },
      type: { type: "string", description: "Action type", required: false, in: "body" },
      config: { type: "object", description: "Action configuration", required: false, in: "body" },
    },
    body: ["name", "type", "config"],
  },

  {
    name: "crm_delete_voice_action",
    description: "Delete a Voice AI action.",
    method: "DELETE",
    path: "/voice-ai/actions/:actionId",
    params: {
      actionId: { type: "string", description: "Action ID", required: true, in: "path" },
    },
  },

  // ── Call Logs ──────────────────────────────────────────────

  {
    name: "crm_list_voice_call_logs",
    description: "List Voice AI call logs with filters.",
    method: "GET",
    path: "/voice-ai/dashboard/call-logs",
    params: {
      locationId: { type: "string", description: "Location ID", required: true, in: "query" },
      agentId: { type: "string", description: "Filter by agent ID", required: false, in: "query" },
      limit: { type: "number", description: "Results per page", required: false, in: "query" },
      offset: { type: "number", description: "Pagination offset", required: false, in: "query" },
    },
  },

  {
    name: "crm_get_voice_call_log",
    description: "Get a specific Voice AI call log with transcript and details.",
    method: "GET",
    path: "/voice-ai/dashboard/call-logs/:callId",
    params: {
      callId: { type: "string", description: "Call ID", required: true, in: "path" },
    },
  },
]
