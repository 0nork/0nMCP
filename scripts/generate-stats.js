#!/usr/bin/env node

/**
 * ═══════════════════════════════════════════════════════════════
 * 0nMCP — Dynamic Stats Generator
 * ═══════════════════════════════════════════════════════════════
 * 
 * Reads catalog.json (the single source of truth) and:
 *   1. Generates stats.json (consumed by homepage, README, API)
 *   2. Updates package.json description with live counts
 *   3. Outputs badge-friendly numbers for shields.io
 * 
 * Usage:
 *   node scripts/generate-stats.js          # generate stats.json
 *   node scripts/generate-stats.js --badge  # output badge JSON
 *   node scripts/generate-stats.js --patch  # update package.json
 *   node scripts/generate-stats.js --all    # do everything
 * 
 * ═══════════════════════════════════════════════════════════════
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');

// ── Load catalog ────────────────────────────────────────────
const catalogPath = resolve(ROOT, 'lib', 'catalog.json');
if (!existsSync(catalogPath)) {
  console.error('❌ catalog.json not found at', catalogPath);
  process.exit(1);
}

const catalog = JSON.parse(readFileSync(catalogPath, 'utf-8'));
const services = catalog.services;

// ── Compute counts ──────────────────────────────────────────
const stats = {
  generated: new Date().toISOString(),
  catalogVersion: catalog._meta.version,
  
  // Top-level counts
  services: services.length,
  tools: 0,
  actions: 0,
  triggers: 0,
  categories: Object.keys(catalog.categories).length,
  
  // Per-service breakdown
  perService: {},
  
  // Per-category breakdown
  perCategory: {},
  
  // Flat lists (for API consumers)
  allTools: [],
  allActions: [],
  allTriggers: [],
  allServiceIds: [],
};

for (const svc of services) {
  const toolCount = svc.tools?.length || 0;
  const actionCount = svc.actions?.length || 0;
  const triggerCount = svc.triggers?.length || 0;
  
  stats.tools += toolCount;
  stats.actions += actionCount;
  stats.triggers += triggerCount;
  
  stats.perService[svc.id] = {
    name: svc.name,
    category: svc.category,
    tools: toolCount,
    actions: actionCount,
    triggers: triggerCount,
    total: toolCount + actionCount + triggerCount,
  };
  
  // Aggregate by category
  if (!stats.perCategory[svc.category]) {
    stats.perCategory[svc.category] = {
      label: catalog.categories[svc.category]?.label || svc.category,
      services: 0,
      tools: 0,
      actions: 0,
      triggers: 0,
    };
  }
  stats.perCategory[svc.category].services += 1;
  stats.perCategory[svc.category].tools += toolCount;
  stats.perCategory[svc.category].actions += actionCount;
  stats.perCategory[svc.category].triggers += triggerCount;
  
  // Flat lists
  stats.allTools.push(...(svc.tools || []));
  stats.allActions.push(...(svc.actions || []));
  stats.allTriggers.push(...(svc.triggers || []));
  stats.allServiceIds.push(svc.id);
}

// CRM module tools (registered separately via registerCrmTools, not in catalog.json)
stats.crmTools = 245;

// Vault module tools (vault_seal, vault_unseal, vault_verify, vault_fingerprint)
stats.vaultTools = 4;

// Vault container tools (vault_container_create, open, inspect, verify, escrow_create, escrow_unwrap, transfer, revoke)
stats.vaultContainerTools = 8;

// Deed transfer tools (deed_create, deed_open, deed_inspect, deed_verify, deed_accept, deed_import)
stats.deedTools = 6;

// Engine module tools (engine_import, engine_verify, engine_platforms, engine_export, engine_bundle, engine_open)
stats.engineTools = 6;

// Application engine tools (app_build, app_open, app_inspect, app_validate, app_list)
stats.appTools = 5;

stats.totalTools = stats.tools + stats.crmTools + stats.vaultTools + (stats.vaultContainerTools || 0) + (stats.deedTools || 0) + stats.engineTools + stats.appTools;

// Total capabilities = tools + CRM tools + vault tools + actions + triggers
stats.totalCapabilities = stats.totalTools + stats.actions + stats.triggers;

// ── Parse CLI flags ─────────────────────────────────────────
const args = process.argv.slice(2);
const doAll = args.includes('--all');
const doBadge = args.includes('--badge') || doAll;
const doPatch = args.includes('--patch') || doAll;
const doReadme = args.includes('--readme') || doAll;

// ── 1. Write stats.json ─────────────────────────────────────
const statsPath = resolve(ROOT, 'lib', 'stats.json');
writeFileSync(statsPath, JSON.stringify(stats, null, 2));
console.log(`✅ stats.json written → ${stats.tools} tools, ${stats.actions} actions, ${stats.triggers} triggers across ${stats.services} services`);

// ── 2. Badge output for shields.io ──────────────────────────
if (doBadge) {
  const badges = {
    tools: {
      schemaVersion: 1,
      label: "tools",
      message: String(stats.tools),
      color: "00ff88",
    },
    services: {
      schemaVersion: 1,
      label: "services",
      message: String(stats.services),
      color: "00d4ff",
    },
    actions: {
      schemaVersion: 1,
      label: "actions",
      message: String(stats.actions),
      color: "ff6b35",
    },
    triggers: {
      schemaVersion: 1,
      label: "triggers",
      message: String(stats.triggers),
      color: "9945ff",
    },
    total: {
      schemaVersion: 1,
      label: "capabilities",
      message: String(stats.totalCapabilities),
      color: "00ff88",
    },
  };
  
  const badgePath = resolve(ROOT, 'lib', 'badges.json');
  writeFileSync(badgePath, JSON.stringify(badges, null, 2));
  console.log(`✅ badges.json written (for shields.io dynamic badges)`);
}

// ── 3. Update package.json description ──────────────────────
if (doPatch) {
  const pkgPath = resolve(ROOT, 'package.json');
  if (existsSync(pkgPath)) {
    const pkg = JSON.parse(readFileSync(pkgPath, 'utf-8'));
    pkg.description = `Universal AI API Orchestrator — ${stats.totalTools} tools, ${stats.services} services, portable AI Brain bundles + machine-bound vault encryption + Application Engine. The most comprehensive MCP server available. Free and open source from 0nORK.`;

    // Also update a custom stats field in package.json
    pkg['0nmcp-stats'] = {
      tools: stats.tools,
      crmTools: stats.crmTools,
      vaultTools: stats.vaultTools,
      vaultContainerTools: stats.vaultContainerTools,
      deedTools: stats.deedTools,
      engineTools: stats.engineTools,
      appTools: stats.appTools,
      totalTools: stats.totalTools,
      services: stats.services,
      actions: stats.actions,
      triggers: stats.triggers,
      totalCapabilities: stats.totalCapabilities,
      categories: stats.categories,
      lastUpdated: stats.generated,
    };
    
    writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n');
    console.log(`✅ package.json updated → description now shows ${stats.tools} tools, ${stats.services} services`);
  }
}

// ── 4. Update README.md badges line ─────────────────────────
if (doReadme) {
  const readmePath = resolve(ROOT, 'README.md');
  if (existsSync(readmePath)) {
    let readme = readFileSync(readmePath, 'utf-8');
    
    // Replace dynamic stat markers
    // Pattern: <!-- STATS:tools --> 252 <!-- /STATS:tools -->
    const replacements = {
      tools: stats.tools,
      services: stats.services,
      actions: stats.actions,
      triggers: stats.triggers,
      capabilities: stats.totalCapabilities,
      categories: stats.categories,
    };
    
    for (const [key, value] of Object.entries(replacements)) {
      const regex = new RegExp(
        `<!-- STATS:${key} -->.*?<!-- /STATS:${key} -->`,
        'g'
      );
      readme = readme.replace(regex, `<!-- STATS:${key} -->${value}<!-- /STATS:${key} -->`);
    }
    
    writeFileSync(readmePath, readme);
    console.log(`✅ README.md updated with live stats`);
  }
}

// ── Summary ─────────────────────────────────────────────────
console.log('\n📊 0nMCP Catalog Summary:');
console.log(`   Services:     ${stats.services}`);
console.log(`   Catalog Tools:${String(stats.tools).padStart(4)}`);
console.log(`   CRM Tools:   ${stats.crmTools}`);
console.log(`   Vault Tools:  ${stats.vaultTools}`);
console.log(`   Container:    ${stats.vaultContainerTools}`);
console.log(`   Deed Tools:   ${stats.deedTools}`);
console.log(`   Engine Tools: ${stats.engineTools}`);
console.log(`   App Tools:    ${stats.appTools}`);
console.log(`   Total Tools:  ${stats.totalTools}`);
console.log(`   Actions:     ${stats.actions}`);
console.log(`   Triggers:    ${stats.triggers}`);
console.log(`   ─────────────────`);
console.log(`   Total:        ${stats.totalCapabilities} capabilities`);
console.log(`   Categories:   ${stats.categories}`);
console.log('');

// Per-category table
console.log('   Category      Svc  Tools  Actions  Triggers');
console.log('   ──────────    ───  ─────  ───────  ────────');
for (const [cat, data] of Object.entries(stats.perCategory)) {
  console.log(
    `   ${data.label.padEnd(13)} ${String(data.services).padStart(3)}  ${String(data.tools).padStart(5)}  ${String(data.actions).padStart(7)}  ${String(data.triggers).padStart(8)}`
  );
}

export default stats;
