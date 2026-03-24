# 0n Product Template — Ship Everywhere

Every 0n product follows this template. One feature, seven distribution channels.

## The 7 Distribution Channels

### 1. MCP Tool (0nMCP)
**Where:** Claude Desktop, Cursor, Windsurf, Claude Code, any MCP client
**How:** Register in `engine/{product}.js`, export from `engine/index.js`
**User gets it:** `npx 0nmcp` → tool is available
**Revenue:** Sparks per execution ($0.01/run)

```javascript
// engine/{product}.js
export function register{Product}Tools(server, z) {
  server.tool("{product}_action", "Description", { params }, async (input) => {
    // Execute the feature
    return { content: [{ type: "text", text: JSON.stringify(result) }] }
  })
}
```

### 2. Console App (0nmcp.com)
**Where:** 0nmcp.com/console/{product}
**How:** Next.js page + API route
**User gets it:** Login → navigate to product
**Revenue:** Subscription tier or Sparks

```
src/app/(dashboard)/console/{product}/page.tsx  — UI
src/app/api/{product}/route.ts                   — API
```

### 3. Chrome Extension (0n Extension)
**Where:** Chrome Web Store → side panel
**How:** Add task to `lib/tasks.js`, add tab or feature to sidebar
**User gets it:** Install extension → open side panel
**Revenue:** Requires 0nmcp.com account (Sparks)

```javascript
// lib/tasks.js — add guided wizard
{product}_task: {
  name: '{Product Name}',
  steps: [...]
}
```

### 4. CRM Marketplace App
**Where:** CRM App Store (installed by agencies)
**How:** Follow the marketplace template (see ghl-marketplace-template.md)
**User gets it:** Install from CRM marketplace → iframe storefront
**Revenue:** Monthly subscription ($29-99/mo)

```
marketplace/apps/0n-{product}/
  app.json       — manifest
  handler.js     — webhook handler
  install.js     — OAuth flow
```

### 5. Claude Desktop Extension
**Where:** Claude Settings → Extensions → Install
**How:** Package as a .claude-extension with manifest
**User gets it:** Download from 0nmcp.com or marketplace
**Revenue:** Sparks per execution

```json
{
  "name": "0n {Product}",
  "version": "1.0.0",
  "description": "...",
  "tools": ["{product}_action"],
  "mcp_server": "npx 0nmcp"
}
```

### 6. WordPress Plugin
**Where:** WordPress.org plugin directory
**How:** PHP wrapper that calls 0nMCP API
**User gets it:** Install plugin → enter 0nmcp.com API key
**Revenue:** Free plugin → paid 0nmcp.com account

```php
// wp-0n-{product}/wp-0n-{product}.php
// Calls https://www.0nmcp.com/api/{product} with user's API key
```

### 7. REST API
**Where:** Any app, any platform, any language
**How:** Already exposed at 0nmcp.com/api/{product}
**User gets it:** API key from 0nmcp.com account
**Revenue:** Sparks per API call

```bash
curl -X POST https://www.0nmcp.com/api/{product} \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{"action": "execute", "params": {...}}'
```

---

## Product Checklist

When building ANY new 0n product:

- [ ] MCP tool registered in `engine/{product}.js`
- [ ] Console page at `console/{product}/page.tsx`
- [ ] API route at `api/{product}/route.ts`
- [ ] Chrome extension task in `lib/tasks.js`
- [ ] CRM marketplace app manifest in `marketplace/apps/`
- [ ] Claude Desktop extension manifest
- [ ] WordPress plugin wrapper (if applicable)
- [ ] Supabase migration for product-specific tables
- [ ] Pricing: Sparks cost per execution defined
- [ ] Documentation: README with usage examples
- [ ] Blog post: SXO-optimized announcement
- [ ] Dev.to: Cross-posted via RSS or API
- [ ] Schema markup on product page

## Current Products

| Product | MCP | Console | Extension | CRM App | Claude Ext | WP | API |
|---------|-----|---------|-----------|---------|------------|----|----|
| SXO Writer | ✓ | ✓ | ○ | ○ | ○ | ○ | ✓ |
| Course Generator | ✓ | ✓ | ○ | ✓ | ○ | ○ | ✓ |
| AutoResponder | ✓ | ○ | ○ | ✓ | ○ | ○ | ✓ |
| Lead Scorer | ✓ | ○ | ○ | ✓ | ○ | ○ | ✓ |
| Content AI | ✓ | ○ | ○ | ✓ | ○ | ○ | ✓ |
| 0nMail | ✓ | ✓ | ○ | ○ | ○ | ○ | ✓ |
| Multi-AI Council | ✓ | ○ | ✓ | ○ | ○ | ○ | ✓ |
| Training Center | ✓ | ✓ | ○ | ○ | ○ | ○ | ✓ |

✓ = Built  ○ = Not yet

## Revenue Model

```
Free: 100 Sparks on signup
Every execution: 1-5 Sparks depending on product
Subscriptions: Supporter $9, Builder $29, Enterprise $99
CRM Marketplace: $29-99/mo per location
WordPress: Free plugin → paid account
```

## The Rule

**Every feature we build goes into ALL channels. No exceptions.**
**0n Everywhere. That's the tagline. That's the strategy.**
