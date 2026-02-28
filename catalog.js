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

  // ── Gmail ───────────────────────────────────────────────────
  gmail: {
    name: "Gmail",
    type: "email",
    description: "Email — send, receive, labels, threads, drafts, search",
    baseUrl: "https://gmail.googleapis.com/gmail/v1",
    authType: "oauth",
    credentialKeys: ["access_token"],
    capabilities: [
      { name: "send_email", actions: ["send"], description: "Send emails" },
      { name: "manage_messages", actions: ["list", "get", "delete", "trash"], description: "Read, search, and manage messages" },
      { name: "manage_drafts", actions: ["create", "list", "send"], description: "Create and manage drafts" },
      { name: "manage_labels", actions: ["list", "create", "update"], description: "Organize with labels" },
      { name: "manage_threads", actions: ["list", "get"], description: "View conversation threads" },
    ],
    endpoints: {
      list_messages:    { method: "GET",  path: "/users/me/messages", query: ["q", "maxResults", "labelIds", "pageToken"] },
      get_message:      { method: "GET",  path: "/users/me/messages/{messageId}", query: ["format"] },
      send_message:     { method: "POST", path: "/users/me/messages/send", body: { raw: "" } },
      trash_message:    { method: "POST", path: "/users/me/messages/{messageId}/trash" },
      untrash_message:  { method: "POST", path: "/users/me/messages/{messageId}/untrash" },
      list_threads:     { method: "GET",  path: "/users/me/threads", query: ["q", "maxResults", "pageToken"] },
      get_thread:       { method: "GET",  path: "/users/me/threads/{threadId}" },
      create_draft:     { method: "POST", path: "/users/me/drafts", body: { message: { raw: "" } } },
      list_drafts:      { method: "GET",  path: "/users/me/drafts" },
      send_draft:       { method: "POST", path: "/users/me/drafts/send", body: { id: "" } },
      list_labels:      { method: "GET",  path: "/users/me/labels" },
      create_label:     { method: "POST", path: "/users/me/labels", body: { name: "" } },
      get_profile:      { method: "GET",  path: "/users/me/profile" },
    },
    authHeader: (creds) => ({
      "Authorization": `Bearer ${creds.access_token}`,
      "Content-Type": "application/json",
    }),
  },

  // ── Google Sheets ───────────────────────────────────────────
  google_sheets: {
    name: "Google Sheets",
    type: "database",
    description: "Spreadsheets — read, write, append, create, format cells",
    baseUrl: "https://sheets.googleapis.com/v4",
    authType: "oauth",
    credentialKeys: ["access_token"],
    capabilities: [
      { name: "manage_spreadsheets", actions: ["create", "get"], description: "Create and get spreadsheet metadata" },
      { name: "manage_values", actions: ["get", "update", "append", "clear"], description: "Read, write, and append cell values" },
      { name: "manage_sheets", actions: ["create", "delete"], description: "Add and remove sheets within a spreadsheet" },
    ],
    endpoints: {
      create_spreadsheet:   { method: "POST", path: "/spreadsheets", body: { properties: { title: "" } } },
      get_spreadsheet:      { method: "GET",  path: "/spreadsheets/{spreadsheetId}" },
      get_values:           { method: "GET",  path: "/spreadsheets/{spreadsheetId}/values/{range}" },
      update_values:        { method: "PUT",  path: "/spreadsheets/{spreadsheetId}/values/{range}", query: ["valueInputOption"], body: { values: [] } },
      append_values:        { method: "POST", path: "/spreadsheets/{spreadsheetId}/values/{range}:append", query: ["valueInputOption"], body: { values: [] } },
      clear_values:         { method: "POST", path: "/spreadsheets/{spreadsheetId}/values/{range}:clear" },
      batch_get:            { method: "GET",  path: "/spreadsheets/{spreadsheetId}/values:batchGet", query: ["ranges"] },
      batch_update:         { method: "POST", path: "/spreadsheets/{spreadsheetId}/values:batchUpdate", body: { data: [], valueInputOption: "USER_ENTERED" } },
    },
    authHeader: (creds) => ({
      "Authorization": `Bearer ${creds.access_token}`,
      "Content-Type": "application/json",
    }),
  },

  // ── Google Drive ────────────────────────────────────────────
  google_drive: {
    name: "Google Drive",
    type: "storage",
    description: "Cloud storage — files, folders, sharing, search, permissions",
    baseUrl: "https://www.googleapis.com/drive/v3",
    authType: "oauth",
    credentialKeys: ["access_token"],
    capabilities: [
      { name: "manage_files", actions: ["list", "get", "create", "delete", "copy"], description: "Upload, download, and manage files" },
      { name: "manage_permissions", actions: ["create", "list", "delete"], description: "Share files and manage access" },
      { name: "search_files", actions: ["search"], description: "Search across Drive" },
    ],
    endpoints: {
      list_files:           { method: "GET",  path: "/files", query: ["q", "pageSize", "orderBy", "fields", "pageToken"] },
      get_file:             { method: "GET",  path: "/files/{fileId}", query: ["fields"] },
      create_file:          { method: "POST", path: "/files", body: { name: "", mimeType: "", parents: [] } },
      copy_file:            { method: "POST", path: "/files/{fileId}/copy", body: { name: "" } },
      update_file:          { method: "PATCH", path: "/files/{fileId}", body: { name: "" } },
      delete_file:          { method: "DELETE", path: "/files/{fileId}" },
      create_permission:    { method: "POST", path: "/files/{fileId}/permissions", body: { role: "", type: "", emailAddress: "" } },
      list_permissions:     { method: "GET",  path: "/files/{fileId}/permissions" },
      delete_permission:    { method: "DELETE", path: "/files/{fileId}/permissions/{permissionId}" },
      generate_ids:         { method: "GET",  path: "/files/generateIds", query: ["count"] },
    },
    authHeader: (creds) => ({
      "Authorization": `Bearer ${creds.access_token}`,
      "Content-Type": "application/json",
    }),
  },

  // ── Jira ────────────────────────────────────────────────────
  jira: {
    name: "Jira",
    type: "project",
    description: "Project management — issues, sprints, boards, projects, epics, JQL search",
    baseUrl: "https://{domain}.atlassian.net/rest/api/3",
    authType: "basic",
    credentialKeys: ["email", "apiToken", "domain"],
    capabilities: [
      { name: "manage_issues", actions: ["create", "get", "update", "delete", "search", "transition"], description: "Full issue lifecycle management" },
      { name: "manage_projects", actions: ["list", "get"], description: "List and view projects" },
      { name: "manage_sprints", actions: ["list"], description: "View sprints and boards" },
      { name: "manage_comments", actions: ["create", "list"], description: "Add and view issue comments" },
    ],
    endpoints: {
      search_issues:        { method: "POST", path: "/search", body: { jql: "", maxResults: 50 } },
      create_issue:         { method: "POST", path: "/issue", body: { fields: { project: {}, summary: "", issuetype: {}, description: {} } } },
      get_issue:            { method: "GET",  path: "/issue/{issueIdOrKey}", query: ["fields", "expand"] },
      update_issue:         { method: "PUT",  path: "/issue/{issueIdOrKey}", body: { fields: {} } },
      delete_issue:         { method: "DELETE", path: "/issue/{issueIdOrKey}" },
      transition_issue:     { method: "POST", path: "/issue/{issueIdOrKey}/transitions", body: { transition: { id: "" } } },
      get_transitions:      { method: "GET",  path: "/issue/{issueIdOrKey}/transitions" },
      add_comment:          { method: "POST", path: "/issue/{issueIdOrKey}/comment", body: { body: {} } },
      list_comments:        { method: "GET",  path: "/issue/{issueIdOrKey}/comment" },
      list_projects:        { method: "GET",  path: "/project", query: ["maxResults", "startAt"] },
      get_project:          { method: "GET",  path: "/project/{projectIdOrKey}" },
      assign_issue:         { method: "PUT",  path: "/issue/{issueIdOrKey}/assignee", body: { accountId: "" } },
    },
    authHeader: (creds) => ({
      "Authorization": "Basic " + Buffer.from(`${creds.email}:${creds.apiToken}`).toString("base64"),
      "Content-Type": "application/json",
    }),
  },

  // ── Zendesk ─────────────────────────────────────────────────
  zendesk: {
    name: "Zendesk",
    type: "support",
    description: "Customer support — tickets, users, organizations, search, macros",
    baseUrl: "https://{subdomain}.zendesk.com/api/v2",
    authType: "basic",
    credentialKeys: ["email", "apiToken", "subdomain"],
    capabilities: [
      { name: "manage_tickets", actions: ["create", "list", "get", "update", "delete"], description: "Full ticket lifecycle" },
      { name: "manage_users", actions: ["create", "list", "search"], description: "Manage end-users and agents" },
      { name: "manage_organizations", actions: ["list", "get"], description: "View organizations" },
      { name: "search", actions: ["search"], description: "Full-text search across tickets, users, orgs" },
    ],
    endpoints: {
      list_tickets:         { method: "GET",  path: "/tickets.json", query: ["page", "per_page", "sort_by", "sort_order"] },
      get_ticket:           { method: "GET",  path: "/tickets/{ticketId}.json" },
      create_ticket:        { method: "POST", path: "/tickets.json", body: { ticket: { subject: "", description: "", priority: "" } } },
      update_ticket:        { method: "PUT",  path: "/tickets/{ticketId}.json", body: { ticket: {} } },
      delete_ticket:        { method: "DELETE", path: "/tickets/{ticketId}.json" },
      list_ticket_comments: { method: "GET",  path: "/tickets/{ticketId}/comments.json" },
      search:               { method: "GET",  path: "/search.json", query: ["query", "sort_by", "sort_order"] },
      list_users:           { method: "GET",  path: "/users.json", query: ["role", "page", "per_page"] },
      create_user:          { method: "POST", path: "/users.json", body: { user: { name: "", email: "" } } },
      get_user:             { method: "GET",  path: "/users/{userId}.json" },
      list_organizations:   { method: "GET",  path: "/organizations.json" },
      list_macros:          { method: "GET",  path: "/macros.json" },
    },
    authHeader: (creds) => ({
      "Authorization": "Basic " + Buffer.from(`${creds.email}/token:${creds.apiToken}`).toString("base64"),
      "Content-Type": "application/json",
    }),
  },

  // ── Mailchimp ───────────────────────────────────────────────
  mailchimp: {
    name: "Mailchimp",
    type: "marketing",
    description: "Email marketing — audiences, campaigns, automations, templates, analytics",
    baseUrl: "https://{dc}.api.mailchimp.com/3.0",
    authType: "api_key",
    credentialKeys: ["apiKey"],
    capabilities: [
      { name: "manage_audiences", actions: ["list", "get"], description: "View and manage audiences/lists" },
      { name: "manage_members", actions: ["create", "update", "list", "search"], description: "Add and manage subscribers" },
      { name: "manage_campaigns", actions: ["create", "list", "send"], description: "Create and send email campaigns" },
      { name: "manage_templates", actions: ["list"], description: "View email templates" },
    ],
    endpoints: {
      list_audiences:       { method: "GET",  path: "/lists", query: ["count", "offset"] },
      get_audience:         { method: "GET",  path: "/lists/{listId}" },
      add_member:           { method: "POST", path: "/lists/{listId}/members", body: { email_address: "", status: "subscribed" } },
      update_member:        { method: "PATCH", path: "/lists/{listId}/members/{subscriberHash}", body: {} },
      list_members:         { method: "GET",  path: "/lists/{listId}/members", query: ["count", "offset", "status"] },
      search_members:       { method: "GET",  path: "/search-members", query: ["query", "list_id"] },
      list_campaigns:       { method: "GET",  path: "/campaigns", query: ["count", "offset", "status", "type"] },
      create_campaign:      { method: "POST", path: "/campaigns", body: { type: "regular", recipients: {}, settings: {} } },
      send_campaign:        { method: "POST", path: "/campaigns/{campaignId}/actions/send" },
      get_campaign_report:  { method: "GET",  path: "/reports/{campaignId}" },
      list_templates:       { method: "GET",  path: "/templates", query: ["count", "type"] },
      list_automations:     { method: "GET",  path: "/automations" },
    },
    authHeader: (creds) => {
      const dc = creds.apiKey.split("-").pop();
      return {
        "Authorization": "Basic " + Buffer.from(`anystring:${creds.apiKey}`).toString("base64"),
        "Content-Type": "application/json",
      };
    },
  },

  // ── Zoom ────────────────────────────────────────────────────
  zoom: {
    name: "Zoom",
    type: "communication",
    description: "Video conferencing — meetings, webinars, recordings, users",
    baseUrl: "https://api.zoom.us/v2",
    authType: "oauth",
    credentialKeys: ["access_token"],
    capabilities: [
      { name: "manage_meetings", actions: ["create", "list", "get", "update", "delete"], description: "Schedule and manage meetings" },
      { name: "manage_recordings", actions: ["list", "get", "delete"], description: "Access meeting recordings" },
      { name: "manage_users", actions: ["list", "get"], description: "View Zoom users" },
      { name: "manage_webinars", actions: ["list", "create"], description: "Schedule webinars" },
    ],
    endpoints: {
      list_meetings:        { method: "GET",  path: "/users/{userId}/meetings", query: ["type", "page_size", "page_number"] },
      create_meeting:       { method: "POST", path: "/users/{userId}/meetings", body: { topic: "", type: 2, start_time: "", duration: 60 } },
      get_meeting:          { method: "GET",  path: "/meetings/{meetingId}" },
      update_meeting:       { method: "PATCH", path: "/meetings/{meetingId}", body: {} },
      delete_meeting:       { method: "DELETE", path: "/meetings/{meetingId}" },
      list_recordings:      { method: "GET",  path: "/users/{userId}/recordings", query: ["from", "to", "page_size"] },
      get_recording:        { method: "GET",  path: "/meetings/{meetingId}/recordings" },
      delete_recording:     { method: "DELETE", path: "/meetings/{meetingId}/recordings" },
      list_users:           { method: "GET",  path: "/users", query: ["status", "page_size", "page_number"] },
      get_user:             { method: "GET",  path: "/users/{userId}" },
    },
    authHeader: (creds) => ({
      "Authorization": `Bearer ${creds.access_token}`,
      "Content-Type": "application/json",
    }),
  },

  // ── Microsoft Graph (Outlook, Teams, OneDrive) ──────────────
  microsoft: {
    name: "Microsoft 365",
    type: "productivity",
    description: "Outlook mail, Teams messages, OneDrive files, calendar — via Microsoft Graph API",
    baseUrl: "https://graph.microsoft.com/v1.0",
    authType: "oauth",
    credentialKeys: ["access_token"],
    capabilities: [
      { name: "manage_mail", actions: ["send", "list", "get", "delete"], description: "Send and manage Outlook email" },
      { name: "manage_events", actions: ["create", "list", "update", "delete"], description: "Manage Outlook calendar events" },
      { name: "manage_files", actions: ["list", "get", "upload"], description: "OneDrive file management" },
      { name: "manage_teams", actions: ["send", "list"], description: "Send Teams messages and list channels" },
      { name: "manage_users", actions: ["list", "get"], description: "View organization users" },
    ],
    endpoints: {
      send_mail:            { method: "POST", path: "/me/sendMail", body: { message: { subject: "", body: {}, toRecipients: [] } } },
      list_messages:        { method: "GET",  path: "/me/messages", query: ["$top", "$skip", "$filter", "$select", "$orderby"] },
      get_message:          { method: "GET",  path: "/me/messages/{messageId}" },
      delete_message:       { method: "DELETE", path: "/me/messages/{messageId}" },
      list_events:          { method: "GET",  path: "/me/events", query: ["$top", "$filter", "$orderby"] },
      create_event:         { method: "POST", path: "/me/events", body: { subject: "", start: {}, end: {}, attendees: [] } },
      update_event:         { method: "PATCH", path: "/me/events/{eventId}", body: {} },
      delete_event:         { method: "DELETE", path: "/me/events/{eventId}" },
      list_drive_items:     { method: "GET",  path: "/me/drive/root/children" },
      get_drive_item:       { method: "GET",  path: "/me/drive/items/{itemId}" },
      search_drive:         { method: "GET",  path: "/me/drive/root/search(q='{query}')" },
      list_teams:           { method: "GET",  path: "/me/joinedTeams" },
      list_channels:        { method: "GET",  path: "/teams/{teamId}/channels" },
      send_channel_message: { method: "POST", path: "/teams/{teamId}/channels/{channelId}/messages", body: { body: { content: "" } } },
      get_user:             { method: "GET",  path: "/me" },
    },
    authHeader: (creds) => ({
      "Authorization": `Bearer ${creds.access_token}`,
      "Content-Type": "application/json",
    }),
  },

  // ── MongoDB Atlas ───────────────────────────────────────────
  mongodb: {
    name: "MongoDB",
    type: "database",
    description: "NoSQL database — find, insert, update, delete, aggregate via Atlas Data API",
    baseUrl: "https://data.mongodb-api.com/app/{appId}/endpoint/data/v1",
    authType: "api_key",
    credentialKeys: ["apiKey", "appId"],
    capabilities: [
      { name: "manage_documents", actions: ["find", "insert", "update", "delete"], description: "CRUD operations on documents" },
      { name: "aggregate", actions: ["aggregate"], description: "Run aggregation pipelines" },
    ],
    endpoints: {
      find_one:             { method: "POST", path: "/action/findOne", body: { dataSource: "", database: "", collection: "", filter: {} } },
      find_many:            { method: "POST", path: "/action/find", body: { dataSource: "", database: "", collection: "", filter: {}, limit: 100 } },
      insert_one:           { method: "POST", path: "/action/insertOne", body: { dataSource: "", database: "", collection: "", document: {} } },
      insert_many:          { method: "POST", path: "/action/insertMany", body: { dataSource: "", database: "", collection: "", documents: [] } },
      update_one:           { method: "POST", path: "/action/updateOne", body: { dataSource: "", database: "", collection: "", filter: {}, update: {} } },
      update_many:          { method: "POST", path: "/action/updateMany", body: { dataSource: "", database: "", collection: "", filter: {}, update: {} } },
      delete_one:           { method: "POST", path: "/action/deleteOne", body: { dataSource: "", database: "", collection: "", filter: {} } },
      aggregate:            { method: "POST", path: "/action/aggregate", body: { dataSource: "", database: "", collection: "", pipeline: [] } },
    },
    authHeader: (creds) => ({
      "api-key": creds.apiKey,
      "Content-Type": "application/json",
      "Access-Control-Request-Headers": "*",
    }),
  },

  // ── QuickBooks ──────────────────────────────────────────────
  quickbooks: {
    name: "QuickBooks",
    type: "accounting",
    description: "Accounting — invoices, customers, payments, bills, estimates, items, reports",
    baseUrl: "https://quickbooks.api.intuit.com/v3",
    authType: "oauth",
    credentialKeys: ["access_token", "realmId"],
    capabilities: [
      { name: "manage_invoices", actions: ["create", "list", "get", "send"], description: "Create and send invoices" },
      { name: "manage_customers", actions: ["create", "list", "get", "update"], description: "Manage customers" },
      { name: "manage_payments", actions: ["create", "list"], description: "Record and list payments" },
      { name: "manage_accounts", actions: ["list", "get"], description: "Chart of accounts management" },
      { name: "manage_bills", actions: ["create", "list"], description: "Create and track bills" },
      { name: "manage_estimates", actions: ["create", "list", "send"], description: "Create and send estimates" },
      { name: "manage_items", actions: ["create", "list", "get", "update"], description: "Manage products and services" },
      { name: "manage_reports", actions: ["get"], description: "Generate financial reports" },
    ],
    endpoints: {
      create_invoice:       { method: "POST", path: "/company/{realmId}/invoice", body: { Line: [], CustomerRef: {} } },
      list_invoices:        { method: "GET",  path: "/company/{realmId}/query", query: ["query"] },
      get_invoice:          { method: "GET",  path: "/company/{realmId}/invoice/{invoiceId}" },
      send_invoice:         { method: "POST", path: "/company/{realmId}/invoice/{invoiceId}/send", query: ["sendTo"] },
      create_customer:      { method: "POST", path: "/company/{realmId}/customer", body: { DisplayName: "", PrimaryEmailAddr: {} } },
      list_customers:       { method: "GET",  path: "/company/{realmId}/query", query: ["query"] },
      get_customer:         { method: "GET",  path: "/company/{realmId}/customer/{customerId}" },
      update_customer:      { method: "POST", path: "/company/{realmId}/customer", body: { Id: "", SyncToken: "" } },
      create_payment:       { method: "POST", path: "/company/{realmId}/payment", body: { TotalAmt: 0, CustomerRef: {} } },
      list_payments:        { method: "GET",  path: "/company/{realmId}/query", query: ["query"] },
      list_accounts:        { method: "GET",  path: "/company/{realmId}/query", query: ["query"] },
      get_account:          { method: "GET",  path: "/company/{realmId}/account/{accountId}" },
      create_bill:          { method: "POST", path: "/company/{realmId}/bill", body: { VendorRef: {}, Line: [] } },
      list_bills:           { method: "GET",  path: "/company/{realmId}/query", query: ["query"] },
      create_estimate:      { method: "POST", path: "/company/{realmId}/estimate", body: { Line: [], CustomerRef: {} } },
      send_estimate:        { method: "POST", path: "/company/{realmId}/estimate/{estimateId}/send", query: ["sendTo"] },
      create_item:          { method: "POST", path: "/company/{realmId}/item", body: { Name: "", Type: "Service" } },
      list_items:           { method: "GET",  path: "/company/{realmId}/query", query: ["query"] },
      get_item:             { method: "GET",  path: "/company/{realmId}/item/{itemId}" },
      profit_loss_report:   { method: "GET",  path: "/company/{realmId}/reports/ProfitAndLoss", query: ["start_date", "end_date"] },
      balance_sheet:        { method: "GET",  path: "/company/{realmId}/reports/BalanceSheet", query: ["start_date", "end_date"] },
    },
    authHeader: (creds) => ({
      "Authorization": `Bearer ${creds.access_token}`,
      "Accept": "application/json",
      "Content-Type": "application/json",
    }),
  },

  // ── Asana ───────────────────────────────────────────────────
  asana: {
    name: "Asana",
    type: "project",
    description: "Project management — tasks, projects, sections, workspaces, tags, teams",
    baseUrl: "https://app.asana.com/api/1.0",
    authType: "token",
    credentialKeys: ["token"],
    capabilities: [
      { name: "manage_tasks", actions: ["create", "list", "get", "update", "delete"], description: "Full task lifecycle management" },
      { name: "manage_projects", actions: ["create", "list", "get"], description: "Create and manage projects" },
      { name: "manage_sections", actions: ["create", "list"], description: "Organize projects with sections" },
      { name: "manage_workspaces", actions: ["list"], description: "List available workspaces" },
      { name: "manage_tags", actions: ["create", "list"], description: "Create and manage tags" },
      { name: "manage_teams", actions: ["list"], description: "List organization teams" },
    ],
    endpoints: {
      create_task:          { method: "POST", path: "/tasks", body: { data: { name: "", workspace: "", projects: [] } } },
      list_tasks:           { method: "GET",  path: "/tasks", query: ["project", "assignee", "workspace", "completed_since"] },
      get_task:             { method: "GET",  path: "/tasks/{taskGid}" },
      update_task:          { method: "PUT",  path: "/tasks/{taskGid}", body: { data: {} } },
      delete_task:          { method: "DELETE", path: "/tasks/{taskGid}" },
      create_project:       { method: "POST", path: "/projects", body: { data: { name: "", workspace: "" } } },
      list_projects:        { method: "GET",  path: "/projects", query: ["workspace", "team"] },
      get_project:          { method: "GET",  path: "/projects/{projectGid}" },
      create_section:       { method: "POST", path: "/projects/{projectGid}/sections", body: { data: { name: "" } } },
      list_sections:        { method: "GET",  path: "/projects/{projectGid}/sections" },
      list_workspaces:      { method: "GET",  path: "/workspaces" },
      create_tag:           { method: "POST", path: "/tags", body: { data: { name: "", workspace: "" } } },
      list_tags:            { method: "GET",  path: "/tags", query: ["workspace"] },
      list_teams:           { method: "GET",  path: "/organizations/{organizationGid}/teams" },
      add_task_to_project:  { method: "POST", path: "/tasks/{taskGid}/addProject", body: { data: { project: "" } } },
      search_tasks:         { method: "GET",  path: "/workspaces/{workspaceGid}/tasks/search", query: ["text", "completed"] },
    },
    authHeader: (creds) => ({
      "Authorization": `Bearer ${creds.token}`,
      "Content-Type": "application/json",
    }),
  },

  // ── Intercom ────────────────────────────────────────────────
  intercom: {
    name: "Intercom",
    type: "support",
    description: "Customer messaging — contacts, conversations, companies, tags, articles",
    baseUrl: "https://api.intercom.io",
    authType: "access_token",
    credentialKeys: ["accessToken"],
    capabilities: [
      { name: "manage_contacts", actions: ["create", "list", "search", "update"], description: "Manage contacts and leads" },
      { name: "manage_conversations", actions: ["create", "list", "reply", "close"], description: "Handle customer conversations" },
      { name: "manage_companies", actions: ["create", "list"], description: "Manage companies" },
      { name: "manage_tags", actions: ["create", "list"], description: "Create and assign tags" },
      { name: "manage_articles", actions: ["create", "list"], description: "Manage help center articles" },
    ],
    endpoints: {
      create_contact:       { method: "POST", path: "/contacts", body: { role: "user", email: "" } },
      list_contacts:        { method: "GET",  path: "/contacts" },
      search_contacts:      { method: "POST", path: "/contacts/search", body: { query: {} } },
      update_contact:       { method: "PUT",  path: "/contacts/{contactId}", body: {} },
      create_conversation:  { method: "POST", path: "/conversations", body: { from: {}, body: "" } },
      list_conversations:   { method: "GET",  path: "/conversations" },
      reply_to_conversation:{ method: "POST", path: "/conversations/{conversationId}/reply", body: { message_type: "comment", type: "admin", body: "" } },
      close_conversation:   { method: "POST", path: "/conversations/{conversationId}/parts", body: { message_type: "close", type: "admin" } },
      create_company:       { method: "POST", path: "/companies", body: { name: "", company_id: "" } },
      list_companies:       { method: "GET",  path: "/companies" },
      create_tag:           { method: "POST", path: "/tags", body: { name: "" } },
      tag_contact:          { method: "POST", path: "/contacts/{contactId}/tags", body: { id: "" } },
      list_tags:            { method: "GET",  path: "/tags" },
      create_article:       { method: "POST", path: "/articles", body: { title: "", body: "", author_id: "" } },
      list_articles:        { method: "GET",  path: "/articles" },
    },
    authHeader: (creds) => ({
      "Authorization": `Bearer ${creds.accessToken}`,
      "Accept": "application/json",
      "Content-Type": "application/json",
      "Intercom-Version": "2.10",
    }),
  },

  // ── Dropbox ─────────────────────────────────────────────────
  dropbox: {
    name: "Dropbox",
    type: "storage",
    description: "Cloud storage — files, folders, sharing, search",
    baseUrl: "https://api.dropboxapi.com/2",
    authType: "oauth",
    credentialKeys: ["access_token"],
    capabilities: [
      { name: "manage_files", actions: ["upload", "download", "list", "move", "delete", "search"], description: "Upload, download, and manage files" },
      { name: "manage_folders", actions: ["create", "list"], description: "Create and list folders" },
      { name: "manage_sharing", actions: ["create_link", "list_shared"], description: "Share files and folders" },
    ],
    endpoints: {
      list_folder:          { method: "POST", path: "/files/list_folder", body: { path: "", recursive: false, limit: 100 } },
      list_folder_continue: { method: "POST", path: "/files/list_folder/continue", body: { cursor: "" } },
      get_metadata:         { method: "POST", path: "/files/get_metadata", body: { path: "" } },
      create_folder:        { method: "POST", path: "/files/create_folder_v2", body: { path: "", autorename: false } },
      delete:               { method: "POST", path: "/files/delete_v2", body: { path: "" } },
      move:                 { method: "POST", path: "/files/move_v2", body: { from_path: "", to_path: "" } },
      copy:                 { method: "POST", path: "/files/copy_v2", body: { from_path: "", to_path: "" } },
      search:               { method: "POST", path: "/files/search_v2", body: { query: "", options: { max_results: 100 } } },
      create_shared_link:   { method: "POST", path: "/sharing/create_shared_link_with_settings", body: { path: "" } },
      list_shared_links:    { method: "POST", path: "/sharing/list_shared_links", body: { path: "" } },
    },
    authHeader: (creds) => ({
      "Authorization": `Bearer ${creds.access_token}`,
      "Content-Type": "application/json",
    }),
  },

  // ── WhatsApp Business ───────────────────────────────────────
  whatsapp: {
    name: "WhatsApp Business",
    type: "communication",
    description: "Business messaging — send texts, templates, media via WhatsApp Business API",
    baseUrl: "https://graph.facebook.com/v19.0",
    authType: "access_token",
    credentialKeys: ["accessToken", "phoneNumberId"],
    capabilities: [
      { name: "send_message", actions: ["send_text", "send_template", "send_media"], description: "Send messages via WhatsApp" },
      { name: "manage_templates", actions: ["list", "get"], description: "Manage message templates" },
      { name: "manage_media", actions: ["upload", "get"], description: "Upload and retrieve media" },
    ],
    endpoints: {
      send_text_message:     { method: "POST", path: "/{phoneNumberId}/messages", body: { messaging_product: "whatsapp", to: "", type: "text", text: { body: "" } } },
      send_template_message: { method: "POST", path: "/{phoneNumberId}/messages", body: { messaging_product: "whatsapp", to: "", type: "template", template: { name: "", language: { code: "en" } } } },
      send_media_message:    { method: "POST", path: "/{phoneNumberId}/messages", body: { messaging_product: "whatsapp", to: "", type: "image", image: { link: "" } } },
      list_templates:        { method: "GET",  path: "/{businessId}/message_templates" },
      upload_media:          { method: "POST", path: "/{phoneNumberId}/media", contentType: "multipart/form-data" },
      get_media_url:         { method: "GET",  path: "/{mediaId}" },
    },
    authHeader: (creds) => ({
      "Authorization": `Bearer ${creds.accessToken}`,
      "Content-Type": "application/json",
    }),
  },

  // ── Instagram ───────────────────────────────────────────────
  instagram: {
    name: "Instagram",
    type: "social",
    description: "Social media — posts, comments, insights, stories via Instagram Graph API",
    baseUrl: "https://graph.facebook.com/v19.0",
    authType: "access_token",
    credentialKeys: ["accessToken", "igUserId"],
    capabilities: [
      { name: "manage_media", actions: ["create", "list", "get"], description: "Create and manage media posts" },
      { name: "manage_comments", actions: ["list", "reply", "delete"], description: "Moderate comments" },
      { name: "manage_insights", actions: ["get"], description: "View account and media insights" },
      { name: "manage_stories", actions: ["list"], description: "List active stories" },
    ],
    endpoints: {
      list_media:             { method: "GET",  path: "/{igUserId}/media", query: ["fields", "limit"] },
      get_media:              { method: "GET",  path: "/{mediaId}", query: ["fields"] },
      create_media_container: { method: "POST", path: "/{igUserId}/media", body: { image_url: "", caption: "" } },
      publish_media:          { method: "POST", path: "/{igUserId}/media_publish", body: { creation_id: "" } },
      list_comments:          { method: "GET",  path: "/{mediaId}/comments", query: ["fields"] },
      reply_to_comment:       { method: "POST", path: "/{commentId}/replies", body: { message: "" } },
      delete_comment:         { method: "DELETE", path: "/{commentId}" },
      get_insights:           { method: "GET",  path: "/{igUserId}/insights", query: ["metric", "period"] },
      list_stories:           { method: "GET",  path: "/{igUserId}/stories", query: ["fields"] },
      get_profile:            { method: "GET",  path: "/{igUserId}", query: ["fields"] },
    },
    authHeader: (creds) => ({
      "Authorization": `Bearer ${creds.accessToken}`,
      "Content-Type": "application/json",
    }),
  },

  // ── X (Twitter) ─────────────────────────────────────────────
  twitter: {
    name: "X (Twitter)",
    type: "social",
    description: "Social platform — tweets, users, followers, lists, direct messages",
    baseUrl: "https://api.x.com/2",
    authType: "oauth",
    credentialKeys: ["bearerToken"],
    capabilities: [
      { name: "manage_tweets", actions: ["create", "list", "delete", "search"], description: "Post and manage tweets" },
      { name: "manage_users", actions: ["get", "list_followers", "list_following"], description: "View user profiles and connections" },
      { name: "manage_lists", actions: ["create", "list"], description: "Create and manage lists" },
      { name: "manage_dm", actions: ["send"], description: "Send direct messages" },
    ],
    endpoints: {
      create_tweet:         { method: "POST",   path: "/tweets", body: { text: "" } },
      delete_tweet:         { method: "DELETE", path: "/tweets/{tweetId}" },
      get_tweet:            { method: "GET",    path: "/tweets/{tweetId}", query: ["tweet.fields", "expansions"] },
      search_tweets:        { method: "GET",    path: "/tweets/search/recent", query: ["query", "max_results", "tweet.fields"] },
      get_user:             { method: "GET",    path: "/users/{userId}", query: ["user.fields"] },
      get_user_by_username: { method: "GET",    path: "/users/by/username/{username}", query: ["user.fields"] },
      get_user_tweets:      { method: "GET",    path: "/users/{userId}/tweets", query: ["max_results", "tweet.fields"] },
      get_followers:        { method: "GET",    path: "/users/{userId}/followers", query: ["max_results", "user.fields"] },
      get_following:        { method: "GET",    path: "/users/{userId}/following", query: ["max_results", "user.fields"] },
      create_list:          { method: "POST",   path: "/lists", body: { name: "", description: "" } },
      get_lists:            { method: "GET",    path: "/users/{userId}/owned_lists" },
      send_dm:              { method: "POST",   path: "/dm_conversations/with/{participantId}/messages", body: { text: "" } },
      like_tweet:           { method: "POST",   path: "/users/{userId}/likes", body: { tweet_id: "" } },
      unlike_tweet:         { method: "DELETE", path: "/users/{userId}/likes/{tweetId}" },
      retweet:              { method: "POST",   path: "/users/{userId}/retweets", body: { tweet_id: "" } },
      unretweet:            { method: "DELETE", path: "/users/{userId}/retweets/{tweetId}" },
    },
    authHeader: (creds) => ({
      "Authorization": `Bearer ${creds.bearerToken}`,
      "Content-Type": "application/json",
    }),
  },

  // ── TikTok Business ─────────────────────────────────────────
  tiktok: {
    name: "TikTok Business",
    type: "social",
    description: "Social video — videos, ads, campaigns, reports via TikTok Business API",
    baseUrl: "https://business-api.tiktok.com/open_api/v1.3",
    authType: "access_token",
    credentialKeys: ["accessToken", "advertiserId"],
    capabilities: [
      { name: "manage_videos", actions: ["list", "get"], description: "View video content" },
      { name: "manage_ads", actions: ["create", "list", "get", "update"], description: "Manage ad creatives" },
      { name: "manage_campaigns", actions: ["create", "list", "get", "update"], description: "Manage ad campaigns" },
      { name: "manage_reports", actions: ["get"], description: "Pull performance reports" },
    ],
    endpoints: {
      list_videos:          { method: "GET",  path: "/video/list/", query: ["advertiser_id"] },
      get_video_info:       { method: "GET",  path: "/video/info/", query: ["advertiser_id", "video_ids"] },
      create_campaign:      { method: "POST", path: "/campaign/create/", body: { advertiser_id: "", campaign_name: "", objective_type: "", budget_mode: "" } },
      list_campaigns:       { method: "GET",  path: "/campaign/get/", query: ["advertiser_id", "page", "page_size"] },
      get_campaign:         { method: "GET",  path: "/campaign/get/", query: ["advertiser_id", "campaign_ids"] },
      update_campaign:      { method: "POST", path: "/campaign/update/", body: { advertiser_id: "", campaign_id: "" } },
      create_ad_group:      { method: "POST", path: "/adgroup/create/", body: { advertiser_id: "", campaign_id: "", adgroup_name: "" } },
      list_ad_groups:       { method: "GET",  path: "/adgroup/get/", query: ["advertiser_id", "page", "page_size"] },
      create_ad:            { method: "POST", path: "/ad/create/", body: { advertiser_id: "", adgroup_id: "", creatives: [] } },
      list_ads:             { method: "GET",  path: "/ad/get/", query: ["advertiser_id", "page", "page_size"] },
      get_report:           { method: "POST", path: "/report/integrated/get/", body: { advertiser_id: "", report_type: "", dimensions: [], metrics: [] } },
    },
    authHeader: (creds) => ({
      "Access-Token": creds.accessToken,
      "Content-Type": "application/json",
    }),
  },

  // ── Google Ads ──────────────────────────────────────────────
  google_ads: {
    name: "Google Ads",
    type: "advertising",
    description: "Search and display advertising — campaigns, ad groups, ads, keywords, reports",
    baseUrl: "https://googleads.googleapis.com/v16",
    authType: "oauth",
    credentialKeys: ["access_token", "developerToken", "customerId"],
    capabilities: [
      { name: "manage_campaigns", actions: ["create", "list", "get", "update"], description: "Manage ad campaigns" },
      { name: "manage_ad_groups", actions: ["create", "list"], description: "Manage ad groups" },
      { name: "manage_ads", actions: ["create", "list"], description: "Manage ad creatives" },
      { name: "manage_keywords", actions: ["create", "list"], description: "Manage keywords and targeting" },
      { name: "get_reports", actions: ["get"], description: "Pull campaign performance reports" },
    ],
    endpoints: {
      search:               { method: "POST", path: "/customers/{customerId}/googleAds:searchStream", body: { query: "" } },
      mutate_campaigns:     { method: "POST", path: "/customers/{customerId}/campaigns:mutate", body: { operations: [] } },
      list_campaigns:       { method: "POST", path: "/customers/{customerId}/googleAds:search", body: { query: "SELECT campaign.id, campaign.name, campaign.status FROM campaign" } },
      create_campaign:      { method: "POST", path: "/customers/{customerId}/campaigns:mutate", body: { operations: [{ create: {} }] } },
      list_ad_groups:       { method: "POST", path: "/customers/{customerId}/googleAds:search", body: { query: "SELECT ad_group.id, ad_group.name FROM ad_group" } },
      create_ad_group:      { method: "POST", path: "/customers/{customerId}/adGroups:mutate", body: { operations: [{ create: {} }] } },
      list_ads:             { method: "POST", path: "/customers/{customerId}/googleAds:search", body: { query: "SELECT ad_group_ad.ad.id, ad_group_ad.ad.name FROM ad_group_ad" } },
      create_ad:            { method: "POST", path: "/customers/{customerId}/adGroupAds:mutate", body: { operations: [{ create: {} }] } },
      get_report:           { method: "POST", path: "/customers/{customerId}/googleAds:searchStream", body: { query: "" } },
    },
    authHeader: (creds) => ({
      "Authorization": `Bearer ${creds.access_token}`,
      "developer-token": creds.developerToken,
      "Content-Type": "application/json",
    }),
  },

  // ── Facebook Ads ────────────────────────────────────────────
  facebook_ads: {
    name: "Facebook Ads",
    type: "advertising",
    description: "Social advertising — campaigns, ad sets, ads, insights, audiences",
    baseUrl: "https://graph.facebook.com/v19.0",
    authType: "access_token",
    credentialKeys: ["accessToken", "adAccountId"],
    capabilities: [
      { name: "manage_campaigns", actions: ["create", "list", "get", "update"], description: "Manage ad campaigns" },
      { name: "manage_adsets", actions: ["create", "list", "get", "update"], description: "Manage ad sets and targeting" },
      { name: "manage_ads", actions: ["create", "list", "get"], description: "Manage ad creatives" },
      { name: "manage_insights", actions: ["get"], description: "View performance insights" },
      { name: "manage_audiences", actions: ["create", "list"], description: "Create and manage custom audiences" },
    ],
    endpoints: {
      create_campaign:      { method: "POST", path: "/act_{adAccountId}/campaigns", body: { name: "", objective: "", status: "PAUSED", special_ad_categories: [] } },
      list_campaigns:       { method: "GET",  path: "/act_{adAccountId}/campaigns", query: ["fields", "limit"] },
      get_campaign:         { method: "GET",  path: "/{campaignId}", query: ["fields"] },
      update_campaign:      { method: "POST", path: "/{campaignId}", body: {} },
      create_adset:         { method: "POST", path: "/act_{adAccountId}/adsets", body: { name: "", campaign_id: "", daily_budget: 0, targeting: {}, status: "PAUSED" } },
      list_adsets:          { method: "GET",  path: "/act_{adAccountId}/adsets", query: ["fields", "limit"] },
      create_ad:            { method: "POST", path: "/act_{adAccountId}/ads", body: { name: "", adset_id: "", creative: {}, status: "PAUSED" } },
      list_ads:             { method: "GET",  path: "/act_{adAccountId}/ads", query: ["fields", "limit"] },
      get_insights:         { method: "GET",  path: "/act_{adAccountId}/insights", query: ["fields", "date_preset", "level", "time_range"] },
      create_audience:      { method: "POST", path: "/act_{adAccountId}/customaudiences", body: { name: "", subtype: "CUSTOM", description: "" } },
      list_audiences:       { method: "GET",  path: "/act_{adAccountId}/customaudiences", query: ["fields", "limit"] },
    },
    authHeader: (creds) => ({
      "Authorization": `Bearer ${creds.accessToken}`,
      "Content-Type": "application/json",
    }),
  },

  // ── Plaid ───────────────────────────────────────────────────
  plaid: {
    name: "Plaid",
    type: "finance",
    description: "Financial data — bank accounts, transactions, identity, auth via Plaid API",
    baseUrl: "https://production.plaid.com",
    authType: "api_key",
    credentialKeys: ["clientId", "secret"],
    capabilities: [
      { name: "manage_links", actions: ["create", "exchange"], description: "Create link tokens and exchange public tokens" },
      { name: "manage_accounts", actions: ["list", "get_balance"], description: "List accounts and get balances" },
      { name: "manage_transactions", actions: ["list", "sync"], description: "List and sync transactions" },
      { name: "manage_identity", actions: ["get"], description: "Retrieve identity information" },
      { name: "manage_auth", actions: ["get"], description: "Get account and routing numbers" },
    ],
    endpoints: {
      create_link_token:    { method: "POST", path: "/link/token/create", body: { client_id: "", secret: "", user: { client_user_id: "" }, client_name: "", products: [], country_codes: ["US"], language: "en" } },
      exchange_public_token:{ method: "POST", path: "/item/public_token/exchange", body: { client_id: "", secret: "", public_token: "" } },
      get_accounts:         { method: "POST", path: "/accounts/get", body: { client_id: "", secret: "", access_token: "" } },
      get_balance:          { method: "POST", path: "/accounts/balance/get", body: { client_id: "", secret: "", access_token: "" } },
      get_transactions:     { method: "POST", path: "/transactions/get", body: { client_id: "", secret: "", access_token: "", start_date: "", end_date: "" } },
      sync_transactions:    { method: "POST", path: "/transactions/sync", body: { client_id: "", secret: "", access_token: "" } },
      get_identity:         { method: "POST", path: "/identity/get", body: { client_id: "", secret: "", access_token: "" } },
      get_auth:             { method: "POST", path: "/auth/get", body: { client_id: "", secret: "", access_token: "" } },
      get_institutions:     { method: "POST", path: "/institutions/get", body: { client_id: "", secret: "", count: 10, offset: 0, country_codes: ["US"] } },
    },
    authHeader: (creds) => ({
      "Content-Type": "application/json",
    }),
  },

  // ── Square ──────────────────────────────────────────────────
  square: {
    name: "Square",
    type: "payments",
    description: "Payments and commerce — payments, customers, orders, catalog, inventory",
    baseUrl: "https://connect.squareup.com/v2",
    authType: "access_token",
    credentialKeys: ["accessToken"],
    capabilities: [
      { name: "manage_payments", actions: ["create", "list", "get", "refund"], description: "Process and manage payments" },
      { name: "manage_customers", actions: ["create", "list", "get", "update", "delete"], description: "Manage customer directory" },
      { name: "manage_orders", actions: ["create", "list", "get"], description: "Create and manage orders" },
      { name: "manage_catalog", actions: ["create", "list", "search"], description: "Manage product catalog" },
      { name: "manage_inventory", actions: ["get", "adjust"], description: "Track and adjust inventory" },
    ],
    endpoints: {
      create_payment:       { method: "POST", path: "/payments", body: { source_id: "", idempotency_key: "", amount_money: { amount: 0, currency: "USD" } } },
      list_payments:        { method: "GET",  path: "/payments", query: ["begin_time", "end_time", "sort_order", "cursor", "limit"] },
      get_payment:          { method: "GET",  path: "/payments/{paymentId}" },
      create_refund:        { method: "POST", path: "/refunds", body: { idempotency_key: "", payment_id: "", amount_money: {} } },
      create_customer:      { method: "POST", path: "/customers", body: { given_name: "", family_name: "", email_address: "" } },
      list_customers:       { method: "GET",  path: "/customers", query: ["cursor", "limit", "sort_field", "sort_order"] },
      get_customer:         { method: "GET",  path: "/customers/{customerId}" },
      update_customer:      { method: "PUT",  path: "/customers/{customerId}", body: {} },
      delete_customer:      { method: "DELETE", path: "/customers/{customerId}" },
      create_order:         { method: "POST", path: "/orders", body: { order: { location_id: "", line_items: [] }, idempotency_key: "" } },
      list_orders:          { method: "POST", path: "/orders/search", body: { location_ids: [], query: {} } },
      get_order:            { method: "GET",  path: "/orders/{orderId}" },
      create_catalog_object:{ method: "POST", path: "/catalog/object", body: { idempotency_key: "", object: {} } },
      list_catalog:         { method: "GET",  path: "/catalog/list", query: ["types", "cursor"] },
      search_catalog:       { method: "POST", path: "/catalog/search", body: { object_types: [], query: {} } },
      get_inventory:        { method: "POST", path: "/inventory/counts/batch-retrieve", body: { catalog_object_ids: [] } },
      adjust_inventory:     { method: "POST", path: "/inventory/changes/batch-create", body: { idempotency_key: "", changes: [] } },
    },
    authHeader: (creds) => ({
      "Authorization": `Bearer ${creds.accessToken}`,
      "Content-Type": "application/json",
      "Square-Version": "2024-01-18",
    }),
  },

  // ── TikTok Ads ──────────────────────────────────────────────
  tiktok_ads: {
    name: "TikTok Ads",
    type: "advertising",
    description: "TikTok advertising — campaigns, ad groups, ads, reports, audiences",
    baseUrl: "https://business-api.tiktok.com/open_api/v1.3",
    authType: "access_token",
    credentialKeys: ["accessToken", "advertiserId"],
    capabilities: [
      { name: "manage_campaigns", actions: ["create", "list", "get", "update"], description: "Manage ad campaigns" },
      { name: "manage_ad_groups", actions: ["create", "list", "update"], description: "Manage ad groups and targeting" },
      { name: "manage_ads", actions: ["create", "list", "update"], description: "Manage ad creatives" },
      { name: "manage_reports", actions: ["get"], description: "Pull performance reports" },
      { name: "manage_audiences", actions: ["create", "list"], description: "Create and manage custom audiences" },
    ],
    endpoints: {
      create_campaign:         { method: "POST", path: "/campaign/create/", body: { advertiser_id: "", campaign_name: "", objective_type: "", budget_mode: "" } },
      list_campaigns:          { method: "GET",  path: "/campaign/get/", query: ["advertiser_id", "page", "page_size"] },
      update_campaign_status:  { method: "POST", path: "/campaign/update/status/", body: { advertiser_id: "", campaign_ids: [], opt_status: "" } },
      create_adgroup:          { method: "POST", path: "/adgroup/create/", body: { advertiser_id: "", campaign_id: "", adgroup_name: "", placement_type: "" } },
      list_adgroups:           { method: "GET",  path: "/adgroup/get/", query: ["advertiser_id", "page", "page_size"] },
      update_adgroup:          { method: "POST", path: "/adgroup/update/", body: { advertiser_id: "", adgroup_id: "" } },
      create_ad:               { method: "POST", path: "/ad/create/", body: { advertiser_id: "", adgroup_id: "", creatives: [] } },
      list_ads:                { method: "GET",  path: "/ad/get/", query: ["advertiser_id", "page", "page_size"] },
      update_ad:               { method: "POST", path: "/ad/update/", body: { advertiser_id: "", ad_ids: [] } },
      get_report:              { method: "POST", path: "/report/integrated/get/", body: { advertiser_id: "", report_type: "", dimensions: [], metrics: [], data_level: "" } },
      create_audience:         { method: "POST", path: "/dmp/custom_audience/create/", body: { advertiser_id: "", custom_audience_name: "" } },
      list_audiences:          { method: "GET",  path: "/dmp/custom_audience/list/", query: ["advertiser_id", "page", "page_size"] },
    },
    authHeader: (creds) => ({
      "Access-Token": creds.accessToken,
      "Content-Type": "application/json",
    }),
  },

  // ── X Ads ───────────────────────────────────────────────────
  x_ads: {
    name: "X Ads",
    type: "advertising",
    description: "X (Twitter) advertising — campaigns, line items, promoted tweets, reports, audiences",
    baseUrl: "https://ads-api.x.com/12",
    authType: "oauth",
    credentialKeys: ["access_token", "accountId"],
    capabilities: [
      { name: "manage_campaigns", actions: ["create", "list", "get", "update"], description: "Manage ad campaigns" },
      { name: "manage_line_items", actions: ["create", "list", "get"], description: "Manage line items and targeting" },
      { name: "manage_promoted_tweets", actions: ["create", "list"], description: "Manage promoted tweets" },
      { name: "manage_reports", actions: ["get"], description: "Pull campaign analytics" },
      { name: "manage_audiences", actions: ["create", "list"], description: "Manage tailored audiences" },
    ],
    endpoints: {
      list_campaigns:        { method: "GET",  path: "/accounts/{accountId}/campaigns", query: ["count", "cursor", "sort_by"] },
      create_campaign:       { method: "POST", path: "/accounts/{accountId}/campaigns", body: { name: "", funding_instrument_id: "", daily_budget_amount_local_micro: 0, status: "PAUSED" } },
      get_campaign:          { method: "GET",  path: "/accounts/{accountId}/campaigns/{campaignId}" },
      update_campaign:       { method: "PUT",  path: "/accounts/{accountId}/campaigns/{campaignId}", body: {} },
      list_line_items:       { method: "GET",  path: "/accounts/{accountId}/line_items", query: ["campaign_ids", "count", "cursor"] },
      create_line_item:      { method: "POST", path: "/accounts/{accountId}/line_items", body: { campaign_id: "", objective: "", placements: [], bid_amount_local_micro: 0 } },
      list_promoted_tweets:  { method: "GET",  path: "/accounts/{accountId}/promoted_tweets", query: ["line_item_ids", "count"] },
      create_promoted_tweet: { method: "POST", path: "/accounts/{accountId}/promoted_tweets", body: { line_item_id: "", tweet_ids: [] } },
      get_stats:             { method: "GET",  path: "/stats/accounts/{accountId}", query: ["entity", "entity_ids", "start_time", "end_time", "granularity", "metric_groups"] },
      create_audience:       { method: "POST", path: "/accounts/{accountId}/tailored_audiences", body: { name: "", list_type: "" } },
      list_audiences:        { method: "GET",  path: "/accounts/{accountId}/tailored_audiences", query: ["count", "cursor"] },
    },
    authHeader: (creds) => ({
      "Authorization": `Bearer ${creds.access_token}`,
      "Content-Type": "application/json",
    }),
  },

  // ── LinkedIn Ads ────────────────────────────────────────────
  linkedin_ads: {
    name: "LinkedIn Ads",
    type: "advertising",
    description: "Professional advertising — campaigns, campaign groups, creatives, reports, audiences",
    baseUrl: "https://api.linkedin.com/rest",
    authType: "oauth",
    credentialKeys: ["access_token", "adAccountId"],
    capabilities: [
      { name: "manage_campaigns", actions: ["create", "list", "get", "update"], description: "Manage ad campaigns" },
      { name: "manage_campaign_groups", actions: ["create", "list"], description: "Manage campaign groups" },
      { name: "manage_creatives", actions: ["create", "list"], description: "Manage ad creatives" },
      { name: "manage_reports", actions: ["get"], description: "Pull campaign analytics" },
      { name: "manage_audiences", actions: ["create", "list"], description: "Manage matched audiences" },
    ],
    endpoints: {
      list_campaigns:        { method: "GET",  path: "/adCampaigns", query: ["q", "search", "count", "start"] },
      create_campaign:       { method: "POST", path: "/adCampaigns", body: { account: "", name: "", type: "SPONSORED_UPDATES", status: "PAUSED" } },
      get_campaign:          { method: "GET",  path: "/adCampaigns/{campaignId}" },
      update_campaign:       { method: "POST", path: "/adCampaigns/{campaignId}", body: {} },
      list_campaign_groups:  { method: "GET",  path: "/adCampaignGroups", query: ["q", "search", "count"] },
      create_campaign_group: { method: "POST", path: "/adCampaignGroups", body: { account: "", name: "", status: "ACTIVE" } },
      list_creatives:        { method: "GET",  path: "/adCreatives", query: ["q", "search", "campaigns", "count"] },
      create_creative:       { method: "POST", path: "/adCreatives", body: { campaign: "", reference: "" } },
      get_analytics:         { method: "GET",  path: "/adAnalytics", query: ["q", "dateRange", "campaigns", "pivot", "timeGranularity", "fields"] },
      create_audience:       { method: "POST", path: "/dmpSegments", body: { name: "", account: "", type: "" } },
      list_audiences:        { method: "GET",  path: "/dmpSegments", query: ["q", "account", "count"] },
    },
    authHeader: (creds) => ({
      "Authorization": `Bearer ${creds.access_token}`,
      "Content-Type": "application/json",
      "LinkedIn-Version": "202402",
      "X-Restli-Protocol-Version": "2.0.0",
    }),
  },

  // ── Instagram Ads ───────────────────────────────────────────
  instagram_ads: {
    name: "Instagram Ads",
    type: "advertising",
    description: "Instagram advertising — campaigns, ad sets, ads, insights via Facebook Marketing API",
    baseUrl: "https://graph.facebook.com/v19.0",
    authType: "access_token",
    credentialKeys: ["accessToken", "adAccountId"],
    capabilities: [
      { name: "manage_campaigns", actions: ["create", "list"], description: "Manage Instagram ad campaigns" },
      { name: "manage_adsets", actions: ["create", "list"], description: "Manage ad sets with Instagram placement" },
      { name: "manage_ads", actions: ["create", "list"], description: "Manage Instagram ad creatives" },
      { name: "manage_insights", actions: ["get"], description: "View Instagram ad performance" },
    ],
    endpoints: {
      create_campaign:      { method: "POST", path: "/act_{adAccountId}/campaigns", body: { name: "", objective: "", status: "PAUSED", special_ad_categories: [] } },
      list_campaigns:       { method: "GET",  path: "/act_{adAccountId}/campaigns", query: ["fields", "limit", "effective_status"] },
      create_adset:         { method: "POST", path: "/act_{adAccountId}/adsets", body: { name: "", campaign_id: "", daily_budget: 0, targeting: { publisher_platforms: ["instagram"] }, status: "PAUSED" } },
      list_adsets:          { method: "GET",  path: "/act_{adAccountId}/adsets", query: ["fields", "limit"] },
      create_ad:            { method: "POST", path: "/act_{adAccountId}/ads", body: { name: "", adset_id: "", creative: {}, status: "PAUSED" } },
      list_ads:             { method: "GET",  path: "/act_{adAccountId}/ads", query: ["fields", "limit"] },
      get_insights:         { method: "GET",  path: "/act_{adAccountId}/insights", query: ["fields", "date_preset", "level", "filtering"] },
      get_ad_previews:      { method: "GET",  path: "/{adId}/previews", query: ["ad_format"] },
    },
    authHeader: (creds) => ({
      "Authorization": `Bearer ${creds.accessToken}`,
      "Content-Type": "application/json",
    }),
  },

  // ── Smartlead ───────────────────────────────────────────────
  smartlead: {
    name: "Smartlead",
    type: "marketing",
    description: "Cold email outreach — campaigns, leads, sequences, email accounts",
    baseUrl: "https://server.smartlead.ai/api/v1",
    authType: "api_key",
    credentialKeys: ["apiKey"],
    capabilities: [
      { name: "manage_campaigns", actions: ["create", "list", "get", "update"], description: "Manage outreach campaigns" },
      { name: "manage_leads", actions: ["add", "list", "get"], description: "Add and manage leads" },
      { name: "manage_sequences", actions: ["create", "list"], description: "Create email sequences" },
      { name: "manage_email_accounts", actions: ["list", "add"], description: "Manage sending email accounts" },
    ],
    endpoints: {
      create_campaign:      { method: "POST", path: "/campaigns/create", query: ["api_key"], body: { name: "" } },
      list_campaigns:       { method: "GET",  path: "/campaigns", query: ["api_key"] },
      get_campaign:         { method: "GET",  path: "/campaigns/{campaignId}", query: ["api_key"] },
      update_campaign:      { method: "POST", path: "/campaigns/{campaignId}/settings", query: ["api_key"], body: {} },
      add_leads:            { method: "POST", path: "/campaigns/{campaignId}/leads", query: ["api_key"], body: { lead_list: [] } },
      list_leads:           { method: "GET",  path: "/campaigns/{campaignId}/leads", query: ["api_key", "offset", "limit"] },
      get_lead:             { method: "GET",  path: "/leads/{leadId}", query: ["api_key"] },
      add_email_account:    { method: "POST", path: "/email-accounts/save", query: ["api_key"], body: { from_name: "", from_email: "", smtp_host: "", smtp_port: 587 } },
      list_email_accounts:  { method: "GET",  path: "/email-accounts", query: ["api_key"] },
      get_campaign_stats:   { method: "GET",  path: "/campaigns/{campaignId}/analytics", query: ["api_key"] },
      create_sequence:      { method: "POST", path: "/campaigns/{campaignId}/sequences", query: ["api_key"], body: { sequences: [] } },
      list_sequences:       { method: "GET",  path: "/campaigns/{campaignId}/sequences", query: ["api_key"] },
    },
    authHeader: (creds) => ({
      "Content-Type": "application/json",
    }),
  },

  // ── Zapier ──────────────────────────────────────────────────
  zapier: {
    name: "Zapier",
    type: "automation",
    description: "Workflow automation — zaps, actions (limited API, most interaction via webhooks)",
    baseUrl: "https://api.zapier.com/v1",
    authType: "api_key",
    credentialKeys: ["apiKey"],
    capabilities: [
      { name: "manage_zaps", actions: ["list", "get", "enable", "disable"], description: "View and toggle zaps" },
      { name: "manage_actions", actions: ["list"], description: "List available actions" },
    ],
    endpoints: {
      list_zaps:            { method: "GET",  path: "/zaps" },
      get_zap:              { method: "GET",  path: "/zaps/{zapId}" },
      enable_zap:           { method: "PUT",  path: "/zaps/{zapId}", body: { is_enabled: true } },
      disable_zap:          { method: "PUT",  path: "/zaps/{zapId}", body: { is_enabled: false } },
      list_actions:         { method: "GET",  path: "/actions" },
    },
    authHeader: (creds) => ({
      "Authorization": `Bearer ${creds.apiKey}`,
      "Content-Type": "application/json",
    }),
  },

  // ── MuleSoft ────────────────────────────────────────────────
  mulesoft: {
    name: "MuleSoft",
    type: "integration",
    description: "Integration platform — APIs, applications, environments via Anypoint Platform",
    baseUrl: "https://anypoint.mulesoft.com",
    authType: "token",
    credentialKeys: ["token"],
    capabilities: [
      { name: "manage_apis", actions: ["list", "get"], description: "View API definitions and specifications" },
      { name: "manage_applications", actions: ["list", "get", "deploy"], description: "Deploy and manage applications" },
      { name: "manage_environments", actions: ["list"], description: "List deployment environments" },
    ],
    endpoints: {
      list_organizations:   { method: "GET",  path: "/accounts/api/me" },
      list_environments:    { method: "GET",  path: "/accounts/api/organizations/{orgId}/environments" },
      list_apis:            { method: "GET",  path: "/apimanager/api/v1/organizations/{orgId}/environments/{envId}/apis", query: ["limit", "offset"] },
      get_api:              { method: "GET",  path: "/apimanager/api/v1/organizations/{orgId}/environments/{envId}/apis/{apiId}" },
      list_applications:    { method: "GET",  path: "/amc/application-manager/api/v2/organizations/{orgId}/environments/{envId}/deployments" },
      get_application:      { method: "GET",  path: "/amc/application-manager/api/v2/organizations/{orgId}/environments/{envId}/deployments/{deploymentId}" },
      deploy_application:   { method: "POST", path: "/amc/application-manager/api/v2/organizations/{orgId}/environments/{envId}/deployments", body: { name: "", target: {} } },
    },
    authHeader: (creds) => ({
      "Authorization": `Bearer ${creds.token}`,
      "Content-Type": "application/json",
    }),
  },

  // ── Microsoft Azure ─────────────────────────────────────────
  azure: {
    name: "Microsoft Azure",
    type: "cloud",
    description: "Cloud infrastructure — resources, resource groups, storage, VMs via Azure Resource Manager",
    baseUrl: "https://management.azure.com",
    authType: "oauth",
    credentialKeys: ["access_token", "subscriptionId"],
    capabilities: [
      { name: "manage_resources", actions: ["list", "get", "create", "delete"], description: "Manage Azure resources" },
      { name: "manage_resource_groups", actions: ["list", "create"], description: "Manage resource groups" },
      { name: "manage_storage", actions: ["list_accounts", "list_containers"], description: "Manage storage accounts" },
      { name: "manage_vms", actions: ["list", "get", "start", "stop"], description: "Manage virtual machines" },
    ],
    endpoints: {
      list_subscriptions:    { method: "GET",  path: "/subscriptions", query: ["api-version=2022-12-01"] },
      list_resource_groups:  { method: "GET",  path: "/subscriptions/{subscriptionId}/resourcegroups", query: ["api-version=2023-07-01"] },
      create_resource_group: { method: "PUT",  path: "/subscriptions/{subscriptionId}/resourcegroups/{resourceGroupName}", query: ["api-version=2023-07-01"], body: { location: "" } },
      list_resources:        { method: "GET",  path: "/subscriptions/{subscriptionId}/resources", query: ["api-version=2023-07-01"] },
      get_resource:          { method: "GET",  path: "/{resourceId}", query: ["api-version=2023-07-01"] },
      delete_resource:       { method: "DELETE", path: "/{resourceId}", query: ["api-version=2023-07-01"] },
      list_storage_accounts: { method: "GET",  path: "/subscriptions/{subscriptionId}/providers/Microsoft.Storage/storageAccounts", query: ["api-version=2023-01-01"] },
      list_vms:              { method: "GET",  path: "/subscriptions/{subscriptionId}/providers/Microsoft.Compute/virtualMachines", query: ["api-version=2023-09-01"] },
      get_vm:                { method: "GET",  path: "/subscriptions/{subscriptionId}/resourceGroups/{resourceGroupName}/providers/Microsoft.Compute/virtualMachines/{vmName}", query: ["api-version=2023-09-01"] },
      start_vm:              { method: "POST", path: "/subscriptions/{subscriptionId}/resourceGroups/{resourceGroupName}/providers/Microsoft.Compute/virtualMachines/{vmName}/start", query: ["api-version=2023-09-01"] },
      stop_vm:               { method: "POST", path: "/subscriptions/{subscriptionId}/resourceGroups/{resourceGroupName}/providers/Microsoft.Compute/virtualMachines/{vmName}/deallocate", query: ["api-version=2023-09-01"] },
    },
    authHeader: (creds) => ({
      "Authorization": `Bearer ${creds.access_token}`,
      "Content-Type": "application/json",
    }),
  },

  // ── Pipedrive ───────────────────────────────────────────────
  pipedrive: {
    name: "Pipedrive",
    type: "crm",
    description: "Sales CRM — deals, persons, organizations, activities, pipelines, notes",
    baseUrl: "https://api.pipedrive.com/v1",
    authType: "api_key",
    credentialKeys: ["apiKey"],
    capabilities: [
      { name: "manage_deals", actions: ["create", "list", "get", "update", "delete"], description: "Full deal lifecycle management" },
      { name: "manage_persons", actions: ["create", "list", "get", "update", "delete"], description: "Manage contact persons" },
      { name: "manage_organizations", actions: ["create", "list", "get"], description: "Manage organizations" },
      { name: "manage_activities", actions: ["create", "list", "get"], description: "Schedule and track activities" },
      { name: "manage_pipelines", actions: ["list", "get"], description: "View sales pipelines and stages" },
      { name: "manage_notes", actions: ["create", "list"], description: "Add and view notes" },
    ],
    endpoints: {
      create_deal:          { method: "POST", path: "/deals", query: ["api_token"], body: { title: "" } },
      list_deals:           { method: "GET",  path: "/deals", query: ["api_token", "start", "limit", "status", "sort"] },
      get_deal:             { method: "GET",  path: "/deals/{dealId}", query: ["api_token"] },
      update_deal:          { method: "PUT",  path: "/deals/{dealId}", query: ["api_token"], body: {} },
      delete_deal:          { method: "DELETE", path: "/deals/{dealId}", query: ["api_token"] },
      create_person:        { method: "POST", path: "/persons", query: ["api_token"], body: { name: "" } },
      list_persons:         { method: "GET",  path: "/persons", query: ["api_token", "start", "limit", "sort"] },
      get_person:           { method: "GET",  path: "/persons/{personId}", query: ["api_token"] },
      update_person:        { method: "PUT",  path: "/persons/{personId}", query: ["api_token"], body: {} },
      delete_person:        { method: "DELETE", path: "/persons/{personId}", query: ["api_token"] },
      create_organization:  { method: "POST", path: "/organizations", query: ["api_token"], body: { name: "" } },
      list_organizations:   { method: "GET",  path: "/organizations", query: ["api_token", "start", "limit", "sort"] },
      create_activity:      { method: "POST", path: "/activities", query: ["api_token"], body: { subject: "", type: "" } },
      list_activities:      { method: "GET",  path: "/activities", query: ["api_token", "start", "limit", "type"] },
      list_pipelines:       { method: "GET",  path: "/pipelines", query: ["api_token"] },
      get_pipeline:         { method: "GET",  path: "/pipelines/{pipelineId}", query: ["api_token"] },
      create_note:          { method: "POST", path: "/notes", query: ["api_token"], body: { content: "" } },
      list_notes:           { method: "GET",  path: "/notes", query: ["api_token", "start", "limit", "sort"] },
      search_items:         { method: "GET",  path: "/itemSearch", query: ["api_token", "term", "item_types", "fields"] },
    },
    authHeader: (creds) => ({
      "Content-Type": "application/json",
    }),
  },

  // ── LinkedIn ────────────────────────────────────────────────
  linkedin: {
    name: "LinkedIn",
    type: "social",
    description: "Professional network — posts, profile, connections, organizations via LinkedIn API",
    baseUrl: "https://api.linkedin.com/rest",
    authType: "oauth",
    credentialKeys: ["access_token"],
    capabilities: [
      { name: "manage_posts", actions: ["create", "list", "delete"], description: "Create and manage posts" },
      { name: "manage_profile", actions: ["get"], description: "View profile information" },
      { name: "manage_connections", actions: ["list"], description: "View connections" },
      { name: "manage_organizations", actions: ["get", "list_posts"], description: "View company pages and posts" },
    ],
    endpoints: {
      create_post:          { method: "POST", path: "/posts", body: { author: "", commentary: "", visibility: "PUBLIC", distribution: { feedDistribution: "MAIN_FEED" }, lifecycleState: "PUBLISHED" } },
      get_profile:          { method: "GET",  path: "/me", query: ["projection"] },
      list_connections:     { method: "GET",  path: "/connections", query: ["start", "count", "projection"] },
      get_organization:     { method: "GET",  path: "/organizations/{organizationId}", query: ["projection"] },
      list_org_posts:       { method: "GET",  path: "/posts", query: ["author", "q", "count", "start"] },
      delete_post:          { method: "DELETE", path: "/posts/{postId}" },
      get_post:             { method: "GET",  path: "/posts/{postId}" },
      upload_image:         { method: "POST", path: "/images", query: ["action=initializeUpload"], body: { initializeUploadRequest: { owner: "" } } },
    },
    authHeader: (creds) => ({
      "Authorization": `Bearer ${creds.access_token}`,
      "Content-Type": "application/json",
      "LinkedIn-Version": "202402",
      "X-Restli-Protocol-Version": "2.0.0",
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
