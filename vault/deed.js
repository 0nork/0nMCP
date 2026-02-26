// ============================================================
// 0nMCP — Vault: Business Deed
// ============================================================
// Digital Business Asset Transfer System.
// Packages an entire business's digital assets (API keys, logins,
// credentials, configurations, workflows, AI prompts) into a
// single verifiable, transferable, encrypted .0nv container.
//
// Lifecycle: CREATE > PACKAGE > ESCROW > ACCEPT > IMPORT > FLIP
//
// Patent Pending: US Provisional Patent Application #63/990,046
// ============================================================

import { join } from "path";
import { homedir } from "os";
import { existsSync, mkdirSync } from "fs";
import { assembleContainer, disassembleContainer, inspectContainer, saveContainer, loadContainer } from "./container.js";
import { LAYER_NAMES } from "./layers.js";
import { createSeal } from "./seal.js";
import { generateSigningKeyPair, sign, sha3Hex } from "./crypto-container.js";
import { registerTransfer, lookupTransfer } from "./registry.js";
import { collectCredentials } from "./deed-collector.js";
import { importDeedToSystem } from "./deed-importer.js";

const VAULT_DIR = join(homedir(), ".0n", "vault");
const DEED_VERSION = "1.0.0";

function ensureVaultDir() {
  if (!existsSync(VAULT_DIR)) mkdirSync(VAULT_DIR, { recursive: true });
}

// ── Deed Metadata Builder ───────────────────────────────────

function buildDeedMetadata(options, services, credentialCount) {
  return {
    deed: {
      version: DEED_VERSION,
      type: "business_deed",
      business: {
        name: options.name || "Unnamed Business",
        domain: options.domain || null,
        description: options.description || null,
        valuation: options.valuation || null,
        currency: options.currency || "USD",
      },
      creator: {
        name: options.creatorName || null,
        email: options.creatorEmail || null,
      },
      services,
      credential_count: credentialCount,
      transfer_history: [],
      created: new Date().toISOString(),
    },
  };
}

// ── BusinessDeed Class ──────────────────────────────────────

export class BusinessDeed {

  /**
   * Create a new Business Deed — package credentials into a .0nv file.
   *
   * @param {Object} options
   * @param {string} options.name - Business name
   * @param {string} [options.domain] - Business domain
   * @param {string} [options.description] - Business description
   * @param {number} [options.valuation] - Business valuation
   * @param {string} [options.currency] - Currency code (default: USD)
   * @param {string} [options.creatorName] - Creator's name
   * @param {string} [options.creatorEmail] - Creator's email
   * @param {Object} [options.credentials] - Pre-structured credentials { service: { field: value } }
   * @param {Array}  [options.workflows] - Workflow definitions
   * @param {Object} [options.envVars] - Environment variables
   * @param {Object} [options.mcpConfigs] - MCP server configurations
   * @param {Object} [options.siteProfiles] - Site/CRO profiles
   * @param {Object} [options.aiBrain] - AI agent data, prompts, memory
   * @param {string} options.passphrase - Encryption passphrase
   * @param {string} [options.output] - Output file path
   * @param {Array}  [options.escrowParties] - Escrow party definitions
   * @param {Object} [options.accessMatrix] - Per-party layer access
   * @returns {Promise<Object>} Created deed info
   */
  async create(options) {
    const {
      credentials = {},
      workflows = [],
      envVars = {},
      mcpConfigs = {},
      siteProfiles = {},
      aiBrain = {},
      passphrase,
      output,
      escrowParties = [],
      accessMatrix = {},
    } = options;

    if (!passphrase) throw new Error("Passphrase is required");

    // Determine services from credentials
    const services = Object.keys(credentials);
    const credentialCount = services.reduce((sum, svc) => sum + Object.keys(credentials[svc]).length, 0);

    // Build deed metadata
    const deedMeta = buildDeedMetadata(options, services, credentialCount);

    // Assemble all 7 layers
    const layers = {};
    if (workflows.length > 0) layers.workflows = workflows;
    if (Object.keys(credentials).length > 0) layers.credentials = credentials;
    if (Object.keys(envVars).length > 0) layers.env_vars = envVars;
    if (Object.keys(mcpConfigs).length > 0) layers.mcp_configs = mcpConfigs;
    if (Object.keys(siteProfiles).length > 0) layers.site_profiles = siteProfiles;
    if (Object.keys(aiBrain).length > 0) layers.ai_brain = aiBrain;

    // Audit trail always includes deed metadata
    layers.audit_trail = deedMeta;

    // Ensure at least credentials or some layer has data
    if (Object.keys(layers).length <= 1) {
      throw new Error("Deed must contain at least one data layer (credentials, workflows, env_vars, etc.)");
    }

    const result = await assembleContainer({
      layers,
      passphrase,
      escrowParties,
      accessMatrix,
      metadata: { type: "business_deed", business: options.name },
    });

    // Save to file
    ensureVaultDir();
    const filePath = output || join(VAULT_DIR, `deed-${result.transferId}.0nv`);
    const savedPath = saveContainer(result.buffer, filePath);

    return {
      file: savedPath,
      transferId: result.transferId,
      sealHex: result.sealHex,
      publicKey: result.publicKey.toString("hex"),
      services,
      credentialCount,
      layerCount: result.layerCount,
      layers: result.layers,
      containerSize: result.buffer.length,
      business: deedMeta.deed.business,
      timestamp: new Date(result.timestamp).toISOString(),
    };
  }

