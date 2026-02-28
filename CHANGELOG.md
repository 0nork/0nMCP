# Changelog

All notable changes to 0nMCP are documented here.

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
