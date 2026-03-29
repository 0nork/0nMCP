/**
 * 0nMCP — Universal Capability Routing System
 * Patent Pending: Universal Capability Routing & Field Resolution
 *
 * Instead of: "send email via SendGrid"
 * You write:  {{email.send}} → resolves to user's configured email provider
 *
 * The .0n file defines WHAT to do.
 * The user's account defines HOW.
 */

export const CAPABILITIES = {

  // ══════════════════════════════════════════════════
  // EMAIL
  // ══════════════════════════════════════════════════
  'email.send': {
    name: 'Send Email',
    variable: '{{email.send}}',
    description: 'Send a transactional or marketing email',
    providers: ['crm', 'sendgrid', 'gmail', 'resend', 'postmark', 'mailgun', 'brevo', 'mailchimp'],
    defaultProvider: 'crm',
    inputSchema: { to: 'string', subject: 'string', body: 'string', from: 'string?', replyTo: 'string?' },
    providerMap: {
      crm: { tool: 'crm_send_email', mapFields: { contactId: '{{resolve.contactId}}', subject: '{{subject}}', body: '{{body}}' } },
      sendgrid: { tool: 'sendgrid_send_email', mapFields: { to: '{{to}}', subject: '{{subject}}', body: '{{body}}' } },
      gmail: { tool: 'gmail_send_email', mapFields: { to: '{{to}}', subject: '{{subject}}', body: '{{body}}' } },
      resend: { tool: 'resend_send_email', mapFields: { to: '{{to}}', subject: '{{subject}}', html: '{{body}}' } },
      postmark: { tool: 'postmark_send_email', mapFields: { To: '{{to}}', Subject: '{{subject}}', HtmlBody: '{{body}}' } },
      mailgun: { tool: 'mailgun_send_message', mapFields: { to: '{{to}}', subject: '{{subject}}', html: '{{body}}' } },
      brevo: { tool: 'brevo_send_transactional', mapFields: { to: [{ email: '{{to}}' }], subject: '{{subject}}', htmlContent: '{{body}}' } },
    },
  },

  'email.list_templates': {
    name: 'List Email Templates',
    variable: '{{email.list_templates}}',
    description: 'List available email templates',
    providers: ['crm', 'sendgrid', 'mailchimp', 'postmark'],
    defaultProvider: 'crm',
  },

  'email.add_contact': {
    name: 'Add to Email List',
    variable: '{{email.add_contact}}',
    description: 'Add a contact to an email list or audience',
    providers: ['sendgrid', 'mailchimp', 'convertkit', 'activecampaign', 'brevo'],
    defaultProvider: 'mailchimp',
    inputSchema: { email: 'string', firstName: 'string?', lastName: 'string?', listId: 'string?' },
  },

  // ══════════════════════════════════════════════════
  // SMS / MESSAGING
  // ══════════════════════════════════════════════════
  'sms.send': {
    name: 'Send SMS',
    variable: '{{sms.send}}',
    description: 'Send a text message',
    providers: ['crm', 'twilio', 'whatsapp'],
    defaultProvider: 'crm',
    inputSchema: { to: 'string', message: 'string' },
    providerMap: {
      crm: { tool: 'crm_send_sms', mapFields: { contactId: '{{resolve.contactId}}', message: '{{message}}' } },
      twilio: { tool: 'twilio_send_sms', mapFields: { to: '{{to}}', body: '{{message}}' } },
    },
  },

  'message.send': {
    name: 'Send Message',
    variable: '{{message.send}}',
    description: 'Send a message to a channel or chat',
    providers: ['slack', 'discord', 'telegram', 'whatsapp'],
    defaultProvider: 'slack',
    inputSchema: { channel: 'string', text: 'string' },
    providerMap: {
      slack: { tool: 'slack_send_message', mapFields: { channel: '{{channel}}', text: '{{text}}' } },
      discord: { tool: 'discord_send_message', mapFields: { channelId: '{{channel}}', content: '{{text}}' } },
      telegram: { tool: 'telegram_send_message', mapFields: { chat_id: '{{channel}}', text: '{{text}}' } },
    },
  },

  // ══════════════════════════════════════════════════
  // CONTACTS / CRM
  // ══════════════════════════════════════════════════
  'contact.create': {
    name: 'Create Contact',
    variable: '{{contact.create}}',
    description: 'Create a new contact/lead in the CRM',
    providers: ['crm', 'hubspot', 'pipedrive', 'activecampaign', 'intercom'],
    defaultProvider: 'crm',
    inputSchema: { email: 'string', firstName: 'string?', lastName: 'string?', phone: 'string?', company: 'string?', tags: 'array?' },
  },

  'contact.search': {
    name: 'Search Contacts',
    variable: '{{contact.search}}',
    description: 'Search for contacts by name, email, or phone',
    providers: ['crm', 'hubspot', 'pipedrive', 'activecampaign'],
    defaultProvider: 'crm',
    inputSchema: { query: 'string' },
  },

  'contact.tag': {
    name: 'Tag Contact',
    variable: '{{contact.tag}}',
    description: 'Add tags to a contact for segmentation',
    providers: ['crm', 'activecampaign', 'convertkit', 'hubspot'],
    defaultProvider: 'crm',
    inputSchema: { contactId: 'string', tags: 'array' },
  },

  // ══════════════════════════════════════════════════
  // CALENDAR / BOOKING
  // ══════════════════════════════════════════════════
  'calendar.book': {
    name: 'Book Appointment',
    variable: '{{calendar.book}}',
    description: 'Book a calendar appointment or meeting',
    providers: ['crm', 'google_calendar', 'calendly', 'zoom'],
    defaultProvider: 'crm',
    inputSchema: { contactId: 'string?', startTime: 'string', endTime: 'string?', title: 'string', attendees: 'array?' },
  },

  'calendar.list': {
    name: 'List Events',
    variable: '{{calendar.list}}',
    description: 'List upcoming calendar events',
    providers: ['crm', 'google_calendar', 'calendly'],
    defaultProvider: 'crm',
    inputSchema: { maxResults: 'number?' },
  },

  'meeting.create': {
    name: 'Create Video Meeting',
    variable: '{{meeting.create}}',
    description: 'Create a video meeting room',
    providers: ['zoom', 'google_calendar'],
    defaultProvider: 'zoom',
    inputSchema: { topic: 'string', startTime: 'string', duration: 'number?' },
  },

  // ══════════════════════════════════════════════════
  // PAYMENTS / INVOICING
  // ══════════════════════════════════════════════════
  'payment.create_customer': {
    name: 'Create Payment Customer',
    variable: '{{payment.create_customer}}',
    description: 'Create a customer in the payment system',
    providers: ['stripe', 'square', 'quickbooks', 'xero'],
    defaultProvider: 'stripe',
    inputSchema: { email: 'string', name: 'string?' },
  },

  'payment.create_invoice': {
    name: 'Create Invoice',
    variable: '{{payment.create_invoice}}',
    description: 'Create and send an invoice',
    providers: ['stripe', 'square', 'quickbooks', 'xero', 'wave'],
    defaultProvider: 'stripe',
    inputSchema: { customer: 'string', amount: 'number', description: 'string?' },
  },

  'payment.create_checkout': {
    name: 'Create Checkout',
    variable: '{{payment.create_checkout}}',
    description: 'Create a payment checkout session',
    providers: ['stripe', 'square'],
    defaultProvider: 'stripe',
    inputSchema: { priceId: 'string', successUrl: 'string?', cancelUrl: 'string?' },
  },

  'payment.list_transactions': {
    name: 'List Transactions',
    variable: '{{payment.list_transactions}}',
    description: 'List recent payment transactions',
    providers: ['stripe', 'square', 'quickbooks'],
    defaultProvider: 'stripe',
    inputSchema: { limit: 'number?' },
  },

  // ══════════════════════════════════════════════════
  // SOCIAL MEDIA
  // ══════════════════════════════════════════════════
  'social.post': {
    name: 'Create Social Post',
    variable: '{{social.post}}',
    description: 'Post to social media',
    providers: ['crm', 'linkedin', 'twitter', 'instagram', 'facebook_ads', 'pinterest', 'tiktok', 'reddit'],
    defaultProvider: 'crm',
    inputSchema: { text: 'string', platform: 'string?', imageUrl: 'string?' },
  },

  'social.get_analytics': {
    name: 'Get Social Analytics',
    variable: '{{social.get_analytics}}',
    description: 'Get social media performance metrics',
    providers: ['crm', 'linkedin', 'twitter', 'instagram', 'youtube', 'pinterest'],
    defaultProvider: 'crm',
    inputSchema: { platform: 'string?', dateRange: 'string?' },
  },

  // ══════════════════════════════════════════════════
  // ADVERTISING
  // ══════════════════════════════════════════════════
  'ads.create_campaign': {
    name: 'Create Ad Campaign',
    variable: '{{ads.create_campaign}}',
    description: 'Create an advertising campaign',
    providers: ['google_ads', 'facebook_ads', 'linkedin_ads', 'tiktok_ads', 'twitter', 'x_ads', 'pinterest'],
    defaultProvider: 'facebook_ads',
    inputSchema: { name: 'string', budget: 'number', objective: 'string?' },
  },

  'ads.get_performance': {
    name: 'Get Ad Performance',
    variable: '{{ads.get_performance}}',
    description: 'Get advertising campaign metrics',
    providers: ['google_ads', 'facebook_ads', 'linkedin_ads', 'tiktok_ads'],
    defaultProvider: 'facebook_ads',
    inputSchema: { campaignId: 'string?', dateRange: 'string?' },
  },

  // ══════════════════════════════════════════════════
  // PROJECT MANAGEMENT
  // ══════════════════════════════════════════════════
  'project.create_task': {
    name: 'Create Task',
    variable: '{{project.create_task}}',
    description: 'Create a task or issue',
    providers: ['crm', 'asana', 'trello', 'monday', 'linear', 'jira', 'notion'],
    defaultProvider: 'crm',
    inputSchema: { title: 'string', description: 'string?', assignee: 'string?', dueDate: 'string?', priority: 'string?' },
  },

  'project.list_tasks': {
    name: 'List Tasks',
    variable: '{{project.list_tasks}}',
    description: 'List tasks from a project',
    providers: ['crm', 'asana', 'trello', 'monday', 'linear', 'jira'],
    defaultProvider: 'crm',
    inputSchema: { projectId: 'string?', status: 'string?' },
  },

  'project.create_issue': {
    name: 'Create Issue',
    variable: '{{project.create_issue}}',
    description: 'Create a bug report or feature request',
    providers: ['github', 'jira', 'linear'],
    defaultProvider: 'github',
    inputSchema: { title: 'string', body: 'string?', labels: 'array?', assignee: 'string?' },
  },

  // ══════════════════════════════════════════════════
  // STORAGE / FILES
  // ══════════════════════════════════════════════════
  'storage.upload': {
    name: 'Upload File',
    variable: '{{storage.upload}}',
    description: 'Upload a file to cloud storage',
    providers: ['google_drive', 'dropbox', 'supabase', 'aws'],
    defaultProvider: 'google_drive',
    inputSchema: { fileName: 'string', content: 'string', folder: 'string?' },
  },

  'storage.list': {
    name: 'List Files',
    variable: '{{storage.list}}',
    description: 'List files in cloud storage',
    providers: ['google_drive', 'dropbox', 'supabase', 'aws'],
    defaultProvider: 'google_drive',
    inputSchema: { folder: 'string?', limit: 'number?' },
  },

  // ══════════════════════════════════════════════════
  // DATABASE
  // ══════════════════════════════════════════════════
  'db.query': {
    name: 'Query Database',
    variable: '{{db.query}}',
    description: 'Query data from a database',
    providers: ['supabase', 'mongodb', 'airtable', 'google_sheets', 'neon', 'planetscale', 'turso', 'cockroachdb'],
    defaultProvider: 'supabase',
    inputSchema: { table: 'string', filter: 'object?', select: 'string?', limit: 'number?' },
  },

  'db.insert': {
    name: 'Insert Record',
    variable: '{{db.insert}}',
    description: 'Insert a record into a database',
    providers: ['supabase', 'mongodb', 'airtable', 'google_sheets', 'notion'],
    defaultProvider: 'supabase',
    inputSchema: { table: 'string', data: 'object' },
  },

  'db.update': {
    name: 'Update Record',
    variable: '{{db.update}}',
    description: 'Update records in a database',
    providers: ['supabase', 'mongodb', 'airtable', 'notion'],
    defaultProvider: 'supabase',
    inputSchema: { table: 'string', data: 'object', match: 'object' },
  },

  // ══════════════════════════════════════════════════
  // SPREADSHEETS
  // ══════════════════════════════════════════════════
  'spreadsheet.read': {
    name: 'Read Spreadsheet',
    variable: '{{spreadsheet.read}}',
    description: 'Read data from a spreadsheet',
    providers: ['google_sheets', 'airtable', 'notion'],
    defaultProvider: 'google_sheets',
    inputSchema: { spreadsheetId: 'string', range: 'string' },
  },

  'spreadsheet.write': {
    name: 'Write to Spreadsheet',
    variable: '{{spreadsheet.write}}',
    description: 'Write data to a spreadsheet',
    providers: ['google_sheets', 'airtable', 'notion'],
    defaultProvider: 'google_sheets',
    inputSchema: { spreadsheetId: 'string', range: 'string', values: 'array' },
  },

  // ══════════════════════════════════════════════════
  // SUPPORT / TICKETING
  // ══════════════════════════════════════════════════
  'support.create_ticket': {
    name: 'Create Support Ticket',
    variable: '{{support.create_ticket}}',
    description: 'Create a support ticket or help desk issue',
    providers: ['zendesk', 'freshdesk', 'intercom', 'jira', 'crm'],
    defaultProvider: 'crm',
    inputSchema: { subject: 'string', description: 'string', priority: 'string?', contactEmail: 'string?' },
  },

  'support.list_tickets': {
    name: 'List Support Tickets',
    variable: '{{support.list_tickets}}',
    description: 'List open support tickets',
    providers: ['zendesk', 'freshdesk', 'intercom', 'jira'],
    defaultProvider: 'zendesk',
    inputSchema: { status: 'string?', limit: 'number?' },
  },

  // ══════════════════════════════════════════════════
  // E-COMMERCE
  // ══════════════════════════════════════════════════
  'shop.list_products': {
    name: 'List Products',
    variable: '{{shop.list_products}}',
    description: 'List products from an e-commerce store',
    providers: ['shopify', 'woocommerce', 'bigcommerce', 'square'],
    defaultProvider: 'shopify',
    inputSchema: { limit: 'number?' },
  },

  'shop.create_product': {
    name: 'Create Product',
    variable: '{{shop.create_product}}',
    description: 'Create a product in an e-commerce store',
    providers: ['shopify', 'woocommerce', 'bigcommerce', 'stripe'],
    defaultProvider: 'shopify',
    inputSchema: { title: 'string', price: 'number', description: 'string?' },
  },

  'shop.list_orders': {
    name: 'List Orders',
    variable: '{{shop.list_orders}}',
    description: 'List recent orders',
    providers: ['shopify', 'woocommerce', 'bigcommerce', 'square'],
    defaultProvider: 'shopify',
    inputSchema: { limit: 'number?', status: 'string?' },
  },

  // ══════════════════════════════════════════════════
  // DESIGN
  // ══════════════════════════════════════════════════
  'design.get_file': {
    name: 'Get Design File',
    variable: '{{design.get_file}}',
    description: 'Read a design file',
    providers: ['figma'],
    defaultProvider: 'figma',
    inputSchema: { fileKey: 'string' },
  },

  'design.export': {
    name: 'Export Design',
    variable: '{{design.export}}',
    description: 'Export design frames as images',
    providers: ['figma'],
    defaultProvider: 'figma',
    inputSchema: { fileKey: 'string', nodeIds: 'string', format: 'string?' },
  },

  // ══════════════════════════════════════════════════
  // AI / GENERATION
  // ══════════════════════════════════════════════════
  'ai.generate_text': {
    name: 'Generate Text',
    variable: '{{ai.generate_text}}',
    description: 'Generate text using AI',
    providers: ['groq', 'openai', 'anthropic', 'mistral', 'cohere', 'ollama', 'replicate', 'deepseek'],
    defaultProvider: 'groq',
    inputSchema: { prompt: 'string', model: 'string?', maxTokens: 'number?' },
  },

  'ai.generate_image': {
    name: 'Generate Image',
    variable: '{{ai.generate_image}}',
    description: 'Generate an image using AI',
    providers: ['openai', 'stability', 'replicate'],
    defaultProvider: 'openai',
    inputSchema: { prompt: 'string', size: 'string?' },
  },

  'ai.generate_audio': {
    name: 'Generate Audio',
    variable: '{{ai.generate_audio}}',
    description: 'Generate speech from text',
    providers: ['elevenlabs', 'openai'],
    defaultProvider: 'elevenlabs',
    inputSchema: { text: 'string', voiceId: 'string?' },
  },

  'ai.transcribe': {
    name: 'Transcribe Audio',
    variable: '{{ai.transcribe}}',
    description: 'Convert speech to text',
    providers: ['deepgram', 'groq', 'openai'],
    defaultProvider: 'deepgram',
    inputSchema: { audioUrl: 'string', language: 'string?' },
  },

  'ai.embed': {
    name: 'Create Embedding',
    variable: '{{ai.embed}}',
    description: 'Create vector embeddings from text',
    providers: ['openai', 'cohere', 'ollama'],
    defaultProvider: 'openai',
    inputSchema: { text: 'string', model: 'string?' },
  },

  // ══════════════════════════════════════════════════
  // DOCUMENTS / SIGNING
  // ══════════════════════════════════════════════════
  'document.sign': {
    name: 'Send for Signature',
    variable: '{{document.sign}}',
    description: 'Send a document for e-signature',
    providers: ['docusign'],
    defaultProvider: 'docusign',
    inputSchema: { subject: 'string', recipients: 'array', documentUrl: 'string?' },
  },

  // ══════════════════════════════════════════════════
  // WEBSITE / CMS
  // ══════════════════════════════════════════════════
  'cms.create_post': {
    name: 'Create Blog Post',
    variable: '{{cms.create_post}}',
    description: 'Create a blog post or page',
    providers: ['crm', 'wordpress', 'webflow', 'notion'],
    defaultProvider: 'crm',
    inputSchema: { title: 'string', content: 'string', status: 'string?' },
  },

  'cms.publish': {
    name: 'Publish Site',
    variable: '{{cms.publish}}',
    description: 'Publish or deploy a website',
    providers: ['webflow', 'netlify'],
    defaultProvider: 'webflow',
    inputSchema: { siteId: 'string' },
  },

  // ══════════════════════════════════════════════════
  // DOMAINS / DNS
  // ══════════════════════════════════════════════════
  'domain.search': {
    name: 'Search Domains',
    variable: '{{domain.search}}',
    description: 'Search for available domain names',
    providers: ['godaddy', 'cloudflare'],
    defaultProvider: 'godaddy',
    inputSchema: { query: 'string' },
  },

  'domain.manage_dns': {
    name: 'Manage DNS',
    variable: '{{domain.manage_dns}}',
    description: 'Create or update DNS records',
    providers: ['cloudflare', 'godaddy'],
    defaultProvider: 'cloudflare',
    inputSchema: { domain: 'string', type: 'string', name: 'string', content: 'string' },
  },

  // ══════════════════════════════════════════════════
  // COLD EMAIL / OUTREACH
  // ══════════════════════════════════════════════════
  'outreach.add_lead': {
    name: 'Add Outreach Lead',
    variable: '{{outreach.add_lead}}',
    description: 'Add a lead to a cold email campaign',
    providers: ['smartlead', 'lemlist'],
    defaultProvider: 'smartlead',
    inputSchema: { email: 'string', firstName: 'string?', campaignId: 'string' },
  },

  // ══════════════════════════════════════════════════
  // FORMS / DATA COLLECTION
  // ══════════════════════════════════════════════════
  'form.get_responses': {
    name: 'Get Form Responses',
    variable: '{{form.get_responses}}',
    description: 'Get responses from a form',
    providers: ['typeform', 'crm', 'google_sheets'],
    defaultProvider: 'typeform',
    inputSchema: { formId: 'string' },
  },

  // ══════════════════════════════════════════════════
  // EDUCATION / COURSES
  // ══════════════════════════════════════════════════
  'course.create': {
    name: 'Create Course',
    variable: '{{course.create}}',
    description: 'Create a course with modules and lessons',
    providers: ['crm'],
    defaultProvider: 'crm',
    inputSchema: { title: 'string', description: 'string?', modules: 'array' },
  },

  // ══════════════════════════════════════════════════
  // SXO / SEO
  // ══════════════════════════════════════════════════
  'sxo.scan': {
    name: 'SXO Domain Scan',
    variable: '{{sxo.scan}}',
    description: 'Scan a domain for SXO/SEO/AI readiness score',
    providers: ['sxo'],
    defaultProvider: 'sxo',
    inputSchema: { url: 'string' },
  },

  // ══════════════════════════════════════════════════
  // PIPELINE / SALES
  // ══════════════════════════════════════════════════
  'pipeline.create_deal': {
    name: 'Create Deal',
    variable: '{{pipeline.create_deal}}',
    description: 'Create a deal/opportunity in the sales pipeline',
    providers: ['crm', 'hubspot', 'pipedrive'],
    defaultProvider: 'crm',
    inputSchema: { name: 'string', value: 'number?', stage: 'string?', contactId: 'string?' },
  },

  'pipeline.move_stage': {
    name: 'Move Deal Stage',
    variable: '{{pipeline.move_stage}}',
    description: 'Move a deal to a different pipeline stage',
    providers: ['crm', 'hubspot', 'pipedrive'],
    defaultProvider: 'crm',
    inputSchema: { dealId: 'string', stageId: 'string' },
  },

  // ══════════════════════════════════════════════════
  // VOICE / PHONE
  // ══════════════════════════════════════════════════
  'voice.call': {
    name: 'Make Phone Call',
    variable: '{{voice.call}}',
    description: 'Initiate a phone call',
    providers: ['twilio', 'crm'],
    defaultProvider: 'twilio',
    inputSchema: { to: 'string', from: 'string?', message: 'string?' },
  },

  'voice.tts': {
    name: 'Text to Speech',
    variable: '{{voice.tts}}',
    description: 'Convert text to natural speech audio',
    providers: ['elevenlabs', 'openai'],
    defaultProvider: 'elevenlabs',
    inputSchema: { text: 'string', voiceId: 'string?' },
  },

  'voice.transcribe': {
    name: 'Transcribe Audio',
    variable: '{{voice.transcribe}}',
    description: 'Convert audio/speech to text',
    providers: ['deepgram', 'groq', 'openai'],
    defaultProvider: 'deepgram',
    inputSchema: { audioUrl: 'string' },
  },

  // ══════════════════════════════════════════════════
  // ACCOUNTING
  // ══════════════════════════════════════════════════
  'accounting.create_invoice': {
    name: 'Create Accounting Invoice',
    variable: '{{accounting.create_invoice}}',
    description: 'Create an invoice in the accounting system',
    providers: ['quickbooks', 'xero', 'wave'],
    defaultProvider: 'quickbooks',
    inputSchema: { customer: 'string', lineItems: 'array', dueDate: 'string?' },
  },

  'accounting.list_invoices': {
    name: 'List Accounting Invoices',
    variable: '{{accounting.list_invoices}}',
    description: 'List invoices from accounting',
    providers: ['quickbooks', 'xero'],
    defaultProvider: 'quickbooks',
    inputSchema: { limit: 'number?', status: 'string?' },
  },

  // ══════════════════════════════════════════════════
  // AUTOMATION / WORKFLOWS
  // ══════════════════════════════════════════════════
  'automation.trigger': {
    name: 'Trigger Automation',
    variable: '{{automation.trigger}}',
    description: 'Trigger an automation workflow',
    providers: ['crm', 'zapier', 'make', 'n8n', 'pabbly'],
    defaultProvider: 'crm',
    inputSchema: { workflowId: 'string?', data: 'object?' },
  },

  // ══════════════════════════════════════════════════
  // DEPLOYMENT / HOSTING
  // ══════════════════════════════════════════════════
  'deploy.site': {
    name: 'Deploy Website',
    variable: '{{deploy.site}}',
    description: 'Deploy or publish a website',
    providers: ['netlify', 'cloudflare', 'render', 'railway'],
    defaultProvider: 'netlify',
    inputSchema: { siteId: 'string' },
  },

  // ══════════════════════════════════════════════════
  // VIDEO
  // ══════════════════════════════════════════════════
  'video.get': {
    name: 'Get Video',
    variable: '{{video.get}}',
    description: 'Get video details or recording',
    providers: ['youtube', 'loom', 'twitch'],
    defaultProvider: 'youtube',
    inputSchema: { videoId: 'string' },
  },
}

