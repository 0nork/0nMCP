#!/usr/bin/env node
/**
 * Auto-post articles to Dev.to about 0nMCP
 * Usage: DEVTO_API_KEY=xxx node post-devto.js
 */

const DEVTO_API = 'https://dev.to/api/articles'

const articles = [
  {
    title: 'I Built an MCP Server with 945 Tools — Here\'s What I Learned',
    tags: ['ai', 'mcp', 'automation', 'opensource'],
    body: `Every AI tool I use — Claude, Cursor, Windsurf — they all speak the same protocol now: **MCP** (Model Context Protocol).

But here's the problem: connecting each service requires writing a separate MCP server. Stripe needs one. Slack needs one. Your CRM needs one. That's dozens of servers to maintain.

So I built **0nMCP** — one universal MCP server that connects to 54 services with 945 tools.

## What is 0nMCP?

It's an npm package. Install it, configure your API keys, and suddenly your AI can:

- Send emails via SendGrid
- Create Stripe customers and invoices
- Post to Slack, Discord, and 50 other services
- Manage CRM contacts, pipelines, and appointments
- Query databases (Supabase, MongoDB, Airtable)

All through natural language.

\`\`\`bash
npm install -g 0nmcp
\`\`\`

## How It Works

Add it to your Claude Desktop config:

\`\`\`json
{
  "mcpServers": {
    "0nMCP": {
      "command": "npx",
      "args": ["-y", "0nmcp"]
    }
  }
}
\`\`\`

That's it. Claude now has access to 945 tools.

## The 54 Services

Communication: Slack, Discord, Twilio, SendGrid, Gmail
CRM: HubSpot, Pipedrive, Salesforce-compatible
Payments: Stripe, Square, QuickBooks
AI: OpenAI, Anthropic
Dev: GitHub, Linear, Jira, Vercel
Data: Supabase, MongoDB, Airtable, Notion, Google Sheets
Social: LinkedIn, Twitter/X, Instagram, Reddit
...and 30+ more.

## Open Source

MIT licensed. Free forever.

- GitHub: https://github.com/0nork/0nMCP
- npm: https://npmjs.com/package/0nmcp
- Website: https://0nmcp.com

If you're building with MCP, try it: \`npx 0nmcp\`

Would love feedback from the community.`
  }
]

async function post() {
  const key = process.env.DEVTO_API_KEY
  if (!key) { console.log('Set DEVTO_API_KEY'); process.exit(1) }

  for (const article of articles) {
    const res = await fetch(DEVTO_API, {
      method: 'POST',
      headers: { 'api-key': key, 'Content-Type': 'application/json' },
      body: JSON.stringify({ article: { title: article.title, body_markdown: article.body, tags: article.tags, published: true } })
    })
    const data = await res.json()
    console.log(res.ok ? `Published: ${data.url}` : `Error: ${JSON.stringify(data)}`)
  }
}

post()
