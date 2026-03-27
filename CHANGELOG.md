# Changelog

All notable changes to 0nMCP are documented here.

## [2.8.0] — 2026-03-26

### Multi-AI Council
- 4 new MCP tools: `council_ask`, `council_debate`, `council_solve` — query GPT-4o, Gemini, Grok, and Claude simultaneously
- Council sessions auto-generate training data for 0nAI pipeline

### 0nAI Training Center
- 8 new MCP tools: `training_feed`, `training_ingest`, `training_generate`, `training_score`, `training_dataset`, `training_export`, `training_search`, `training_review`
- 7 database tables for persistent training data
- 11 verified public sources (HN, arXiv, Dev.to, GitHub, npm, CoinGecko, Wikipedia)
- Export as Anthropic/OpenAI/Alpaca JSONL

### Agent Studio + 50 CRM Tools
- Agent Studio module (8 tools) — AI-powered sequences replace workflow builder
- 50 new CRM tools: Knowledge Base, Voice AI, SaaS, Funnels, Forms, Surveys
- Fixed duplicate CRM tool registrations across modules

### SXO Content Engine
- SXO Blog Writer: self-improving content that learns from every post
- SXO Radial Burst: origin on 0nmcp.com → Dev.to → LinkedIn → all social channels
- CRM blog posting + social drafting integration
- OG image auto-inclusion in Dev.to radial burst

### 0n Standard
- `brand.0n` template — complete brand profile for all 0n services
- 0n Field Standard — universal field resolution across all services
- 0n Everywhere — universal product template, 7 distribution channels per feature

### Onboarding & Distribution
- `npx 0nmcp install` — one-command onboarding
- Viral social post generator in install flow (PACG multi-platform)
- CRM Marketplace apps: autoresponder, lead scorer, content AI + shared OAuth/webhook lib
- Grok/any-AI setup guide

### Stats (verified)
- **819 total tools** — 545 catalog + 245 CRM + 4 vault + 8 container + 6 deed + 6 engine + 5 app
- **48 services** across **21 categories**
- **1,078 total capabilities** — 104 actions + 155 triggers

## [2.4.0] — 2026-03-12

### Zero-Knowledge Capability Proxy
- All service API calls now route through `CapabilityProxy` — credentials borrowed in-memory, wiped after each call
- Rate limiting (`ratelimit.js`) fully wired for all 54 services — no more unthrottled calls
- Audit log at `~/.0n/history/audit.jsonl` — every API call tracked, no credentials in logs
- Retry with exponential backoff on 429/5xx responses
- CRM tools use `callWithCredentials()` for per-call access_token pattern
- **54 services** (up from 53) — Whimsical added (18 endpoints)
- **594 catalog endpoints**, **~870 total tools**

### Docker & Registry
- Official Dockerfile for containerized MCP deployment (Node 18 Alpine)
- Glama MCP directory listing compatibility
- `.well-known/0n-manifest.json` for AI crawler discovery

## [2.3.0] — 2026-03-08

### 5 New Services + Conversion Layer
- **850 total tools** (up from 819) — 576 catalog + 245 CRM + 4 vault + 8 vault container + 6 deed + 6 engine + 5 app
- **53 services** (up from 48) across **23 categories** (up from 21)
- **1,142 total capabilities** — 104 actions + 155 triggers
- New services: Cloudflare (DNS, Workers, KV), GoDaddy (domains), n8n (self-hosted automation), Pabbly (workflows), Make (scenarios)
- Resend expanded from 3→67 endpoints — full API coverage
- **ACTION_ALIASES conversion layer** — 150+ intuitive action mappings for .0n SWITCH files
- **Connection auto-enrichment** — workflow runner injects locationId, pipelineId, projectRef from .0n connection metadata
- **Enhanced API validation** — CRM, Anthropic, Vercel verification endpoints

