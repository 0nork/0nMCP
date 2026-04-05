# 0nMCP — Full Architecture Context for Claude Desktop

> Use this document to understand the complete 0nMCP infrastructure so you can write detailed, actionable instructions for the Claude Code AI (Jaxx) to execute.

---

## System Overview

0nMCP is a universal AI API orchestrator with **1,589 tools across 102 services**. It's the largest MCP (Model Context Protocol) server available, officially listed on the MCP Registry.

**Owner:** Mike Mento @ RocketOpp LLC
**AI Builder:** Claude Opus 4.6 (Jaxx) running in Claude Code CLI
**Stack:** Next.js 16 + React 19 + Supabase + Stripe + Vercel + Tailwind v4

---

## The Data Architecture (Critical)

### Supabase (Master DB: `pwujhhmlrtxjmjzyttwn`)

One database with EVERYTHING:

**Auth & Profiles:**
- `auth.users` — Supabase Auth
- `profiles` — user data, plan, stripe_customer_id, crm_location_id, crm_contact_id
- `spark_balances` — execution credits (50 free on signup)
- `spark_transactions` — credit history

**Stripe Sync Engine (29 tables, auto-syncing):**
- `stripe.customers`, `stripe.subscriptions`, `stripe.invoices`, `stripe.charges`, `stripe.products`, `stripe.prices`, `stripe.payment_intents`, `stripe.payment_methods`, etc.
- Syncs automatically via Supabase integration — NO manual webhook handling needed for subscription status
- Query directly: `SELECT * FROM stripe.subscriptions WHERE status = 'active'`

**Foreign Data Wrappers (14 servers configured):**
| Server | Type | What it queries |
|--------|------|-----------------|
| `slack_0n_server` | Native FDW | Slack channels, messages, users, files (LIVE) |
| `openapi_server` | Wasm | ANY REST API with OpenAPI 3.0 spec |
| `shopify_server` | Wasm | Shopify orders, products, customers |
| `hubspot_server` | Wasm | HubSpot CRM contacts, deals |
| `notion_server` | Wasm | Notion pages, databases |
| `calendly_server` | Wasm | Calendly bookings, events |
| `calcom_server` | Wasm | Cal.com scheduling |
| `clerk_server` | Wasm | Clerk auth users |
| `paddle_server` | Wasm | Paddle payments |
| `airtable_server` | Native | Airtable bases as SQL |
| `auth0_server` | Native | Auth0 users |
| `firebase_server` | Native | Firebase data |
| `redis_server` | Native | Redis cache as SQL |
| `s3_server` | Native | S3 CSV/JSON/Parquet files |

**All queryable in one SQL statement.** Example:
```sql
SELECT p.email, s.status, sc.name as slack_channel
FROM profiles p
JOIN stripe.subscriptions s ON s.customer = p.stripe_customer_id
JOIN channels sc ON sc.creator = p.id
```

**Other Tables:**
- `community_threads`, `community_posts`, `community_groups` — Forum
- `vip_accounts` — VIP portal configs (slug, branding, features, pricing)
- `nda_signatures` — Investor NDA tracking (token-based access)
- `mcp_registry_servers` — MCP Registry aggregator cache (hourly sync)
- `slack_installations` — Multi-workspace Slack app tokens
- `user_crm_accounts` — Maps users to CRM sub-accounts
- `crm_provision_queue` — Failed provision retry queue

---

## CRM Integration (Critical — NEVER say "GHL" or "Go High Level")

**Always call it "CRM" or "ROCKET"**

**API:** `https://services.leadconnectorhq.com` | Version: `2021-07-28`

### PIT Tokens (Personal Integration Tokens)
| Token | Scope | Use For |
|-------|-------|---------|
| Agency PIT (`pit-e789d87e...`) | Create/delete locations, agency admin | Auto-provisioning new user sub-locations |
| Sub-location PIT (`pit-bd4efaef...`) | Contacts, conversations, calendars, pipelines, email/SMS | All location-level operations |
| Agent Studio PIT (`pit-f5f41b5a...`) | Full scopes + Agent Studio | KB agents, MCP Server nodes |

