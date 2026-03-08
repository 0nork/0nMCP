<div align="center">

```
 ██████╗ ███╗   ██╗███╗   ███╗ ██████╗██████╗
██╔═████╗████╗  ██║████╗ ████║██╔════╝██╔══██╗
██║██╔██║██╔██╗ ██║██╔████╔██║██║     ██████╔╝
████╔╝██║██║╚██╗██║██║╚██╔╝██║██║     ██╔═══╝
╚██████╔╝██║ ╚████║██║ ╚═╝ ██║╚██████╗██║
 ╚═════╝ ╚═╝  ╚═══╝╚═╝     ╚═╝ ╚═════╝╚═╝
```

# The Universal AI API Orchestrator

### Connect your apps. Say what you want. AI does the rest.

[![npm version](https://img.shields.io/npm/v/0nmcp.svg?style=flat-square)](https://www.npmjs.com/package/0nmcp)
[![npm downloads](https://img.shields.io/npm/dm/0nmcp.svg?style=flat-square)](https://www.npmjs.com/package/0nmcp)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen?style=flat-square)](https://nodejs.org)
[![MCP](https://img.shields.io/badge/MCP-Compatible-blueviolet?style=flat-square)](https://modelcontextprotocol.io)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square)](http://makeapullrequest.com)
[![Services](https://img.shields.io/badge/services-53+-blue?style=flat-square)](#-supported-services)
[![Tools](https://img.shields.io/badge/tools-850-orange?style=flat-square)](#-all-tools)
[![Community](https://img.shields.io/badge/community-1000%2B_devs-ff6600?style=flat-square)](#-community)
[![Website](https://img.shields.io/badge/Website-0nmcp.com-ff6b35?style=flat-square)](https://0nmcp.com)
[![GitHub Discussions](https://img.shields.io/github/discussions/0nork/0nMCP?style=flat-square&label=discussions)](https://github.com/0nork/0nMCP/discussions)

**850 tools. 53 services. Zero configuration. One natural language interface.**

[Website](https://0nmcp.com) · [Quick Start](#-installation) · [Services](#-supported-services) · [850 Tools](#-all-tools) · [.0n Standard](#-the-0n-standard) · [Unlocks](#-unlocks) · [Community](https://0nmcp.com/community)

</div>

---

> **v2.3.0** — 850 tools across 53 services in 23 categories. 1,142 total capabilities. New in v2.3: **5 new services** (Cloudflare, GoDaddy, n8n, Pabbly, Make), **Resend expanded** (3→67 endpoints), **ACTION_ALIASES conversion layer** for intuitive .0n workflow authoring, **connection auto-enrichment** (locationId, pipelineId injected from .0n files), and **enhanced API validation** (CRM, Anthropic, Vercel). [See what's new](#-whats-new-in-v23).

---

## The Problem

You have **Stripe** for payments. **SendGrid** for email. **Slack** for messaging. **Airtable** for data. A **CRM** for contacts.

Today, to automate across them, you need:
- Zapier ($50+/month) — and build complex zaps
- n8n/Make — and learn their visual builders
- Custom code — and maintain API integrations forever

**What if you could just... talk to them?**

---

## The Solution

```
You: "Invoice john@acme.com for $500 and notify #sales on Slack when it's sent"
```

0nMCP **figures out the rest**:

```
Step 1: Found John Smith (john@acme.com) in Stripe
Step 2: Created invoice INV-0042 for $500.00
Step 3: Posted to #sales: "New invoice sent to John Smith for $500"

Done. 3 steps. 2 services. 1.2 seconds.
```

**No workflows. No mapping. No code. Just results.**

---

## Watch It Work

```bash
# In Claude Desktop after setup:

You: "Connect to Stripe with key sk_live_xxx"
AI:  Connected to Stripe (8 capabilities available)

You: "Connect to Slack with bot token xoxb-xxx"
AI:  Connected to Slack (4 capabilities available)

You: "Get my Stripe balance and post it to #finance"
AI:  Your Stripe balance is $12,450.00. Posted to #finance.
```

**That's it.** No configuration files. No workflow builders. No decisions about which API to use.

---

## Installation

### One Command

```bash
npx 0nmcp
```

Or install globally:

```bash
npm install -g 0nmcp
```

### Configure Claude Desktop

Add to `~/Library/Application Support/Claude/claude_desktop_config.json` (Mac) or `%APPDATA%\Claude\claude_desktop_config.json` (Windows):

```json
{
  "mcpServers": {
    "0nmcp": {
      "command": "npx",
      "args": ["0nmcp"],
      "env": {
        "ANTHROPIC_API_KEY": "sk-ant-..."
      }
    }
  }
}
```

> `ANTHROPIC_API_KEY` is **optional**. It enables AI-powered multi-step task planning. Without it, 0nMCP still works using keyword-based routing.

### Restart Claude Desktop. Start talking.

> **New to 0nMCP?** Visit **[0nmcp.com](https://0nmcp.com)** for guides, tutorials, and the community hub.

---

## Supported Services

| Service | Type | What You Can Do |
|---------|------|-----------------|
| **Stripe** | Payments | Create customers, send invoices, check balance, subscriptions, products, prices |
| **SendGrid** | Email | Send emails, manage contacts, templates, lists |
| **Resend** | Email | Send transactional emails, manage domains |
| **Twilio** | SMS/Voice | Send SMS, make calls, check message status |
| **Slack** | Communication | Post to channels, DMs, list users, create channels |
| **Discord** | Communication | Send messages, list server channels |
| **OpenAI** | AI | Text generation, DALL-E images, embeddings, TTS |
| **Airtable** | Database | CRUD records in any base, list bases |
| **Notion** | Database | Search, create pages, query databases |
| **GitHub** | Code | Repos, issues, pull requests |
| **Linear** | Projects | Issues, projects (GraphQL) |
| **Shopify** | E-commerce | Products, orders, customers, inventory |
| **HubSpot** | CRM | Contacts, companies, deals |
| **Supabase** | Database | Tables, auth users, storage buckets |
| **Calendly** | Scheduling | Events, event types, availability |
| **Google Calendar** | Scheduling | Events, calendars, CRUD |
| **Gmail** | Email | Send, read, search emails, manage labels, drafts, threads, attachments |
| **Google Sheets** | Database | Read/write spreadsheets, create sheets, append rows, batch operations |
| **Google Drive** | Storage | Upload, download, search, share files, manage folders, permissions |
| **Jira** | Dev Tools | Issues, projects, sprints, boards, transitions, comments, assignments |
| **Zendesk** | Support | Tickets, users, organizations, comments, tags, views, search |
| **Mailchimp** | Marketing | Campaigns, lists, members, templates, automations, reports |
| **Zoom** | Communication | Meetings, webinars, recordings, users, registrants |
| **Microsoft 365** | Productivity | Outlook mail, Teams messages, OneDrive files, calendar events |
| **MongoDB** | Database | Find, insert, update, delete, aggregate documents via Atlas Data API |
| **QuickBooks** | Accounting | Invoices, customers, payments, bills, estimates, items, P&L reports |
| **Asana** | Projects | Tasks, projects, sections, workspaces, tags, teams, search |
| **Intercom** | Support | Contacts, conversations, companies, tags, help center articles |
| **Dropbox** | Storage | Files, folders, sharing links, search, move, copy |
| **WhatsApp Business** | Communication | Text messages, templates, media messages via Business API |
| **Instagram** | Social | Media posts, comments, insights, stories via Graph API |
| **X (Twitter)** | Social | Tweets, users, followers, lists, DMs, likes, retweets |
| **TikTok Business** | Social | Videos, ads, campaigns, ad groups, reports |
| **Google Ads** | Advertising | Campaigns, ad groups, ads, keywords, performance reports |
| **Facebook Ads** | Advertising | Campaigns, ad sets, ads, insights, custom audiences |
| **Plaid** | Finance | Bank accounts, transactions, balances, identity, auth |
| **Square** | Payments | Payments, customers, orders, catalog, inventory |
| **TikTok Ads** | Advertising | Campaigns, ad groups, ads, reports, audiences |
| **X Ads** | Advertising | Campaigns, line items, promoted tweets, stats, audiences |
| **LinkedIn Ads** | Advertising | Campaigns, campaign groups, creatives, analytics, audiences |
| **Instagram Ads** | Advertising | Campaigns, ad sets, ads, insights via Marketing API |
| **Smartlead** | Marketing | Cold email campaigns, leads, sequences, email accounts |
| **Zapier** | Automation | Zaps, actions — view and toggle automations |
| **MuleSoft** | Integration | APIs, applications, environments via Anypoint Platform |
| **Microsoft Azure** | Cloud | Resources, resource groups, storage, VMs via ARM |
| **Pipedrive** | CRM | Deals, persons, organizations, activities, pipelines, notes |
| **LinkedIn** | Social | Posts, profile, connections, organization pages |
| **Cloudflare** | Cloud | DNS zones, records, workers, KV storage, page rules, firewall |
| **GoDaddy** | Cloud | Domains, DNS, availability, agreements, renewals |
| **n8n** | Automation | Workflows, executions, credentials — self-hosted automation |
| **Pabbly** | Automation | Workflows, triggers, actions, connections |
| **Make** | Automation | Scenarios, organizations, data stores, connections |
| **CRM** | CRM | **245 tools** — contacts, conversations, calendars, invoices, payments, products, pipelines, social media, custom objects, and more |

**53 services. 850 tools. 23 categories. One interface.**

> **More coming:** AWS S3, Vercel, Firebase, Figma, DocuSign, Twilio Flex...

---

## Examples

### Simple Tasks

```
"Send an email to sarah@example.com: Meeting moved to 3pm"

"Create a Stripe customer for mike@startup.io"

"Post to #engineering on Slack: Deploy complete!"

"Send SMS to +1555123456: Your order shipped"

"What's my Stripe balance?"

"Search Notion for project roadmap"
```

### Multi-Step

```
"Create a Stripe invoice for $1000, then email the link via Gmail to john@client.com"

"Create a Jira issue for the login bug, then post it to #bugs on Slack"

"Look up sarah@example.com in my CRM and send her a follow-up email"
```

### Complex Orchestration

```
"Check if we have any overdue invoices in Stripe. If so, send a summary
 to #finance on Slack and email the finance team."
```

The AI:
1. Queries Stripe for overdue invoices
2. Formats a summary
3. Posts to Slack
4. Sends the email
5. Reports back

**You describe the outcome. AI figures out the path.**

### CRM Snapshots — Deploy Entire Configurations

```
"Deploy a full CRM snapshot with a 12-stage sales pipeline,
 all lead tags, custom values, and 18 workflow definitions"
```

One tool call. Everything deployed:

```json
{
  "pipeline": {
    "name": "Sales Pipeline",
    "stages": ["001. New Lead", "002. Attempt to Contact", "003. Engaged",
               "004. Appointment Set", "005. Appointment Showed", "006. Proposal Sent"]
  },
  "tags": ["New Lead", "FB Lead", "Hot Lead", "Booked Appointment", "No Show"],
  "custom_values": {
    "calendar_link": "https://calendly.com/yourlink",
    "support_email": "support@yourco.com",
    "welcome_sms": "Hey {{contact.first_name}}, welcome aboard!"
  }
}
```

---

## All Tools

### Universal Tools (7)

| Tool | Description |
|------|-------------|
| `execute` | Run any task in natural language across all connected services |
| `connect_service` | Connect a new service with credentials |
| `disconnect_service` | Remove a connected service |
| `list_connections` | See what's connected and capability counts |
| `list_available_services` | Browse all 53 services grouped by category |
| `get_service_info` | Deep dive on a specific service — endpoints, auth, capabilities |
| `api_call` | Direct API call to any connected service endpoint |

### CRM Tools (245)

The deepest CRM integration available in any MCP server. 245 tools across 12 modules — every endpoint, every parameter, full CRUD.

| Module | Tools | Coverage |
|--------|-------|----------|
| **Auth** | 5 | OAuth flow, token management, snapshot deploy, workflow processing |
| **Contacts** | 23 | CRUD, search, upsert, tags, notes, tasks, workflows, followers, campaigns |
| **Conversations** | 13 | CRUD, messaging (SMS, Email, WhatsApp, IG, FB, Live Chat), attachments |
| **Calendars** | 27 | Calendars, events, appointments, groups, resources, blocked slots, notes |
| **Opportunities** | 14 | CRUD, search, upsert, status updates, followers, pipelines, stages |
| **Invoices** | 20 | CRUD, send, void, record payments, templates, schedules, auto-payment |
| **Payments** | 16 | Orders, transactions, subscriptions, coupons, providers, fulfillment |
| **Products** | 10 | Products + prices CRUD, inventory management |
| **Locations** | 24 | Locations, tags, custom fields, custom values, templates, tasks, timezones |
| **Social** | 35 | Social media posts, blogs, authors, categories, tags, Google Business |
| **Users** | 24 | Users, forms, surveys, funnels, media, companies, businesses |
| **Objects** | 34 | Custom objects, associations, email, workflows, snapshots, links, campaigns, courses, SaaS |

**850 total tools.** Universal orchestration (576 catalog tools across 53 services) + the most comprehensive CRM integration in the MCP ecosystem (245 dedicated tools) + Vault (4 tools) + Vault Containers (8 tools) + Business Deed Transfer (6 tools) + Engine (6 tools) + App Builder (5 tools).

> Every CRM tool is data-driven — defined as configuration, not code. Adding new endpoints takes minutes, not hours. See [CONTRIBUTING.md](CONTRIBUTING.md).

---

## What's New in v2.3

### v2.3.0 — Conversion Layer + 5 New Services

- **5 new services**: Cloudflare (DNS, Workers, KV), GoDaddy (domains), n8n (self-hosted automation), Pabbly (workflows), Make (scenarios)
- **68 new catalog endpoints** — from 508 to 576 catalog tools
- **Resend expanded**: 3→67 endpoints — full Resend API coverage (domains, contacts, audiences, broadcasts)
- **ACTION_ALIASES conversion layer** — 150+ intuitive action mappings (e.g., `contacts.create` → `create_contact`) so .0n SWITCH files use natural action names
- **Connection auto-enrichment** — workflow runner automatically injects `locationId`, `pipelineId`, `projectRef` from .0n connection metadata
- **Enhanced API validation** — CRM, Anthropic, and Vercel verification endpoints added to engine validator
- Total: **850 tools across 53 services in 23 categories**

### v2.2.0 — 22 New Services Expansion

- **255 new catalog endpoints** across 22 new services — from 290 to 576 catalog tools
- **6 new categories**: Accounting, Advertising, Finance, Cloud, Integration, Automation
- **Advertising suite**: Google Ads, Facebook Ads, TikTok Ads, X Ads, LinkedIn Ads, Instagram Ads
- **Social expansion**: Instagram, X (Twitter), TikTok Business, LinkedIn
- **Business tools**: QuickBooks, Asana, Intercom, Pipedrive, Square, Plaid
- **Infrastructure**: Dropbox, MuleSoft, Microsoft Azure, Zapier
- **Communication**: WhatsApp Business
- **Marketing**: Smartlead cold email outreach
- Total: **850 tools across 53 services in 23 categories**

### v2.1.0 — Business Deed Transfer System

- **6 new tools**: `deed_create`, `deed_open`, `deed_inspect`, `deed_verify`, `deed_accept`, `deed_import`
- Package entire business digital assets into encrypted `.0nv` containers
- Chain of custody tracking with transfer history in audit_trail layer
- Auto-detection of credentials from .env/JSON/CSV via engine mapper
- Lifecycle: **CREATE → PACKAGE → ESCROW → ACCEPT → IMPORT → FLIP**

### v2.0.0 — 0nVault Container System (Patent Pending #63/990,046)

- **8 new tools**: `vault_container_create/open/inspect/verify` + `escrow_create/escrow_unwrap/transfer/revoke`
- **7 semantic layers**: workflows, credentials, env_vars, mcp_configs, site_profiles, ai_brain, audit_trail
- Argon2id double-encryption for credential layer
- X25519 ECDH multi-party escrow (up to 8 parties, per-layer access matrix)
- **Seal of Truth**: SHA3-256 content-addressed integrity verification
- Ed25519 digital signatures, binary `.0nv` container format
- Transfer registry with replay prevention
- **Application Engine** — build, distribute, inspect, schedule `.0n` applications

### v1.7.0 — Foundation

- 550 tools across 26 services in 13 categories
- **.0n Conversion Engine** — import credentials, auto-map to 53 services, generate configs for 7 AI platforms
- **Vault** — machine-bound encrypted credential storage (AES-256-GCM + PBKDF2-SHA512 + hardware fingerprint)
- **Workflow Runtime** + **HTTP Server** + **CLI with named runs**
- **Three-Level Execution** (Patent Pending) — Pipeline → Assembly Line → Radial Burst

> **850 tools. 53 services. 1,142 total capabilities.** See [CHANGELOG.md](CHANGELOG.md) for full version history and the [What's New in v2.3](#-whats-new-in-v23) section above.

---

## How It Works

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│   You (Claude)  │────▶│      0nMCP        │────▶│   Your APIs     │
│                 │     │                  │     │                 │
│ "Invoice John   │     │ 1. Parse intent  │     │ Stripe          │
│  for $500 and   │     │ 2. Plan steps    │     │ SendGrid        │
│  notify #sales" │     │ 3. Execute APIs  │     │ Slack           │
│                 │◀────│ 4. Chain data    │◀────│ CRM             │
│                 │     │ 5. Summarize     │     │ + 49 more...    │
└─────────────────┘     └──────────────────┘     └─────────────────┘
```

### With `ANTHROPIC_API_KEY` (AI Mode)

Claude analyzes your task, inspects connected services and their capabilities, creates a multi-step execution plan, runs every API call in order, passes data between steps, and summarizes the results.

### Without API Key (Keyword Mode)

The orchestrator uses keyword matching to route tasks to the right service. Less intelligent but still functional for straightforward single-service requests.

---

## Why Not Just Use...

| | **0nMCP** | Zapier | Custom Code |
|---|---|---|---|
| **Setup time** | 2 minutes | 30+ min per zap | Hours/days |
| **Learning curve** | None (natural language) | Medium (visual builder) | High (APIs, auth) |
| **Multi-step tasks** | Just describe it | Build complex zaps | Write orchestration logic |
| **Cost** | Free + your API keys | $20-$100+/month | Your time |
| **Flexibility** | Say what you want | Triggers/actions only | Unlimited but complex |
| **Maintenance** | Zero | Update broken zaps | Fix API changes |
| **Open source** | Yes (MIT) | No | Depends |
| **Tools available** | 850 | Varies | Whatever you build |

---

## The .0n Standard

0nMCP implements the **[.0n Standard](https://github.com/0nork/0n-spec)** — a universal configuration format for AI orchestration.

```
~/.0n/
├── config.json               # Global settings
├── connections/              # Service credentials as .0n files
│   ├── stripe.0n
│   ├── slack.0n
│   └── sendgrid.0n
├── workflows/                # Saved automation definitions
│   └── invoice-notify.0n
├── snapshots/                # System state captures
│   └── crm-setup.0n
├── history/                  # Execution logs (JSONL by date)
│   └── 2026-02-06.jsonl
└── cache/
```

Every connection is stored as a `.0n` file with a standard header:

```json
{
  "$0n": {
    "type": "connection",
    "version": "1.0.0",
    "name": "Production Stripe"
  },
  "service": "stripe",
  "auth": {
    "type": "api_key",
    "credentials": { "api_key": "sk_live_..." }
  }
}
```

Every task execution is logged to `~/.0n/history/` as JSONL — full audit trail of what ran, when, and how.

**[Read the full spec](https://github.com/0nork/0n-spec)**

---

## Architecture

```
0nMCP/
├── index.js              # Entry point — MCP server startup
├── catalog.js            # Service catalog — 53 integrations with endpoints
├── connections.js        # Connection manager — ~/.0n/connections/*.0n
├── orchestrator.js       # AI execution planner — the brain
├── workflow.js           # WorkflowRunner — .0n file execution
├── server.js             # Express HTTP server — MCP over HTTP + webhooks
├── webhooks.js           # Webhook receiver and HMAC verification
├── ratelimit.js          # Per-service rate limiting with retry
├── tools.js              # Tool registration for catalog + engine tools
├── cli.js                # CLI — 39KB, all commands
├── crm/                  # 245 CRM tools across 12 modules
│   ├── index.js          # Tool orchestrator — registers all modules
│   ├── helpers.js        # Data-driven tool factory — registerTools()
│   ├── auth.js           # OAuth, tokens, snapshots, workflows (5 tools)
│   ├── contacts.js       # Contact management (23 tools)
│   ├── conversations.js  # Messaging — SMS, Email, WhatsApp, IG, FB (13 tools)
│   ├── calendars.js      # Calendar & scheduling (27 tools)
│   ├── opportunities.js  # Pipeline & deal management (14 tools)
│   ├── invoices.js       # Invoicing (20 tools)
│   ├── payments.js       # Payment processing (16 tools)
│   ├── products.js       # Product catalog (10 tools)
│   ├── locations.js      # Location management (24 tools)
│   ├── social.js         # Social media & blogs (35 tools)
│   ├── users.js          # User & form management (24 tools)
│   └── objects.js        # Custom objects & associations (34 tools)
├── vault/                # Encrypted credential storage + containers
│   ├── index.js          # Vault entry — seal/unseal/verify/fingerprint (4 tools)
│   ├── container.js      # 0nVault Container orchestrator
│   ├── crypto-container.js # AES-256-GCM + Argon2id encryption
│   ├── layers.js         # 7 semantic layers
│   ├── escrow.js         # X25519 ECDH multi-party escrow
│   ├── seal.js           # Seal of Truth — SHA3-256 integrity
│   ├── registry.js       # Transfer registry with replay prevention
│   ├── tools-container.js # 8 vault container tools
│   ├── deed.js           # Business Deed Transfer core
│   ├── deed-collector.js # Asset collection from .env/JSON/CSV
│   ├── deed-importer.js  # Import deeds into .0n ecosystem
│   ├── tools-deed.js     # 6 deed transfer tools
│   └── cache.js          # Vault cache layer
├── engine/               # .0n Conversion Engine + App Builder
│   ├── index.js          # Engine entry — 6 tools
│   ├── parser.js         # Multi-format credential parser
│   ├── mapper.js         # Auto-map credentials to 26 services
│   ├── validator.js      # API key verification
│   ├── platforms.js      # 7 AI platform config generators
│   ├── bundler.js        # Portable .0n bundle creator
│   ├── cipher-portable.js # Passphrase-only AES-256-GCM
│   ├── application.js    # Application Engine core
│   ├── app-builder.js    # App builder
│   ├── app-server.js     # App HTTP middleware
│   ├── operations.js     # App operations
│   └── scheduler.js      # CronScheduler class
├── types/
│   └── index.d.ts        # Full TypeScript definitions
├── package.json
├── LICENSE               # MIT
└── CONTRIBUTING.md
```

| Component | What It Does |
|-----------|-------------|
| **Service Catalog** | Defines all 53 services — their base URLs, endpoints, auth patterns, and capabilities |
| **Connection Manager** | Stores credentials as `.0n` files in `~/.0n/connections/` per the .0n standard |
| **Orchestrator** | The brain — parses natural language, plans multi-step execution, calls APIs, chains data |
| **CRM Modules** | 245 tools across 12 modules — data-driven, every tool is config not code |
| **Vault** | Machine-bound encrypted credential storage — AES-256-GCM + PBKDF2-SHA512 |
| **Vault Container System** | Patent Pending #63/990,046 — 7 semantic layers, multi-party escrow, Seal of Truth, binary .0nv format |
| **Business Deed Transfer** | Package + escrow + transfer entire digital businesses in encrypted containers |
| **Conversion Engine** | Import credentials from .env/CSV/JSON, auto-map to 53 services, generate 7 AI platform configs |
| **Application Engine** | Build, distribute, schedule .0n applications with CronScheduler + HTTP middleware |
| **Workflow Runtime** | Load and execute `.0n` workflow files with template engine, conditions, and step chaining |
| **HTTP Server** | Express-based REST API, MCP over HTTP, and webhook receivers |
| **Rate Limiter** | Per-service rate limits with automatic retry and backoff |
| **Webhook Handler** | HMAC-verified event processing — Stripe, CRM, Slack, GitHub, Twilio, Shopify |
| **Execution History** | Logs every task to `~/.0n/history/` as JSONL — full audit trail |
| **TypeScript Defs** | Full type coverage for all exports, connections, workflows, and tools |

---

## Security

- **Local execution** — MCP server runs on your machine, not in the cloud
- **Direct API calls** — Requests go straight to each service, not through a proxy
- **Your credentials** — Stored locally in `~/.0n/connections/` as `.0n` files, never sent anywhere
- **Anthropic key** — Only used for task planning (never passed to external services)
- **Rate limiting** — Built-in per-service rate limits prevent accidental API abuse
- **Execution history** — Full audit trail in `~/.0n/history/`
- **Open source** — Audit every line yourself

### 0nVault Container Security (Patent Pending)
- **AES-256-GCM** encryption for all container layers
- **Argon2id** double-encryption for credential layer (memory-hard, side-channel resistant)
- **Ed25519** digital signatures for container authenticity
- **Seal of Truth** — SHA3-256 content-addressed integrity verification
- **X25519 ECDH** multi-party escrow — up to 8 parties with per-layer access matrix
- **Binary .0nv format** — magic bytes `0x304E5350`, tamper-evident structure
- **Transfer registry** — replay prevention with chain of custody tracking
- **Machine-bound vault** — PBKDF2-SHA512 (100K iterations) + hardware fingerprint binding

See [SECURITY.md](SECURITY.md) for our security policy and how to report vulnerabilities.

---

## Configuration

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `ANTHROPIC_API_KEY` | No | Enables AI-powered multi-step planning. Keyword matching without it. |

### Credential Storage

Connections stored as `.0n` files in `~/.0n/connections/`. For production:
- Use a secrets manager
- Enable encryption via `~/.0n/config.json`
- Use environment variables: `"api_key": "{{env.STRIPE_KEY}}"`

---

## For Developers

### Adding a New Service

Drop a definition into `catalog.js`:

```javascript
your_service: {
  name: "Your Service",
  type: "category",
  description: "What it does",
  baseUrl: "https://api.yourservice.com",
  authType: "api_key",
  credentialKeys: ["apiKey"],
  capabilities: [
    { name: "do_thing", actions: ["create", "list"], description: "Does the thing" },
  ],
  endpoints: {
    do_thing:    { method: "POST", path: "/things", body: { name: "" } },
    list_things: { method: "GET",  path: "/things" },
  },
  authHeader: (creds) => ({
    "Authorization": `Bearer ${creds.apiKey}`,
    "Content-Type": "application/json",
  }),
},
```

### Adding CRM Endpoints

Even easier — just add a config object to the relevant module:

```javascript
{
  name: "crm_do_thing",
  description: "Does the thing in the CRM",
  method: "POST",
  path: "/things/:thingId",
  params: {
    thingId: { type: "string", description: "Thing ID", required: true, in: "path" },
    name:    { type: "string", description: "Thing name", required: true, in: "body" },
  },
  body: ["name"],
}
```

The tool factory handles registration, validation, API calls, error handling — everything. See [CONTRIBUTING.md](CONTRIBUTING.md) for the full guide.

---

## Unlocks

0nMCP grows with its community. Every milestone unlocks new capabilities — the more developers who join, the more powerful the platform becomes.

**Visit [0nmcp.com](https://0nmcp.com) for the full unlock schedule and community impact. [Become a Sponsor](https://0nmcp.com/sponsor)**

### Phase 0 — Foundation (Current)

- [x] **53 services, 850 tools, 23 categories**
- [x] Core orchestration engine with AI planning
- [x] **245 CRM tools** — full API coverage across 12 modules
- [x] Gmail, Google Sheets, Google Drive, Jira, Zendesk, Mailchimp, Zoom, Microsoft 365, MongoDB
- [x] Data-driven tool factory — config, not code
- [x] Full snapshot deployment (pipeline + tags + values + workflows)
- [x] **.0n Standard** — universal config format (`~/.0n/`)
- [x] Rate limiting, webhooks, TypeScript definitions, CLI
- [x] **npm published** — `npx 0nmcp` live on npm

### Phase 1 — Essential Expansion (100 stars / $500 MRR)

- [ ] **OAuth flows** — connect services with one click
- [ ] **Credential encryption** — AES-256-GCM at-rest
- [x] **QuickBooks** — accounting and invoicing
- [x] **Asana** — project and task management
- [x] **Intercom** — customer messaging
- [x] **22 new services** — advertising, social, finance, cloud, automation
- [x] Target: 53 services, 850 tools (exceeded)

### Phase 2 — Full Stack (500 stars / $2K MRR)

- [ ] **AWS S3** — cloud storage
- [ ] **Vercel** — deployment management
- [ ] **Cloudflare** — DNS, workers, security
- [ ] **Scheduled tasks** — "every Monday, send a report"
- [ ] **Conditionals** — "if balance < $100, alert me"
- [ ] Target: 35+ services, 750+ tools

### Phase 3 — Platform (1,000 stars / $5K MRR)

- [ ] **Plugin system** — bring your own services
- [ ] **Web dashboard** — manage connections visually
- [ ] **Workflow marketplace** — share and discover automations
- [ ] **Firebase, Figma, WordPress, Webflow**
- [ ] Target: 42+ services, 900+ tools

### Phase 4 — Industry Packs (5,000 stars / $15K MRR)

- [ ] Healthcare, Legal, Real Estate, and E-Commerce industry packs
- [ ] **Twilio Flex, Square, Plaid, DocuSign**
- [ ] Target: 55+ services, 1,200+ tools

### Phase 5 — Ecosystem Dominance (10,000 stars / $50K MRR)

- [ ] Multi-agent orchestration
- [ ] Self-hosted enterprise edition
- [ ] Real-time streaming execution
- [ ] Target: 75+ services, 2,000+ tools

### Phase 6 — The Singularity (25,000+ stars / $100K+ MRR)

- [ ] Autonomous agent mode
- [ ] Cross-organization federation
- [ ] AI-generated service adapters
- [ ] Target: 100+ services, 5,000+ tools

> Every unlock is permanent. Once a milestone is hit, the feature ships for everyone — free and open source forever.

---

## Community

0nMCP is built in the open by a growing network of developers who believe AI orchestration should be free, composable, and community-owned.

**The 0n community is growing fast** — building integrations, shipping tools, and pushing the boundaries of what MCP can do.

### This is not a side project. This is infrastructure.

We ship weekly. The codebase is active. The community is real. If you're building with MCP, you're already one of us.

### Join the Community

- **[0nmcp.com/community](https://0nmcp.com/community)** — community hub with guides, events, and resources
- **[GitHub Discussions](https://github.com/0nork/0nMCP/discussions)** — ask questions, share ideas, show off what you built
- **[Sponsor on GitHub](https://github.com/sponsors/0nork)** — fund the next unlock and get your name on the wall
- **Star this repo** — it helps more than you think
- **Submit a PR** — [Contributing Guide](CONTRIBUTING.md)
- **Learn the .0n Standard** — [0n-spec](https://github.com/0nork/0n-spec)

### Community Stats

| Metric | |
|--------|---|
| **Tools shipped** | 850 |
| **Services integrated** | 53 |
| **Categories** | 23 |
| **CRM endpoints covered** | 245 / 245 (100%) |
| **npm packages** | 3 ([0nmcp](https://www.npmjs.com/package/0nmcp), [0nork](https://www.npmjs.com/package/0nork), [0n-spec](https://www.npmjs.com/package/0n-spec)) |
| **Open source repos** | 3 |
| **Time to first tool call** | ~2 minutes |

---

## License & Philosophy

**MIT Licensed** — free to use, modify, and distribute. See [LICENSE](LICENSE).

**Our position:** 0nMCP is and always will be **free and open source**. We built this because we believe AI orchestration is infrastructure — it should be accessible to every developer, not locked behind enterprise paywalls or monthly subscriptions.

If you find someone selling this tool, know that **it's free right here**. Always has been, always will be. The entire codebase is open, auditable, and community-maintained.

We chose MIT for maximum freedom. Use it in your projects, your products, your startups. But if you build something great with it, **give back to the community** that made it possible. That's the deal.

**Trademarks:** The names "0nMCP", "0nORK", and ".0n Standard" are trademarks of RocketOpp. The MIT license grants rights to the software, not to the trademarks. You may not use these names to promote derivative products without permission.

---

## Contributing

We want 0nMCP to be the **open standard** for AI-powered API orchestration.

**Ways to contribute:**
- **Add a service** — Drop it in the catalog. See [CONTRIBUTING.md](CONTRIBUTING.md)
- **Add CRM tools** — Config-driven, takes minutes
- **Report bugs** — [Open an issue](https://github.com/0nork/0nMCP/issues)
- **Suggest features** — [Start a discussion](https://github.com/0nork/0nMCP/discussions)
- **Improve docs** — PRs welcome
- **Star the repo** — Help others find it

```bash
git clone https://github.com/0nork/0nMCP.git
cd 0nMCP
npm install
node index.js
```

---

## The 0n Network

0nMCP is part of the **0n Network** — an open ecosystem of AI-native tools built by [0nORK](https://github.com/0nork).

| Project | Description |
|---------|-------------|
| **[0nMCP](https://0nmcp.com)** | Universal AI API Orchestrator — 850 tools, 53 services, Vault encryption, Business Deed transfer ([source](https://github.com/0nork/0nMCP)) |
| **[0n-spec](https://github.com/0nork/0n-spec)** | The .0n Standard — universal configuration format for AI orchestration |
| **[0nork](https://github.com/0nork/0nork)** | The parent org — AI orchestration infrastructure |

### Built With

- [Anthropic](https://anthropic.com) — Claude and the MCP standard
- [Model Context Protocol](https://modelcontextprotocol.io) — The protocol that makes this possible

### Support the Network

0nMCP is free and always will be. If it saves you time or money:

<div align="center">

**[Sponsor on GitHub](https://github.com/sponsors/0nork)** · **[Star the repo](https://github.com/0nork/0nMCP)** · **[Tell a friend](https://twitter.com/intent/tweet?text=0nMCP%20-%20850%20tools,%2053%20services,%20zero%20config.%20The%20universal%20AI%20API%20orchestrator.%20Free%20and%20open%20source.&url=https://github.com/0nork/0nMCP)**

</div>

---

<div align="center">

### Stop building workflows. Start describing outcomes.

**850 tools. 53 services. Zero config. MIT licensed. Community driven.**

**[Get Started](https://0nmcp.com)** · **[Join the Community](https://0nmcp.com/community)** · **[Unlock Schedule](https://0nmcp.com/sponsor)** · **[View Source](https://github.com/0nork/0nMCP)** · **[Read the Spec](https://github.com/0nork/0n-spec)**

---

Made with conviction by [0nORK](https://github.com/0nork) · Backed by [RocketOpp](https://rocketopp.com)

*"The best automation is the one you don't have to build."*

</div>
