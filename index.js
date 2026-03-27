#!/usr/bin/env node
// ============================================================
//
//   ██████╗ ███╗   ██╗███╗   ███╗ ██████╗██████╗
//  ██╔═████╗████╗  ██║████╗ ████║██╔════╝██╔══██╗
//  ██║██╔██║██╔██╗ ██║██╔████╔██║██║     ██████╔╝
//  ████╔╝██║██║╚██╗██║██║╚██╔╝██║██║     ██╔═══╝
//  ╚██████╔╝██║ ╚████║██║ ╚═╝ ██║╚██████╗██║
//   ╚═════╝ ╚═╝  ╚═══╝╚═╝     ╚═╝ ╚═════╝╚═╝
//
//  Universal AI-Powered API Orchestrator
//  Connect services. Describe tasks. AI handles the rest.
//
//  Implements the .0n Standard: https://github.com/0nork/0n-spec
//  Config: ~/.0n/ | Connections: ~/.0n/connections/*.0n
//
//  https://github.com/0nork/0nMCP
//  MIT License — Open Source
//
// ============================================================

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

import { ConnectionManager } from "./connections.js";
import { Orchestrator } from "./orchestrator.js";
import { WorkflowRunner } from "./workflow.js";
import { registerAllTools } from "./tools.js";
import { registerCrmTools } from "./crm/index.js";
import { registerVaultTools, autoUnseal } from "./vault/index.js";
import { registerContainerTools } from "./vault/tools-container.js";
import { registerDeedTools } from "./vault/tools-deed.js";
import { unsealedCache } from "./vault/cache.js";
import { registerEngineTools, registerTrainingTools, registerFeedTools, registerCouncilTools, registerSxoWriterTools } from "./engine/index.js";
import { registerBrainTools } from "./engine/brain.js";
import { registerLocalAITools } from "./engine/local-ai.js";
import { CapabilityProxy } from "./capability-proxy.js";
import { SERVICE_CATALOG } from "./catalog.js";

// ── Initialize ─────────────────────────────────────────────
const connections = new ConnectionManager();
connections._vaultCache = unsealedCache;
const proxy = new CapabilityProxy(connections, SERVICE_CATALOG);
const orchestrator = new Orchestrator(connections, proxy);
const workflowRunner = new WorkflowRunner(connections, proxy);

const server = new McpServer({
  name: "0nMCP",
  version: "2.2.0",
});

// ============================================================
// REGISTER ALL TOOLS
// ============================================================

registerAllTools(server, connections, orchestrator, workflowRunner, proxy);

// ============================================================
// SERVICE-SPECIFIC TOOLS
// ============================================================

import { z } from "zod";
registerCrmTools(server, z, proxy);

// ============================================================
// VAULT TOOLS (machine-bound credential encryption)
// ============================================================

registerVaultTools(server, z);

// Auto-unseal sealed connections if ON_VAULT_PASSPHRASE is set
const vaultResult = autoUnseal();
if (vaultResult.unsealed.length > 0) {
  console.error(`Vault: auto-unsealed ${vaultResult.unsealed.length} connection(s)`);
}

// ============================================================
// ENGINE TOOLS (.0n conversion engine + AI brain bundles)
// ============================================================

registerEngineTools(server, z);

// ============================================================
// 0nAI TRAINING CENTER
// ============================================================

registerTrainingTools(server, z);
registerFeedTools(server, z);
registerCouncilTools(server, z);
registerSxoWriterTools(server, z);
registerBrainTools(server, z);
registerLocalAITools(server, z);

// ============================================================
// VAULT CONTAINER TOOLS (patent-pending 0nVault containers)
// ============================================================

registerContainerTools(server, z);

// ============================================================
// BUSINESS DEED TOOLS (digital asset transfer system)
// ============================================================

registerDeedTools(server, z);

// ============================================================
// START SERVER (stdio transport)
// ============================================================

const transport = new StdioServerTransport();
await server.connect(transport);
