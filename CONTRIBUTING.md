# Contributing to 0nMCP

We welcome contributions from everyone. 0nMCP is built by the community, for the community.

## Quick Start

```bash
git clone https://github.com/0nork/0nMCP.git
cd 0nMCP
npm install
node index.js
```

## Ways to Contribute

### 1. Add a New Service Integration

The fastest way to contribute — add a service to `catalog.js`:

```javascript
your_service: {
  name: "Your Service",
  type: "category",       // payments, email, sms, crm, database, etc.
  description: "What it does",
  baseUrl: "https://api.yourservice.com",
  authType: "api_key",    // api_key, oauth, bot_token, basic
  credentialKeys: ["apiKey"],
  capabilities: [
    { name: "do_thing", actions: ["create", "list"], description: "Does the thing" },
  ],
  endpoints: {
    do_thing: { method: "POST", path: "/things", body: { name: "" } },
    list_things: { method: "GET", path: "/things" },
  },
  authHeader: (creds) => ({
    "Authorization": `Bearer ${creds.apiKey}`,
    "Content-Type": "application/json",
  }),
},
```

Then add keyword triggers to `orchestrator.js` and submit a PR.

### 2. Add CRM Tools

CRM tools use a data-driven factory pattern. Each tool is just a config object in the relevant module file under `crm/`:

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

The `registerTools()` helper in `crm/helpers.js` handles everything else — registration, zod validation, API calls, error handling.

**Current CRM modules (245 tools):**

| Module | File | Tools |
|--------|------|-------|
| Auth | `crm/auth.js` | 5 |
| Contacts | `crm/contacts.js` | 23 |
| Conversations | `crm/conversations.js` | 13 |
| Calendars | `crm/calendars.js` | 27 |
| Opportunities | `crm/opportunities.js` | 14 |
| Invoices | `crm/invoices.js` | 20 |
| Payments | `crm/payments.js` | 16 |
| Products | `crm/products.js` | 10 |
| Locations | `crm/locations.js` | 24 |
| Social | `crm/social.js` | 35 |
| Users | `crm/users.js` | 24 |
| Objects | `crm/objects.js` | 34 |

### 3. Fix Bugs & Improve Docs

- Found a bug? [Open an issue](https://github.com/0nork/0nMCP/issues)
- See a typo? Submit a PR
- Have ideas? [Start a discussion](https://github.com/0nork/0nMCP/discussions)

## Project Structure

```
index.js          Entry point — 7 universal tools + server startup
catalog.js        Service catalog — 17 integrations
connections.js    Connection manager — local credential storage (.0n standard)
orchestrator.js   AI execution planner — the brain
webhooks.js       Webhook receiver and event processing
ratelimit.js      Per-service rate limiting
cli.js            CLI — init, connect, migrate, interactive setup
crm/              245 CRM tools across 12 data-driven modules
  index.js        Tool orchestrator — registers all modules
  helpers.js      Tool factory — registerTools()
  auth.js         OAuth, tokens, snapshots, workflows
  contacts.js     Contact management (23 tools)
  conversations.js  Messaging (13 tools)
  calendars.js    Calendar & scheduling (27 tools)
  opportunities.js  Pipeline & deals (14 tools)
  invoices.js     Invoicing (20 tools)
  payments.js     Payment processing (16 tools)
  products.js     Product catalog (10 tools)
  locations.js    Location management (24 tools)
  social.js       Social media & blogs (35 tools)
  users.js        User & form management (24 tools)
  objects.js      Custom objects & associations (34 tools)
types/
  index.d.ts      TypeScript definitions
```

## Code Style

- Pure ESM (`"type": "module"`)
- No build step — runs directly with Node.js 18+
- No TypeScript source (types provided separately in `types/`)
- Keep functions small and readable
- Comment the "why", not the "what"

## Naming Rules

**CRITICAL:**
- NEVER use "GHL", "Go High Level", or "High Level" in any code, comments, file names, or documentation
- Use "CRM" for all CRM-related references

## Submitting a PR

1. Fork the repo
2. Create a feature branch (`git checkout -b add-service-mailchimp`)
3. Make your changes
4. Test locally (`node index.js`)
5. Commit with a clear message
6. Push and open a PR

## Code of Conduct

By participating, you agree to our [Code of Conduct](CODE_OF_CONDUCT.md).

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