### Auto-Provision Flow (on every signup)
```
User signs up (Supabase Auth)
  → handle_new_user() trigger creates profile + 50 Sparks
  → Auth callback fires (fire-and-forget, non-blocking):
    1. ensureStripeCustomer() → stripe.customers.create → stores stripe_customer_id
    2. autoProvisionCrm() → provisionUser():
       a. Create CRM contact in 0nMCP location
       b. Tag with ['0n-user', 'agent-studio', 'auto-provisioned']
       c. Create sub-location using Agency PIT (POST /locations/)
       d. Fire Agent Studio agent to deploy KB
       e. Store crm_location_id + crm_contact_id on profile
    3. sendWelcomeIfNew() → welcome email
    4. convertReferral() → 50 bonus Sparks if referred
  → Stripe Sync Engine auto-syncs customer to stripe.customers table
  → User lands on /dashboard with everything ready
```

### CRM Module (245 tools)
| Module | Tools | Module | Tools |
|--------|-------|--------|-------|
| auth | 5 | payments | 16 |
| contacts | 23 | products | 10 |
| conversations | 13 | locations | 24 |
| calendars | 27 | social | 35 |
| opportunities | 14 | users | 24 |
| invoices | 20 | objects | 34 |

---

## Slack Integration

**App ID:** A0AQHLXC3FD
**Bot Token:** xoxb-10833698032195-...
**50+ scopes** including `assistant:write` for native Slack AI

### Commands
- `/0n` — Welcome + command list
- `/0n status` — Live stats
- `/0n run <task>` — AI workflow execution
- `/0n connect` — Service connection link
- `/0n help` — All commands

### API Endpoints on 0nmcp.com
- `/api/slack/events` — Event subscriptions handler
- `/api/slack/commands` — Slash command handler
- `/api/slack/interactions` — Interactive components
- `/api/slack/install` — OAuth install redirect
- `/api/slack/callback` — OAuth callback + token storage

### Slack FDW Tables (queryable in SQL)
- `channels` — id, name, is_private, created, creator
- `messages` — ts, user_id, channel_id, text (requires channel_id filter)
- `users` — needs `users:read` scope added
- `usergroups`, `usergroup_members`, `slack_files`, `team_info`

---

## Stripe Integration

**Account:** acct_1PUJi5HThmAuKVQM (RocketOpp LLC)
**Sync Engine:** LIVE — 29 tables auto-syncing to `stripe.*` schema

### Pricing Tiers
| Tier | Price | Stripe Price ID |
|------|-------|-----------------|
| Free | $0 | — |
| Supporter | /mo | price_1T1rY5HThmAuKVQMEvWdsvcy |
| Builder | /mo | price_1T1rYYHThmAuKVQMZIOi4kdq |
| Enterprise | /mo | price_1T1rYiHThmAuKVQMsUKlhrSq |

### Metered Billing
- $0.01 per execution
- 20 free executions/month
- Price: price_1Sz5jVHThmAuKVQMtSPKsNsS

---

## Web Properties

| Site | Repo | Domain | Vercel ID |
|------|------|--------|-----------|
| 0nmcp.com | ~/Github/0nmcp-website/ | 0nmcp.com | prj_Ccq53WXdb5CQd4iIBRR0qr4QToge |
| 0nCore | ~/Github/onork-app/ | command.0nmcp.com | prj_OJ0gi5HItdtUmQYclXirYk1BSJnt |
| Marketplace | ~/Github/0n-marketplace/ | marketplace.rocketclients.com | prj_fWdT7RGwoK01RqhxNN6M7USSCIZj |

