<div align="center">

# 0nMCP

### 995+ Tools. 55 Services. One MCP Server.

**The most comprehensive MCP server available.**<br>
Connect any AI to any API. Natural language. Zero configuration. $0.01/run.<br>
4 patents filed. LinkedIn certifications. Daily patent monitoring via 0nDefender.

[![npm version](https://img.shields.io/npm/v/0nmcp.svg?style=flat-square)](https://www.npmjs.com/package/0nmcp)
[![npm downloads](https://img.shields.io/npm/dm/0nmcp.svg?style=flat-square)](https://www.npmjs.com/package/0nmcp)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen?style=flat-square)](https://nodejs.org)
[![MCP](https://img.shields.io/badge/MCP-Compatible-blueviolet?style=flat-square)](https://modelcontextprotocol.io)
[![Tools](https://img.shields.io/badge/tools-995+-orange?style=flat-square)](#tool-count-breakdown)
[![Services](https://img.shields.io/badge/services-55-blue?style=flat-square)](#all-55-services)
[![Patents](https://img.shields.io/badge/patents-4%20filed-blueviolet?style=flat-square)](#key-features)

[Website](https://0nmcp.com) &middot; [Quick Start](#quick-start) &middot; [All 55 Services](#all-55-services) &middot; [MCP Config](#mcp-configuration) &middot; [Certifications](https://0nmcp.com/learn) &middot; [Community](https://0nmcp.com/community)

</div>

---

## Why 0nMCP?

- **One server, every API.** Stripe, Slack, GitHub, CRM, Shopify, OpenAI, Anthropic, Google, Microsoft, and 46 more services -- all through a single MCP server. No juggling 20 different integrations.

- **Talk, don't code.** Say "Invoice john@acme.com for $500 and notify #sales on Slack" and it happens. 0nMCP resolves services, maps parameters, handles auth, and executes -- in under 2 seconds.

- **Production-grade security.** Patent-pending 0nVault containers with AES-256-GCM encryption, Argon2id key derivation, Ed25519 signatures, multi-party escrow, and a Seal of Truth integrity system. Your credentials never leave your machine.

---

## Quick Start

```bash
npm install -g 0nmcp
```

```bash
# Start MCP server (stdio mode for Claude Desktop / Cursor / Windsurf)
0nmcp

# Or start HTTP server
0nmcp serve --port 3000

# Import your API keys
0nmcp engine import

# Verify all connections
0nmcp engine verify
```

That's it. Your AI can now use 945 tools across 54 services.

---

## All 54 Services

### Communication (6)
| Service | Tools | What You Can Do |
|---------|-------|-----------------|
| **Slack** | Messaging | Send messages, manage channels, upload files |
| **Discord** | Messaging | Servers, channels, messages, webhooks |
| **Twilio** | SMS/Voice | Send SMS, make calls, manage numbers |
| **SendGrid** | Email | Transactional email, templates, contacts |
| **Gmail** | Email | Read/send email, labels, threads |
| **WhatsApp** | Messaging | Business messaging via Twilio |

### CRM & Sales (5)
| Service | Tools | What You Can Do |
|---------|-------|-----------------|
| **CRM** | 294 tools | Contacts, calendars, pipelines, invoices, payments, social, objects |
| **HubSpot** | CRM | Contacts, deals, companies, tickets |
| **Pipedrive** | CRM | Deals, persons, organizations, pipelines |
| **Intercom** | Support | Conversations, contacts, articles |
| **Zendesk** | Support | Tickets, users, organizations |

### Payments & Finance (4)
| Service | Tools | What You Can Do |
|---------|-------|-----------------|
| **Stripe** | Payments | Charges, subscriptions, invoices, customers |
| **Square** | POS | Payments, catalog, customers, orders |
| **Plaid** | Banking | Account linking, transactions, balances |
| **QuickBooks** | Accounting | Invoices, customers, payments, reports |

### Project Management (4)
| Service | Tools | What You Can Do |
|---------|-------|-----------------|
| **Jira** | Issues | Issues, projects, boards, sprints |
| **Asana** | Tasks | Tasks, projects, workspaces, sections |
| **Linear** | Issues | Issues, projects, teams, cycles |
| **Notion** | Workspace | Pages, databases, blocks, users |

### Data & Databases (4)
| Service | Tools | What You Can Do |
|---------|-------|-----------------|
| **Supabase** | Database | Tables, auth, storage, edge functions |
| **MongoDB** | Database | Collections, documents, aggregation |
| **Airtable** | Database | Bases, tables, records, views |
| **Google Sheets** | Spreadsheets | Read/write cells, create sheets |

### AI & ML (2)
| Service | Tools | What You Can Do |
|---------|-------|-----------------|
| **OpenAI** | AI | Completions, embeddings, images, assistants |
| **Anthropic** | AI | Messages, completions, streaming |

### Developer Tools (3)
| Service | Tools | What You Can Do |
|---------|-------|-----------------|
| **GitHub** | Code | Repos, issues, PRs, actions, releases |
| **Vercel** | Hosting | Deployments, domains, env vars |
| **Cloudflare** | Infrastructure | DNS, workers, pages, zones |

### Marketing & Social (6)
| Service | Tools | What You Can Do |
|---------|-------|-----------------|
| **Mailchimp** | Email Marketing | Campaigns, audiences, automations |
| **LinkedIn** | 50 tools | Posts, profiles, org pages, ads, reporting, events, certifications |
| **Instagram** | Social | Posts, stories, insights |
| **TikTok** | Social | Videos, analytics |
| **Twitter/X** | Social | Tweets, timelines, users |
| **SmartLead** | Outreach | Campaigns, leads, sequences |

### Advertising (5)
| Service | Tools | What You Can Do |
|---------|-------|-----------------|
| **Google Ads** | Advertising | Campaigns, ad groups, keywords |
| **Facebook Ads** | Advertising | Campaigns, ad sets, creatives |
| **LinkedIn Ads** | Advertising | Campaigns, audiences, conversions |
| **TikTok Ads** | Advertising | Campaigns, ad groups, creatives |
| **Instagram Ads** | Advertising | Campaigns, ad sets, creatives |

### E-Commerce (2)
| Service | Tools | What You Can Do |
|---------|-------|-----------------|
| **Shopify** | E-Commerce | Products, orders, customers, inventory |
| **GoDaddy** | Domains | Domain availability, DNS, registration |

### Productivity (5)
| Service | Tools | What You Can Do |
|---------|-------|-----------------|
| **Google Calendar** | Scheduling | Events, calendars, reminders |
| **Calendly** | Scheduling | Events, invitees, availability |
| **Zoom** | Video | Meetings, recordings, users |
| **Google Drive** | Storage | Files, folders, permissions |
| **Dropbox** | Storage | Files, folders, sharing |

### Microsoft (4)
| Service | Tools | What You Can Do |
|---------|-------|-----------------|
| **Outlook** | Email | Messages, calendar, contacts |
| **Teams** | Collaboration | Messages, channels, meetings |
| **OneDrive** | Storage | Files, folders, sharing |
| **Azure** | Cloud | Resources, services, management |

### Automation & Integration (4)
| Service | Tools | What You Can Do |
|---------|-------|-----------------|
| **Zapier** | Automation | Triggers, actions, zaps |
| **n8n** | Automation | Workflows, nodes, executions |
| **Pabbly** | Automation | Workflows, connections |
| **Make** | Automation | Scenarios, modules, connections |

---

## Tool Count Breakdown

| Module | Tools | Description |
|--------|-------|-------------|
| **Service Catalog** | 701 | API tools across 55 services (including LinkedIn 50-tool suite) |
| **CRM Module** | 245 | Contacts, calendars, pipelines, invoices, payments, social, custom objects |
| **0nVault** | 4 | AES-256-GCM machine-bound encryption |
| **Vault Containers** | 8 | Patent-pending multi-layer encrypted containers (US #63/990,046) |
| **Deed Transfer** | 6 | Digital business asset packaging and transfer |
| **Engine** | 29 | Credential import, verification, AI platform config generation |
| **App Builder** | 5 | Operations, routes, middleware, scheduler |
| **Total** | **995+** | |

---

## Key Features

### Encrypted Vault (Patent Pending)
- AES-256-GCM + PBKDF2-SHA512 (100K iterations)
- Machine-bound hardware fingerprinting
- 7 semantic layers: workflows, credentials, env_vars, mcp_configs, site_profiles, ai_brain, audit_trail
- Multi-party escrow with X25519 ECDH (up to 8 parties)
- Seal of Truth: SHA3-256 content-addressed integrity verification
- Ed25519 digital signatures

### .0n Workflow Runtime
- Declarative YAML/JSON workflow files
- Variable resolution: `{{system.*}}` > `{{launch.*}}` > `{{inputs.*}}` > `{{step.output.*}}`
- Internal actions: lookup, set, transform, compute, condition, map
- Three-level execution: Pipeline > Assembly Line > Radial Burst

### Multi-AI Council
- Route tasks across multiple AI providers
- Consensus-based decision making
- Automatic fallback and load balancing

### Zero-Knowledge Capability Proxy
- All API calls route through a credential-wiping proxy
- Your secrets never reach the AI model
- Full audit trail of every execution

---

## MCP Configuration

### Claude Desktop

Add to `~/Library/Application Support/Claude/claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "0nMCP": {
      "command": "npx",
      "args": ["-y", "0nmcp"]
    }
  }
}
```

### Cursor

Add to `.cursor/mcp.json`:

```json
{
  "mcpServers": {
    "0nMCP": {
      "command": "npx",
      "args": ["-y", "0nmcp"]
    }
  }
}
```

### Windsurf

Add to `~/.windsurf/mcp.json`:

```json
{
  "mcpServers": {
    "0nMCP": {
      "command": "npx",
      "args": ["-y", "0nmcp"]
    }
  }
}
```

### Claude Code

```bash
claude mcp add 0nMCP -- npx -y 0nmcp
```

---

## CLI Commands

```bash
0nmcp                              # Start MCP server (stdio)
0nmcp serve [--port] [--host]      # HTTP server mode
0nmcp run <workflow.0n>            # Execute .0n workflow
0nmcp engine import                # Import API keys from .env/CSV/JSON
0nmcp engine verify                # Test all connections
0nmcp engine platforms             # Generate configs for 7 AI platforms
0nmcp vault create                 # Create encrypted .0nv container
0nmcp vault open <file>            # Decrypt container
0nmcp vault inspect <file>         # Inspect without decrypting
0nmcp vault verify <file>          # Verify Seal of Truth
0nmcp deed create                  # Package business assets for transfer
0nmcp deed accept <file>           # Accept incoming business transfer
```

---

## Architecture

```
index.js           MCP server entry (McpServer from @modelcontextprotocol/sdk)
cli.js             CLI handler
catalog.js         SERVICE_CATALOG: 54 services with endpoints
tools.js           Tool registration (catalog + engine + vault)
connections.js     ~/.0n/ credential loader
orchestrator.js    AI-driven workflow orchestration
workflow.js        WorkflowRunner for .0n file execution
server.js          Express HTTP server (MCP over HTTP + webhooks)
capability-proxy.js Zero-knowledge credential proxy
ratelimit.js       Token bucket per service with backoff
webhooks.js        HMAC verification (Stripe, CRM, Slack, GitHub, Twilio, Shopify)
crm/               294 CRM tools (data-driven tool factory)
vault/             Encrypted vault + containers + deed transfer
engine/            Credential import, AI platform configs, app builder
```

---

## The .0n Standard

0nMCP uses the [.0n Standard](https://github.com/0nork/0n-spec) for configuration and workflow files. Install it separately:

```bash
npm install -g 0n-spec
```

Credentials are stored in `~/.0n/connections/` and workflows in `~/.0n/workflows/`.

---

## LinkedIn Integration (50 tools)

Full LinkedIn API v2 suite with 17 OAuth scopes:

| Category | Endpoints | Capabilities |
|----------|-----------|-------------|
| **Profile** | 5 | Basic info, email, connections, verification, photos |
| **Social** | 10 | Posts CRUD, comments, likes, shares, image/video upload |
| **Organization** | 10 | Pages, stats, followers, visitors, brand pages |
| **Advertising** | 15 | Accounts, campaigns, creatives, targeting, lead forms |
| **Ad Reporting** | 5 | Analytics, conversions, budgets, InMail stats |
| **Events** | 5 | Create, manage, attendees |

---

## 0nMCP Certifications

Complete courses and earn LinkedIn-verifiable certifications:

| Certification | Course | Level |
|--------------|--------|-------|
| **0nMCP Certified Orchestrator** | 0nMCP Mastery | Getting Started |
| **CRM Automation Specialist** | CRM Automation Blueprint | Intermediate |
| **Security Engineer** | 0nVault Security | Advanced |
| **AI Council Architect** | 0nPlex Council | Advanced |
| **Enterprise Deployer** | Enterprise Deployment | Enterprise |
| **Certified Developer** | .0n SWITCH Files | Fundamentals |

Add certifications to your LinkedIn profile with one click. Public verification at `0nmcp.com/verify/{certId}`.

---

## 0nDefender (Patent Intelligence)

Always-on competitive intelligence that monitors four threat vectors daily:

- **MCP Ecosystem Entrants** — new companies building on MCP
- **Patent Conflicts** — USPTO/WIPO filings overlapping our 4 patents
- **Acquisition Signals** — companies that might license or acquire
- **Brand Protection** — unauthorized use of 0nMCP IP

Automated daily scans via Claude AI with web search. Dashboard at `/admin/patent-intel`.

---

## Links

- **Website**: [0nmcp.com](https://0nmcp.com)
- **npm**: [npmjs.com/package/0nmcp](https://www.npmjs.com/package/0nmcp)
- **GitHub**: [github.com/0nork/0nMCP](https://github.com/0nork/0nMCP)
- **Community**: [0nmcp.com/community](https://0nmcp.com/community)
- **Forum**: [0nmcp.com/forum](https://0nmcp.com/forum)
- **Marketplace**: [marketplace.rocketclients.com](https://marketplace.rocketclients.com)
- **Learn & Certify**: [0nmcp.com/learn](https://0nmcp.com/learn)
- **Community Grid**: [grid.0nmcp.com](https://grid.0nmcp.com)

---

## License

MIT -- free for personal and commercial use.

Built by [0nORK](https://0nork.com). Stop building workflows. Start describing outcomes.