/**
 * Resolve a capability to the user's configured provider
 */
export function resolveCapability(capabilityId, userConfig = {}) {
  const cap = CAPABILITIES[capabilityId]
  if (!cap) return null

  // Check user's preferred provider for this capability
  const preferredProvider = userConfig[capabilityId] || userConfig[capabilityId.split('.')[0]] || cap.defaultProvider

  // Verify the provider is in the allowed list
  if (cap.providers.includes(preferredProvider)) {
    return { capability: cap, provider: preferredProvider, tool: cap.providerMap?.[preferredProvider]?.tool }
  }

  // Fallback to default
  return { capability: cap, provider: cap.defaultProvider, tool: cap.providerMap?.[cap.defaultProvider]?.tool }
}

/**
 * List all capabilities
 */
export function listCapabilities() {
  return Object.entries(CAPABILITIES).map(([id, cap]) => ({
    id,
    variable: cap.variable,
    name: cap.name,
    description: cap.description,
    providers: cap.providers,
    defaultProvider: cap.defaultProvider,
  }))
}

/**
 * Get capabilities by category
 */
export function getCapabilitiesByCategory() {
  const categories = {}
  for (const [id, cap] of Object.entries(CAPABILITIES)) {
    const category = id.split('.')[0]
    if (!categories[category]) categories[category] = []
    categories[category].push({ id, ...cap })
  }
  return categories
}
