// ============================================================
// 0nMCP — Vault: Business Deed MCP Tools
// ============================================================
// 6 MCP tools for the Business Deed digital asset transfer system.
//
// Patent Pending: US Provisional Patent Application #63/990,046
// ============================================================

import { BusinessDeed } from "./deed.js";
import { collectCredentials, validateCollected } from "./deed-collector.js";
import { LAYER_NAMES } from "./layers.js";

const deed = new BusinessDeed();

/**
 * Register Business Deed tools on an MCP server.
 *
 * @param {import("@modelcontextprotocol/sdk/server/mcp.js").McpServer} server
 * @param {import("zod").ZodType} z
 */
export function registerDeedTools(server, z) {

  // ─── deed_create ────────────────────────────────────────────
  server.tool(
    "deed_create",
    `Create a Business Deed — package an entire business's digital assets into a single
encrypted, verifiable .0nv container file. Includes API keys, credentials, workflows,
configs, and AI data across 7 semantic layers with Argon2id double-encryption for secrets.

This is the digital equivalent of signing over a business deed — one file that proves
ownership, packages all operational credentials, and enables instant activation.

Lifecycle: CREATE > PACKAGE > ESCROW > ACCEPT > IMPORT

Patent Pending: US Provisional Patent Application #63/990,046

Example: deed_create({
  name: "My SaaS Business",
  passphrase: "secure-pass",
  credentials: { stripe: { apiKey: "sk_..." }, github: { token: "ghp_..." } },
  envVars: { DATABASE_URL: "postgres://..." }
})`,
    {
      name: z.string().describe("Business name"),
      passphrase: z.string().describe("Encryption passphrase for the deed"),
      domain: z.string().optional().describe("Business domain (e.g., example.com)"),
      description: z.string().optional().describe("Business description"),
      valuation: z.number().optional().describe("Business valuation amount"),
      currency: z.string().optional().describe("Currency code (default: USD)"),
      creatorName: z.string().optional().describe("Creator's name"),
      creatorEmail: z.string().optional().describe("Creator's email"),
      credentials: z.record(z.record(z.string())).optional().describe("Service credentials: { service: { field: value } }"),
      workflows: z.array(z.any()).optional().describe("Workflow definitions to include"),
      envVars: z.record(z.string()).optional().describe("Environment variables to include"),
      mcpConfigs: z.record(z.any()).optional().describe("MCP server configurations"),
      siteProfiles: z.record(z.any()).optional().describe("Site/CRO profiles"),
      aiBrain: z.record(z.any()).optional().describe("AI agent data, prompts, memory"),
      output: z.string().optional().describe("Output .0nv file path"),
    },
    async (params) => {
      try {
        const result = await deed.create(params);

        return {
          content: [{ type: "text", text: JSON.stringify({
            success: true,
            ...result,
            patent: "US Provisional #63/990,046",
          }, null, 2) }],
        };
      } catch (err) {
        return {
          content: [{ type: "text", text: JSON.stringify({
            success: false, error: err.message,
          }, null, 2) }],
        };
      }
    }
  );

  // ─── deed_open ──────────────────────────────────────────────
  server.tool(
    "deed_open",
    `Open and decrypt a Business Deed (.0nv file).
Verifies Ed25519 signature and Seal of Truth, then decrypts all layers.
Returns credentials, workflows, configs, and deed metadata.

Example: deed_open({ file: "deed-abc123.0nv", passphrase: "secure-pass" })`,
    {
      file: z.string().describe("Path to .0nv deed file"),
      passphrase: z.string().describe("Decryption passphrase"),
      layers: z.array(z.string()).optional().describe("Only decrypt these layers (default: all)"),
    },
    async ({ file, passphrase, layers: onlyLayers }) => {
      try {
        const result = await deed.open(file, passphrase, onlyLayers || null);

        return {
          content: [{ type: "text", text: JSON.stringify({
            success: true,
            ...result,
          }, null, 2) }],
        };
      } catch (err) {
        return {
          content: [{ type: "text", text: JSON.stringify({
            success: false, error: err.message,
          }, null, 2) }],
        };
      }
    }
  );

  // ─── deed_inspect ───────────────────────────────────────────
  server.tool(
    "deed_inspect",
    `Inspect a Business Deed without decrypting.
Shows business name, services, layer info, seal verification, and transfer history.
No passphrase required — all metadata is public.

Example: deed_inspect({ file: "deed-abc123.0nv" })`,
    {
      file: z.string().describe("Path to .0nv deed file"),
    },
    async ({ file }) => {
      try {
        const result = deed.inspect(file);

        return {
          content: [{ type: "text", text: JSON.stringify({
            success: true,
            ...result,
          }, null, 2) }],
        };
      } catch (err) {
        return {
          content: [{ type: "text", text: JSON.stringify({
            success: false, error: err.message,
          }, null, 2) }],
        };
      }
    }
  );

  // ─── deed_verify ────────────────────────────────────────────
  server.tool(
    "deed_verify",
    `Verify a Business Deed's Seal of Truth and Ed25519 signature.
Confirms the deed is authentic, unmodified, and from the original creator.
Also checks the transfer registry for chain of custody.

Example: deed_verify({ file: "deed-abc123.0nv" })`,
    {
      file: z.string().describe("Path to .0nv deed file"),
    },
    async ({ file }) => {
      try {
        const result = deed.verify(file);

        return {
          content: [{ type: "text", text: JSON.stringify({
            success: true,
            ...result,
          }, null, 2) }],
        };
      } catch (err) {
        return {
          content: [{ type: "text", text: JSON.stringify({
            success: false, error: err.message,
          }, null, 2) }],
        };
      }
    }
  );

  // ─── deed_accept ────────────────────────────────────────────
  server.tool(
    "deed_accept",
    `Accept a Business Deed transfer — buyer signs acceptance with chain of custody.
Creates a new deed container with updated transfer history and optionally re-encrypts
with a new passphrase for the buyer.

Example: deed_accept({
  file: "deed-abc123.0nv",
  passphrase: "seller-pass",
  buyerName: "New Owner",
  buyerEmail: "buyer@example.com"
})`,
    {
      file: z.string().describe("Path to .0nv deed file"),
      passphrase: z.string().describe("Current deed passphrase"),
      buyerName: z.string().describe("Buyer's name"),
      buyerEmail: z.string().describe("Buyer's email"),
      newPassphrase: z.string().optional().describe("New passphrase for re-encrypted deed"),
      output: z.string().optional().describe("Output path for accepted deed"),
    },
    async ({ file, passphrase, buyerName, buyerEmail, newPassphrase, output }) => {
      try {
        const result = await deed.accept(
          file,
          passphrase,
          { name: buyerName, email: buyerEmail },
          newPassphrase || null,
          output || null
        );

        return {
          content: [{ type: "text", text: JSON.stringify({
            success: true,
            ...result,
          }, null, 2) }],
        };
      } catch (err) {
        return {
          content: [{ type: "text", text: JSON.stringify({
            success: false, error: err.message,
          }, null, 2) }],
        };
      }
    }
  );

  // ─── deed_import ────────────────────────────────────────────
  server.tool(
    "deed_import",
    `Import a Business Deed — decrypt and write credentials to live system config.
Writes .0n connection files, .env file, MCP configs, workflows, and AI brain data.
The deed's Seal of Truth and signature are verified before import.

Example: deed_import({ file: "deed-abc123.0nv", passphrase: "secure-pass" })`,
    {
      file: z.string().describe("Path to .0nv deed file"),
      passphrase: z.string().describe("Decryption passphrase"),
      targetDir: z.string().optional().describe("Target directory (default: ~/.0n/)"),
    },
    async ({ file, passphrase, targetDir }) => {
      try {
        const result = await deed.importDeed(file, passphrase, targetDir || null);

        return {
          content: [{ type: "text", text: JSON.stringify({
            success: true,
            ...result,
          }, null, 2) }],
        };
      } catch (err) {
        return {
          content: [{ type: "text", text: JSON.stringify({
            success: false, error: err.message,
          }, null, 2) }],
        };
      }
    }
  );
}

export const DEED_TOOL_COUNT = 6;
