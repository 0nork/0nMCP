# MCP Directory Submission

## PR Title
Add 0nMCP - Universal AI API Orchestrator (945 tools, 54 services)

## PR Description

### What is 0nMCP?

0nMCP is the most comprehensive MCP server available -- 945 tools across 54 services in 22 categories. It connects any AI to any API through a single MCP server with zero configuration.

### Entry to add to Community Servers

Add to the community servers table in README.md:

```markdown
| [0nMCP](https://github.com/0nork/0nMCP) | Universal AI API Orchestrator with 945 tools across 54 services (Stripe, Slack, GitHub, Shopify, CRM, OpenAI, Google, Microsoft, and more). Includes encrypted vault, .0n workflow runtime, and zero-knowledge capability proxy. | [npm](https://www.npmjs.com/package/0nmcp) |
```

### Details

- **npm package**: `0nmcp` (MIT license)
- **Tools**: 945
- **Services**: 54 (Stripe, Slack, Discord, Twilio, SendGrid, Gmail, GitHub, Shopify, OpenAI, Anthropic, Supabase, MongoDB, Airtable, Notion, Google Sheets, Google Drive, Google Calendar, Google Ads, HubSpot, Pipedrive, Jira, Asana, Linear, Zendesk, Intercom, Mailchimp, Calendly, Zoom, Dropbox, WhatsApp, Instagram, TikTok, Twitter/X, LinkedIn, Square, Plaid, QuickBooks, Cloudflare, GoDaddy, Vercel, Azure, Microsoft Teams, Outlook, OneDrive, Facebook Ads, LinkedIn Ads, TikTok Ads, Instagram Ads, SmartLead, Zapier, n8n, Pabbly, Make, CRM)
- **Categories**: 22 (Communication, CRM & Sales, Payments & Finance, Project Management, Data & Databases, AI & ML, Developer Tools, Marketing & Social, Advertising, E-Commerce, Productivity, Microsoft, Automation & Integration, and more)
- **Node.js**: >= 18.0.0
- **Protocol**: Full MCP stdio + HTTP server mode
- **Security**: AES-256-GCM encrypted vault, patent-pending container system

### Installation

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

### Links

- GitHub: https://github.com/0nork/0nMCP
- npm: https://www.npmjs.com/package/0nmcp
- Website: https://0nmcp.com
- Documentation: https://0nmcp.com/learn

### Checklist

- [x] MCP server follows the MCP specification
- [x] Uses `@modelcontextprotocol/sdk`
- [x] Published on npm as `0nmcp`
- [x] MIT licensed
- [x] Has comprehensive README
- [x] Works with Claude Desktop, Cursor, Windsurf, and Claude Code
- [x] Node.js >= 18
