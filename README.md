# 0nMCP

**Connect your services. Describe what you want. AI handles the rest.**

An open-source MCP server that lets AI assistants orchestrate any connected API. No workflow builders, no decision trees — just natural language.

```
You: "Send an invoice to john@example.com for $500"

AI automatically:
1. Looks up John in your CRM
2. Creates an invoice in Stripe
3. Sends confirmation via SendGrid
4. Returns: "Invoice sent to john@example.com"
```

**You don't decide HOW. You just say WHAT.**

---

## Quick Start

### 1. Install

```bash
npm install -g 0nmcp
```

Or run directly:

```bash
npx 0nmcp
```

### 2. Add to Claude Desktop

Edit `claude_desktop_config.json`:

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

> `ANTHROPIC_API_KEY` is optional. It enables AI-powered task planning across services. Without it, 0nMCP still works using keyword-based routing.

### 3. Connect Services & Go

```
"Connect Stripe with API key sk_live_..."
"Connect SendGrid with API key SG..."
"Now send an email to john@example.com about the project update"
```

---

## Supported Services

| Service | Type | Auth | Capabilities |
|---------|------|------|-------------|
| **Stripe** | Payments | API Key | Customers, charges, invoices, subscriptions, balance |
| **SendGrid** | Email | API Key | Send emails, manage contacts, templates |
| **Resend** | Email | API Key | Send transactional emails |
| **Twilio** | SMS | Account SID + Token | Send SMS, make calls |
| **Slack** | Communication | Bot Token | Post messages, manage channels |
| **Discord** | Communication | Bot Token | Send messages |
| **OpenAI** | AI | API Key | Text generation, images, embeddings, TTS |
| **Airtable** | Database | API Key | CRUD on records, manage bases |
| **Notion** | Database | API Key | Pages, databases, search |
| **GitHub** | Code | Token | Issues, repos, pull requests |
| **Linear** | Project | API Key | Issues, projects |
| **Shopify** | E-commerce | Access Token | Products, orders, customers |
| **HubSpot** | CRM | Access Token | Contacts, companies, deals |
| **Supabase** | Database | API Key | Tables, auth, storage |
| **Calendly** | Scheduling | API Key | Events, event types |
| **Google Calendar** | Scheduling | OAuth | Events, calendars |
| **CRM** | CRM | OAuth | Contacts, pipelines, tags, workflows, SMS, email |

**17 services. 100+ capabilities. One interface.**

---

## Tools

### Universal Tools

| Tool | Description |
|------|-------------|
| `execute` | Run any task using natural language across connected services |
| `connect_service` | Connect a new service with credentials |
| `disconnect_service` | Remove a connected service |
| `list_connections` | See what's connected |
| `list_available_services` | See all 17 services and their capabilities |
| `get_service_info` | Get detailed info about a specific service |
| `api_call` | Make a direct API call to any connected service |

### CRM Tools (Direct Access)

| Tool | Description |
|------|-------------|
| `crm_auth_url` | Generate OAuth URL for CRM authorization |
| `crm_exchange_token` | Exchange auth code for access token |
| `crm_refresh_token` | Refresh expired access token |
| `crm_create_tags` | Bulk create tags |
| `crm_create_pipeline` | Create pipeline with stages |
| `crm_create_custom_values` | Create custom values |
| `crm_process_workflow` | Process workflow JSON — creates tags and custom values |
| `crm_deploy_snapshot` | Deploy full snapshot (pipeline + tags + values + workflows) |
| `crm_list_workflows` | List all workflows |
| `crm_list_pipelines` | List all pipelines and stages |

---

## How It Works

### With `ANTHROPIC_API_KEY` (AI Mode)

```
┌─────────────────┐     ┌──────────────┐     ┌──────────────┐
│   "Send invoice  │     │  AI parses   │     │  AI creates  │
│    to John for   │ ──▶ │  intent:     │ ──▶ │  plan:       │
│    $500"         │     │  - invoice   │     │  1. Stripe   │
│                  │     │  - to John   │     │  2. SendGrid │
│                  │     │  - $500      │     │  3. Notify   │
└─────────────────┘     └──────────────┘     └──────────────┘
                                                      │
                                                      ▼
┌─────────────────┐     ┌──────────────┐     ┌──────────────┐
│   Returns        │     │  Executes    │     │  Routes to   │
│   summary:       │ ◀── │  each step   │ ◀── │  services    │
│   "Invoice sent" │     │  in order    │     │              │
└─────────────────┘     └──────────────┘     └──────────────┘
```

