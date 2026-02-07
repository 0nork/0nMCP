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
[![Services](https://img.shields.io/badge/services-17+-blue?style=flat-square)](#-supported-services)
[![Tools](https://img.shields.io/badge/tools-252-orange?style=flat-square)](#-all-tools)
[![Community](https://img.shields.io/badge/community-1000%2B_devs-ff6600?style=flat-square)](#-community)
[![GitHub Discussions](https://img.shields.io/github/discussions/0nork/0nMCP?style=flat-square&label=discussions)](https://github.com/0nork/0nMCP/discussions)

**252 tools. 17 services. Zero configuration. One natural language interface.**

[Quick Start](#-installation) · [Services](#-supported-services) · [252 Tools](#-all-tools) · [.0n Standard](#-the-0n-standard) · [Community](#-community) · [Contributing](#-contributing)

</div>

---

> **v1.2.0** — 245 CRM tools across 12 modules, full API coverage, rate limiting, webhooks, TypeScript definitions, and a growing open source community. [See what's new](#-whats-new-in-v12).

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
| **CRM** | CRM | **245 tools** — contacts, conversations, calendars, invoices, payments, products, pipelines, social media, custom objects, and more |

**17 services. 252 tools. One interface.**

> **More coming:** Mailchimp, QuickBooks, Jira, Asana, Zendesk, Intercom, Webflow, WordPress...

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
"Create a Stripe invoice for $1000, then email the link to john@client.com"

"Create a GitHub issue for the login bug, then post it to #bugs on Slack"

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
| `list_available_services` | Browse all 17 services grouped by category |
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

**252 total tools.** Universal orchestration + the most comprehensive CRM integration in the MCP ecosystem.

> Every CRM tool is data-driven — defined as configuration, not code. Adding new endpoints takes minutes, not hours. See [CONTRIBUTING.md](CONTRIBUTING.md).

---

## What's New in v1.2

- **245 CRM tools** — up from 10. Full API coverage across 12 modules
- **Data-driven tool factory** — every tool is a config object, new endpoints in minutes
- **Rate limiting** — built-in per-service rate limits with automatic retry
- **Webhook support** — receive and process external events
- **TypeScript definitions** — full type coverage for all exports
- **CLI improvements** — interactive setup, legacy migration, colored output

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
│                 │     │ 5. Summarize     │     │ + 13 more...    │
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
| **Tools available** | 252 | Varies | Whatever you build |

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
├── index.js          # Entry point — 7 universal tools + server startup
├── catalog.js        # Service catalog — 17 integrations with endpoints
├── connections.js    # Connection manager — ~/.0n/connections/*.0n
├── orchestrator.js   # AI execution planner — the brain
├── webhooks.js       # Webhook receiver and event processing
├── ratelimit.js      # Per-service rate limiting with retry
├── cli.js            # CLI — init, connect, migrate, interactive setup
├── crm/              # 245 CRM tools across 12 modules
│   ├── index.js      # Tool orchestrator — registers all modules
│   ├── helpers.js    # Data-driven tool factory — registerTools()
│   ├── auth.js       # OAuth, tokens, snapshots, workflows
│   ├── contacts.js   # 23 contact management tools
│   ├── conversations.js  # 13 messaging tools
│   ├── calendars.js  # 27 calendar & scheduling tools
│   ├── opportunities.js  # 14 pipeline & deal tools
│   ├── invoices.js   # 20 invoicing tools
│   ├── payments.js   # 16 payment processing tools
│   ├── products.js   # 10 product catalog tools
│   ├── locations.js  # 24 location management tools
│   ├── social.js     # 35 social media & blog tools
│   ├── users.js      # 24 user & form tools
│   └── objects.js    # 34 custom object & association tools
├── types/
│   └── index.d.ts    # Full TypeScript definitions
├── package.json
├── LICENSE           # MIT
└── CONTRIBUTING.md
```

| Component | What It Does |
|-----------|-------------|
| **Service Catalog** | Defines all 17 services — their base URLs, endpoints, auth patterns, and capabilities |
| **Connection Manager** | Stores credentials as `.0n` files in `~/.0n/connections/` per the .0n standard |
| **Orchestrator** | The brain — parses natural language, plans multi-step execution, calls APIs, chains data |
| **CRM Modules** | 245 tools across 12 modules — data-driven, every tool is config not code |
| **Rate Limiter** | Per-service rate limits with automatic retry and backoff |
| **Webhook Handler** | Receive and process external events from connected services |
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

## Roadmap

**Shipped:**

- [x] Core orchestration engine with AI planning
- [x] 17 service integrations
- [x] Multi-step execution with data chaining
- [x] **245 CRM tools** — full API coverage across 12 modules
- [x] Data-driven tool factory — config, not code
- [x] Full snapshot deployment (pipeline + tags + values + workflows)
- [x] Keyword fallback mode (works without Anthropic key)
- [x] **.0n Standard** — universal config format (`~/.0n/`)
- [x] **Execution history** — JSONL logs in `~/.0n/history/`
- [x] **Rate limiting** — per-service with automatic retry
- [x] **Webhook support** — receive external events
- [x] **TypeScript definitions** — full type coverage
- [x] **CLI** — interactive setup, migration, colored output
- [x] **npm published** — `npx 0nmcp` live on npm

**In Progress:**

- [ ] **OAuth flows** — connect with one click (Q1 2026)
- [ ] **Credential encryption** — AES-256-GCM at-rest (Q1 2026)
- [ ] **Scheduled tasks** — "every Monday, send a report"
- [ ] **More services** — 50+ planned (Mailchimp, QuickBooks, Jira, Asana...)
- [ ] **Plugin system** — bring your own services
- [ ] **Web dashboard** — manage connections visually
- [ ] **Conditionals** — "if balance < $100, alert me"
- [ ] **Test suite** — comprehensive unit + integration tests

---

## Community

0nMCP is built in the open by a growing network of developers who believe AI orchestration should be free, composable, and community-owned.

**The 0n community is 1,000+ developers strong** — building integrations, shipping tools, and pushing the boundaries of what MCP can do.

### This is not a side project. This is infrastructure.

We ship weekly. The codebase is active. The community is real. If you're building with MCP, you're already one of us.

### Get Involved

- **Star this repo** — it helps more than you think
- **Open an issue** — [bugs, ideas, questions](https://github.com/0nork/0nMCP/issues)
- **Join the discussion** — [GitHub Discussions](https://github.com/0nork/0nMCP/discussions)
- **Submit a PR** — [Contributing Guide](CONTRIBUTING.md)
- **Learn the .0n Standard** — [0n-spec](https://github.com/0nork/0n-spec)
- **Spread the word** — tell a developer friend

### Community Stats

| Metric | |
|--------|---|
| **Tools shipped** | 252 |
| **Services integrated** | 17 |
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
| **[0nMCP](https://github.com/0nork/0nMCP)** | Universal AI API Orchestrator — 252 tools, 17 services, natural language interface |
| **[0n-spec](https://github.com/0nork/0n-spec)** | The .0n Standard — universal configuration format for AI orchestration |
| **[0nork](https://github.com/0nork/0nork)** | The parent org — AI orchestration infrastructure |

### Built With

- [Anthropic](https://anthropic.com) — Claude and the MCP standard
- [Model Context Protocol](https://modelcontextprotocol.io) — The protocol that makes this possible

### Support the Network

0nMCP is free and always will be. If it saves you time or money:

<div align="center">

**[Sponsor on GitHub](https://github.com/sponsors/0nork)** · **[Star the repo](https://github.com/0nork/0nMCP)** · **[Tell a friend](https://twitter.com/intent/tweet?text=0nMCP%20-%20252%20tools,%2017%20services,%20zero%20config.%20The%20universal%20AI%20API%20orchestrator.%20Free%20and%20open%20source.&url=https://github.com/0nork/0nMCP)**

</div>

---

<div align="center">

### Stop building workflows. Start describing outcomes.

**252 tools. 17 services. Zero config. MIT licensed. Community driven.**

**[Get Started](https://github.com/0nork/0nMCP)** · **[Join the Community](https://github.com/0nork/0nMCP/discussions)** · **[Read the Docs](https://github.com/0nork/0n-spec)**

---

Made with conviction by [0nORK](https://github.com/0nork) · Backed by [RocketOpp](https://rocketopp.com)

*"The best automation is the one you don't have to build."*

</div>