### Key Pages on 0nmcp.com
| Page | Purpose |
|------|---------|
| `/setup` | 5-step setup wizard (platforms, install, connect, run, explore) |
| `/install` | Public install page (11 platforms) |
| `/dashboard` | User command center (guided launchpad) |
| `/dashboard/connect` | Guided service connections (API key inputs) |
| `/dashboard/install` | Install page inside dashboard wrapper |
| `/console` | Power-user deep-dive (builder, marketplace, courses) |
| `/portal/[company]` | VIP white-label portals |
| `/investors` | NDA-gated pitch deck + one-sheet |
| `/convert/env` | Free .env to .0n converter (lead magnet) |
| `/slack` | Add to Slack page |
| `/forum` | Community forum (SSR, SEO) |
| `/audit` | Free SXO audit tool |

---

## MCP Server Endpoint

**URL:** `https://www.0nmcp.com/api/mcp`
**Protocol:** JSON-RPC (MCP standard)
**Methods:** `initialize`, `tools/list`, `tools/call`
**Currently exposes:** 16 CRM tools (needs expansion to full catalog)
**Registry:** Listed as `io.github.0nork/0nMCP` v3.1.0

---

## Patents (5 filed)

| # | Application | Coverage |
|---|------------|----------|
| 1 | #63/968,814 | MCPFed, 3-tier execution, Smart Deploy, Seal of Truth, .FED |
| 2 | #63/990,046 | 0nVault, semantic layers, multi-party escrow, .0nv binary |
| 3 | #64/006,268 | 0nPlex, multi-persona AI, ACKO, dual-track scoring |
| 4 | #64/006,282 | 0nCore, PACG, LVOS (Thompson Sampling), CUCIA |
| 5 | Filed Apr 1 | 7-layer knowledge architecture, auto-discovery, cross-platform |

---

## .0n Standard v2.0.0

| File Type | Schema | Purpose |
|-----------|--------|---------|
| connection | 0n-connection/v1 | Service credentials |
| workflow | 0n-workflow/v1 | Automation definitions |
| snapshot | 0n-snapshot/v1 | System state capture |
| execution | 0n-execution/v1 | Run history |
| config | 0n-config/v1 | Global settings |
| task | 0n-task/v1 | Project management |
| brain | 0n-brain/v1 | 7-layer knowledge (K1-K7) |
| brand | 0n-brand/v1 | Visual identity |
| switch | 0n-switch/v1 | Infrastructure-as-code bundle |

---

## Design Brain (for AI design assistance)

Location: `~/.0n/brains/design-kb/`
- `design-brain.0n` — Master brain with 5-step Style Wizard
- `buttons.0n` — 45 button styles, 7 categories
- `auth-pages.0n` — 5 auth layouts + sub-components
- `wizards.0n` — Multi-step wizard layouts (Quizo)
- `step-forms.0n` — Step-by-step form layouts (Steps v2.9)

**Golden rule:** ALWAYS use real SVG brand logos — never letter abbreviations or emojis.
**Logos stored at:** `/public/brand/logos/{service}.svg` (40 logos)

---

## How to Write Instructions for Jaxx (Claude Code)

When writing tasks for the Claude Code AI to execute:

1. **Be specific about file paths** — always use full paths from `~/Github/0nmcp-website/src/...`
2. **Reference existing code** — "modify the component at X" not "create something"
3. **Include the WHY** — explain the user experience goal
4. **Specify the visual style** — dark theme, brand green #7ed957, no emojis, SVG icons
5. **Name the deployment** — "push to main" = Vercel auto-deploys
6. **Test instructions** — include what to verify after the change
7. **Never say GHL** — always "CRM"
8. **Push to main** — no branches, no PRs, direct deploy

### Example instruction format:
```
TASK: Add real-time subscription status badge to /dashboard

CONTEXT: The Stripe Sync Engine syncs subscription data to stripe.subscriptions table.
Currently the dashboard doesn't show whether the user has an active paid subscription.

WHAT TO BUILD:
1. In src/app/dashboard/page.tsx, add a query to fetch the user's subscription status from stripe.subscriptions
2. Show a badge next to their plan: "Active" (green), "Past Due" (yellow), "Cancelled" (red)
3. Use the stripe_customer_id from the profiles table to join

VISUAL: Green badge with white text, rounded-full, font-size 0.7rem
VERIFY: Sign in, check /dashboard shows correct subscription status
DEPLOY: Push to main
```
