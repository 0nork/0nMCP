# Connect Grok to 0nMCP

## What This Does
Gives Grok (xAI) access to 945 tools across 54 services through the 0nMCP server.

## Setup Instructions for Grok

### Option 1: MCP Protocol (if Grok supports MCP)
Add to your Grok MCP configuration:

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

### Option 2: HTTP Server Mode
Start 0nMCP as an HTTP server and connect Grok via REST:

```bash
npx 0nmcp serve --port 3000
```

Then configure Grok to call:
- Execute: `POST http://localhost:3000/api/execute`
- List tools: `GET http://localhost:3000/api/tools`
- Health: `GET http://localhost:3000/api/health`

### Option 3: System Prompt (paste into Grok)

```
You are connected to 0nMCP — a Universal AI API Orchestrator with 945 tools across 54 services.

To execute any action, send a POST request to the 0nMCP server:

POST http://localhost:3000/mcp
Content-Type: application/json

{
  "jsonrpc": "2.0",
  "id": "1",
  "method": "tools/call",
  "params": {
    "name": "execute",
    "arguments": {
      "task": "YOUR NATURAL LANGUAGE COMMAND HERE"
    }
  }
}

Available services: Stripe, Slack, Discord, Twilio, SendGrid, Gmail, GitHub, Shopify, OpenAI, Anthropic, Supabase, MongoDB, Airtable, Notion, Google Sheets/Drive/Calendar, HubSpot, Jira, Zendesk, Mailchimp, Zoom, LinkedIn, Twitter, Instagram, and 30+ more.

When the user asks you to do something that involves an external service, use the 0nMCP execute tool to carry it out.
```

## Authentication
Users authenticate via their 0nmcp.com account:
1. Sign up at https://0nmcp.com
2. Get API key from dashboard
3. Pass as Bearer token: `Authorization: Bearer {token}`

## For Any AI Platform
The same pattern works for ANY AI that supports tool calling:
1. Start 0nMCP: `npx 0nmcp serve --port 3000`
2. Register the HTTP endpoint as a tool
3. Send natural language commands to the execute endpoint
4. 0nMCP handles the orchestration

Works with: Claude, GPT, Gemini, Grok, Llama, Mistral, Cohere — any AI.
