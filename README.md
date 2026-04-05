<div align="center">

# 0nMCP

### 1,554 Tools. 96 Services. One MCP Server.

**The most comprehensive MCP server available.**<br>
Connect any AI to any API. Natural language. Zero configuration. $0.01/run.<br>
5 patents filed. LinkedIn certifications. Daily patent monitoring via 0nDefender.

[![npm version](https://img.shields.io/npm/v/0nmcp.svg?style=flat-square)](https://www.npmjs.com/package/0nmcp)
[![npm downloads](https://img.shields.io/npm/dm/0nmcp.svg?style=flat-square)](https://www.npmjs.com/package/0nmcp)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen?style=flat-square)](https://nodejs.org)
[![MCP](https://img.shields.io/badge/MCP-Compatible-blueviolet?style=flat-square)](https://modelcontextprotocol.io)
[![Tools](https://img.shields.io/badge/tools-1554-orange?style=flat-square)](#tool-count-breakdown)
[![Services](https://img.shields.io/badge/services-96-blue?style=flat-square)](#all-96-services)
[![Patents](https://img.shields.io/badge/patents-5%20filed-blueviolet?style=flat-square)](#patents)

[Website](https://0nmcp.com) &middot; [Quick Start](#quick-start) &middot; [All 96 Services](#all-96-services) &middot; [MCP Config](#mcp-configuration) &middot; [Certifications](https://0nmcp.com/learn) &middot; [Community](https://0nmcp.com/community)

</div>

---

## Why 0nMCP?

- **One server, every API.** Stripe, Slack, GitHub, CRM, Shopify, OpenAI, Anthropic, Google, Microsoft, Telegram, Figma, LinkedIn, and 84 more services -- all through a single MCP server. No juggling 20 different integrations.

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

That's it. Your AI can now use 1,554 tools across 96 services.

---

## MCP Configuration

**No API key required.** Just paste this config into your AI platform:

### Claude Desktop

Add to `~/Library/Application Support/Claude/claude_desktop_config.json` (Mac) or `%APPDATA%\Claude\claude_desktop_config.json` (Windows):

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

### Cursor / Windsurf

Add to `.cursor/mcp.json` or `~/.codeium/windsurf/mcp_config.json`:

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

### VS Code (Copilot MCP)

Add to `.vscode/mcp.json`:

```json
{
  "servers": {
    "0nMCP": {
      "command": "npx",
      "args": ["-y", "0nmcp"]
    }
  }
}
```

> **Note:** No `ANTHROPIC_API_KEY` or any other API key is needed in the config. 0nMCP provides the tools — your AI platform (Claude, Cursor, etc.) provides the intelligence. API keys for individual services (Stripe, Slack, etc.) can be added later via `0nmcp engine import`.

---

## Tool Count Breakdown

| Module | Tools | Description |
|--------|-------|-------------|
| **Service Catalog** | 1,280 | API tools across 96 services in 21 categories |
| **CRM Module** | 245 | Contacts, calendars, pipelines, invoices, payments, social, custom objects |
| **0nVault** | 4 | AES-256-GCM machine-bound encryption |
| **Vault Containers** | 8 | Patent-pending multi-layer encrypted containers (US #63/990,046) |
| **Deed Transfer** | 6 | Digital business asset packaging and transfer |
| **Engine** | 6 | Credential import, verification, AI platform config generation |
| **App Builder** | 5 | Operations, routes, middleware, scheduler |
| **Total** | **1,554** | |

---

## All 96 Services

### AI (9)
| Service | Tools | What You Can Do |
|---------|-------|-----------------|
| **OpenAI** | 4 | Completions, embeddings, images, assistants |
| **Anthropic** | 6 | Messages, completions, streaming |
| **Ollama** | 8 | Local LLM inference, model management |
| **Groq** | 3 | Ultra-fast inference |
| **Cohere** | 6 | Embeddings, reranking, generation |
| **Mistral** | 3 | Chat, embeddings |
| **Replicate** | 8 | Run open-source ML models |
| **Stability AI** | 6 | Image generation and editing |
| **ElevenLabs** | 8 | Text-to-speech, voice cloning |

### Communication (6)
| Service | Tools | What You Can Do |
|---------|-------|-----------------|
| **Telegram** | 132 | Bots, messages, groups, channels, inline queries |
| **Slack** | 45 | Messages, channels, workflows, apps |
| **Discord** | 2 | Servers, channels, messages, webhooks |
| **Twilio** | 3 | SMS, voice calls, phone numbers |
| **Zoom** | 10 | Meetings, recordings, users |
| **WhatsApp Business** | 6 | Business messaging via Twilio |

### Social Media (8)
| Service | Tools | What You Can Do |
|---------|-------|-----------------|
| **LinkedIn** | 50 | Posts, profiles, org pages, ads, reporting, events, certifications |
| **Reddit** | 21 | Subreddits, posts, comments, moderation |
| **X (Twitter)** | 16 | Tweets, timelines, users |
| **TikTok Business** | 11 | Videos, analytics |
| **Instagram** | 10 | Posts, stories, insights |
| **YouTube** | 6 | Videos, channels, playlists, analytics |
| **Pinterest** | 7 | Pins, boards, analytics |
| **Twitch** | 7 | Streams, chat, clips |

### Email (7)
| Service | Tools | What You Can Do |
|---------|-------|-----------------|
| **Resend** | 67 | Transactional email, domains, audiences |
| **Gmail** | 13 | Read/send email, labels, threads |
| **SendGrid** | 5 | Transactional email, templates, contacts |
| **Postmark** | 9 | Transactional email, templates, servers |
| **Mailgun** | 8 | Email sending, routes, lists |
| **ConvertKit** | 11 | Email marketing, sequences, subscribers |
| **Brevo** | 8 | Email marketing, transactional, SMS |

### CRM & Sales (3)
| Service | Tools | What You Can Do |
|---------|-------|-----------------|
| **CRM** | 14 + 245 module | Contacts, calendars, pipelines, invoices, payments, social, objects |
| **HubSpot** | 6 | Contacts, deals, companies, tickets |
| **Pipedrive** | 95 | Deals, persons, organizations, pipelines |

### Payments (2)
| Service | Tools | What You Can Do |
|---------|-------|-----------------|
| **Stripe** | 12 | Charges, subscriptions, invoices, customers |
| **Square** | 57 | Payments, catalog, customers, orders, POS |

### Dev Tools (8)
| Service | Tools | What You Can Do |
|---------|-------|-----------------|
| **Figma** | 32 | Files, components, styles, comments, exports |
| **GitHub** | 5 | Repos, issues, PRs, actions, releases |
| **Jira** | 12 | Issues, projects, boards, sprints |
| **Linear** | 1 | Issues, projects, teams, cycles |
| **Webflow** | 12 | Sites, CMS, forms, domains |
| **WordPress** | 13 | Posts, pages, media, plugins |
| **Netlify** | 9 | Deploys, sites, forms, functions |
| **Loom** | 4 | Videos, folders, sharing |

### Database (8)
| Service | Tools | What You Can Do |
|---------|-------|-----------------|
| **Supabase** | 6 | Tables, auth, storage, edge functions |
| **MongoDB** | 8 | Collections, documents, aggregation |
| **Airtable** | 5 | Bases, tables, records, views |
| **Google Sheets** | 8 | Read/write cells, create sheets |
| **Neon** | 8 | Serverless Postgres, branching |
| **PlanetScale** | 7 | Serverless MySQL, branching |
| **Turso** | 8 | Edge SQLite, replicas |
| **CockroachDB** | 7 | Distributed SQL |

### Cloud (6)
| Service | Tools | What You Can Do |
|---------|-------|-----------------|
| **Cloudflare** | 21 | DNS, workers, pages, zones |
| **Microsoft Azure** | 11 | Resources, services, management |
| **AWS** | 5 | S3, Lambda, SES, SQS |
| **Google Cloud** | 5 | Cloud functions, storage, compute |
| **Railway** | 1 | App deployments |
| **Render** | 7 | Web services, databases, cron |

### Advertising (6)
| Service | Tools | What You Can Do |
|---------|-------|-----------------|
| **Google Ads** | 9 | Campaigns, ad groups, keywords |
| **Facebook Ads** | 11 | Campaigns, ad sets, creatives |
| **LinkedIn Ads** | 11 | Campaigns, audiences, conversions |
| **TikTok Ads** | 12 | Campaigns, ad groups, creatives |
| **X Ads** | 11 | Campaigns, audiences, promoted tweets |
| **Instagram Ads** | 8 | Campaigns, ad sets, creatives |

### Productivity (5)
| Service | Tools | What You Can Do |
|---------|-------|-----------------|
| **Notion** | 5 | Pages, databases, blocks, users |
| **Microsoft 365** | 15 | Outlook, Teams, OneDrive, Calendar |
| **Whimsical** | 18 | Flowcharts, wireframes, mind maps |
| **Typeform** | 7 | Forms, responses, workspaces |
| **DocuSign** | 6 | Envelopes, signing, templates |

### E-Commerce (4)
| Service | Tools | What You Can Do |
|---------|-------|-----------------|
| **Shopify** | 6 | Products, orders, customers, inventory |
| **WooCommerce** | 12 | Products, orders, coupons |
| **GoDaddy** | 9 | Domains, DNS, registration |
| **BigCommerce** | 8 | Products, orders, customers |

### Marketing (4)
| Service | Tools | What You Can Do |
|---------|-------|-----------------|
| **Mailchimp** | 12 | Campaigns, audiences, automations |
| **SmartLead** | 12 | Outreach campaigns, leads, sequences |
| **ActiveCampaign** | 10 | Email automation, contacts, deals |
| **Lemlist** | 7 | Cold outreach, sequences |

### Automation (4)
| Service | Tools | What You Can Do |
|---------|-------|-----------------|
| **Zapier** | 5 | Triggers, actions, zaps |
| **n8n** | 14 | Workflows, nodes, executions |
| **Pabbly Connect** | 9 | Workflows, connections |
| **Make** | 15 | Scenarios, modules, connections |

### Support (3)
| Service | Tools | What You Can Do |
|---------|-------|-----------------|
| **Zendesk** | 12 | Tickets, users, organizations |
| **Intercom** | 15 | Conversations, contacts, articles |
| **Freshdesk** | 8 | Tickets, contacts, agents |

### Project Management (3)
| Service | Tools | What You Can Do |
|---------|-------|-----------------|
| **Asana** | 16 | Tasks, projects, workspaces, sections |
| **Monday.com** | 1 | Boards, items, columns |
| **Trello** | 10 | Boards, cards, lists |

### Finance (3)
| Service | Tools | What You Can Do |
|---------|-------|-----------------|
| **Plaid** | 9 | Account linking, transactions, balances |
| **Xero** | 9 | Invoices, contacts, bank feeds |
| **Wave** | 1 | Invoices, accounting |

### Scheduling (2)
| Service | Tools | What You Can Do |
|---------|-------|-----------------|
| **Google Calendar** | 5 | Events, calendars, reminders |
| **Calendly** | 3 | Events, invitees, availability |

### Storage (2)
| Service | Tools | What You Can Do |
|---------|-------|-----------------|
| **Google Drive** | 10 | Files, folders, permissions |
| **Dropbox** | 10 | Files, folders, sharing |

### Integration (2)
| Service | Tools | What You Can Do |
|---------|-------|-----------------|
| **MuleSoft** | 7 | APIs, integrations, flows |
| **CloudConvert** | 32 | File format conversion |

### Accounting (1)
| Service | Tools | What You Can Do |
|---------|-------|-----------------|
| **QuickBooks** | 21 | Invoices, customers, payments, reports |

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

## Patents

0nMCP has 5 patent applications filed:

1. **US #63/968,814** -- Seal of Truth (content-addressed integrity verification)
2. **US #63/990,046** -- 0nVault Container System (multi-layer encrypted containers)
3. **Three-Level Execution** -- Pipeline > Assembly Line > Radial Burst orchestration
4. **Universal Capability Routing** -- .0n Field Standard for cross-platform API resolution
5. **Multi-Layer AI Knowledge Architecture** -- Semantic layer system for AI brain storage

---

## Security

**Network access warning**: Security scanners like socket.dev and Snyk may flag that 0nMCP makes network requests. **This is expected and required.** 0nMCP is an API orchestrator -- its entire purpose is to call external APIs (Stripe, Slack, GitHub, etc.) on your behalf. Without network access, it cannot function.

**How credentials are handled**:
- Credentials are stored locally in `~/.0n/connections/` on your machine
- The Zero-Knowledge Capability Proxy strips credentials before responses reach the AI model
- 0nVault provides AES-256-GCM encryption with machine-bound hardware fingerprinting
- No credentials are ever sent to 0nMCP servers -- there are no 0nMCP servers. Everything runs locally.

**What 0nMCP does NOT do**:
- Does not phone home or collect telemetry
- Does not store your API keys anywhere except your local filesystem
- Does not proxy requests through third-party servers
- Does not require an account or subscription to use

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
catalog.js         SERVICE_CATALOG: 96 services with endpoints
tools.js           Tool registration (catalog + engine + vault)
connections.js     ~/.0n/ credential loader
orchestrator.js    AI-driven workflow orchestration
workflow.js        WorkflowRunner for .0n file execution
server.js          Express HTTP server (MCP over HTTP + webhooks)
capability-proxy.js Zero-knowledge credential proxy
ratelimit.js       Token bucket per service with backoff
webhooks.js        HMAC verification (Stripe, CRM, Slack, GitHub, Twilio, Shopify)
crm/               245 CRM tools (data-driven tool factory)
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

Always-on competitive intelligence that monitors five threat vectors daily:

- **MCP Ecosystem Entrants** -- new companies building on MCP
- **Patent Conflicts** -- USPTO/WIPO filings overlapping our 5 patents
- **Acquisition Signals** -- companies that might license or acquire
- **Brand Protection** -- unauthorized use of 0nMCP IP
- **Open Source Forks** -- unauthorized derivative works

Automated daily scans via Claude AI with web search.

---

## Links

- **Website**: [0nmcp.com](https://0nmcp.com)
- **Install Guide**: [0nmcp.com/install](https://0nmcp.com/install)
- **npm**: [npmjs.com/package/0nmcp](https://www.npmjs.com/package/0nmcp)
- **GitHub**: [github.com/0nork/0nMCP](https://github.com/0nork/0nMCP)
- **Issues**: [github.com/0nork/0nMCP/issues](https://github.com/0nork/0nMCP/issues)
- **Community**: [0nmcp.com/community](https://0nmcp.com/community)
- **Learn & Certify**: [0nmcp.com/learn](https://0nmcp.com/learn)
- **Marketplace**: [marketplace.rocketclients.com](https://marketplace.rocketclients.com)

---

## License

MIT -- free for personal and commercial use.

Built by [0nORK](https://0nork.com). Stop building workflows. Start describing outcomes.
