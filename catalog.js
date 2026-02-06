// ============================================================
// 0nMCP — Service Catalog
// ============================================================
// Every service the orchestrator can connect to.
// Add new services here to expand capabilities.
// ============================================================

export const SERVICE_CATALOG = {

  // ── CRM ───────────────────────────────────────────────────
  crm: {
    name: "CRM",
    type: "crm",
    description: "Customer Relationship Management — contacts, pipelines, opportunities, workflows, SMS, email campaigns",
    baseUrl: "https://services.leadconnectorhq.com",
    authType: "oauth",
    credentialKeys: ["access_token"],
    capabilities: [
      { name: "manage_contacts", actions: ["create", "update", "search", "delete"], description: "Create, update, search, and manage contacts" },
      { name: "manage_pipelines", actions: ["create", "list"], description: "Create and manage sales pipelines with stages" },
      { name: "manage_opportunities", actions: ["create", "update", "list"], description: "Track deals and opportunities through pipeline stages" },
      { name: "manage_tags", actions: ["create", "list"], description: "Create and assign tags for segmentation" },
      { name: "manage_custom_values", actions: ["create", "list"], description: "Create and manage custom values" },
      { name: "manage_workflows", actions: ["list"], description: "List and inspect automation workflows" },
      { name: "send_sms", actions: ["send"], description: "Send SMS messages to contacts" },
      { name: "send_email", actions: ["send"], description: "Send emails via CRM" },
      { name: "manage_calendars", actions: ["list", "create"], description: "Book and manage appointments" },
      { name: "manage_campaigns", actions: ["list"], description: "View marketing campaigns" },
    ],
    endpoints: {
      create_contact:    { method: "POST", path: "/contacts/", body: { firstName: "", lastName: "", email: "", phone: "", locationId: "" } },
      search_contacts:   { method: "GET",  path: "/contacts/search", query: ["locationId", "query"] },
      get_contact:       { method: "GET",  path: "/contacts/{contactId}" },
      update_contact:    { method: "PUT",  path: "/contacts/{contactId}", body: {} },
      delete_contact:    { method: "DELETE", path: "/contacts/{contactId}" },
      create_pipeline:   { method: "POST", path: "/opportunities/pipelines", body: { name: "", stages: [] } },
      list_pipelines:    { method: "GET",  path: "/opportunities/pipelines", query: ["locationId"] },
      create_opportunity:{ method: "POST", path: "/opportunities/", body: { pipelineId: "", name: "", stageId: "", locationId: "" } },
      create_tag:        { method: "POST", path: "/locations/{locationId}/tags", body: { name: "" } },
      list_tags:         { method: "GET",  path: "/locations/{locationId}/tags" },
      create_custom_value:{ method: "POST", path: "/locations/{locationId}/customValues", body: { name: "", value: "" } },
      list_custom_values:{ method: "GET",  path: "/locations/{locationId}/customValues" },
      list_workflows:    { method: "GET",  path: "/workflows/", query: ["locationId"] },
      list_calendars:    { method: "GET",  path: "/calendars/", query: ["locationId"] },
    },
    authHeader: (creds) => ({
      "Authorization": `Bearer ${creds.access_token}`,
      "Content-Type": "application/json",
      "Version": "2021-07-28",
    }),
  },

  // ── Stripe ────────────────────────────────────────────────
  stripe: {
    name: "Stripe",
    type: "payments",
    description: "Payment processing — customers, charges, subscriptions, invoices, payouts",
    baseUrl: "https://api.stripe.com/v1",
    authType: "api_key",
    credentialKeys: ["apiKey"],
    capabilities: [
      { name: "manage_customers", actions: ["create", "list", "get"], description: "Create and manage customers" },
      { name: "create_charge", actions: ["create"], description: "Charge a customer's payment method" },
      { name: "manage_invoices", actions: ["create", "send", "list"], description: "Create and send invoices" },
      { name: "manage_subscriptions", actions: ["create", "cancel", "list"], description: "Set up recurring billing" },
      { name: "get_balance", actions: ["get"], description: "Check account balance" },
      { name: "list_payments", actions: ["list"], description: "List recent payment intents" },
      { name: "manage_products", actions: ["create", "list"], description: "Create and manage products" },
      { name: "manage_prices", actions: ["create", "list"], description: "Create and manage prices" },
    ],
    endpoints: {
      create_customer:    { method: "POST", path: "/customers", contentType: "application/x-www-form-urlencoded" },
      list_customers:     { method: "GET",  path: "/customers" },
      get_customer:       { method: "GET",  path: "/customers/{id}" },
      create_charge:      { method: "POST", path: "/charges", contentType: "application/x-www-form-urlencoded" },
      create_invoice:     { method: "POST", path: "/invoices", contentType: "application/x-www-form-urlencoded" },
      send_invoice:       { method: "POST", path: "/invoices/{id}/send", contentType: "application/x-www-form-urlencoded" },
      list_invoices:      { method: "GET",  path: "/invoices" },
      create_subscription:{ method: "POST", path: "/subscriptions", contentType: "application/x-www-form-urlencoded" },
      get_balance:        { method: "GET",  path: "/balance" },
      list_payments:      { method: "GET",  path: "/payment_intents" },
      create_product:     { method: "POST", path: "/products", contentType: "application/x-www-form-urlencoded" },
      create_price:       { method: "POST", path: "/prices", contentType: "application/x-www-form-urlencoded" },
    },
    authHeader: (creds) => ({
      "Authorization": `Bearer ${creds.apiKey}`,
    }),
  },

  // ── SendGrid ──────────────────────────────────────────────
  sendgrid: {
    name: "SendGrid",
    type: "email",
    description: "Transactional and marketing email — send, templates, contacts",
    baseUrl: "https://api.sendgrid.com/v3",
    authType: "api_key",
    credentialKeys: ["apiKey"],
    capabilities: [
      { name: "send_email", actions: ["send"], description: "Send transactional emails" },
      { name: "manage_contacts", actions: ["create", "list", "search"], description: "Manage email contacts and lists" },
      { name: "manage_templates", actions: ["list"], description: "List email templates" },
    ],
    endpoints: {
      send_email:       { method: "POST", path: "/mail/send", body: { personalizations: [], from: {}, subject: "", content: [] } },
      add_contacts:     { method: "PUT",  path: "/marketing/contacts", body: { contacts: [] } },
      search_contacts:  { method: "POST", path: "/marketing/contacts/search", body: { query: "" } },
      list_templates:   { method: "GET",  path: "/templates" },
      list_lists:       { method: "GET",  path: "/marketing/lists" },
    },
    authHeader: (creds) => ({
      "Authorization": `Bearer ${creds.apiKey}`,
      "Content-Type": "application/json",
    }),
  },

  // ── Resend ────────────────────────────────────────────────
  resend: {
    name: "Resend",
    type: "email",
    description: "Developer-first email API — send transactional emails",
    baseUrl: "https://api.resend.com",
    authType: "api_key",
    credentialKeys: ["apiKey"],
    capabilities: [
      { name: "send_email", actions: ["send"], description: "Send transactional emails" },
      { name: "manage_domains", actions: ["list"], description: "Manage email domains" },
    ],
    endpoints: {
      send_email:    { method: "POST", path: "/emails", body: { from: "", to: [], subject: "", html: "" } },
      list_emails:   { method: "GET",  path: "/emails" },
      list_domains:  { method: "GET",  path: "/domains" },
    },
    authHeader: (creds) => ({
      "Authorization": `Bearer ${creds.apiKey}`,
      "Content-Type": "application/json",
    }),
  },

  // ── Twilio ────────────────────────────────────────────────
  twilio: {
    name: "Twilio",
    type: "sms",
    description: "SMS and voice — send text messages, make calls",
    baseUrl: "https://api.twilio.com/2010-04-01",
    authType: "basic",
    credentialKeys: ["accountSid", "authToken"],
    capabilities: [
      { name: "send_sms", actions: ["send"], description: "Send SMS messages" },
      { name: "make_call", actions: ["create"], description: "Initiate phone calls" },
      { name: "list_messages", actions: ["list"], description: "List sent messages" },
    ],
    endpoints: {
      send_sms:       { method: "POST", path: "/Accounts/{accountSid}/Messages.json", contentType: "application/x-www-form-urlencoded" },
      list_messages:  { method: "GET",  path: "/Accounts/{accountSid}/Messages.json" },
      make_call:      { method: "POST", path: "/Accounts/{accountSid}/Calls.json", contentType: "application/x-www-form-urlencoded" },
    },
    authHeader: (creds) => ({
      "Authorization": "Basic " + Buffer.from(`${creds.accountSid}:${creds.authToken}`).toString("base64"),
    }),
  },

  // ── Slack ─────────────────────────────────────────────────
  slack: {
    name: "Slack",
    type: "communication",
    description: "Team messaging — channels, direct messages, notifications",
    baseUrl: "https://slack.com/api",
    authType: "bot_token",
    credentialKeys: ["botToken"],
    capabilities: [
      { name: "send_message", actions: ["send"], description: "Post messages to channels" },
      { name: "manage_channels", actions: ["list", "create"], description: "List and create channels" },
      { name: "manage_users", actions: ["list"], description: "List workspace users" },
    ],
    endpoints: {
      send_message:    { method: "POST", path: "/chat.postMessage", body: { channel: "", text: "" } },
      list_channels:   { method: "GET",  path: "/conversations.list" },
      list_users:      { method: "GET",  path: "/users.list" },
      create_channel:  { method: "POST", path: "/conversations.create", body: { name: "" } },
    },
    authHeader: (creds) => ({
      "Authorization": `Bearer ${creds.botToken}`,
      "Content-Type": "application/json",
    }),
  },

  // ── Discord ───────────────────────────────────────────────
  discord: {
    name: "Discord",
    type: "communication",
    description: "Community messaging — servers, channels, messages",
    baseUrl: "https://discord.com/api/v10",
    authType: "bot_token",
    credentialKeys: ["botToken"],
    capabilities: [
      { name: "send_message", actions: ["send"], description: "Send messages to channels" },
      { name: "manage_channels", actions: ["list"], description: "List server channels" },
    ],
    endpoints: {
      send_message:    { method: "POST", path: "/channels/{channelId}/messages", body: { content: "" } },
      list_channels:   { method: "GET",  path: "/guilds/{guildId}/channels" },
    },
    authHeader: (creds) => ({
      "Authorization": `Bot ${creds.botToken}`,
      "Content-Type": "application/json",
    }),
  },

  // ── OpenAI ────────────────────────────────────────────────
  openai: {
    name: "OpenAI",
    type: "ai",
    description: "AI completions, embeddings, image generation, TTS",
    baseUrl: "https://api.openai.com/v1",
    authType: "api_key",
    credentialKeys: ["apiKey"],
    capabilities: [
      { name: "generate_text", actions: ["create"], description: "Generate text completions" },
      { name: "generate_image", actions: ["create"], description: "Generate images with DALL-E" },
      { name: "create_embedding", actions: ["create"], description: "Create text embeddings" },
      { name: "text_to_speech", actions: ["create"], description: "Convert text to speech" },
    ],
    endpoints: {
      chat_completion:  { method: "POST", path: "/chat/completions", body: { model: "gpt-4o", messages: [] } },
      create_image:     { method: "POST", path: "/images/generations", body: { prompt: "", model: "dall-e-3" } },
      create_embedding: { method: "POST", path: "/embeddings", body: { model: "text-embedding-3-small", input: "" } },
      text_to_speech:   { method: "POST", path: "/audio/speech", body: { model: "tts-1", voice: "alloy", input: "" } },
    },
    authHeader: (creds) => ({
      "Authorization": `Bearer ${creds.apiKey}`,
      "Content-Type": "application/json",
    }),
  },

  // ── Airtable ──────────────────────────────────────────────
  airtable: {
    name: "Airtable",
    type: "database",
    description: "Spreadsheet-database — bases, tables, records",
    baseUrl: "https://api.airtable.com/v0",
    authType: "api_key",
    credentialKeys: ["apiKey"],
    capabilities: [
      { name: "manage_records", actions: ["create", "list", "update", "delete"], description: "CRUD operations on table records" },
      { name: "list_bases", actions: ["list"], description: "List available bases" },
    ],
    endpoints: {
      list_bases:      { method: "GET",  path: "https://api.airtable.com/v0/meta/bases" },
      list_records:    { method: "GET",  path: "/{baseId}/{tableId}" },
      create_record:   { method: "POST", path: "/{baseId}/{tableId}", body: { fields: {} } },
      update_record:   { method: "PATCH", path: "/{baseId}/{tableId}/{recordId}", body: { fields: {} } },
      delete_record:   { method: "DELETE", path: "/{baseId}/{tableId}/{recordId}" },
    },
    authHeader: (creds) => ({
      "Authorization": `Bearer ${creds.apiKey}`,
      "Content-Type": "application/json",
    }),
  },

  // ── Notion ────────────────────────────────────────────────
  notion: {
    name: "Notion",
    type: "database",
    description: "Workspace — pages, databases, blocks",
    baseUrl: "https://api.notion.com/v1",
    authType: "api_key",
    credentialKeys: ["apiKey"],
    capabilities: [
      { name: "manage_pages", actions: ["create", "get", "update"], description: "Create and manage pages" },
      { name: "manage_databases", actions: ["query", "list"], description: "Query and manage databases" },
      { name: "search", actions: ["search"], description: "Search across workspace" },
    ],
    endpoints: {
      search:           { method: "POST", path: "/search", body: { query: "" } },
      create_page:      { method: "POST", path: "/pages", body: { parent: {}, properties: {} } },
      get_page:         { method: "GET",  path: "/pages/{pageId}" },
      query_database:   { method: "POST", path: "/databases/{databaseId}/query", body: {} },
      list_databases:   { method: "GET",  path: "/databases" },
    },
    authHeader: (creds) => ({
      "Authorization": `Bearer ${creds.apiKey}`,
      "Content-Type": "application/json",
      "Notion-Version": "2022-06-28",
    }),
  },

  // ── GitHub ────────────────────────────────────────────────
  github: {
    name: "GitHub",
    type: "code",
    description: "Code hosting — repos, issues, pull requests, actions",
    baseUrl: "https://api.github.com",
    authType: "token",
    credentialKeys: ["token"],
    capabilities: [
      { name: "manage_issues", actions: ["create", "list", "update"], description: "Create and manage issues" },
      { name: "manage_repos", actions: ["list", "create"], description: "List and create repositories" },
      { name: "manage_prs", actions: ["list", "create"], description: "List and create pull requests" },
    ],
    endpoints: {
      list_repos:      { method: "GET",  path: "/user/repos" },
      create_issue:    { method: "POST", path: "/repos/{owner}/{repo}/issues", body: { title: "", body: "" } },
      list_issues:     { method: "GET",  path: "/repos/{owner}/{repo}/issues" },
      create_pr:       { method: "POST", path: "/repos/{owner}/{repo}/pulls", body: { title: "", body: "", head: "", base: "" } },
      list_prs:        { method: "GET",  path: "/repos/{owner}/{repo}/pulls" },
    },
    authHeader: (creds) => ({
      "Authorization": `Bearer ${creds.token}`,
      "Accept": "application/vnd.github+json",
    }),
  },

  // ── Linear ────────────────────────────────────────────────
  linear: {
    name: "Linear",
    type: "project",
    description: "Issue tracking — teams, projects, issues, cycles",
    baseUrl: "https://api.linear.app",
    authType: "api_key",
    credentialKeys: ["apiKey"],
    capabilities: [
      { name: "manage_issues", actions: ["create", "list", "update"], description: "Create and manage issues" },
      { name: "manage_projects", actions: ["list"], description: "List projects" },
    ],
    endpoints: {
      graphql: { method: "POST", path: "/graphql", body: { query: "" } },
    },
    authHeader: (creds) => ({
      "Authorization": creds.apiKey,
      "Content-Type": "application/json",
    }),
  },

  // ── Shopify ───────────────────────────────────────────────
  shopify: {
    name: "Shopify",
    type: "ecommerce",
    description: "E-commerce — products, orders, customers, inventory",
    baseUrl: "https://{store}.myshopify.com/admin/api/2024-01",
    authType: "access_token",
    credentialKeys: ["accessToken", "store"],
    capabilities: [
      { name: "manage_products", actions: ["create", "list", "update"], description: "Manage products and variants" },
      { name: "manage_orders", actions: ["list", "get"], description: "View and manage orders" },
      { name: "manage_customers", actions: ["create", "list", "search"], description: "Manage customers" },
    ],
    endpoints: {
      list_products:    { method: "GET",  path: "/products.json" },
      create_product:   { method: "POST", path: "/products.json", body: { product: {} } },
      list_orders:      { method: "GET",  path: "/orders.json" },
      get_order:        { method: "GET",  path: "/orders/{orderId}.json" },
      list_customers:   { method: "GET",  path: "/customers.json" },
      create_customer:  { method: "POST", path: "/customers.json", body: { customer: {} } },
    },
    authHeader: (creds) => ({
      "X-Shopify-Access-Token": creds.accessToken,
      "Content-Type": "application/json",
    }),
  },

  // ── HubSpot ───────────────────────────────────────────────
  hubspot: {
    name: "HubSpot",
    type: "crm",
    description: "CRM and marketing — contacts, companies, deals, emails",
    baseUrl: "https://api.hubapi.com",
    authType: "access_token",
    credentialKeys: ["accessToken"],
    capabilities: [
      { name: "manage_contacts", actions: ["create", "list", "search"], description: "Manage contacts" },
      { name: "manage_companies", actions: ["create", "list"], description: "Manage companies" },
      { name: "manage_deals", actions: ["create", "list"], description: "Manage deals" },
    ],
    endpoints: {
      create_contact:   { method: "POST", path: "/crm/v3/objects/contacts", body: { properties: {} } },
      list_contacts:    { method: "GET",  path: "/crm/v3/objects/contacts" },
      search_contacts:  { method: "POST", path: "/crm/v3/objects/contacts/search", body: { query: "" } },
      create_company:   { method: "POST", path: "/crm/v3/objects/companies", body: { properties: {} } },
      create_deal:      { method: "POST", path: "/crm/v3/objects/deals", body: { properties: {} } },
      list_deals:       { method: "GET",  path: "/crm/v3/objects/deals" },
    },
    authHeader: (creds) => ({
      "Authorization": `Bearer ${creds.accessToken}`,
      "Content-Type": "application/json",
    }),
  },

  // ── Supabase ──────────────────────────────────────────────
  supabase: {
    name: "Supabase",
    type: "database",
    description: "Backend-as-a-service — database, auth, storage, edge functions",
    baseUrl: "https://{projectRef}.supabase.co",
    authType: "api_key",
    credentialKeys: ["apiKey", "projectRef"],
    capabilities: [
      { name: "manage_data", actions: ["select", "insert", "update", "delete"], description: "CRUD on database tables" },
      { name: "manage_auth", actions: ["list"], description: "Manage auth users" },
      { name: "manage_storage", actions: ["list", "upload"], description: "Manage file storage" },
    ],
    endpoints: {
      query_table:      { method: "GET",  path: "/rest/v1/{table}" },
      insert_row:       { method: "POST", path: "/rest/v1/{table}", body: {} },
      update_row:       { method: "PATCH", path: "/rest/v1/{table}", query: ["id"] },
      delete_row:       { method: "DELETE", path: "/rest/v1/{table}", query: ["id"] },
      list_users:       { method: "GET",  path: "/auth/v1/admin/users" },
      list_buckets:     { method: "GET",  path: "/storage/v1/bucket" },
    },
    authHeader: (creds) => ({
      "apikey": creds.apiKey,
      "Authorization": `Bearer ${creds.apiKey}`,
      "Content-Type": "application/json",
    }),
  },

  // ── Calendly ──────────────────────────────────────────────
  calendly: {
    name: "Calendly",
    type: "scheduling",
    description: "Scheduling — event types, bookings, availability",
    baseUrl: "https://api.calendly.com",
    authType: "api_key",
    credentialKeys: ["apiKey"],
    capabilities: [
      { name: "manage_events", actions: ["list"], description: "List scheduled events" },
      { name: "manage_event_types", actions: ["list"], description: "List event types" },
    ],
    endpoints: {
      list_events:      { method: "GET",  path: "/scheduled_events", query: ["user", "count"] },
      list_event_types: { method: "GET",  path: "/event_types", query: ["user"] },
      get_user:         { method: "GET",  path: "/users/me" },
    },
    authHeader: (creds) => ({
      "Authorization": `Bearer ${creds.apiKey}`,
      "Content-Type": "application/json",
    }),
  },

  // ── Google Calendar ───────────────────────────────────────
  google_calendar: {
    name: "Google Calendar",
    type: "scheduling",
    description: "Calendar management — events, schedules, availability",
    baseUrl: "https://www.googleapis.com/calendar/v3",
    authType: "oauth",
    credentialKeys: ["access_token"],
    capabilities: [
      { name: "manage_events", actions: ["create", "list", "update", "delete"], description: "Manage calendar events" },
      { name: "manage_calendars", actions: ["list"], description: "List calendars" },
    ],
    endpoints: {
      list_calendars:   { method: "GET",  path: "/users/me/calendarList" },
      list_events:      { method: "GET",  path: "/calendars/{calendarId}/events" },
      create_event:     { method: "POST", path: "/calendars/{calendarId}/events", body: { summary: "", start: {}, end: {} } },
      update_event:     { method: "PUT",  path: "/calendars/{calendarId}/events/{eventId}", body: {} },
      delete_event:     { method: "DELETE", path: "/calendars/{calendarId}/events/{eventId}" },
    },
    authHeader: (creds) => ({
      "Authorization": `Bearer ${creds.access_token}`,
      "Content-Type": "application/json",
    }),
  },

};

// ── Helpers ────────────────────────────────────────────────

export function getService(key) {
  return SERVICE_CATALOG[key] || null;
}

export function listServices() {
  return Object.entries(SERVICE_CATALOG).map(([key, svc]) => ({
    key,
    name: svc.name,
    type: svc.type,
    description: svc.description,
    authType: svc.authType,
    credentialKeys: svc.credentialKeys,
    capabilityCount: svc.capabilities.length,
  }));
}

export function getServicesByType(type) {
  return Object.entries(SERVICE_CATALOG)
    .filter(([, svc]) => svc.type === type)
    .map(([key, svc]) => ({ key, ...svc }));
}

export function findServiceForCapability(capabilityName) {
  const matches = [];
  for (const [key, svc] of Object.entries(SERVICE_CATALOG)) {
    const cap = svc.capabilities.find(c => c.name === capabilityName);
    if (cap) matches.push({ key, service: svc, capability: cap });
  }
  return matches;
}