### Universal Authentication (RFC 8628 Device Authorization Grant)
- CLI `login`, `logout`, `whoami`, `version` commands
- Device Authorization Grant flow (RFC 8628) — works in headless/SSH environments
- Token refresh with rotation (old tokens immediately invalidated)
- Machine-bound local token encryption (AES-256-GCM + PBKDF2-SHA512)
- Auth audit trail — all auth events logged with device fingerprint
- Rate-limited device code + polling endpoints
- Device management web console

### E2E Encrypted Vault Sync
- Cross-platform credential sync (CLI <> Web <> Extension)
- Argon2id + AES-256-GCM end-to-end encryption — server never sees plaintext
- Conflict resolution with vector clocks
- Offline-first with automatic reconciliation on reconnect

## [2.2.0] — 2026-02-28

### Massive Service Expansion
- **819 total tools** (up from 564) — 545 catalog + 245 CRM + 12 vault + 6 deed + 6 engine + 5 app
- **48 services** (up from 26) across **21 categories** (up from 13)
- **1,078 total capabilities** — 104 actions + 155 triggers
- New services: QuickBooks, Asana, Intercom, Dropbox, WhatsApp, Instagram, Twitter/X Ads, TikTok, Google Ads, Facebook Ads, Plaid, Square, LinkedIn Ads, SmartLead, Zapier, MuleSoft, Azure, Pipedrive, LinkedIn, and more
- AI Mode (Claude) + Keyword Fallback — works with or without Anthropic API key
- Improved rate limiting and retry logic across all services

## [2.1.0] — 2026-02-25

### Business Deed Transfer System
- 6 new tools: `deed_create`, `deed_open`, `deed_inspect`, `deed_verify`, `deed_accept`, `deed_import`
- Package entire business digital assets into encrypted .0nv containers
- Chain of custody tracking with transfer history in audit_trail layer
- Auto-detection of credentials from .env/JSON/CSV via engine mapper
- Lifecycle: CREATE → PACKAGE → ESCROW → ACCEPT → IMPORT → FLIP
- 21/21 tests pass

## [2.0.0] — 2026-02-24

### 0nVault Container System (Patent Pending #63/990,046)
- 8 new tools: `vault_container_create/open/inspect/verify` + `escrow_create/escrow_unwrap/transfer/revoke`
- 7 semantic layers: workflows, credentials, env_vars, mcp_configs, site_profiles, ai_brain, audit_trail
- Argon2id double-encryption for credential layer
- X25519 ECDH multi-party escrow (up to 8 parties, per-layer access matrix)
- Seal of Truth: SHA3-256 content-addressed integrity verification
- Ed25519 digital signatures, binary .0nv container format (magic: 0x304E5350)
- Transfer registry with replay prevention
- 48/48 tests pass

### Application Engine
- 5 new app tools for building, distributing, and scheduling .0n applications
- CronScheduler class + HTTP middleware for app routes
- 12 engine files total

## [1.7.0] — 2026-02-15

### Major Release
- 550 tools across 26 services in 13 categories — 708 total capabilities
- .0n Conversion Engine: import credentials from .env/CSV/JSON, auto-map to 26 services
- Generate configs for 7 AI platforms (Claude Desktop, Cursor, Windsurf, Gemini, Continue, Cline, OpenAI)
- Application Engine: build, distribute, inspect, validate portable .0n app bundles
- Named Runs / Hotkeys: define command aliases, run as `0nmcp launch`
- Interactive Shell: `0nmcp shell` starts REPL for `/command` execution

## [1.6.0] — 2026-02-10

### .0n Conversion Engine
- 6 new tools: `engine_import`, `engine_verify`, `engine_platforms`, `engine_export`, `engine_bundle`, `engine_open`
- Portable encryption: passphrase-only AES-256-GCM (no machine fingerprint)
- Import from .env/CSV/JSON → auto-map to 26 services → verify API keys
- 30/30 tests pass

## [1.5.0] — 2026-02-05

### Vault Module
- 4 tools: `vault_seal`, `vault_unseal`, `vault_verify`, `vault_fingerprint`
- AES-256-GCM + PBKDF2-SHA512 (100K iterations) + hardware fingerprint binding
- Machine-bound encrypted credential storage
- 13/13 tests pass
