# Reddit Posts for 0nMCP

## Post 1: r/MCP
**Title:** I built the most comprehensive MCP server — 945 tools, 54 services, one npm install
**Body:**
Been working on 0nMCP for months. It's a universal MCP server that connects any AI (Claude, Cursor, Windsurf) to 54 different services through one package.

`npx 0nmcp` — that's the entire setup.

Services include: Stripe, Slack, Discord, GitHub, OpenAI, Supabase, MongoDB, Google Sheets, HubSpot, Shopify, and 44 more.

It's MIT licensed and free: https://github.com/0nork/0nMCP

Would love feedback from the MCP community.

## Post 2: r/ClaudeAI
**Title:** Connect Claude Desktop to 54 services with one MCP server (open source)
**Body:**
Just shipped v2.7.0 of 0nMCP. Add this to your Claude Desktop config:

```json
{"mcpServers":{"0nMCP":{"command":"npx","args":["-y","0nmcp"]}}}
```

Claude can now: create Stripe invoices, send Slack messages, manage GitHub issues, query databases, send emails — 945 tools total.

GitHub: https://github.com/0nork/0nMCP
npm: https://npmjs.com/package/0nmcp

## Post 3: r/SideProject
**Title:** From 26 services to 54 — my open source MCP server just hit 945 tools
**Body:**
Started with a simple idea: one MCP server for everything. Six months later, 0nMCP has 945 tools across 54 services.

What makes it different: you describe what you want in English, and the AI orchestrator figures out which API calls to make.

"Create a Stripe customer for john@example.com, add them to our CRM pipeline, and send a welcome email via SendGrid"

→ 3 API calls, executed in 2 seconds.

Free and open source: https://github.com/0nork/0nMCP

## Post 4: r/artificial
**Title:** Universal AI API layer — connect any LLM to any API through MCP
**Body:**
Built 0nMCP as a bridge between AI models and real-world APIs. Any AI that speaks MCP (Claude, Cursor, Windsurf, Gemini via adapters) gets instant access to 945 tools.

The thesis: AI shouldn't need custom integrations for every service. One protocol, one server, unlimited APIs.

Currently supports 54 services including payments, CRM, communication, databases, social media, and developer tools.

MIT licensed: https://github.com/0nork/0nMCP