  /**
   * Open a deed — decrypt and return all layer data.
   *
   * @param {string} filePath - Path to .0nv file
   * @param {string} passphrase - Decryption passphrase
   * @param {string[]} [onlyLayers] - Only decrypt these layers
   * @returns {Promise<Object>}
   */
  async open(filePath, passphrase, onlyLayers = null) {
    const buffer = loadContainer(filePath);
    const result = await disassembleContainer(buffer, passphrase, onlyLayers);

    // Extract deed metadata from audit_trail
    const deedMeta = result.layers.audit_trail?.deed || null;

    return {
      ...result,
      deed: deedMeta,
    };
  }

  /**
   * Inspect a deed without decrypting — metadata + seal only.
   *
   * @param {string} filePath
   * @returns {Object}
   */
  inspect(filePath) {
    const buffer = loadContainer(filePath);
    const info = inspectContainer(buffer);

    // Check registry for transfer history
    const transfer = lookupTransfer(info.metadata.transferId);

    return {
      ...info,
      type: "business_deed",
      transfer: transfer.found ? transfer.transfer : null,
    };
  }

  /**
   * Verify deed integrity — Seal of Truth + Ed25519 signature.
   *
   * @param {string} filePath
   * @returns {Object}
   */
  verify(filePath) {
    const buffer = loadContainer(filePath);
    const info = inspectContainer(buffer);
    const transfer = lookupTransfer(info.metadata.transferId);

    return {
      verified: info.seal.valid && info.signature.valid,
      seal: info.seal,
      signature: info.signature,
      transferId: info.metadata.transferId,
      created: info.metadata.created,
      transfer: transfer.found ? transfer.transfer : null,
      patent: info.patent,
    };
  }

  /**
   * Accept a deed transfer — buyer signs acceptance with chain of custody.
   * Opens the deed, records the acceptance in the audit trail,
   * and creates a new container with updated transfer history.
   *
   * @param {string} filePath - Path to .0nv deed
   * @param {string} passphrase - Deed passphrase
   * @param {Object} buyer - { name, email }
   * @param {string} [newPassphrase] - Optional new passphrase for re-encrypted deed
   * @param {string} [outputPath] - Optional output path for accepted deed
   * @returns {Promise<Object>}
   */
  async accept(filePath, passphrase, buyer, newPassphrase = null, outputPath = null) {
    // Open existing deed
    const buffer = loadContainer(filePath);
    const result = await disassembleContainer(buffer, passphrase);

    if (!result.seal.valid || !result.signature.valid) {
      throw new Error("Cannot accept deed — seal or signature verification failed");
    }

    const deedMeta = result.layers.audit_trail?.deed;
    if (!deedMeta) {
      throw new Error("Not a valid business deed — no deed metadata found in audit_trail");
    }

    // Record acceptance in transfer history
    const acceptanceRecord = {
      action: "accept",
      from: deedMeta.creator,
      to: { name: buyer.name, email: buyer.email },
      timestamp: new Date().toISOString(),
      originalSeal: result.seal.hash,
      originalTransferId: result.metadata.transferId,
    };

    deedMeta.transfer_history.push(acceptanceRecord);
    deedMeta.creator = { name: buyer.name, email: buyer.email };
    result.layers.audit_trail.deed = deedMeta;

    // Re-create container with updated audit trail (optionally with new passphrase)
    const usePassphrase = newPassphrase || passphrase;
    const newResult = await assembleContainer({
      layers: result.layers,
      passphrase: usePassphrase,
      metadata: { type: "business_deed_accepted", buyer: buyer.name },
    });

    ensureVaultDir();
    const outPath = outputPath || join(VAULT_DIR, `deed-accepted-${newResult.transferId}.0nv`);
    const savedPath = saveContainer(newResult.buffer, outPath);

    return {
      file: savedPath,
      transferId: newResult.transferId,
      sealHex: newResult.sealHex,
      previousTransferId: result.metadata.transferId,
      previousSeal: result.seal.hash,
      buyer,
      services: deedMeta.services,
      credentialCount: deedMeta.credential_count,
      transferHistory: deedMeta.transfer_history,
    };
  }

  /**
   * Import a deed — decrypt and write to live system configuration.
   *
   * @param {string} filePath - Path to .0nv deed
   * @param {string} passphrase - Decryption passphrase
   * @param {string} [targetDir] - Target ~/.0n/ directory
   * @returns {Promise<Object>} Import report
   */
  async importDeed(filePath, passphrase, targetDir = null) {
    const buffer = loadContainer(filePath);
    const result = await disassembleContainer(buffer, passphrase);

    if (!result.seal.valid || !result.signature.valid) {
      throw new Error("Cannot import deed — seal or signature verification failed");
    }

    return importDeedToSystem(result.layers, targetDir);
  }

  /**
   * Export — collect credentials from sources and package as deed in one step.
   *
   * @param {Object} sources - { envFile, jsonFile, csvFile, connectionsDir, manual }
   * @param {Object} options - Same as create() options
   * @returns {Promise<Object>}
   */
  async export(sources, options) {
    const collected = await collectCredentials(sources);

    return this.create({
      ...options,
      credentials: collected.credentials,
      envVars: collected.envVars,
      services: collected.services,
    });
  }
}

export const DEED_VERSION_STR = DEED_VERSION;
