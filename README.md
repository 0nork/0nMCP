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

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen?style=flat-square)](https://nodejs.org)
[![MCP](https://img.shields.io/badge/MCP-Compatible-blueviolet?style=flat-square)](https://modelcontextprotocol.io)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square)](http://makeapullrequest.com)
[![Services](https://img.shields.io/badge/services-17-blue?style=flat-square)](#-supported-services)
[![Tools](https://img.shields.io/badge/tools-17-orange?style=flat-square)](#-all-tools)

[Demo](#-watch-it-work) · [Install](#-installation) · [Services](#-supported-services) · [Tools](#-all-tools) · [Examples](#-examples) · [Contributing](#-contributing)

</div>

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
| **CRM** | CRM | Contacts, pipelines, tags, workflows, custom values, SMS, email, snapshots |

**17 services. 100+ capabilities. One interface.**

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
  },
  "workflows": [
    {
      "id": "001a",
      "name": "001.a New Lead In",
      "trigger": { "type": "tag_added", "tag": "New Lead" },
      "actions": [
        { "type": "send_sms", "message": "{{custom_values.welcome_sms}}" },
        { "type": "wait", "duration": "10 minutes" },
        { "type": "add_tag", "value": "Contacted" }
      ]
    }
  ]
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

### CRM Tools (10)

| Tool | Description |
|------|-------------|
| `crm_auth_url` | Generate OAuth authorization URL |
| `crm_exchange_token` | Exchange auth code for access + refresh tokens |
| `crm_refresh_token` | Refresh an expired access token |
| `crm_create_tags` | Bulk create tags in a sub-account |
| `crm_create_pipeline` | Create pipeline with ordered stages |
| `crm_create_custom_values` | Push custom key-value pairs |
| `crm_process_workflow` | Process workflow JSON — extracts and creates tags + custom values |
| `crm_deploy_snapshot` | Full deployment: pipeline + tags + custom values + all workflows |
| `crm_list_workflows` | List all workflows |
| `crm_list_pipelines` | List all pipelines and stages |

**17 tools total.** Universal orchestration + deep CRM integration.

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

---

## Architecture

```
0nMCP/
├── index.js          # Entry point — 7 universal tools + server startup
├── catalog.js        # Service catalog — 17 integrations with endpoints
├── connections.js    # Connection manager — credential storage (~/.0nmcp/)
├── orchestrator.js   # AI execution planner — the brain
├── crm.js            # CRM tools — 10 dedicated tools, first full integration
├── package.json
├── LICENSE           # MIT
├── CONTRIBUTING.md
└── README.md
```

| Component | What It Does |
|-----------|-------------|
| **Service Catalog** | Defines all 17 services — their base URLs, endpoints, auth patterns, and capabilities |
| **Connection Manager** | Stores and retrieves credentials locally at `~/.0nmcp/connections.json` |
| **Orchestrator** | The brain — parses natural language, plans multi-step execution, calls APIs, chains data |
| **Universal Tools** | MCP interface: `execute`, `connect_service`, `api_call`, etc. |
| **CRM Tools** | Direct access: pipelines, tags, custom values, workflows, full snapshot deploy |

---

## Security

- **Local execution** — MCP server runs on your machine, not in the cloud
- **Direct API calls** — Requests go straight to each service, not through a proxy
- **Your credentials** — Stored locally at `~/.0nmcp/connections.json`, never sent anywhere
- **Anthropic key** — Only used for task planning (never passed to external services)
- **Open source** — Audit every line yourself

---

## Configuration

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `ANTHROPIC_API_KEY` | No | Enables AI-powered multi-step planning. Keyword matching without it. |

### Credential Storage

Connections stored in plain text at `~/.0nmcp/connections.json`. For production:
- Use a secrets manager
- Encrypt the connections file
- Use environment variables for credentials

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

Add keyword triggers to `orchestrator.js`. Submit a PR. Done.

See [CONTRIBUTING.md](CONTRIBUTING.md) for the full guide.

---

## Roadmap

- [x] Core orchestration engine with AI planning
- [x] 17 service integrations
- [x] Multi-step execution with data chaining
- [x] CRM deep integration (10 dedicated tools)
- [x] Full snapshot deployment (pipeline + tags + values + workflows)
- [x] Keyword fallback mode (works without Anthropic key)
- [ ] **OAuth flows** — connect with one click
- [ ] **Credential encryption** — at-rest security
- [ ] **Execution history** — see what ran and when
- [ ] **Scheduled tasks** — "every Monday, send a report"
- [ ] **Webhooks** — trigger on external events
- [ ] **Conditionals** — "if balance < $100, alert me"
- [ ] **More services** — 50+ planned
- [ ] **npm publish** — `npx 0nmcp` live on npm
- [ ] **Web dashboard** — manage connections visually
- [ ] **Plugin system** — bring your own services

---

## Contributing

We want 0nMCP to be the **open standard** for AI-powered API orchestration.

**Ways to contribute:**
- **Add a service** — Drop it in the catalog. See [CONTRIBUTING.md](CONTRIBUTING.md)
- **Report bugs** — [Open an issue](https://github.com/0nork/0nMCP/issues)
- **Suggest features** — Start a discussion
- **Improve docs** — PRs welcome
- **Star the repo** — Help others find it

```bash
git clone https://github.com/0nork/0nMCP.git
cd 0nMCP
npm install
node index.js
```

---

## License

MIT License — do whatever you want with it. See [LICENSE](LICENSE).

---

## The 0n Network

0nMCP is part of the **0n Network** — an open ecosystem of AI-native tools built by [RocketOpp](https://rocketopp.com).

| | |
|---|---|
| **[RocketOpp](https://rocketopp.com)** | The agency behind the 0n Network. We build AI-powered systems that replace manual operations for businesses — automation, orchestration, and intelligent infrastructure at scale. |
| **[Rocket+MCP](https://rocketadd.com)** | Our flagship MCP platform. A universal control layer that connects AI agents to the tools businesses already use — CRM, payments, email, scheduling, and more. The commercial backbone that powers 0nMCP. |
| **[0n Network](https://github.com/0nork)** | The open-source arm. Every core tool we build gets released here. We believe the orchestration layer should be open, composable, and owned by the community. |

### Support the Network

0nMCP is free and always will be. If it saves you time or money, consider funding the expansion of the 0n Network:

<div align="center">

**[Sponsor on GitHub](https://github.com/sponsors/0nork)**

Every dollar goes directly toward building more open-source MCP tools, adding integrations, and keeping the network growing.

</div>

---

## Credits

Built on:
- [Anthropic](https://anthropic.com) — Claude and the MCP standard
- [Model Context Protocol](https://modelcontextprotocol.io) — The protocol that makes this possible

---

<div align="center">

### Stop building workflows. Start describing outcomes.

**[Star this repo](https://github.com/0nork/0nMCP)** if you believe AI should just *do things* for you.

---

Made with conviction by [RocketOpp](https://rocketopp.com) · [Rocket+MCP](https://rocketadd.com) · [0n Network](https://github.com/0nork)

*"The best automation is the one you don't have to build."*

</div>
