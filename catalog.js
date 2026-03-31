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
    description: "Developer-first email API — transactional emails, broadcasts, contacts, domains, templates, segments, webhooks",
    baseUrl: "https://api.resend.com",
    authType: "api_key",
    credentialKeys: ["apiKey"],
    capabilities: [
      { name: "send_email", actions: ["send"], description: "Send transactional emails with HTML, React templates, scheduling, and attachments" },
      { name: "batch_emails", actions: ["send"], description: "Send up to 100 emails in a single batch request" },
      { name: "manage_emails", actions: ["list", "get", "update", "cancel"], description: "List, retrieve, update scheduled, and cancel emails" },
      { name: "receive_emails", actions: ["list", "get"], description: "List and retrieve received inbound emails" },
      { name: "manage_attachments", actions: ["list", "get"], description: "List and retrieve attachments from sent and received emails" },
      { name: "manage_domains", actions: ["create", "list", "get", "update", "verify", "delete"], description: "Create, list, verify, update, and delete email domains" },
      { name: "manage_api_keys", actions: ["create", "list", "delete"], description: "Create, list, and delete API keys" },
      { name: "manage_audiences", actions: ["create", "list", "get", "delete"], description: "Create, list, get, and delete audiences (deprecated — use segments)" },
      { name: "manage_contacts", actions: ["create", "list", "get", "update", "delete"], description: "Create, list, get, update, and delete contacts" },
      { name: "manage_contact_segments", actions: ["add", "remove", "list"], description: "Add, remove, and list segment memberships for contacts" },
      { name: "manage_contact_topics", actions: ["get", "update"], description: "Get and update topic subscriptions for contacts" },
      { name: "manage_broadcasts", actions: ["create", "list", "get", "update", "send", "delete"], description: "Create, list, get, update, send, and delete broadcasts" },
      { name: "manage_segments", actions: ["create", "list", "get", "delete"], description: "Create, list, get, and delete segments" },
      { name: "manage_contact_properties", actions: ["create", "list", "get", "update", "delete"], description: "Create, list, get, update, and delete contact properties" },
      { name: "manage_templates", actions: ["create", "list", "get", "update", "delete", "duplicate", "publish"], description: "Create, list, get, update, delete, duplicate, and publish email templates" },
      { name: "manage_topics", actions: ["create", "list", "get", "update", "delete"], description: "Create, list, get, update, and delete email topics" },
      { name: "manage_webhooks", actions: ["create", "list", "get", "update", "delete"], description: "Create, list, get, update, and delete webhooks" },
    ],
    endpoints: {
      // ── Emails ──
      send_email:               { method: "POST",   path: "/emails", body: { from: "", to: [], subject: "", html: "" } },
      send_batch_emails:        { method: "POST",   path: "/emails/batch", body: [] },
      list_emails:              { method: "GET",    path: "/emails" },
      get_email:                { method: "GET",    path: "/emails/{email_id}" },
      update_email:             { method: "PATCH",  path: "/emails/{email_id}" },
      cancel_email:             { method: "POST",   path: "/emails/{email_id}/cancel" },
      // ── Received Emails ──
      list_received_emails:     { method: "GET",    path: "/emails/receiving" },
      get_received_email:       { method: "GET",    path: "/emails/receiving/{email_id}" },
      // ── Attachments ──
      list_email_attachments:   { method: "GET",    path: "/emails/{email_id}/attachments" },
      get_email_attachment:     { method: "GET",    path: "/emails/{email_id}/attachments/{attachment_id}" },
      list_received_attachments:{ method: "GET",    path: "/emails/receiving/{email_id}/attachments" },
      get_received_attachment:  { method: "GET",    path: "/emails/receiving/{email_id}/attachments/{attachment_id}" },
      // ── Domains ──
      create_domain:            { method: "POST",   path: "/domains", body: { name: "" } },
      list_domains:             { method: "GET",    path: "/domains" },
      get_domain:               { method: "GET",    path: "/domains/{domain_id}" },
      update_domain:            { method: "PATCH",  path: "/domains/{domain_id}" },
      verify_domain:            { method: "POST",   path: "/domains/{domain_id}/verify" },
      delete_domain:            { method: "DELETE", path: "/domains/{domain_id}" },
      // ── API Keys ──
      create_api_key:           { method: "POST",   path: "/api-keys", body: { name: "" } },
      list_api_keys:            { method: "GET",    path: "/api-keys" },
      delete_api_key:           { method: "DELETE", path: "/api-keys/{api_key_id}" },
      // ── Audiences (deprecated) ──
      create_audience:          { method: "POST",   path: "/audiences", body: { name: "" } },
      list_audiences:           { method: "GET",    path: "/audiences" },
      get_audience:             { method: "GET",    path: "/audiences/{audience_id}" },
      delete_audience:          { method: "DELETE", path: "/audiences/{audience_id}" },
      // ── Contacts ──
      create_contact:           { method: "POST",   path: "/contacts", body: { email: "" } },
      list_contacts:            { method: "GET",    path: "/contacts" },
      get_contact:              { method: "GET",    path: "/contacts/{contact_id}" },
      update_contact:           { method: "PATCH",  path: "/contacts/{contact_id}" },
      delete_contact:           { method: "DELETE", path: "/contacts/{contact_id}" },
      add_contact_to_segment:   { method: "POST",   path: "/contacts/{contact_id}/segments/{segment_id}" },
      remove_contact_from_segment: { method: "DELETE", path: "/contacts/{contact_id}/segments/{segment_id}" },
      list_contact_segments:    { method: "GET",    path: "/contacts/{contact_id}/segments" },
      get_contact_topics:       { method: "GET",    path: "/contacts/{contact_id}/topics" },
      update_contact_topics:    { method: "PATCH",  path: "/contacts/{contact_id}/topics" },
      // ── Broadcasts ──
      create_broadcast:         { method: "POST",   path: "/broadcasts", body: { segment_id: "", from: "", subject: "" } },
      list_broadcasts:          { method: "GET",    path: "/broadcasts" },
      get_broadcast:            { method: "GET",    path: "/broadcasts/{broadcast_id}" },
      update_broadcast:         { method: "PATCH",  path: "/broadcasts/{broadcast_id}" },
      send_broadcast:           { method: "POST",   path: "/broadcasts/{broadcast_id}/send" },
      delete_broadcast:         { method: "DELETE", path: "/broadcasts/{broadcast_id}" },
      // ── Segments ──
      create_segment:           { method: "POST",   path: "/segments", body: { name: "" } },
      list_segments:            { method: "GET",    path: "/segments" },
      get_segment:              { method: "GET",    path: "/segments/{segment_id}" },
      delete_segment:           { method: "DELETE", path: "/segments/{segment_id}" },
      // ── Contact Properties ──
      create_contact_property:  { method: "POST",   path: "/contact-properties", body: { name: "", type: "string" } },
      list_contact_properties:  { method: "GET",    path: "/contact-properties" },
      get_contact_property:     { method: "GET",    path: "/contact-properties/{property_id}" },
      update_contact_property:  { method: "PATCH",  path: "/contact-properties/{property_id}" },
      delete_contact_property:  { method: "DELETE", path: "/contact-properties/{property_id}" },
      // ── Templates ──
      create_template:          { method: "POST",   path: "/templates", body: { name: "", html: "" } },
      list_templates:           { method: "GET",    path: "/templates" },
      get_template:             { method: "GET",    path: "/templates/{template_id}" },
      update_template:          { method: "PATCH",  path: "/templates/{template_id}" },
      delete_template:          { method: "DELETE", path: "/templates/{template_id}" },
      duplicate_template:       { method: "POST",   path: "/templates/{template_id}/duplicate" },
      publish_template:         { method: "POST",   path: "/templates/{template_id}/publish" },
      // ── Topics ──
      create_topic:             { method: "POST",   path: "/topics", body: { name: "" } },
      list_topics:              { method: "GET",    path: "/topics" },
      get_topic:                { method: "GET",    path: "/topics/{topic_id}" },
      update_topic:             { method: "PATCH",  path: "/topics/{topic_id}" },
      delete_topic:             { method: "DELETE", path: "/topics/{topic_id}" },
      // ── Webhooks ──
      create_webhook:           { method: "POST",   path: "/webhooks", body: { endpoint_url: "", events: [] } },
      list_webhooks:            { method: "GET",    path: "/webhooks" },
      get_webhook:              { method: "GET",    path: "/webhooks/{webhook_id}" },
      update_webhook:           { method: "PATCH",  path: "/webhooks/{webhook_id}" },
      delete_webhook:           { method: "DELETE", path: "/webhooks/{webhook_id}" },
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
    description: "Professional network — profile, posts, comments, likes, organizations, page analytics, events, advertising, ad reporting via LinkedIn API v2",
    baseUrl: "https://api.linkedin.com",
    authType: "oauth2",
    scopes: ["rw_organization_admin", "w_member_social", "r_profile_basicinfo", "rw_events", "r_ads", "r_basicprofile", "r_organization_admin", "email", "r_1st_connections_size", "openid", "profile", "r_ads_reporting", "r_organization_social", "r_verify", "w_organization_social", "rw_ads", "r_events"],
    credentialKeys: ["access_token"],
    capabilities: [
      { name: "manage_profile", actions: ["get", "get_email", "get_connections", "get_verification", "get_photos"], description: "View profile, email, connections count, verification status, and photos" },
      { name: "manage_posts", actions: ["create", "get", "delete"], description: "Create, read, and delete posts for members or organizations" },
      { name: "manage_social_actions", actions: ["comment", "list_comments", "like", "unlike"], description: "Comment on and like/unlike posts" },
      { name: "manage_shares", actions: ["list"], description: "List shared content" },
      { name: "manage_media", actions: ["upload_image", "upload_video"], description: "Upload images and videos for posts" },
      { name: "manage_organizations", actions: ["get", "list_admin_orgs", "update", "get_brand_pages"], description: "View and manage organization pages" },
      { name: "manage_org_analytics", actions: ["page_stats", "follower_stats", "share_stats", "follower_count", "visitor_stats"], description: "Organization page analytics and statistics" },
      { name: "manage_ads", actions: ["list_accounts", "get_account", "create_campaign_group", "list_campaign_groups", "create_campaign", "list_campaigns", "update_campaign", "create_creative", "list_creatives", "update_creative"], description: "Manage ad accounts, campaigns, and creatives" },
      { name: "manage_ad_extras", actions: ["get_analytics", "get_budget_pricing", "create_sponsored_content", "get_targeting", "get_form_responses"], description: "Ad analytics, targeting, budget suggestions, and lead gen forms" },
      { name: "manage_ad_reporting", actions: ["get_performance", "get_statistics", "get_conversions", "get_budget_reports", "get_inmail_analytics"], description: "Campaign performance metrics, conversion tracking, and InMail analytics" },
      { name: "manage_events", actions: ["create", "get", "update", "delete", "list_attendees"], description: "Create, manage, and track events and attendees" },
    ],
    endpoints: {
      // ── Profile (5) ───────────────────────────────────────────
      get_profile:                { method: "GET",  path: "/v2/me", query: ["projection"] },
      get_email:                  { method: "GET",  path: "/v2/emailAddress", query: ["q=members", "projection=(elements*(handle~))"] },
      get_connections_size:       { method: "GET",  path: "/v2/connections", query: ["q=viewer", "start", "count"] },
      get_verification:           { method: "GET",  path: "/v2/profileVerification", query: ["q=member"] },
      get_profile_pictures:       { method: "GET",  path: "/v2/profilePictures", query: ["q=member", "projection"] },

      // ── Social / Posts (10) ───────────────────────────────────
      create_post:                { method: "POST", path: "/v2/posts", body: { author: "", commentary: "", visibility: "PUBLIC", distribution: { feedDistribution: "MAIN_FEED" }, lifecycleState: "PUBLISHED" } },
      get_post:                   { method: "GET",  path: "/v2/posts/{postId}" },
      delete_post:                { method: "DELETE", path: "/v2/posts/{postId}" },
      add_comment:                { method: "POST", path: "/v2/socialActions/{activityId}/comments", body: { actor: "", message: { text: "" } } },
      list_comments:              { method: "GET",  path: "/v2/socialActions/{activityId}/comments", query: ["start", "count"] },
      like_post:                  { method: "POST", path: "/v2/socialActions/{activityId}/likes", body: { actor: "" } },
      unlike_post:                { method: "DELETE", path: "/v2/socialActions/{activityId}/likes/{likeId}" },
      list_shares:                { method: "GET",  path: "/v2/shares", query: ["q", "owners", "count", "start"] },
      upload_image:               { method: "POST", path: "/v2/images", query: ["action=initializeUpload"], body: { initializeUploadRequest: { owner: "" } } },
      upload_video:               { method: "POST", path: "/v2/videos", query: ["action=initializeUpload"], body: { initializeUploadRequest: { owner: "", fileSizeBytes: 0 } } },

      // ── Organization Pages (10) ───────────────────────────────
      get_organization:           { method: "GET",  path: "/v2/organizations/{organizationId}", query: ["projection"] },
      list_admin_orgs:            { method: "GET",  path: "/v2/organizationalEntityAcls", query: ["q=roleAssignee", "role", "projection"] },
      create_org_post:            { method: "POST", path: "/v2/posts", body: { author: "urn:li:organization:{organizationId}", commentary: "", visibility: "PUBLIC", distribution: { feedDistribution: "MAIN_FEED" }, lifecycleState: "PUBLISHED" } },
      get_page_statistics:        { method: "GET",  path: "/v2/organizationPageStatistics", query: ["q=organization", "organization", "timeIntervals"] },
      get_follower_statistics:    { method: "GET",  path: "/v2/organizationalEntityFollowerStatistics", query: ["q=organizationalEntity", "organizationalEntity", "timeIntervals"] },
      get_share_statistics:       { method: "GET",  path: "/v2/organizationalEntityShareStatistics", query: ["q=organizationalEntity", "organizationalEntity", "shares"] },
      get_follower_count:         { method: "GET",  path: "/v2/networkSizes/{organizationUrn}", query: ["edgeType=CompanyFollowedByMember"] },
      update_organization:        { method: "PUT",  path: "/v2/organizations/{organizationId}", body: {} },
      get_brand_pages:            { method: "GET",  path: "/v2/organizationBrandPages", query: ["q=parentOrganization", "parentOrganization"] },
      get_visitor_statistics:     { method: "GET",  path: "/v2/organizationPageVisitorStatistics", query: ["q=organization", "organization", "timeIntervals"] },

      // ── Advertising (15) ──────────────────────────────────────
      list_ad_accounts:           { method: "GET",  path: "/v2/adAccountsV2", query: ["q=search", "search", "count", "start"] },
      get_ad_account:             { method: "GET",  path: "/v2/adAccountsV2/{adAccountId}" },
      create_campaign_group:      { method: "POST", path: "/v2/adCampaignGroupsV2", body: { account: "", name: "", status: "ACTIVE" } },
      list_campaign_groups:       { method: "GET",  path: "/v2/adCampaignGroupsV2", query: ["q=search", "search", "count", "start"] },
      create_campaign:            { method: "POST", path: "/v2/adCampaignsV2", body: { account: "", campaignGroup: "", name: "", type: "SPONSORED_UPDATES", costType: "CPM", status: "PAUSED" } },
      list_campaigns:             { method: "GET",  path: "/v2/adCampaignsV2", query: ["q=search", "search", "count", "start"] },
      update_campaign:            { method: "PATCH", path: "/v2/adCampaignsV2/{campaignId}", body: {} },
      create_creative:            { method: "POST", path: "/v2/adCreativesV2", body: { campaign: "", reference: "" } },
      list_creatives:             { method: "GET",  path: "/v2/adCreativesV2", query: ["q=search", "search", "campaigns", "count"] },
      update_creative:            { method: "PATCH", path: "/v2/adCreativesV2/{creativeId}", body: {} },
      get_ad_analytics:           { method: "GET",  path: "/v2/adAnalyticsV2", query: ["q=analytics", "dateRange", "campaigns", "pivot", "timeGranularity", "fields"] },
      get_budget_pricing:         { method: "GET",  path: "/v2/adBudgetPricingV2", query: ["account", "campaign", "bidType", "match"] },
      create_sponsored_content:   { method: "POST", path: "/v2/adDirectSponsoredContents", body: { account: "", owner: "", content: {} } },
      get_targeting_facets:       { method: "GET",  path: "/v2/adTargetingFacets", query: ["q=search", "search", "queryType"] },
      get_form_responses:         { method: "GET",  path: "/v2/adFormResponses", query: ["q=account", "account", "versionedLeadGenFormUrn", "count", "start"] },

      // ── Ad Reporting (5) ──────────────────────────────────────
      get_performance_metrics:    { method: "GET",  path: "/v2/adAnalyticsV2", query: ["q=analytics", "dateRange", "accounts", "campaigns", "creatives", "pivot", "timeGranularity", "fields"] },
      get_aggregate_statistics:   { method: "GET",  path: "/v2/adAnalyticsV2", query: ["q=statistics", "accounts", "dateRange", "fields"] },
      get_conversion_tracking:    { method: "GET",  path: "/v2/conversionTrackingV2", query: ["q=account", "account", "count", "start"] },
      get_budget_reports:         { method: "GET",  path: "/v2/adBudgetV2", query: ["q=account", "account", "count", "start"] },
      get_inmail_analytics:       { method: "GET",  path: "/v2/adInMailContentV2", query: ["q=account", "account", "campaign", "count", "start"] },

      // ── Events (5) ────────────────────────────────────────────
      create_event:               { method: "POST", path: "/v2/events", body: { organizer: "", name: { locale: { language: "en", country: "US" }, value: "" }, description: {}, startAt: "", endAt: "" } },
      get_event:                  { method: "GET",  path: "/v2/events/{eventId}" },
      update_event:               { method: "PUT",  path: "/v2/events/{eventId}", body: {} },
      delete_event:               { method: "DELETE", path: "/v2/events/{eventId}" },
      list_event_attendees:       { method: "GET",  path: "/v2/eventAttendees", query: ["q=event", "event", "count", "start"] },
    },
    authHeader: (creds) => ({
      "Authorization": `Bearer ${creds.access_token}`,
      "Content-Type": "application/json",
      "LinkedIn-Version": "202402",
      "X-Restli-Protocol-Version": "2.0.0",
    }),
  },

  // ── Cloudflare ──────────────────────────────────────────────
  cloudflare: {
    name: "Cloudflare",
    type: "cloud",
    description: "Edge computing & CDN — Workers, KV, R2 storage, D1 database, DNS, WAF, DDoS protection, analytics",
    baseUrl: "https://api.cloudflare.com/client/v4",
    authType: "api_key",
    credentialKeys: ["apiToken"],
    capabilities: [
      { name: "manage_workers", actions: ["list", "create", "update", "delete", "deploy"], description: "Deploy and manage Cloudflare Workers" },
      { name: "manage_kv", actions: ["list_namespaces", "read", "write", "delete"], description: "Key-Value storage for Workers" },
      { name: "manage_r2", actions: ["list_buckets", "create_bucket", "list_objects", "put_object", "get_object", "delete_object"], description: "S3-compatible object storage" },
      { name: "manage_d1", actions: ["list_databases", "create_database", "query"], description: "Serverless SQL database" },
      { name: "manage_dns", actions: ["list_zones", "list_records", "create_record", "update_record", "delete_record"], description: "DNS zone and record management" },
      { name: "manage_waf", actions: ["list_rules", "create_rule", "update_rule"], description: "Web Application Firewall rules" },
      { name: "manage_pages", actions: ["list_projects", "create_deployment"], description: "Cloudflare Pages static site deployments" },
      { name: "analytics", actions: ["get_zone_analytics", "get_worker_analytics"], description: "Traffic and performance analytics" },
    ],
    endpoints: {
      list_zones:            { method: "GET",  path: "/zones", query: ["name", "status", "page", "per_page"] },
      get_zone:              { method: "GET",  path: "/zones/{zoneId}" },
      list_dns_records:      { method: "GET",  path: "/zones/{zoneId}/dns_records", query: ["type", "name", "page", "per_page"] },
      create_dns_record:     { method: "POST", path: "/zones/{zoneId}/dns_records", body: { type: "", name: "", content: "", ttl: 1, proxied: true } },
      update_dns_record:     { method: "PUT",  path: "/zones/{zoneId}/dns_records/{recordId}", body: {} },
      delete_dns_record:     { method: "DELETE", path: "/zones/{zoneId}/dns_records/{recordId}" },
      list_workers:          { method: "GET",  path: "/accounts/{accountId}/workers/scripts" },
      get_worker:            { method: "GET",  path: "/accounts/{accountId}/workers/scripts/{scriptName}" },
      delete_worker:         { method: "DELETE", path: "/accounts/{accountId}/workers/scripts/{scriptName}" },
      list_kv_namespaces:    { method: "GET",  path: "/accounts/{accountId}/storage/kv/namespaces" },
      create_kv_namespace:   { method: "POST", path: "/accounts/{accountId}/storage/kv/namespaces", body: { title: "" } },
      read_kv_value:         { method: "GET",  path: "/accounts/{accountId}/storage/kv/namespaces/{namespaceId}/values/{keyName}" },
      write_kv_value:        { method: "PUT",  path: "/accounts/{accountId}/storage/kv/namespaces/{namespaceId}/values/{keyName}" },
      delete_kv_value:       { method: "DELETE", path: "/accounts/{accountId}/storage/kv/namespaces/{namespaceId}/values/{keyName}" },
      list_r2_buckets:       { method: "GET",  path: "/accounts/{accountId}/r2/buckets" },
      create_r2_bucket:      { method: "POST", path: "/accounts/{accountId}/r2/buckets", body: { name: "" } },
      list_d1_databases:     { method: "GET",  path: "/accounts/{accountId}/d1/database" },
      create_d1_database:    { method: "POST", path: "/accounts/{accountId}/d1/database", body: { name: "" } },
      query_d1:              { method: "POST", path: "/accounts/{accountId}/d1/database/{databaseId}/query", body: { sql: "" } },
      list_pages_projects:   { method: "GET",  path: "/accounts/{accountId}/pages/projects" },
      get_zone_analytics:    { method: "GET",  path: "/zones/{zoneId}/analytics/dashboard", query: ["since", "until"] },
    },
    authHeader: (creds) => ({
      "Authorization": `Bearer ${creds.apiToken}`,
      "Content-Type": "application/json",
    }),
  },

  // ── GoDaddy ───────────────────────────────────────────────────
  godaddy: {
    name: "GoDaddy",
    type: "domains",
    description: "Domain registrar — search, check availability, manage DNS records, domain registration and management",
    baseUrl: "https://api.godaddy.com/v1",
    authType: "api_key",
    credentialKeys: ["apiKey", "apiSecret"],
    capabilities: [
      { name: "search_domains", actions: ["suggest", "check_availability"], description: "Search and check domain name availability" },
      { name: "manage_domains", actions: ["list", "get", "purchase"], description: "List owned domains and purchase new ones" },
      { name: "manage_dns", actions: ["list_records", "add_record", "update_record", "delete_record"], description: "Manage DNS records for owned domains" },
    ],
    endpoints: {
      suggest_domains:       { method: "GET",  path: "/domains/suggest", query: ["query", "limit", "tlds"] },
      check_availability:    { method: "GET",  path: "/domains/available", query: ["domain"] },
      list_domains:          { method: "GET",  path: "/domains", query: ["limit", "marker", "status"] },
      get_domain:            { method: "GET",  path: "/domains/{domain}" },
      purchase_domain:       { method: "POST", path: "/domains/purchase", body: { domain: "", consent: {} } },
      list_dns_records:      { method: "GET",  path: "/domains/{domain}/records", query: ["type", "name"] },
      add_dns_records:       { method: "PATCH", path: "/domains/{domain}/records", body: [] },
      update_dns_record:     { method: "PUT",  path: "/domains/{domain}/records/{type}/{name}", body: [] },
      delete_dns_record:     { method: "DELETE", path: "/domains/{domain}/records/{type}/{name}" },
    },
    authHeader: (creds) => ({
      "Authorization": `sso-key ${creds.apiKey}:${creds.apiSecret}`,
      "Content-Type": "application/json",
    }),
  },

  // ── n8n ─────────────────────────────────────────────────────
  n8n: {
    name: "n8n",
    type: "automation",
    description: "Open-source workflow automation — workflows, executions, credentials, triggers, webhooks (self-hosted or cloud)",
    baseUrl: "https://app.n8n.cloud/api/v1",
    authType: "api_key",
    credentialKeys: ["apiKey", "baseUrl"],
    capabilities: [
      { name: "manage_workflows", actions: ["list", "get", "create", "update", "delete", "activate", "deactivate"], description: "Create and manage automation workflows" },
      { name: "manage_executions", actions: ["list", "get", "delete"], description: "View and manage workflow execution history" },
      { name: "manage_credentials", actions: ["list", "create", "delete"], description: "Manage integration credentials" },
      { name: "trigger_workflow", actions: ["execute"], description: "Trigger a workflow via webhook or API" },
    ],
    endpoints: {
      list_workflows:        { method: "GET",  path: "/workflows", query: ["active", "limit", "cursor"] },
      get_workflow:           { method: "GET",  path: "/workflows/{workflowId}" },
      create_workflow:        { method: "POST", path: "/workflows", body: { name: "", nodes: [], connections: {} } },
      update_workflow:        { method: "PUT",  path: "/workflows/{workflowId}", body: {} },
      delete_workflow:        { method: "DELETE", path: "/workflows/{workflowId}" },
      activate_workflow:      { method: "PATCH", path: "/workflows/{workflowId}", body: { active: true } },
      deactivate_workflow:    { method: "PATCH", path: "/workflows/{workflowId}", body: { active: false } },
      list_executions:        { method: "GET",  path: "/executions", query: ["workflowId", "status", "limit", "cursor"] },
      get_execution:          { method: "GET",  path: "/executions/{executionId}" },
      delete_execution:       { method: "DELETE", path: "/executions/{executionId}" },
      list_credentials:       { method: "GET",  path: "/credentials", query: ["limit", "cursor"] },
      create_credential:      { method: "POST", path: "/credentials", body: { name: "", type: "", data: {} } },
      delete_credential:      { method: "DELETE", path: "/credentials/{credentialId}" },
      execute_workflow:        { method: "POST", path: "/workflows/{workflowId}/run", body: {} },
    },
    authHeader: (creds) => ({
      "X-N8N-API-KEY": creds.apiKey,
      "Content-Type": "application/json",
    }),
  },

  // ── Pabbly Connect ──────────────────────────────────────────
  pabbly: {
    name: "Pabbly Connect",
    type: "automation",
    description: "Workflow automation — connect apps, build automations, manage workflows with webhook triggers",
    baseUrl: "https://connect.pabbly.com/api",
    authType: "api_key",
    credentialKeys: ["apiKey"],
    capabilities: [
      { name: "manage_workflows", actions: ["list", "get", "create", "enable", "disable"], description: "Create and manage automation workflows" },
      { name: "manage_connections", actions: ["list"], description: "View connected app integrations" },
      { name: "manage_executions", actions: ["list", "get"], description: "View workflow execution history and logs" },
      { name: "trigger_workflow", actions: ["execute"], description: "Trigger a workflow via webhook" },
    ],
    endpoints: {
      list_workflows:        { method: "GET",  path: "/workflows", query: ["page", "limit"] },
      get_workflow:           { method: "GET",  path: "/workflows/{workflowId}" },
      create_workflow:        { method: "POST", path: "/workflows", body: { name: "", trigger: {} } },
      enable_workflow:        { method: "PUT",  path: "/workflows/{workflowId}/enable" },
      disable_workflow:       { method: "PUT",  path: "/workflows/{workflowId}/disable" },
      list_connections:       { method: "GET",  path: "/connections" },
      list_executions:        { method: "GET",  path: "/workflows/{workflowId}/executions", query: ["page", "limit"] },
      get_execution:          { method: "GET",  path: "/workflows/{workflowId}/executions/{executionId}" },
      trigger_webhook:        { method: "POST", path: "/webhooks/{webhookId}", body: {} },
    },
    authHeader: (creds) => ({
      "Authorization": `Bearer ${creds.apiKey}`,
      "Content-Type": "application/json",
    }),
  },

  // ── Make (Integromat) ─────────────────────────────────────
  make: {
    name: "Make",
    type: "automation",
    description: "Visual automation platform (formerly Integromat) — scenarios, organizations, connections, data stores",
    baseUrl: "https://us1.make.com/api/v2",
    authType: "api_key",
    credentialKeys: ["apiToken"],
    capabilities: [
      { name: "manage_scenarios", actions: ["list", "get", "create", "update", "start", "stop", "run"], description: "Create and manage automation scenarios" },
      { name: "manage_connections", actions: ["list", "get", "verify"], description: "Manage app connections" },
      { name: "manage_data_stores", actions: ["list", "get_records"], description: "Access internal data stores" },
      { name: "manage_organizations", actions: ["list", "get"], description: "View organizations and teams" },
      { name: "manage_executions", actions: ["list"], description: "View scenario execution history" },
    ],
    endpoints: {
      list_scenarios:        { method: "GET",  path: "/scenarios", query: ["teamId", "folderId", "pg[limit]", "pg[offset]"] },
      get_scenario:          { method: "GET",  path: "/scenarios/{scenarioId}" },
      create_scenario:       { method: "POST", path: "/scenarios", body: { teamId: 0, name: "", blueprint: {} } },
      update_scenario:       { method: "PATCH", path: "/scenarios/{scenarioId}", body: {} },
      start_scenario:        { method: "POST", path: "/scenarios/{scenarioId}/start" },
      stop_scenario:         { method: "POST", path: "/scenarios/{scenarioId}/stop" },
      run_scenario:          { method: "POST", path: "/scenarios/{scenarioId}/run", body: {} },
      list_connections:      { method: "GET",  path: "/connections", query: ["teamId", "pg[limit]"] },
      get_connection:        { method: "GET",  path: "/connections/{connectionId}" },
      verify_connection:     { method: "POST", path: "/connections/{connectionId}/test" },
      list_data_stores:      { method: "GET",  path: "/data-stores", query: ["teamId"] },
      get_data_store_records:{ method: "GET",  path: "/data-stores/{dataStoreId}/data", query: ["pg[limit]", "pg[offset]"] },
      list_organizations:    { method: "GET",  path: "/organizations" },
      get_organization:      { method: "GET",  path: "/organizations/{organizationId}" },
      list_executions:       { method: "GET",  path: "/scenarios/{scenarioId}/logs", query: ["pg[limit]", "pg[offset]"] },
    },
    authHeader: (creds) => ({
      "Authorization": `Token ${creds.apiToken}`,
      "Content-Type": "application/json",
    }),
  },

  // ── Whimsical ──────────────────────────────────────────────
  whimsical: {
    name: "Whimsical",
    type: "design",
    description: "Visual collaboration — flowcharts, wireframes, mind maps, docs, sticky notes, and AI-powered diagramming",
    baseUrl: "https://api.whimsical.com",
    authType: "oauth",
    credentialKeys: ["accessToken"],
    capabilities: [
      { name: "manage_workspaces", actions: ["list", "get"], description: "List and view workspaces" },
      { name: "manage_boards", actions: ["list", "get", "create", "update", "delete"], description: "Create and manage whiteboards, flowcharts, wireframes" },
      { name: "manage_docs", actions: ["list", "get", "create", "update"], description: "Create and manage documents" },
      { name: "manage_mind_maps", actions: ["list", "get", "create"], description: "Create and manage mind maps" },
      { name: "generate_diagrams", actions: ["create_from_mermaid", "create_from_text"], description: "AI-powered diagram generation from text or Mermaid markup" },
      { name: "manage_users", actions: ["list", "create", "update", "deactivate"], description: "SCIM user provisioning and management" },
    ],
    endpoints: {
      list_workspaces:       { method: "GET",  path: "/workspaces" },
      get_workspace:         { method: "GET",  path: "/workspaces/{workspaceId}" },
      list_boards:           { method: "GET",  path: "/workspaces/{workspaceId}/boards", query: ["type", "limit", "cursor"] },
      get_board:             { method: "GET",  path: "/boards/{boardId}" },
      create_board:          { method: "POST", path: "/workspaces/{workspaceId}/boards", body: { name: "", type: "flowchart" } },
      update_board:          { method: "PATCH", path: "/boards/{boardId}", body: {} },
      delete_board:          { method: "DELETE", path: "/boards/{boardId}" },
      get_board_export:      { method: "GET",  path: "/boards/{boardId}/export", query: ["format"] },
      list_docs:             { method: "GET",  path: "/workspaces/{workspaceId}/docs", query: ["limit", "cursor"] },
      get_doc:               { method: "GET",  path: "/docs/{docId}" },
      create_doc:            { method: "POST", path: "/workspaces/{workspaceId}/docs", body: { title: "", content: "" } },
      update_doc:            { method: "PATCH", path: "/docs/{docId}", body: {} },
      create_from_mermaid:   { method: "POST", path: "/boards/from-mermaid", body: { workspaceId: "", mermaid: "", name: "" } },
      create_from_text:      { method: "POST", path: "/boards/from-text", body: { workspaceId: "", text: "", type: "flowchart" } },
      list_scim_users:       { method: "GET",  path: "/scim-v2/Users", query: ["filter", "count", "startIndex"] },
      create_scim_user:      { method: "POST", path: "/scim-v2/Users", body: { schemas: ["urn:ietf:params:scim:schemas:core:2.0:User"], userName: "", name: {} } },
      update_scim_user:      { method: "PUT",  path: "/scim-v2/Users/{userId}", body: {} },
      deactivate_scim_user:  { method: "PATCH", path: "/scim-v2/Users/{userId}", body: { Operations: [{ op: "replace", value: { active: false } }] } },
    },
    authHeader: (creds) => ({
      "Authorization": `Bearer ${creds.accessToken}`,
      "Content-Type": "application/json",
    }),
  },

  // ── Ollama (Local AI) ──────────────────────────────────────
  ollama: {
    name: "Ollama",
    type: "ai",
    description: "Local AI inference — chat completions, embeddings, model management. Free, private, no API costs.",
    baseUrl: "http://localhost:11434",
    authType: "none",
    credentialKeys: [],
    capabilities: [
      { name: "generate_text", actions: ["create"], description: "Generate text completions with local models (Llama, Mistral, etc.)" },
      { name: "chat_completion", actions: ["create"], description: "Multi-turn chat with local models" },
      { name: "create_embedding", actions: ["create"], description: "Create text embeddings locally" },
      { name: "manage_models", actions: ["list", "pull", "delete", "show"], description: "List, pull, inspect, and delete local models" },
    ],
    endpoints: {
      chat_completion:  { method: "POST", path: "/api/chat", body: { model: "llama3.1", messages: [], stream: false } },
      generate:         { method: "POST", path: "/api/generate", body: { model: "llama3.1", prompt: "", stream: false } },
      create_embedding: { method: "POST", path: "/api/embed", body: { model: "llama3.1", input: "" } },
      list_models:      { method: "GET",  path: "/api/tags" },
      show_model:       { method: "POST", path: "/api/show", body: { name: "" } },
      pull_model:       { method: "POST", path: "/api/pull", body: { name: "", stream: false } },
      delete_model:     { method: "DELETE", path: "/api/delete", body: { name: "" } },
      list_running:     { method: "GET",  path: "/api/ps" },
    },
    authHeader: () => ({
      "Content-Type": "application/json",
    }),
  },

  // ── Reddit ──────────────────────────────────────────────────
  reddit: {
    name: "Reddit",
    type: "social",
    description: "Social platform — posts, comments, subreddits, user profiles, search, monitoring via Reddit Data API. IMPORTANT: Reddit requires pre-approved OAuth apps as of Nov 2025. Auto-posting must comply with Reddit's Responsible Builder Policy. Default mode is MANUAL — auto mode requires double confirmation.",
    baseUrl: "https://oauth.reddit.com",
    authType: "oauth",
    credentialKeys: ["accessToken", "refreshToken", "clientId", "clientSecret", "username"],
    safetyConfig: {
      defaultMode: "manual",
      autoModeRequiresDoubleConfirmation: true,
      minPostDelayMs: 600000,
      minCommentDelayMs: 300000,
      maxPostsPerHour: 3,
      maxCommentsPerHour: 10,
      rateLimitPerMinute: 60,
      disclaimer: "Reddit aggressively bans automated promotional activity. Accounts suspected of bot behavior may be required to pass human verification (passkeys, biometrics, or government ID). All automated accounts must carry an [APP] label. Respect the 90/10 rule: 90% genuine value, 10% promotional. Each subreddit has its own rules — check before posting.",
    },
    capabilities: [
      { name: "manage_posts", actions: ["create", "list", "get", "delete"], description: "Submit text/link posts to subreddits and manage them" },
      { name: "manage_comments", actions: ["create", "list", "get", "delete"], description: "Post comments and replies on Reddit threads" },
      { name: "manage_subreddits", actions: ["get", "list", "search"], description: "Browse and search subreddit info, rules, and hot/new/top posts" },
      { name: "manage_profile", actions: ["get"], description: "View authenticated user profile, karma, and account age" },
      { name: "search_content", actions: ["search"], description: "Search Reddit posts, comments, and subreddits" },
      { name: "monitor_mentions", actions: ["search"], description: "Monitor keyword mentions across Reddit for brand/topic tracking" },
      { name: "manage_messages", actions: ["list", "send"], description: "Read and send private messages" },
    ],
    endpoints: {
      submit_post:          { method: "POST", path: "/api/submit", contentType: "application/x-www-form-urlencoded", body: { sr: "", kind: "self", title: "", text: "" } },
      submit_link:          { method: "POST", path: "/api/submit", contentType: "application/x-www-form-urlencoded", body: { sr: "", kind: "link", title: "", url: "" } },
      get_post:             { method: "GET",  path: "/r/{subreddit}/comments/{postId}" },
      delete_thing:         { method: "POST", path: "/api/del", contentType: "application/x-www-form-urlencoded", body: { id: "" } },
      get_user_posts:       { method: "GET",  path: "/user/{username}/submitted", query: ["sort", "t", "limit"] },
      post_comment:         { method: "POST", path: "/api/comment", contentType: "application/x-www-form-urlencoded", body: { thing_id: "", text: "" } },
      get_comments:         { method: "GET",  path: "/r/{subreddit}/comments/{postId}", query: ["sort", "limit", "depth"] },
      get_subreddit:        { method: "GET",  path: "/r/{subreddit}/about" },
      get_subreddit_rules:  { method: "GET",  path: "/r/{subreddit}/about/rules" },
      get_hot:              { method: "GET",  path: "/r/{subreddit}/hot", query: ["limit", "after"] },
      get_new:              { method: "GET",  path: "/r/{subreddit}/new", query: ["limit", "after"] },
      get_top:              { method: "GET",  path: "/r/{subreddit}/top", query: ["t", "limit", "after"] },
      search_subreddits:    { method: "GET",  path: "/subreddits/search", query: ["q", "limit", "sort"] },
      list_my_subreddits:   { method: "GET",  path: "/subreddits/mine/subscriber", query: ["limit", "after"] },
      search_posts:         { method: "GET",  path: "/search", query: ["q", "type", "sort", "t", "limit", "restrict_sr", "sr"] },
      get_me:               { method: "GET",  path: "/api/v1/me" },
      get_user:             { method: "GET",  path: "/user/{username}/about" },
      get_user_comments:    { method: "GET",  path: "/user/{username}/comments", query: ["sort", "t", "limit"] },
      get_inbox:            { method: "GET",  path: "/message/inbox", query: ["limit", "after"] },
      send_message:         { method: "POST", path: "/api/compose", contentType: "application/x-www-form-urlencoded", body: { to: "", subject: "", text: "" } },
      vote:                 { method: "POST", path: "/api/vote", contentType: "application/x-www-form-urlencoded", body: { id: "", dir: 1 } },
    },
    authHeader: (creds) => ({
      "Authorization": `Bearer ${creds.accessToken}`,
      "User-Agent": `0nMCP:RedditService:1.0.0 (by /u/${creds.username || "0nMCP"})`,
    }),
  },

  // ── Figma ─────────────────────────────────────────────────
  figma: {
    name: "Figma",
    type: "design",
    description: "Design platform — files, components, styles, variables, images, comments, webhooks, dev resources",
    baseUrl: "https://api.figma.com",
    authType: "api_key",
    credentialKeys: ["personalAccessToken"],
    capabilities: [
      { name: "manage_files", actions: ["get", "list"], description: "Read design files and nodes" },
      { name: "export_images", actions: ["export"], description: "Export frames as PNG/SVG/PDF" },
      { name: "manage_components", actions: ["list", "get"], description: "List and read components and styles" },
      { name: "manage_variables", actions: ["get", "update"], description: "Read and write design tokens/variables" },
      { name: "manage_comments", actions: ["list", "create", "delete"], description: "Manage file comments" },
      { name: "manage_webhooks", actions: ["create", "list", "delete"], description: "Subscribe to design events" },
      { name: "manage_dev_resources", actions: ["create", "list", "delete"], description: "Manage developer annotations" },
    ],
    endpoints: {
      get_file:              { method: "GET",  path: "/v1/files/{file_key}" },
      get_file_nodes:        { method: "GET",  path: "/v1/files/{file_key}/nodes", query: ["ids", "depth"] },
      get_file_meta:         { method: "GET",  path: "/v1/files/{file_key}/meta" },
      get_file_versions:     { method: "GET",  path: "/v1/files/{file_key}/versions" },
      export_images:         { method: "GET",  path: "/v1/images/{file_key}", query: ["ids", "scale", "format", "svg_outline_text"] },
      get_image_fills:       { method: "GET",  path: "/v1/files/{file_key}/images" },
      get_team_components:   { method: "GET",  path: "/v1/teams/{team_id}/components", query: ["page_size", "after"] },
      get_file_components:   { method: "GET",  path: "/v1/files/{file_key}/components" },
      get_component:         { method: "GET",  path: "/v1/components/{key}" },
      get_team_component_sets: { method: "GET", path: "/v1/teams/{team_id}/component_sets" },
      get_team_styles:       { method: "GET",  path: "/v1/teams/{team_id}/styles" },
      get_file_styles:       { method: "GET",  path: "/v1/files/{file_key}/styles" },
      get_style:             { method: "GET",  path: "/v1/styles/{key}" },
      get_local_variables:   { method: "GET",  path: "/v1/files/{file_key}/variables/local" },
      get_published_variables: { method: "GET", path: "/v1/files/{file_key}/variables/published" },
      update_variables:      { method: "POST", path: "/v1/files/{file_key}/variables", body: {} },
      get_comments:          { method: "GET",  path: "/v1/files/{file_key}/comments" },
      post_comment:          { method: "POST", path: "/v1/files/{file_key}/comments", body: { message: "" } },
      delete_comment:        { method: "DELETE", path: "/v1/files/{file_key}/comments/{comment_id}" },
      react_to_comment:      { method: "POST", path: "/v1/files/{file_key}/comments/{comment_id}/reactions", body: { emoji: "" } },
      create_webhook:        { method: "POST", path: "/v2/webhooks", body: { event_type: "", team_id: "", endpoint: "", passcode: "" } },
      list_webhooks:         { method: "GET",  path: "/v2/webhooks", query: ["team_id"] },
      get_webhook:           { method: "GET",  path: "/v2/webhooks/{webhook_id}" },
      update_webhook:        { method: "PUT",  path: "/v2/webhooks/{webhook_id}", body: {} },
      delete_webhook:        { method: "DELETE", path: "/v2/webhooks/{webhook_id}" },
      get_dev_resources:     { method: "GET",  path: "/v1/files/{file_key}/dev_resources", query: ["node_ids"] },
      create_dev_resources:  { method: "POST", path: "/v1/dev_resources", body: { dev_resources: [] } },
      update_dev_resources:  { method: "PUT",  path: "/v1/dev_resources", body: { dev_resources: [] } },
      delete_dev_resource:   { method: "DELETE", path: "/v1/files/{file_key}/dev_resources/{dev_resource_id}" },
      list_projects:         { method: "GET",  path: "/v1/teams/{team_id}/projects" },
      list_project_files:    { method: "GET",  path: "/v1/projects/{project_id}/files" },
      get_me:                { method: "GET",  path: "/v1/me" },
    },
    authHeader: (creds) => ({ "X-Figma-Token": creds.personalAccessToken }),
  },

  // ── ElevenLabs ──────────────────────────────────────────
  elevenlabs: {
    name: "ElevenLabs",
    type: "ai",
    description: "AI voice synthesis — text-to-speech, voice cloning, audio generation",
    baseUrl: "https://api.elevenlabs.io",
    authType: "api_key",
    credentialKeys: ["apiKey"],
    capabilities: [
      { name: "text_to_speech", actions: ["generate"], description: "Convert text to natural speech" },
      { name: "manage_voices", actions: ["list", "get", "clone"], description: "List, get, and clone voices" },
      { name: "manage_audio", actions: ["get_history"], description: "View generation history" },
    ],
    endpoints: {
      text_to_speech:     { method: "POST", path: "/v1/text-to-speech/{voice_id}", body: { text: "", model_id: "eleven_monolingual_v1" } },
      text_to_speech_stream: { method: "POST", path: "/v1/text-to-speech/{voice_id}/stream", body: { text: "", model_id: "eleven_monolingual_v1" } },
      list_voices:        { method: "GET",  path: "/v1/voices" },
      get_voice:          { method: "GET",  path: "/v1/voices/{voice_id}" },
      delete_voice:       { method: "DELETE", path: "/v1/voices/{voice_id}" },
      get_models:         { method: "GET",  path: "/v1/models" },
      get_history:        { method: "GET",  path: "/v1/history", query: ["page_size", "start_after_history_item_id"] },
      get_user:           { method: "GET",  path: "/v1/user" },
    },
    authHeader: (creds) => ({ "xi-api-key": creds.apiKey, "Content-Type": "application/json" }),
  },

  // ── Deepgram ────────────────────────────────────────────
  deepgram: {
    name: "Deepgram",
    type: "ai",
    description: "Speech-to-text and audio intelligence — transcription, summarization, topic detection",
    baseUrl: "https://api.deepgram.com",
    authType: "api_key",
    credentialKeys: ["apiKey"],
    capabilities: [
      { name: "transcribe", actions: ["transcribe_url", "transcribe_file"], description: "Convert speech to text" },
      { name: "manage_projects", actions: ["list", "get"], description: "Manage Deepgram projects" },
      { name: "manage_keys", actions: ["list", "create"], description: "Manage API keys" },
    ],
    endpoints: {
      transcribe_url:     { method: "POST", path: "/v1/listen", query: ["model", "language", "punctuate", "diarize", "summarize", "topics"], body: { url: "" } },
      list_projects:      { method: "GET",  path: "/v1/projects" },
      get_project:        { method: "GET",  path: "/v1/projects/{project_id}" },
      list_keys:          { method: "GET",  path: "/v1/projects/{project_id}/keys" },
      create_key:         { method: "POST", path: "/v1/projects/{project_id}/keys", body: { comment: "", scopes: [] } },
      get_usage:          { method: "GET",  path: "/v1/projects/{project_id}/usage", query: ["start", "end"] },
      list_balances:      { method: "GET",  path: "/v1/projects/{project_id}/balances" },
    },
    authHeader: (creds) => ({ "Authorization": `Token ${creds.apiKey}`, "Content-Type": "application/json" }),
  },

  // ── Groq ────────────────────────────────────────────────
  groq: {
    name: "Groq",
    type: "ai",
    description: "Ultra-fast AI inference — chat completions, embeddings, audio transcription",
    baseUrl: "https://api.groq.com/openai",
    authType: "api_key",
    credentialKeys: ["apiKey"],
    capabilities: [
      { name: "chat", actions: ["complete"], description: "Chat completions with Llama, Mixtral, Gemma" },
      { name: "audio", actions: ["transcribe"], description: "Audio transcription via Whisper" },
      { name: "models", actions: ["list"], description: "List available models" },
    ],
    endpoints: {
      chat_completion:    { method: "POST", path: "/v1/chat/completions", body: { model: "llama-3.3-70b-versatile", messages: [] } },
      create_transcription: { method: "POST", path: "/v1/audio/transcriptions", contentType: "multipart/form-data" },
      list_models:        { method: "GET",  path: "/v1/models" },
    },
    authHeader: (creds) => ({ "Authorization": `Bearer ${creds.apiKey}`, "Content-Type": "application/json" }),
  },

  // ── Cohere ──────────────────────────────────────────────
  cohere: {
    name: "Cohere",
    type: "ai",
    description: "Enterprise AI — text generation, embeddings, reranking, classification",
    baseUrl: "https://api.cohere.com",
    authType: "api_key",
    credentialKeys: ["apiKey"],
    capabilities: [
      { name: "generate", actions: ["chat", "generate"], description: "Text generation and chat" },
      { name: "embed", actions: ["embed"], description: "Create text embeddings" },
      { name: "rerank", actions: ["rerank"], description: "Rerank search results" },
      { name: "classify", actions: ["classify"], description: "Text classification" },
    ],
    endpoints: {
      chat:               { method: "POST", path: "/v2/chat", body: { model: "command-r-plus", messages: [] } },
      generate:           { method: "POST", path: "/v1/generate", body: { model: "command", prompt: "" } },
      embed:              { method: "POST", path: "/v2/embed", body: { model: "embed-english-v3.0", texts: [], input_type: "search_document" } },
      rerank:             { method: "POST", path: "/v2/rerank", body: { model: "rerank-english-v3.0", query: "", documents: [] } },
      classify:           { method: "POST", path: "/v1/classify", body: { model: "embed-english-v3.0", inputs: [], examples: [] } },
      list_models:        { method: "GET",  path: "/v1/models" },
    },
    authHeader: (creds) => ({ "Authorization": `Bearer ${creds.apiKey}`, "Content-Type": "application/json" }),
  },

  // ── Mistral ─────────────────────────────────────────────
  mistral: {
    name: "Mistral",
    type: "ai",
    description: "Open-weight AI models — chat, embeddings, code generation, function calling",
    baseUrl: "https://api.mistral.ai",
    authType: "api_key",
    credentialKeys: ["apiKey"],
    capabilities: [
      { name: "chat", actions: ["complete"], description: "Chat completions" },
      { name: "embed", actions: ["embed"], description: "Text embeddings" },
      { name: "models", actions: ["list"], description: "List available models" },
    ],
    endpoints: {
      chat_completion:    { method: "POST", path: "/v1/chat/completions", body: { model: "mistral-large-latest", messages: [] } },
      create_embedding:   { method: "POST", path: "/v1/embeddings", body: { model: "mistral-embed", input: [] } },
      list_models:        { method: "GET",  path: "/v1/models" },
    },
    authHeader: (creds) => ({ "Authorization": `Bearer ${creds.apiKey}`, "Content-Type": "application/json" }),
  },

  // ── Replicate ───────────────────────────────────────────
  replicate: {
    name: "Replicate",
    type: "ai",
    description: "Run open-source AI models — image generation, LLMs, video, audio",
    baseUrl: "https://api.replicate.com",
    authType: "api_key",
    credentialKeys: ["apiKey"],
    capabilities: [
      { name: "predictions", actions: ["create", "get", "list", "cancel"], description: "Run model predictions" },
      { name: "models", actions: ["list", "get", "search"], description: "Browse and search models" },
    ],
    endpoints: {
      create_prediction:  { method: "POST", path: "/v1/predictions", body: { version: "", input: {} } },
      get_prediction:     { method: "GET",  path: "/v1/predictions/{prediction_id}" },
      list_predictions:   { method: "GET",  path: "/v1/predictions" },
      cancel_prediction:  { method: "POST", path: "/v1/predictions/{prediction_id}/cancel" },
      get_model:          { method: "GET",  path: "/v1/models/{owner}/{name}" },
      list_model_versions:{ method: "GET",  path: "/v1/models/{owner}/{name}/versions" },
      search_models:      { method: "GET",  path: "/v1/models", query: ["query"] },
      list_collections:   { method: "GET",  path: "/v1/collections" },
    },
    authHeader: (creds) => ({ "Authorization": `Bearer ${creds.apiKey}`, "Content-Type": "application/json" }),
  },

  // ── Stability AI ────────────────────────────────────────
  stability: {
    name: "Stability AI",
    type: "ai",
    description: "Image generation — Stable Diffusion, upscaling, inpainting, image-to-image",
    baseUrl: "https://api.stability.ai",
    authType: "api_key",
    credentialKeys: ["apiKey"],
    capabilities: [
      { name: "generate_image", actions: ["generate", "upscale", "edit"], description: "Generate and edit images" },
      { name: "engines", actions: ["list"], description: "List available engines" },
    ],
    endpoints: {
      text_to_image:      { method: "POST", path: "/v1/generation/{engine_id}/text-to-image", body: { text_prompts: [{ text: "" }], cfg_scale: 7, steps: 30 } },
      image_to_image:     { method: "POST", path: "/v1/generation/{engine_id}/image-to-image", contentType: "multipart/form-data" },
      upscale:            { method: "POST", path: "/v1/generation/{engine_id}/image-to-image/upscale", contentType: "multipart/form-data" },
      list_engines:       { method: "GET",  path: "/v1/engines/list" },
      get_account:        { method: "GET",  path: "/v1/user/account" },
      get_balance:        { method: "GET",  path: "/v1/user/balance" },
    },
    authHeader: (creds) => ({ "Authorization": `Bearer ${creds.apiKey}`, "Content-Type": "application/json" }),
  },

  // ── Telegram ────────────────────────────────────────────
  telegram: {
    name: "Telegram",
    type: "messaging",
    description: "Messaging platform — send messages, manage bots, groups, channels",
    baseUrl: "https://api.telegram.org/bot{botToken}",
    authType: "api_key",
    credentialKeys: ["botToken"],
    capabilities: [
      { name: "send_messages", actions: ["send_text", "send_photo", "send_document"], description: "Send messages, photos, files" },
      { name: "manage_chats", actions: ["get_chat", "get_members"], description: "Manage chats and groups" },
      { name: "manage_updates", actions: ["get_updates", "set_webhook"], description: "Receive and handle updates" },
    ],
    endpoints: {
      send_message:       { method: "POST", path: "/sendMessage", body: { chat_id: "", text: "", parse_mode: "HTML" } },
      send_photo:         { method: "POST", path: "/sendPhoto", body: { chat_id: "", photo: "", caption: "" } },
      send_document:      { method: "POST", path: "/sendDocument", contentType: "multipart/form-data" },
      get_updates:        { method: "GET",  path: "/getUpdates", query: ["offset", "limit", "timeout"] },
      set_webhook:        { method: "POST", path: "/setWebhook", body: { url: "" } },
      delete_webhook:     { method: "POST", path: "/deleteWebhook" },
      get_chat:           { method: "GET",  path: "/getChat", query: ["chat_id"] },
      get_chat_member_count: { method: "GET", path: "/getChatMemberCount", query: ["chat_id"] },
      get_me:             { method: "GET",  path: "/getMe" },
    },
    authHeader: () => ({ "Content-Type": "application/json" }),
  },

  // ── Postmark ────────────────────────────────────────────
  postmark: {
    name: "Postmark",
    type: "email",
    description: "Transactional email — send, templates, webhooks, bounce management",
    baseUrl: "https://api.postmarkapp.com",
    authType: "api_key",
    credentialKeys: ["serverToken"],
    capabilities: [
      { name: "send_email", actions: ["send", "send_batch", "send_template"], description: "Send transactional emails" },
      { name: "manage_templates", actions: ["list", "get", "create"], description: "Manage email templates" },
      { name: "manage_bounces", actions: ["list", "get"], description: "Track bounces and deliverability" },
    ],
    endpoints: {
      send_email:         { method: "POST", path: "/email", body: { From: "", To: "", Subject: "", HtmlBody: "" } },
      send_batch:         { method: "POST", path: "/email/batch", body: [] },
      send_template:      { method: "POST", path: "/email/withTemplate", body: { TemplateId: 0, To: "", TemplateModel: {} } },
      list_templates:     { method: "GET",  path: "/templates", query: ["Count", "Offset"] },
      get_template:       { method: "GET",  path: "/templates/{templateId}" },
      create_template:    { method: "POST", path: "/templates", body: { Name: "", Subject: "", HtmlBody: "" } },
      list_bounces:       { method: "GET",  path: "/bounces", query: ["count", "offset", "type"] },
      get_delivery_stats: { method: "GET",  path: "/deliverystats" },
      get_server:         { method: "GET",  path: "/server" },
    },
    authHeader: (creds) => ({ "X-Postmark-Server-Token": creds.serverToken, "Content-Type": "application/json", "Accept": "application/json" }),
  },

  // ── Mailgun ─────────────────────────────────────────────
  mailgun: {
    name: "Mailgun",
    type: "email",
    description: "Email API — send, receive, validate, track deliverability",
    baseUrl: "https://api.mailgun.net/v3",
    authType: "api_key",
    credentialKeys: ["apiKey", "domain"],
    capabilities: [
      { name: "send_email", actions: ["send"], description: "Send emails" },
      { name: "manage_domains", actions: ["list", "get"], description: "Manage sending domains" },
      { name: "track_events", actions: ["list"], description: "Track email events" },
      { name: "validate_email", actions: ["validate"], description: "Validate email addresses" },
    ],
    endpoints: {
      send_message:       { method: "POST", path: "/{domain}/messages", contentType: "multipart/form-data" },
      list_domains:       { method: "GET",  path: "/domains" },
      get_domain:         { method: "GET",  path: "/domains/{domain}" },
      list_events:        { method: "GET",  path: "/{domain}/events", query: ["begin", "end", "event", "limit"] },
      get_stats:          { method: "GET",  path: "/{domain}/stats/total", query: ["event", "start", "end"] },
      validate_email:     { method: "GET",  path: "/address/validate", query: ["address"] },
      list_bounces:       { method: "GET",  path: "/{domain}/bounces" },
      list_unsubscribes:  { method: "GET",  path: "/{domain}/unsubscribes" },
    },
    authHeader: (creds) => ({ "Authorization": "Basic " + Buffer.from("api:" + creds.apiKey).toString("base64") }),
  },

  // ── ConvertKit ──────────────────────────────────────────
  convertkit: {
    name: "ConvertKit",
    type: "email_marketing",
    description: "Creator email marketing — subscribers, sequences, broadcasts, forms, tags",
    baseUrl: "https://api.convertkit.com/v3",
    authType: "api_key",
    credentialKeys: ["apiSecret"],
    capabilities: [
      { name: "manage_subscribers", actions: ["list", "get", "create", "tag"], description: "Manage subscribers" },
      { name: "manage_sequences", actions: ["list", "subscribe"], description: "Manage email sequences" },
      { name: "manage_broadcasts", actions: ["list", "create"], description: "Send broadcasts" },
      { name: "manage_tags", actions: ["list", "create"], description: "Manage subscriber tags" },
      { name: "manage_forms", actions: ["list", "subscribe"], description: "Manage signup forms" },
    ],
    endpoints: {
      list_subscribers:   { method: "GET",  path: "/subscribers", query: ["api_secret", "page", "sort_order"] },
      get_subscriber:     { method: "GET",  path: "/subscribers/{subscriber_id}", query: ["api_secret"] },
      create_subscriber:  { method: "POST", path: "/forms/{form_id}/subscribe", body: { api_secret: "", email: "" } },
      tag_subscriber:     { method: "POST", path: "/tags/{tag_id}/subscribe", body: { api_secret: "", email: "" } },
      list_tags:          { method: "GET",  path: "/tags", query: ["api_secret"] },
      create_tag:         { method: "POST", path: "/tags", body: { api_secret: "", tag: { name: "" } } },
      list_sequences:     { method: "GET",  path: "/sequences", query: ["api_secret"] },
      add_to_sequence:    { method: "POST", path: "/sequences/{sequence_id}/subscribe", body: { api_secret: "", email: "" } },
      list_forms:         { method: "GET",  path: "/forms", query: ["api_secret"] },
      list_broadcasts:    { method: "GET",  path: "/broadcasts", query: ["api_secret"] },
      create_broadcast:   { method: "POST", path: "/broadcasts", body: { api_secret: "", subject: "", content: "" } },
    },
    authHeader: () => ({ "Content-Type": "application/json" }),
  },

  // ── Brevo (Sendinblue) ──────────────────────────────────
  brevo: {
    name: "Brevo",
    type: "email_marketing",
    description: "Email & SMS marketing — campaigns, transactional, contacts, automation",
    baseUrl: "https://api.brevo.com/v3",
    authType: "api_key",
    credentialKeys: ["apiKey"],
    capabilities: [
      { name: "send_email", actions: ["send_transactional", "send_campaign"], description: "Send transactional and campaign emails" },
      { name: "manage_contacts", actions: ["create", "update", "list"], description: "Manage contact lists" },
      { name: "send_sms", actions: ["send"], description: "Send SMS messages" },
    ],
    endpoints: {
      send_transactional: { method: "POST", path: "/smtp/email", body: { sender: {}, to: [{}], subject: "", htmlContent: "" } },
      list_contacts:      { method: "GET",  path: "/contacts", query: ["limit", "offset", "sort"] },
      create_contact:     { method: "POST", path: "/contacts", body: { email: "", attributes: {} } },
      update_contact:     { method: "PUT",  path: "/contacts/{identifier}", body: { attributes: {} } },
      get_contact:        { method: "GET",  path: "/contacts/{identifier}" },
      list_lists:         { method: "GET",  path: "/contacts/lists", query: ["limit", "offset"] },
      send_sms:           { method: "POST", path: "/transactionalSMS/sms", body: { sender: "", recipient: "", content: "" } },
      get_account:        { method: "GET",  path: "/account" },
    },
    authHeader: (creds) => ({ "api-key": creds.apiKey, "Content-Type": "application/json" }),
  },

  // ── ActiveCampaign ──────────────────────────────────────
  activecampaign: {
    name: "ActiveCampaign",
    type: "email_marketing",
    description: "Email marketing + CRM — contacts, automations, deals, campaigns, tags",
    baseUrl: "https://{accountName}.api-us1.com/api/3",
    authType: "api_key",
    credentialKeys: ["apiKey", "accountName"],
    capabilities: [
      { name: "manage_contacts", actions: ["create", "update", "list", "search"], description: "Manage contacts" },
      { name: "manage_tags", actions: ["list", "add", "remove"], description: "Tag contacts" },
      { name: "manage_automations", actions: ["list"], description: "List automations" },
      { name: "manage_deals", actions: ["create", "list", "update"], description: "Manage CRM deals" },
    ],
    endpoints: {
      create_contact:     { method: "POST", path: "/contacts", body: { contact: { email: "", firstName: "", lastName: "" } } },
      list_contacts:      { method: "GET",  path: "/contacts", query: ["search", "limit", "offset"] },
      get_contact:        { method: "GET",  path: "/contacts/{id}" },
      update_contact:     { method: "PUT",  path: "/contacts/{id}", body: { contact: {} } },
      add_tag:            { method: "POST", path: "/contactTags", body: { contactTag: { contact: "", tag: "" } } },
      list_tags:          { method: "GET",  path: "/tags", query: ["search", "limit"] },
      list_automations:   { method: "GET",  path: "/automations" },
      create_deal:        { method: "POST", path: "/deals", body: { deal: { title: "", value: 0 } } },
      list_deals:         { method: "GET",  path: "/deals", query: ["search", "limit"] },
      list_lists:         { method: "GET",  path: "/lists" },
    },
    authHeader: (creds) => ({ "Api-Token": creds.apiKey, "Content-Type": "application/json" }),
  },

  // ── Lemlist ─────────────────────────────────────────────
  lemlist: {
    name: "Lemlist",
    type: "cold_email",
    description: "Cold email outreach — campaigns, leads, sequences, email warmup",
    baseUrl: "https://api.lemlist.com/api",
    authType: "api_key",
    credentialKeys: ["apiKey"],
    capabilities: [
      { name: "manage_campaigns", actions: ["list", "get"], description: "Manage outreach campaigns" },
      { name: "manage_leads", actions: ["add", "list", "delete"], description: "Manage campaign leads" },
      { name: "manage_activities", actions: ["list"], description: "Track email activities" },
    ],
    endpoints: {
      list_campaigns:     { method: "GET",  path: "/campaigns" },
      get_campaign:       { method: "GET",  path: "/campaigns/{campaignId}" },
      add_lead:           { method: "POST", path: "/campaigns/{campaignId}/leads/{email}", body: { firstName: "", lastName: "", companyName: "" } },
      list_leads:         { method: "GET",  path: "/campaigns/{campaignId}/leads" },
      delete_lead:        { method: "DELETE", path: "/campaigns/{campaignId}/leads/{email}" },
      list_activities:    { method: "GET",  path: "/activities", query: ["campaignId", "type", "limit"] },
      get_team:           { method: "GET",  path: "/team" },
    },
    authHeader: (creds) => ({ "Authorization": "Basic " + Buffer.from(":" + creds.apiKey).toString("base64") }),
  },

  // ── AWS ─────────────────────────────────────────────────
  aws: {
    name: "AWS",
    type: "cloud",
    description: "Amazon Web Services — S3 storage, Lambda functions, SES email, SNS notifications",
    baseUrl: "https://s3.amazonaws.com",
    authType: "aws_signature",
    credentialKeys: ["accessKeyId", "secretAccessKey", "region"],
    capabilities: [
      { name: "manage_s3", actions: ["list_buckets", "put_object", "get_object", "delete_object"], description: "S3 storage operations" },
      { name: "send_email", actions: ["send"], description: "Send email via SES" },
      { name: "manage_lambda", actions: ["invoke", "list"], description: "Lambda function management" },
    ],
    endpoints: {
      list_buckets:       { method: "GET",  path: "/" },
      list_objects:       { method: "GET",  path: "/{bucket}", query: ["prefix", "max-keys", "delimiter"] },
      put_object:         { method: "PUT",  path: "/{bucket}/{key}" },
      get_object:         { method: "GET",  path: "/{bucket}/{key}" },
      delete_object:      { method: "DELETE", path: "/{bucket}/{key}" },
    },
    authHeader: (creds) => ({ "Content-Type": "application/json" }),
  },

  // ── Webflow ─────────────────────────────────────────────
  webflow: {
    name: "Webflow",
    type: "websites",
    description: "Visual web builder — sites, CMS collections, forms, e-commerce, memberships",
    baseUrl: "https://api.webflow.com/v2",
    authType: "api_key",
    credentialKeys: ["accessToken"],
    capabilities: [
      { name: "manage_sites", actions: ["list", "get", "publish"], description: "Manage Webflow sites" },
      { name: "manage_collections", actions: ["list", "get", "create_item"], description: "Manage CMS collections" },
      { name: "manage_forms", actions: ["list", "get_submissions"], description: "Get form submissions" },
      { name: "manage_ecommerce", actions: ["list_products", "create_order"], description: "E-commerce operations" },
    ],
    endpoints: {
      list_sites:         { method: "GET",  path: "/sites" },
      get_site:           { method: "GET",  path: "/sites/{site_id}" },
      publish_site:       { method: "POST", path: "/sites/{site_id}/publish", body: { domains: [] } },
      list_collections:   { method: "GET",  path: "/sites/{site_id}/collections" },
      get_collection:     { method: "GET",  path: "/collections/{collection_id}" },
      list_items:         { method: "GET",  path: "/collections/{collection_id}/items", query: ["limit", "offset"] },
      create_item:        { method: "POST", path: "/collections/{collection_id}/items", body: { fieldData: {} } },
      update_item:        { method: "PATCH", path: "/collections/{collection_id}/items/{item_id}", body: { fieldData: {} } },
      delete_item:        { method: "DELETE", path: "/collections/{collection_id}/items/{item_id}" },
      list_forms:         { method: "GET",  path: "/sites/{site_id}/forms" },
      list_form_submissions: { method: "GET", path: "/forms/{form_id}/submissions" },
      list_products:      { method: "GET",  path: "/sites/{site_id}/products" },
    },
    authHeader: (creds) => ({ "Authorization": `Bearer ${creds.accessToken}`, "Content-Type": "application/json" }),
  },

  // ── WordPress ───────────────────────────────────────────
  wordpress: {
    name: "WordPress",
    type: "websites",
    description: "WordPress REST API — posts, pages, media, users, comments, plugins",
    baseUrl: "https://{siteUrl}/wp-json/wp/v2",
    authType: "basic",
    credentialKeys: ["siteUrl", "username", "applicationPassword"],
    capabilities: [
      { name: "manage_posts", actions: ["create", "update", "list", "delete"], description: "Manage blog posts" },
      { name: "manage_pages", actions: ["create", "update", "list"], description: "Manage pages" },
      { name: "manage_media", actions: ["upload", "list"], description: "Manage media library" },
      { name: "manage_users", actions: ["list", "get"], description: "Manage users" },
    ],
    endpoints: {
      list_posts:         { method: "GET",  path: "/posts", query: ["per_page", "page", "search", "status"] },
      create_post:        { method: "POST", path: "/posts", body: { title: "", content: "", status: "draft" } },
      update_post:        { method: "PUT",  path: "/posts/{id}", body: {} },
      delete_post:        { method: "DELETE", path: "/posts/{id}" },
      list_pages:         { method: "GET",  path: "/pages", query: ["per_page", "page", "search"] },
      create_page:        { method: "POST", path: "/pages", body: { title: "", content: "", status: "draft" } },
      update_page:        { method: "PUT",  path: "/pages/{id}", body: {} },
      list_media:         { method: "GET",  path: "/media", query: ["per_page", "page"] },
      upload_media:       { method: "POST", path: "/media", contentType: "multipart/form-data" },
      list_users:         { method: "GET",  path: "/users" },
      list_comments:      { method: "GET",  path: "/comments", query: ["post", "per_page"] },
      list_categories:    { method: "GET",  path: "/categories" },
      list_tags:          { method: "GET",  path: "/tags" },
    },
    authHeader: (creds) => ({ "Authorization": "Basic " + Buffer.from(creds.username + ":" + creds.applicationPassword).toString("base64"), "Content-Type": "application/json" }),
  },

  // ── Monday.com ──────────────────────────────────────────
  monday: {
    name: "Monday.com",
    type: "project_mgmt",
    description: "Work management — boards, items, columns, updates, automations via GraphQL",
    baseUrl: "https://api.monday.com/v2",
    authType: "api_key",
    credentialKeys: ["apiKey"],
    capabilities: [
      { name: "manage_boards", actions: ["list", "create"], description: "Manage boards" },
      { name: "manage_items", actions: ["create", "update", "list"], description: "Manage items/rows" },
      { name: "manage_updates", actions: ["create", "list"], description: "Post updates on items" },
    ],
    endpoints: {
      graphql:            { method: "POST", path: "/", body: { query: "" } },
    },
    authHeader: (creds) => ({ "Authorization": creds.apiKey, "Content-Type": "application/json" }),
  },

  // ── Trello ──────────────────────────────────────────────
  trello: {
    name: "Trello",
    type: "project_mgmt",
    description: "Kanban boards — cards, lists, boards, checklists, labels, members",
    baseUrl: "https://api.trello.com/1",
    authType: "api_key",
    credentialKeys: ["apiKey", "apiToken"],
    capabilities: [
      { name: "manage_boards", actions: ["list", "get", "create"], description: "Manage Trello boards" },
      { name: "manage_cards", actions: ["create", "update", "move", "delete"], description: "Manage cards" },
      { name: "manage_lists", actions: ["create", "list"], description: "Manage lists" },
    ],
    endpoints: {
      list_boards:        { method: "GET",  path: "/members/me/boards", query: ["key", "token"] },
      get_board:          { method: "GET",  path: "/boards/{id}", query: ["key", "token"] },
      create_board:       { method: "POST", path: "/boards", query: ["key", "token", "name"] },
      get_lists:          { method: "GET",  path: "/boards/{boardId}/lists", query: ["key", "token"] },
      create_list:        { method: "POST", path: "/lists", query: ["key", "token", "name", "idBoard"] },
      create_card:        { method: "POST", path: "/cards", query: ["key", "token", "name", "idList"] },
      update_card:        { method: "PUT",  path: "/cards/{id}", query: ["key", "token"] },
      delete_card:        { method: "DELETE", path: "/cards/{id}", query: ["key", "token"] },
      get_card:           { method: "GET",  path: "/cards/{id}", query: ["key", "token"] },
      list_labels:        { method: "GET",  path: "/boards/{boardId}/labels", query: ["key", "token"] },
    },
    authHeader: () => ({}),
  },

  // ── Typeform ────────────────────────────────────────────
  typeform: {
    name: "Typeform",
    type: "forms",
    description: "Interactive forms — create forms, collect responses, webhooks",
    baseUrl: "https://api.typeform.com",
    authType: "api_key",
    credentialKeys: ["accessToken"],
    capabilities: [
      { name: "manage_forms", actions: ["list", "get", "create"], description: "Manage forms" },
      { name: "manage_responses", actions: ["list"], description: "Get form responses" },
      { name: "manage_webhooks", actions: ["create", "list"], description: "Manage form webhooks" },
    ],
    endpoints: {
      list_forms:         { method: "GET",  path: "/forms", query: ["page", "page_size", "search"] },
      get_form:           { method: "GET",  path: "/forms/{form_id}" },
      create_form:        { method: "POST", path: "/forms", body: { title: "", fields: [] } },
      list_responses:     { method: "GET",  path: "/forms/{form_id}/responses", query: ["page_size", "since", "until"] },
      create_webhook:     { method: "PUT",  path: "/forms/{form_id}/webhooks/{tag}", body: { url: "", enabled: true } },
      list_webhooks:      { method: "GET",  path: "/forms/{form_id}/webhooks" },
      list_workspaces:    { method: "GET",  path: "/workspaces" },
    },
    authHeader: (creds) => ({ "Authorization": `Bearer ${creds.accessToken}`, "Content-Type": "application/json" }),
  },

  // ── DocuSign ────────────────────────────────────────────
  docusign: {
    name: "DocuSign",
    type: "productivity",
    description: "E-signatures — envelopes, templates, recipients, signing workflows",
    baseUrl: "https://demo.docusign.net/restapi/v2.1",
    authType: "oauth",
    credentialKeys: ["accessToken", "accountId"],
    capabilities: [
      { name: "manage_envelopes", actions: ["create", "get", "list", "send"], description: "Create and send documents for signing" },
      { name: "manage_templates", actions: ["list", "get"], description: "Manage document templates" },
    ],
    endpoints: {
      create_envelope:    { method: "POST", path: "/accounts/{accountId}/envelopes", body: { emailSubject: "", documents: [], recipients: {}, status: "sent" } },
      get_envelope:       { method: "GET",  path: "/accounts/{accountId}/envelopes/{envelopeId}" },
      list_envelopes:     { method: "GET",  path: "/accounts/{accountId}/envelopes", query: ["from_date", "status"] },
      list_recipients:    { method: "GET",  path: "/accounts/{accountId}/envelopes/{envelopeId}/recipients" },
      list_templates:     { method: "GET",  path: "/accounts/{accountId}/templates" },
      get_template:       { method: "GET",  path: "/accounts/{accountId}/templates/{templateId}" },
    },
    authHeader: (creds) => ({ "Authorization": `Bearer ${creds.accessToken}`, "Content-Type": "application/json" }),
  },

  // ── Xero ────────────────────────────────────────────────
  xero: {
    name: "Xero",
    type: "accounting",
    description: "Cloud accounting — invoices, contacts, payments, bank reconciliation, reports",
    baseUrl: "https://api.xero.com/api.xro/2.0",
    authType: "oauth",
    credentialKeys: ["accessToken", "tenantId"],
    capabilities: [
      { name: "manage_invoices", actions: ["create", "list", "get"], description: "Manage invoices" },
      { name: "manage_contacts", actions: ["create", "list", "get"], description: "Manage accounting contacts" },
      { name: "manage_payments", actions: ["create", "list"], description: "Record payments" },
    ],
    endpoints: {
      list_invoices:      { method: "GET",  path: "/Invoices" },
      create_invoice:     { method: "POST", path: "/Invoices", body: { Type: "ACCREC", Contact: {}, LineItems: [] } },
      get_invoice:        { method: "GET",  path: "/Invoices/{InvoiceID}" },
      list_contacts:      { method: "GET",  path: "/Contacts" },
      create_contact:     { method: "POST", path: "/Contacts", body: { Name: "", EmailAddress: "" } },
      list_payments:      { method: "GET",  path: "/Payments" },
      create_payment:     { method: "PUT",  path: "/Payments", body: { Invoice: {}, Account: {}, Amount: 0 } },
      list_accounts:      { method: "GET",  path: "/Accounts" },
      get_organisation:   { method: "GET",  path: "/Organisation" },
    },
    authHeader: (creds) => ({ "Authorization": `Bearer ${creds.accessToken}`, "xero-tenant-id": creds.tenantId, "Content-Type": "application/json" }),
  },

  // ── Freshdesk ───────────────────────────────────────────
  freshdesk: {
    name: "Freshdesk",
    type: "support",
    description: "Help desk — tickets, contacts, agents, groups, automations",
    baseUrl: "https://{domain}.freshdesk.com/api/v2",
    authType: "api_key",
    credentialKeys: ["apiKey", "domain"],
    capabilities: [
      { name: "manage_tickets", actions: ["create", "update", "list", "get"], description: "Manage support tickets" },
      { name: "manage_contacts", actions: ["create", "list", "get"], description: "Manage contacts" },
    ],
    endpoints: {
      list_tickets:       { method: "GET",  path: "/tickets", query: ["per_page", "page", "filter"] },
      create_ticket:      { method: "POST", path: "/tickets", body: { subject: "", description: "", email: "", priority: 1, status: 2 } },
      update_ticket:      { method: "PUT",  path: "/tickets/{id}", body: {} },
      get_ticket:         { method: "GET",  path: "/tickets/{id}" },
      list_contacts:      { method: "GET",  path: "/contacts", query: ["per_page", "page"] },
      create_contact:     { method: "POST", path: "/contacts", body: { name: "", email: "" } },
      get_contact:        { method: "GET",  path: "/contacts/{id}" },
      list_agents:        { method: "GET",  path: "/agents" },
    },
    authHeader: (creds) => ({ "Authorization": "Basic " + Buffer.from(creds.apiKey + ":X").toString("base64"), "Content-Type": "application/json" }),
  },

  // ── WooCommerce ─────────────────────────────────────────
  woocommerce: {
    name: "WooCommerce",
    type: "ecommerce",
    description: "WordPress e-commerce — products, orders, customers, coupons, reports",
    baseUrl: "https://{siteUrl}/wp-json/wc/v3",
    authType: "basic",
    credentialKeys: ["siteUrl", "consumerKey", "consumerSecret"],
    capabilities: [
      { name: "manage_products", actions: ["create", "update", "list", "delete"], description: "Manage products" },
      { name: "manage_orders", actions: ["create", "update", "list"], description: "Manage orders" },
      { name: "manage_customers", actions: ["create", "list", "get"], description: "Manage customers" },
      { name: "manage_coupons", actions: ["create", "list"], description: "Manage coupons" },
    ],
    endpoints: {
      list_products:      { method: "GET",  path: "/products", query: ["per_page", "page", "search", "status"] },
      create_product:     { method: "POST", path: "/products", body: { name: "", type: "simple", regular_price: "" } },
      update_product:     { method: "PUT",  path: "/products/{id}", body: {} },
      get_product:        { method: "GET",  path: "/products/{id}" },
      list_orders:        { method: "GET",  path: "/orders", query: ["per_page", "page", "status"] },
      create_order:       { method: "POST", path: "/orders", body: { line_items: [] } },
      update_order:       { method: "PUT",  path: "/orders/{id}", body: {} },
      list_customers:     { method: "GET",  path: "/customers", query: ["per_page", "page", "search"] },
      create_customer:    { method: "POST", path: "/customers", body: { email: "", first_name: "", last_name: "" } },
      list_coupons:       { method: "GET",  path: "/coupons" },
      create_coupon:      { method: "POST", path: "/coupons", body: { code: "", amount: "", discount_type: "percent" } },
      get_reports:        { method: "GET",  path: "/reports/sales", query: ["period"] },
    },
    authHeader: (creds) => ({ "Authorization": "Basic " + Buffer.from(creds.consumerKey + ":" + creds.consumerSecret).toString("base64"), "Content-Type": "application/json" }),
  },

  // ── YouTube ─────────────────────────────────────────────
  youtube: {
    name: "YouTube",
    type: "social_media",
    description: "Video platform — channels, videos, playlists, comments, analytics",
    baseUrl: "https://www.googleapis.com/youtube/v3",
    authType: "oauth",
    credentialKeys: ["accessToken", "apiKey"],
    capabilities: [
      { name: "manage_videos", actions: ["list", "search"], description: "Search and list videos" },
      { name: "manage_channels", actions: ["list"], description: "Get channel information" },
      { name: "manage_playlists", actions: ["list", "create"], description: "Manage playlists" },
      { name: "manage_comments", actions: ["list"], description: "List video comments" },
    ],
    endpoints: {
      search:             { method: "GET",  path: "/search", query: ["q", "type", "part", "maxResults", "order", "key"] },
      list_videos:        { method: "GET",  path: "/videos", query: ["id", "part", "chart", "maxResults", "key"] },
      list_channels:      { method: "GET",  path: "/channels", query: ["id", "part", "mine", "key"] },
      list_playlists:     { method: "GET",  path: "/playlists", query: ["channelId", "part", "maxResults", "key"] },
      list_playlist_items:{ method: "GET",  path: "/playlistItems", query: ["playlistId", "part", "maxResults", "key"] },
      list_comments:      { method: "GET",  path: "/commentThreads", query: ["videoId", "part", "maxResults", "key"] },
    },
    authHeader: (creds) => creds.accessToken ? { "Authorization": `Bearer ${creds.accessToken}` } : {},
  },

  // ── Netlify ─────────────────────────────────────────────
  netlify: {
    name: "Netlify",
    type: "cloud",
    description: "Web deployment — sites, deploys, forms, functions, DNS",
    baseUrl: "https://api.netlify.com/api/v1",
    authType: "api_key",
    credentialKeys: ["accessToken"],
    capabilities: [
      { name: "manage_sites", actions: ["list", "get", "create"], description: "Manage sites" },
      { name: "manage_deploys", actions: ["list", "create"], description: "Manage deployments" },
      { name: "manage_forms", actions: ["list"], description: "Get form submissions" },
    ],
    endpoints: {
      list_sites:         { method: "GET",  path: "/sites" },
      get_site:           { method: "GET",  path: "/sites/{site_id}" },
      create_site:        { method: "POST", path: "/sites", body: { name: "" } },
      list_deploys:       { method: "GET",  path: "/sites/{site_id}/deploys" },
      get_deploy:         { method: "GET",  path: "/deploys/{deploy_id}" },
      list_forms:         { method: "GET",  path: "/sites/{site_id}/forms" },
      list_form_submissions: { method: "GET", path: "/forms/{form_id}/submissions" },
      list_dns_zones:     { method: "GET",  path: "/dns_zones" },
      get_account:        { method: "GET",  path: "/accounts" },
    },
    authHeader: (creds) => ({ "Authorization": `Bearer ${creds.accessToken}` }),
  },

  // ── Cloudflare (already exists but ensure it's comprehensive) ──

  // ── Pinterest ───────────────────────────────────────────
  pinterest: {
    name: "Pinterest",
    type: "social_media",
    description: "Visual discovery — pins, boards, ads, analytics",
    baseUrl: "https://api.pinterest.com/v5",
    authType: "oauth",
    credentialKeys: ["accessToken"],
    capabilities: [
      { name: "manage_pins", actions: ["create", "list", "get"], description: "Manage pins" },
      { name: "manage_boards", actions: ["create", "list"], description: "Manage boards" },
      { name: "analytics", actions: ["get"], description: "Get account analytics" },
    ],
    endpoints: {
      create_pin:         { method: "POST", path: "/pins", body: { board_id: "", title: "", description: "", media_source: {} } },
      list_pins:          { method: "GET",  path: "/pins", query: ["bookmark", "page_size"] },
      get_pin:            { method: "GET",  path: "/pins/{pin_id}" },
      list_boards:        { method: "GET",  path: "/boards", query: ["bookmark", "page_size"] },
      create_board:       { method: "POST", path: "/boards", body: { name: "", description: "" } },
      get_user_account:   { method: "GET",  path: "/user_account" },
      get_analytics:      { method: "GET",  path: "/user_account/analytics", query: ["start_date", "end_date", "metric_types"] },
    },
    authHeader: (creds) => ({ "Authorization": `Bearer ${creds.accessToken}`, "Content-Type": "application/json" }),
  },

  // ── BigCommerce ──────────────────────────────────────────
  bigcommerce: {
    name: "BigCommerce", type: "ecommerce",
    description: "E-commerce platform — products, orders, customers, categories",
    baseUrl: "https://api.bigcommerce.com/stores/{store_hash}/v3",
    authType: "api_key", credentialKeys: ["accessToken", "storeHash"],
    capabilities: [
      { name: "manage_products", actions: ["create", "list", "get"], description: "Manage products" },
      { name: "manage_orders", actions: ["list", "get"], description: "Manage orders" },
      { name: "manage_customers", actions: ["create", "list"], description: "Manage customers" },
    ],
    endpoints: {
      list_products:  { method: "GET",  path: "/catalog/products", query: ["page", "limit"] },
      create_product: { method: "POST", path: "/catalog/products", body: { name: "", type: "physical", weight: 0, price: 0 } },
      get_product:    { method: "GET",  path: "/catalog/products/{product_id}" },
      list_orders:    { method: "GET",  path: "/orders", query: ["page", "limit"] },
      get_order:      { method: "GET",  path: "/orders/{order_id}" },
      list_customers: { method: "GET",  path: "/customers", query: ["page", "limit"] },
      create_customer:{ method: "POST", path: "/customers", body: [{ email: "", first_name: "", last_name: "" }] },
      list_categories:{ method: "GET",  path: "/catalog/categories" },
    },
    authHeader: (creds) => ({ "X-Auth-Token": creds.accessToken, "Content-Type": "application/json" }),
  },

  // ── Twitch ──────────────────────────────────────────────
  twitch: {
    name: "Twitch", type: "social_media",
    description: "Live streaming — streams, users, channels, clips, chat",
    baseUrl: "https://api.twitch.tv/helix",
    authType: "oauth", credentialKeys: ["accessToken", "clientId"],
    capabilities: [
      { name: "manage_streams", actions: ["list"], description: "Get stream info" },
      { name: "manage_users", actions: ["get", "search"], description: "Get user data" },
      { name: "manage_clips", actions: ["list", "create"], description: "Manage clips" },
    ],
    endpoints: {
      get_streams:       { method: "GET", path: "/streams", query: ["user_id", "user_login", "game_id", "first"] },
      get_users:         { method: "GET", path: "/users", query: ["id", "login"] },
      search_channels:   { method: "GET", path: "/search/channels", query: ["query", "first"] },
      get_clips:         { method: "GET", path: "/clips", query: ["broadcaster_id", "id", "first"] },
      create_clip:       { method: "POST", path: "/clips", query: ["broadcaster_id"] },
      get_channel_info:  { method: "GET", path: "/channels", query: ["broadcaster_id"] },
      get_top_games:     { method: "GET", path: "/games/top", query: ["first"] },
    },
    authHeader: (creds) => ({ "Authorization": `Bearer ${creds.accessToken}`, "Client-Id": creds.clientId }),
  },

  // ── Wave ────────────────────────────────────────────────
  wave: {
    name: "Wave", type: "accounting",
    description: "Free accounting — invoicing, payments, expenses via GraphQL",
    baseUrl: "https://gql.waveapps.com/graphql/public",
    authType: "oauth", credentialKeys: ["accessToken"],
    capabilities: [
      { name: "manage_invoices", actions: ["create", "list"], description: "Manage invoices" },
      { name: "manage_customers", actions: ["create", "list"], description: "Manage customers" },
    ],
    endpoints: {
      graphql: { method: "POST", path: "/", body: { query: "" } },
    },
    authHeader: (creds) => ({ "Authorization": `Bearer ${creds.accessToken}`, "Content-Type": "application/json" }),
  },

  // ── Loom ────────────────────────────────────────────────
  loom: {
    name: "Loom", type: "productivity",
    description: "Video messaging — recordings, transcripts, workspace",
    baseUrl: "https://developer.loom.com",
    authType: "api_key", credentialKeys: ["accessToken"],
    capabilities: [
      { name: "manage_videos", actions: ["list", "get", "delete"], description: "Manage recordings" },
    ],
    endpoints: {
      list_videos:         { method: "POST", path: "/v1/videos", body: {} },
      get_video:           { method: "GET",  path: "/v1/videos/{id}" },
      delete_video:        { method: "DELETE", path: "/v1/videos/{id}" },
      get_video_transcript:{ method: "GET",  path: "/v1/videos/{id}/transcript" },
    },
    authHeader: (creds) => ({ "Authorization": `Bearer ${creds.accessToken}`, "Content-Type": "application/json" }),
  },

  // ── Google Cloud ────────────────────────────────────────
  gcloud: {
    name: "Google Cloud", type: "cloud",
    description: "GCP — Cloud Storage, Compute Engine, BigQuery",
    baseUrl: "https://storage.googleapis.com/storage/v1",
    authType: "oauth", credentialKeys: ["accessToken", "projectId"],
    capabilities: [
      { name: "manage_storage", actions: ["list_buckets", "list_objects"], description: "Cloud Storage" },
    ],
    endpoints: {
      list_buckets:  { method: "GET", path: "/b", query: ["project"] },
      get_bucket:    { method: "GET", path: "/b/{bucket}" },
      list_objects:  { method: "GET", path: "/b/{bucket}/o", query: ["prefix", "maxResults"] },
      get_object:    { method: "GET", path: "/b/{bucket}/o/{object}" },
      delete_object: { method: "DELETE", path: "/b/{bucket}/o/{object}" },
    },
    authHeader: (creds) => ({ "Authorization": `Bearer ${creds.accessToken}` }),
  },

  // ── Neon ────────────────────────────────────────────────
  neon: {
    name: "Neon", type: "database",
    description: "Serverless Postgres — projects, branches, databases, endpoints",
    baseUrl: "https://console.neon.tech/api/v2",
    authType: "api_key", credentialKeys: ["apiKey"],
    capabilities: [
      { name: "manage_projects", actions: ["create", "list", "delete"], description: "Manage projects" },
      { name: "manage_branches", actions: ["create", "list"], description: "Manage branches" },
    ],
    endpoints: {
      list_projects:  { method: "GET",  path: "/projects" },
      create_project: { method: "POST", path: "/projects", body: { project: { name: "" } } },
      get_project:    { method: "GET",  path: "/projects/{project_id}" },
      delete_project: { method: "DELETE", path: "/projects/{project_id}" },
      list_branches:  { method: "GET",  path: "/projects/{project_id}/branches" },
      create_branch:  { method: "POST", path: "/projects/{project_id}/branches", body: {} },
      list_databases: { method: "GET",  path: "/projects/{project_id}/branches/{branch_id}/databases" },
      list_endpoints: { method: "GET",  path: "/projects/{project_id}/endpoints" },
    },
    authHeader: (creds) => ({ "Authorization": `Bearer ${creds.apiKey}`, "Content-Type": "application/json" }),
  },

  // ── PlanetScale ─────────────────────────────────────────
  planetscale: {
    name: "PlanetScale", type: "database",
    description: "Serverless MySQL — databases, branches, deploy requests",
    baseUrl: "https://api.planetscale.com/v1",
    authType: "oauth", credentialKeys: ["accessToken", "organizationId"],
    capabilities: [
      { name: "manage_databases", actions: ["create", "list", "delete"], description: "Manage databases" },
      { name: "manage_branches", actions: ["create", "list"], description: "Manage branches" },
    ],
    endpoints: {
      list_databases:       { method: "GET",  path: "/organizations/{organization}/databases" },
      create_database:      { method: "POST", path: "/organizations/{organization}/databases", body: { name: "" } },
      get_database:         { method: "GET",  path: "/organizations/{organization}/databases/{database}" },
      delete_database:      { method: "DELETE", path: "/organizations/{organization}/databases/{database}" },
      list_branches:        { method: "GET",  path: "/organizations/{organization}/databases/{database}/branches" },
      create_branch:        { method: "POST", path: "/organizations/{organization}/databases/{database}/branches", body: { name: "" } },
      list_deploy_requests: { method: "GET",  path: "/organizations/{organization}/databases/{database}/deploy-requests" },
    },
    authHeader: (creds) => ({ "Authorization": `Bearer ${creds.accessToken}`, "Content-Type": "application/json" }),
  },

  // ── Turso ───────────────────────────────────────────────
  turso: {
    name: "Turso", type: "database",
    description: "Edge SQLite — databases, groups, locations, tokens",
    baseUrl: "https://api.turso.tech/v1",
    authType: "api_key", credentialKeys: ["apiToken", "organizationName"],
    capabilities: [
      { name: "manage_databases", actions: ["create", "list", "delete"], description: "Manage databases" },
      { name: "manage_groups", actions: ["create", "list"], description: "Manage groups" },
    ],
    endpoints: {
      list_databases:  { method: "GET",  path: "/organizations/{organizationName}/databases" },
      create_database: { method: "POST", path: "/organizations/{organizationName}/databases", body: { name: "", group: "default" } },
      get_database:    { method: "GET",  path: "/organizations/{organizationName}/databases/{databaseName}" },
      delete_database: { method: "DELETE", path: "/organizations/{organizationName}/databases/{databaseName}" },
      list_groups:     { method: "GET",  path: "/organizations/{organizationName}/groups" },
      create_group:    { method: "POST", path: "/organizations/{organizationName}/groups", body: { name: "", location: "ord" } },
      list_locations:  { method: "GET",  path: "/organizations/{organizationName}/locations" },
      create_token:    { method: "POST", path: "/organizations/{organizationName}/databases/{databaseName}/auth/tokens" },
    },
    authHeader: (creds) => ({ "Authorization": `Bearer ${creds.apiToken}`, "Content-Type": "application/json" }),
  },

  // ── CockroachDB ─────────────────────────────────────────
  cockroachdb: {
    name: "CockroachDB", type: "database",
    description: "Distributed SQL — clusters, databases, SQL users, backups",
    baseUrl: "https://cockroachlabs.cloud/api/v1",
    authType: "api_key", credentialKeys: ["apiKey"],
    capabilities: [
      { name: "manage_clusters", actions: ["create", "list", "get"], description: "Manage clusters" },
    ],
    endpoints: {
      list_clusters:   { method: "GET",  path: "/clusters" },
      create_cluster:  { method: "POST", path: "/clusters", body: { name: "", provider: "GCP", spec: {} } },
      get_cluster:     { method: "GET",  path: "/clusters/{cluster_id}" },
      delete_cluster:  { method: "DELETE", path: "/clusters/{cluster_id}" },
      list_sql_users:  { method: "GET",  path: "/clusters/{cluster_id}/sql-users" },
      create_sql_user: { method: "POST", path: "/clusters/{cluster_id}/sql-users", body: { name: "", password: "" } },
      list_databases:  { method: "GET",  path: "/clusters/{cluster_id}/databases" },
    },
    authHeader: (creds) => ({ "Authorization": `Bearer ${creds.apiKey}`, "Content-Type": "application/json" }),
  },

  // ── Railway ─────────────────────────────────────────────
  railway: {
    name: "Railway", type: "cloud",
    description: "Deploy anything — projects, services, environments via GraphQL",
    baseUrl: "https://backboard.railway.app/graphql/v2",
    authType: "api_key", credentialKeys: ["apiToken"],
    capabilities: [
      { name: "manage_projects", actions: ["create", "list"], description: "Manage projects" },
    ],
    endpoints: {
      graphql: { method: "POST", path: "/", body: { query: "" } },
    },
    authHeader: (creds) => ({ "Authorization": `Bearer ${creds.apiToken}`, "Content-Type": "application/json" }),
  },

  // ── Render ──────────────────────────────────────────────
  render: {
    name: "Render", type: "cloud",
    description: "Cloud platform — web services, static sites, databases, cron jobs",
    baseUrl: "https://api.render.com/v1",
    authType: "api_key", credentialKeys: ["apiKey"],
    capabilities: [
      { name: "manage_services", actions: ["create", "list", "get"], description: "Manage services" },
      { name: "manage_deploys", actions: ["list", "create"], description: "Manage deploys" },
    ],
    endpoints: {
      list_services:  { method: "GET",  path: "/services", query: ["limit", "cursor", "type"] },
      get_service:    { method: "GET",  path: "/services/{serviceId}" },
      create_service: { method: "POST", path: "/services", body: { type: "web_service", name: "" } },
      list_deploys:   { method: "GET",  path: "/services/{serviceId}/deploys", query: ["limit"] },
      create_deploy:  { method: "POST", path: "/services/{serviceId}/deploys", body: {} },
      get_deploy:     { method: "GET",  path: "/services/{serviceId}/deploys/{deployId}" },
      list_env_groups:{ method: "GET",  path: "/env-groups" },
    },
    authHeader: (creds) => ({ "Authorization": `Bearer ${creds.apiKey}`, "Content-Type": "application/json" }),
  },

  // ── CloudConvert ────────────────────────────────────────────────
  cloudconvert: {
    name: "CloudConvert",
    type: "utility",
    description: "File conversion API — convert between 200+ formats (PDF, DOCX, PNG, MP4, etc.), optimize, merge, capture websites, create thumbnails",
    baseUrl: "https://api.cloudconvert.com/v2",
    authType: "apiKey",
    credentialKeys: ["apiKey"],
    capabilities: [
      "convert files between 200+ formats",
      "merge PDFs and documents",
      "optimize images and PDFs",
      "capture website screenshots",
      "create thumbnails from documents",
      "extract text from PDFs (OCR)",
      "convert spreadsheets to CSV/JSON",
      "watermark PDFs",
      "compress videos",
      "manage conversion jobs and tasks",
    ],
    endpoints: {
      // Jobs (multi-step conversion pipelines)
      create_job:         { method: "POST", path: "/jobs", body: { tasks: {} } },
      list_jobs:          { method: "GET",  path: "/jobs", query: ["status", "tag", "per_page", "page"] },
      get_job:            { method: "GET",  path: "/jobs/{jobId}" },
      delete_job:         { method: "DELETE", path: "/jobs/{jobId}" },
      wait_job:           { method: "GET",  path: "/jobs/{jobId}/wait" },

      // Tasks
      create_task:        { method: "POST", path: "/tasks", body: { operation: "", input: "" } },
      list_tasks:         { method: "GET",  path: "/tasks", query: ["status", "operation", "job_id", "per_page", "page"] },
      get_task:           { method: "GET",  path: "/tasks/{taskId}" },
      delete_task:        { method: "DELETE", path: "/tasks/{taskId}" },
      wait_task:          { method: "GET",  path: "/tasks/{taskId}/wait" },
      cancel_task:        { method: "POST", path: "/tasks/{taskId}/cancel" },
      retry_task:         { method: "POST", path: "/tasks/{taskId}/retry" },

      // Conversion operations
      convert:            { method: "POST", path: "/convert", body: { input: "", input_format: "", output_format: "" } },
      optimize:           { method: "POST", path: "/optimize", body: { input: "", input_format: "" } },
      capture_website:    { method: "POST", path: "/capture-website", body: { url: "", output_format: "pdf" } },
      create_thumbnail:   { method: "POST", path: "/thumbnail", body: { input: "", output_format: "png" } },
      merge:              { method: "POST", path: "/merge", body: { input: [], output_format: "pdf" } },
      create_archive:     { method: "POST", path: "/archive", body: { input: [], output_format: "zip" } },
      watermark:          { method: "POST", path: "/watermark", body: { input: "", input_format: "pdf" } },
      metadata:           { method: "POST", path: "/metadata", body: { input: "", input_format: "" } },

      // Import/Export (file transfer)
      import_url:         { method: "POST", path: "/import/url", body: { url: "" } },
      import_upload:      { method: "POST", path: "/import/upload" },
      import_s3:          { method: "POST", path: "/import/s3", body: { bucket: "", region: "", key: "" } },
      import_google_cloud: { method: "POST", path: "/import/google-cloud-storage", body: { bucket: "", key: "" } },
      export_url:         { method: "POST", path: "/export/url", body: { input: "" } },
      export_s3:          { method: "POST", path: "/export/s3", body: { input: "", bucket: "", region: "", key: "" } },
      export_google_cloud: { method: "POST", path: "/export/google-cloud-storage", body: { input: "", bucket: "", key: "" } },

      // Users & Usage
      get_user:           { method: "GET",  path: "/users/me" },
      get_balance:        { method: "GET",  path: "/users/me/balance" },

      // Webhooks
      create_webhook:     { method: "POST", path: "/webhooks", body: { url: "", events: [] } },
      list_webhooks:      { method: "GET",  path: "/webhooks" },
      delete_webhook:     { method: "DELETE", path: "/webhooks/{webhookId}" },
    },
    authHeader: (creds) => ({ "Authorization": `Bearer ${creds.apiKey}`, "Content-Type": "application/json" }),
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
