# Contributing to 0nMCP

We welcome contributions from everyone. Here's how you can help.

## Adding a New Service

The fastest way to contribute is adding a new service integration:

1. **Edit `catalog.js`** — Add your service to `SERVICE_CATALOG`:

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

2. **(Optional) Add dedicated tools** — If the service needs specialized logic beyond generic API calls, create a `your-service.js` file following `crm.js` as a template, then register the tools in `index.js`.

3. **Update keyword matching** — Add entries to `CAPABILITY_KEYWORDS` in `orchestrator.js` so the fallback planner can route tasks to your service.

4. **Test it** — Connect the service and run some tasks.

5. **Submit a PR** — Include a description of what the service does and example tasks.

## Project Structure

```
index.js          Entry point — universal tools + server startup
catalog.js        Service catalog — all supported integrations
connections.js    Connection manager — local credential storage
orchestrator.js   AI execution planner — the brain
crm.js            CRM service tools — first integration
```

## Development

```bash
git clone https://github.com/0nork/0nMCP.git
cd 0nMCP
npm install
```

Test locally:
```bash
echo '{}' | node index.js
```

## Code Style

- Pure ESM (`"type": "module"`)
- No build step — runs directly with Node.js 18+
- No TypeScript (keep the barrier low for contributors)
- Keep functions small and readable
- Comment the "why", not the "what"

## Naming Rules

- NEVER use "GHL", "Go High Level", or "High Level" in any code, comments, file names, or documentation
- Use "CRM" for CRM-related references

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
