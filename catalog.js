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