Claude analyzes your task, picks the best services, creates an execution plan, runs it, and summarizes the results.

### Without API Key (Keyword Mode)

The orchestrator uses keyword matching to route tasks to the right services. Less intelligent but still functional for straightforward requests.

---

## Examples

Once services are connected, just describe what you want:

```
"Send an email to sarah@example.com about the meeting tomorrow"
"Create a Stripe customer for mike@test.com with name Mike Johnson"
"Post to #general on Slack: We just closed a $50k deal!"
"Add a record to Airtable: Name=John, Status=Active, Amount=500"
"Create a GitHub issue in my-repo: Bug in login page"
"Send an SMS to +1234567890: Your order has shipped"
"Get my Stripe balance"
"Search Notion for project roadmap"
"Deploy a full CRM snapshot with pipeline, tags, and workflows"
```

---

## CRM Snapshot Format

Deploy entire CRM configurations in one shot:

```json
{
  "pipeline": {
    "name": "Sales Pipeline",
    "stages": ["001. New Lead", "002. Attempt to Contact", "003. Engaged"]
  },
  "tags": ["New Lead", "FB Lead", "Hot Lead", "Booked Appointment"],
  "custom_values": {
    "calendar_link": "https://calendly.com/yourlink",
    "support_email": "support@yourco.com"
  },
  "workflows": [
    {
      "id": "001a",
      "name": "001.a New Lead In",
      "trigger": { "type": "tag_added", "tag": "New Lead" },
      "actions": [
        { "type": "send_sms", "message": "Hey {{contact.first_name}}!" },
        { "type": "wait", "duration": "10 minutes" },
        { "type": "add_tag", "value": "Contacted" }
      ]
    }
  ]
}
```

---

## Architecture

```
0nMCP/
├── index.js          # Entry point — universal tools + server
├── catalog.js        # Service catalog — 17 integrations
├── connections.js    # Connection manager — local credential storage
├── orchestrator.js   # AI execution planner — the brain
├── crm.js            # CRM service tools — first full integration
├── package.json
├── LICENSE           # MIT
├── CONTRIBUTING.md
└── README.md
```

| Component | File | Purpose |
|-----------|------|---------|
| **Service Catalog** | `catalog.js` | All services, endpoints, auth patterns, capabilities |
| **Connection Manager** | `connections.js` | Local credential storage at `~/.0nmcp/connections.json` |
| **Orchestrator** | `orchestrator.js` | AI-powered intent parsing, plan creation, step execution |
| **Universal Tools** | `index.js` | MCP tools: `execute`, `connect_service`, `api_call`, etc. |
| **CRM Tools** | `crm.js` | Direct CRM API tools for pipelines, tags, workflows |

---

## Configuration

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `ANTHROPIC_API_KEY` | No | Enables AI-powered planning. Without it, uses keyword matching. |

### Data Storage

Connections stored locally at `~/.0nmcp/connections.json`. Credentials are plain text. For production use, consider a secrets manager or encrypting the file.

---

## Security

- Credentials stored locally on your machine only
- Never shared with third parties
- Each API call goes directly to the service
- MCP server runs locally, not in the cloud
- `ANTHROPIC_API_KEY` only used for task planning (not passed to external services)

---

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md). The fastest way to contribute is adding a new service to the catalog.

---

## Roadmap

- [ ] More services (50+ planned)
- [ ] OAuth flows for services that require it
- [ ] Credential encryption at rest
- [ ] Execution history and logging
- [ ] Scheduled tasks
- [ ] Webhook triggers
- [ ] Multi-step conditional workflows
- [ ] `npx 0nmcp` publish to npm
- [ ] Web dashboard for connection management
- [ ] Plugin system for custom services

---

## License

[MIT](LICENSE)

---

Built by [RocketOpp](https://github.com/Crypto-Goatz)
