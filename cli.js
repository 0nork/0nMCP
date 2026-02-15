#!/usr/bin/env node
/**
 * ═══════════════════════════════════════════════════════════════════════════
 * 0nMCP - CLI
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * Usage:
 *   npx 0nmcp              Start MCP server (stdio)
 *   npx 0nmcp serve        Start HTTP server (REST + MCP + webhooks)
 *   npx 0nmcp run <wf>     Run a .0n workflow from CLI
 *   npx 0nmcp init         Initialize ~/.0n directory
 *   npx 0nmcp connect      Interactive connection setup
 *   npx 0nmcp list         List connected services
 *   npx 0nmcp migrate      Migrate from ~/.0nmcp to ~/.0n
 *   npx 0nmcp engine       Engine commands (import, verify, platforms, export, open)
 * 
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import os from 'os';
import readline from 'readline';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Colors
const c = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

const BANNER = `
${c.cyan}${c.bright}
   ██████╗ ███╗   ██╗███╗   ███╗ ██████╗██████╗ 
  ██╔═████╗████╗  ██║████╗ ████║██╔════╝██╔══██╗
  ██║██╔██║██╔██╗ ██║██╔████╔██║██║     ██████╔╝
  ████╔╝██║██║╚██╗██║██║╚██╔╝██║██║     ██╔═══╝ 
  ╚██████╔╝██║ ╚████║██║ ╚═╝ ██║╚██████╗██║     
   ╚═════╝ ╚═╝  ╚═══╝╚═╝     ╚═╝ ╚═════╝╚═╝     
${c.reset}
  ${c.bright}Universal AI API Orchestrator${c.reset}
  ${c.cyan}Connect your apps. Say what you want. AI does the rest.${c.reset}
  
  ${c.yellow}https://0nmcp.com${c.reset} | ${c.yellow}https://0nork.com${c.reset}
`;

const DOT_ON_DIR = path.join(os.homedir(), '.0n');

async function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  // No args = start MCP server
  if (!command) {
    // Import and run the server
    await import('./index.js');
    return;
  }

  // Help
  if (command === 'help' || command === '--help' || command === '-h') {
    console.log(BANNER);
    console.log(`
${c.bright}Usage:${c.reset}

  ${c.cyan}npx 0nmcp${c.reset}              Start MCP server (stdio, for Claude Desktop)
  ${c.cyan}npx 0nmcp serve${c.reset}        Start HTTP server (REST + MCP + webhooks)
  ${c.cyan}npx 0nmcp run <wf>${c.reset}     Run a .0n workflow from CLI
  ${c.cyan}npx 0nmcp init${c.reset}         Initialize ~/.0n directory
  ${c.cyan}npx 0nmcp connect${c.reset}      Interactive connection setup
  ${c.cyan}npx 0nmcp list${c.reset}         List connected services
  ${c.cyan}npx 0nmcp migrate${c.reset}      Migrate from ~/.0nmcp to ~/.0n

${c.bright}Engine commands:${c.reset}

  ${c.cyan}npx 0nmcp engine import <file>${c.reset}    Import credentials from .env/CSV/JSON
  ${c.cyan}npx 0nmcp engine verify${c.reset}           Verify all connected API keys
  ${c.cyan}npx 0nmcp engine platforms${c.reset}        Generate AI platform configs
  ${c.cyan}npx 0nmcp engine export${c.reset}           Export .0n bundle (AI Brain)
  ${c.cyan}npx 0nmcp engine open <bundle>${c.reset}    Open/inspect a .0n bundle

${c.bright}Serve options:${c.reset}

  ${c.cyan}npx 0nmcp serve --port 3000 --host 0.0.0.0${c.reset}

${c.bright}Run options:${c.reset}

  ${c.cyan}npx 0nmcp run invoice-notify --input customer_email=test@x.com --input amount=100${c.reset}

${c.bright}Configure Claude Desktop:${c.reset}

  Add to your claude_desktop_config.json:

  {
    "mcpServers": {
      "0nmcp": {
        "command": "npx",
        "args": ["-y", "0nmcp"]
      }
    }
  }

${c.bright}Links:${c.reset}

  Documentation: ${c.yellow}https://0nmcp.com/docs${c.reset}
  GitHub:        ${c.yellow}https://github.com/0nork/0nmcp${c.reset}
  Discord:       ${c.yellow}https://discord.gg/0nmcp${c.reset}
`);
    return;
  }

  // Init
  if (command === 'init') {
    console.log(BANNER);
    initDotOn();
    return;
  }

  // List
  if (command === 'list') {
    console.log(BANNER);
    await listConnections();
    return;
  }

  // Connect
  if (command === 'connect') {
    console.log(BANNER);
    await interactiveConnect();
    return;
  }

  // Serve (HTTP server)
  if (command === 'serve') {
    console.log(BANNER);
    const port = getFlag(args, '--port', 3000);
    const host = getFlag(args, '--host', '0.0.0.0');

    console.log(`${c.bright}Starting HTTP server...${c.reset}\n`);

    const { startServer } = await import('./server.js');
    await startServer({ port: Number(port), host: String(host) });
    return;
  }

  // Run (execute a workflow from CLI)
  if (command === 'run') {
    const workflowName = args[1];
    if (!workflowName) {
      console.log(`${c.red}Usage: npx 0nmcp run <workflow-name> [--input key=value]${c.reset}`);
      process.exit(1);
    }

    // Parse --input flags
    const inputs = {};
    for (let i = 2; i < args.length; i++) {
      if (args[i] === '--input' && args[i + 1]) {
        const [key, ...valueParts] = args[i + 1].split('=');
        const value = valueParts.join('=');
        // Auto-type: numbers and booleans
        if (value === 'true') inputs[key] = true;
        else if (value === 'false') inputs[key] = false;
        else if (!isNaN(value) && value !== '') inputs[key] = Number(value);
        else inputs[key] = value;
        i++;
      }
    }

    console.log(`${c.bright}Running workflow: ${c.cyan}${workflowName}${c.reset}`);
    if (Object.keys(inputs).length > 0) {
      console.log(`${c.bright}Inputs:${c.reset}`, JSON.stringify(inputs, null, 2));
    }
    console.log('');

    try {
      const { ConnectionManager } = await import('./connections.js');
      const { WorkflowRunner } = await import('./workflow.js');

      const connections = new ConnectionManager();
      const runner = new WorkflowRunner(connections);
      const result = await runner.run({ workflowPath: workflowName, inputs });

      if (result.success) {
        console.log(`${c.green}${c.bright}Workflow completed successfully${c.reset}`);
      } else {
        console.log(`${c.red}${c.bright}Workflow failed${c.reset}`);
      }

      console.log(`\n${c.bright}Execution ID:${c.reset} ${result.executionId}`);
      console.log(`${c.bright}Steps:${c.reset} ${result.stepsSuccessful}/${result.stepsExecuted} successful`);
      console.log(`${c.bright}Duration:${c.reset} ${result.duration}ms`);

      if (result.outputs && Object.keys(result.outputs).length > 0) {
        console.log(`\n${c.bright}Outputs:${c.reset}`);
        console.log(JSON.stringify(result.outputs, null, 2));
      }

      if (result.errors.length > 0) {
        console.log(`\n${c.red}${c.bright}Errors:${c.reset}`);
        for (const err of result.errors) {
          console.log(`  ${c.red}●${c.reset} ${err.service}.${err.action}: ${err.error}`);
        }
      }

      process.exit(result.success ? 0 : 1);
    } catch (err) {
      console.log(`${c.red}Error: ${err.message}${c.reset}`);
      process.exit(1);
    }
  }

  // Engine
  if (command === 'engine') {
    console.log(BANNER);
    await handleEngine(args.slice(1));
    return;
  }

  // Migrate
  if (command === 'migrate') {
    console.log(BANNER);
    const { migrateLegacy } = await import('./connections.js');
    const result = await migrateLegacy();
    console.log(result);
    return;
  }

  // Unknown command
  console.log(`${c.red}Unknown command: ${command}${c.reset}`);
  console.log(`Run ${c.cyan}npx 0nmcp help${c.reset} for usage`);
  process.exit(1);
}

/**
 * Get a CLI flag value: --flag value
 */
function getFlag(args, flag, defaultValue) {
  const idx = args.indexOf(flag);
  if (idx !== -1 && args[idx + 1]) return args[idx + 1];
  return defaultValue;
}

function initDotOn() {
  const dirs = [
    DOT_ON_DIR,
    path.join(DOT_ON_DIR, 'connections'),
    path.join(DOT_ON_DIR, 'workflows'),
    path.join(DOT_ON_DIR, 'snapshots'),
    path.join(DOT_ON_DIR, 'history'),
    path.join(DOT_ON_DIR, 'cache'),
  ];

  console.log(`${c.bright}Initializing ~/.0n directory...${c.reset}\n`);

  for (const dir of dirs) {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      console.log(`${c.green}✓${c.reset} Created ${dir}`);
    } else {
      console.log(`${c.blue}○${c.reset} Exists ${dir}`);
    }
  }

  // Create default config
  const configPath = path.join(DOT_ON_DIR, 'config.json');
  if (!fs.existsSync(configPath)) {
    const config = {
      "$0n": {
        type: "config",
        version: "1.0.0",
        created: new Date().toISOString(),
      },
      settings: {
        ai_provider: "anthropic",
        fallback_mode: "keyword",
        history_enabled: true,
        cache_enabled: true,
      },
    };
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
    console.log(`${c.green}✓${c.reset} Created config.json`);
  }

  console.log(`
${c.green}${c.bright}~/.0n initialized!${c.reset}

${c.bright}Next steps:${c.reset}

  1. Connect a service:
     ${c.cyan}npx 0nmcp connect${c.reset}

  2. Configure Claude Desktop:
     Add to claude_desktop_config.json:
     
     ${c.yellow}{
       "mcpServers": {
         "0nmcp": {
           "command": "npx",
           "args": ["-y", "0nmcp"]
         }
       }
     }${c.reset}

  3. Restart Claude Desktop and start orchestrating!
`);
}

async function listConnections() {
  const connectionsDir = path.join(DOT_ON_DIR, 'connections');
  
  if (!fs.existsSync(connectionsDir)) {
    console.log(`${c.yellow}No connections found.${c.reset}`);
    console.log(`Run ${c.cyan}npx 0nmcp connect${c.reset} to add one.`);
    return;
  }

  const files = fs.readdirSync(connectionsDir).filter(f => f.endsWith('.0n'));
  
  if (files.length === 0) {
    console.log(`${c.yellow}No connections found.${c.reset}`);
    console.log(`Run ${c.cyan}npx 0nmcp connect${c.reset} to add one.`);
    return;
  }

  console.log(`${c.bright}Connected Services:${c.reset}\n`);

  for (const file of files) {
    try {
      const data = JSON.parse(fs.readFileSync(path.join(connectionsDir, file), 'utf8'));
      console.log(`  ${c.green}●${c.reset} ${c.bright}${data.$0n?.name || data.service}${c.reset}`);
      console.log(`    Service: ${data.service}`);
      console.log(`    File: ${file}`);
      console.log('');
    } catch (e) {
      console.log(`  ${c.red}●${c.reset} ${file} (error reading)`);
    }
  }
}

async function interactiveConnect() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const ask = (q) => new Promise(resolve => rl.question(q, resolve));

  console.log(`${c.bright}Connect a new service${c.reset}\n`);

  const services = [
    'stripe', 'slack', 'discord', 'twilio', 'sendgrid', 'resend',
    'openai', 'anthropic', 'airtable', 'notion', 'supabase',
    'github', 'linear', 'shopify', 'hubspot', 'calendly', 'crm',
  ];

  console.log('Available services:');
  services.forEach((s, i) => console.log(`  ${i + 1}. ${s}`));
  console.log('');

  const serviceInput = await ask('Enter service name or number: ');
  let service = serviceInput;
  
  const num = parseInt(serviceInput);
  if (!isNaN(num) && num >= 1 && num <= services.length) {
    service = services[num - 1];
  }

  if (!services.includes(service)) {
    console.log(`${c.yellow}Custom service: ${service}${c.reset}`);
  }

  console.log(`\nConnecting to ${c.cyan}${service}${c.reset}\n`);

  // Get credentials based on service
  const creds = {};
  
  if (['stripe', 'openai', 'anthropic', 'sendgrid', 'resend', 'airtable', 'notion', 'calendly'].includes(service)) {
    creds.api_key = await ask('API Key: ');
  } else if (service === 'slack' || service === 'discord') {
    creds.botToken = await ask('Bot Token: ');
  } else if (service === 'twilio') {
    creds.accountSid = await ask('Account SID: ');
    creds.authToken = await ask('Auth Token: ');
  } else if (service === 'github') {
    creds.token = await ask('Personal Access Token: ');
  } else if (service === 'crm') {
    creds.access_token = await ask('Access Token: ');
    creds.locationId = await ask('Location ID: ');
  } else if (service === 'supabase') {
    creds.url = await ask('Supabase URL: ');
    creds.anonKey = await ask('Anon Key: ');
  } else {
    creds.api_key = await ask('API Key/Token: ');
  }

  const name = await ask(`Connection name (default: ${service}): `) || service;

  rl.close();

  // Save connection
  const connection = {
    "$0n": {
      type: "connection",
      version: "1.0.0",
      created: new Date().toISOString(),
      name: name,
    },
    service: service,
    environment: "production",
    auth: {
      type: "api_key",
      credentials: creds,
    },
    metadata: {
      connected_at: new Date().toISOString(),
      connected_by: "0nmcp-cli",
    },
  };

  const connectionsDir = path.join(DOT_ON_DIR, 'connections');
  if (!fs.existsSync(connectionsDir)) {
    fs.mkdirSync(connectionsDir, { recursive: true });
  }

  const filePath = path.join(connectionsDir, `${service}.0n`);
  fs.writeFileSync(filePath, JSON.stringify(connection, null, 2));

  console.log(`\n${c.green}✓${c.reset} Connected to ${c.bright}${service}${c.reset}`);
  console.log(`  Saved to: ${filePath}`);
}

async function handleEngine(args) {
  const sub = args[0];

  if (!sub || sub === 'help') {
    console.log(`${c.bright}Engine — .0n Conversion Engine${c.reset}\n`);
    console.log(`  ${c.cyan}import <file>${c.reset}     Import credentials from .env, CSV, or JSON`);
    console.log(`  ${c.cyan}verify${c.reset}            Verify all connected API keys`);
    console.log(`  ${c.cyan}platforms${c.reset}         Generate AI platform configs`);
    console.log(`  ${c.cyan}export${c.reset}            Export .0n bundle (AI Brain)`);
    console.log(`  ${c.cyan}open <bundle>${c.reset}     Open/inspect a .0n bundle file\n`);
    return;
  }

  if (sub === 'import') {
    const source = args[1];
    if (!source) {
      console.log(`${c.red}Usage: npx 0nmcp engine import <file>${c.reset}`);
      process.exit(1);
    }
    try {
      const { parseFile } = await import('./engine/parser.js');
      const { mapEnvVars, groupByService, validateMapping } = await import('./engine/mapper.js');
      const { entries } = parseFile(source);
      const { mapped, unmapped } = mapEnvVars(entries);
      const groups = groupByService(mapped);

      console.log(`${c.bright}Import Results:${c.reset}\n`);
      console.log(`  Entries found:  ${entries.length}`);
      console.log(`  Mapped:         ${mapped.length}`);
      console.log(`  Unmapped:       ${unmapped.length}\n`);

      console.log(`${c.bright}Services Detected:${c.reset}\n`);
      for (const [service, group] of Object.entries(groups)) {
        const validation = validateMapping(service, group.credentials);
        const status = validation.valid ? `${c.green}complete${c.reset}` : `${c.yellow}missing: ${validation.missing.join(', ')}${c.reset}`;
        console.log(`  ${c.green}●${c.reset} ${c.bright}${service}${c.reset} — ${Object.keys(group.credentials).length} credentials (${status})`);
      }

      if (unmapped.length > 0) {
        console.log(`\n${c.yellow}Unmapped variables:${c.reset} ${unmapped.map(u => u.key).join(', ')}`);
      }

      console.log(`\n${c.bright}Next:${c.reset} Run ${c.cyan}npx 0nmcp engine export${c.reset} to create a portable .0n bundle.`);
    } catch (err) {
      console.log(`${c.red}Error: ${err.message}${c.reset}`);
      process.exit(1);
    }
    return;
  }

  if (sub === 'verify') {
    try {
      const { verifyAll } = await import('./engine/validator.js');
      const { existsSync, readdirSync, readFileSync } = await import('fs');
      const connectionsDir = path.join(DOT_ON_DIR, 'connections');

      if (!existsSync(connectionsDir)) {
        console.log(`${c.yellow}No connections found. Run ${c.cyan}npx 0nmcp connect${c.reset} first.`);
        return;
      }

      const files = readdirSync(connectionsDir).filter(f => f.endsWith('.0n') || f.endsWith('.0n.json'));
      const connections = {};
      for (const file of files) {
        try {
          const data = JSON.parse(readFileSync(path.join(connectionsDir, file), 'utf8'));
          if (data.$0n?.sealed) continue;
          connections[data.service] = { credentials: data.auth?.credentials || {} };
        } catch { /* skip */ }
      }

      if (Object.keys(connections).length === 0) {
        console.log(`${c.yellow}No unsealed connections to verify.${c.reset}`);
        return;
      }

      console.log(`${c.bright}Verifying ${Object.keys(connections).length} connections...${c.reset}\n`);

      const { results, summary } = await verifyAll(connections);
      for (const [service, result] of Object.entries(results)) {
        const icon = result.valid ? `${c.green}✓` : `${c.red}✗`;
        const latency = result.latency_ms ? ` (${result.latency_ms}ms)` : '';
        console.log(`  ${icon}${c.reset} ${c.bright}${service}${c.reset}${latency}${result.error ? ` — ${result.error}` : ''}`);
      }

      console.log(`\n${c.bright}Summary:${c.reset} ${summary.valid}/${summary.total} valid`);
    } catch (err) {
      console.log(`${c.red}Error: ${err.message}${c.reset}`);
      process.exit(1);
    }
    return;
  }

  if (sub === 'platforms') {
    try {
      const { getPlatformInfo, generatePlatformConfig } = await import('./engine/platforms.js');
      const platform = args[1];

      if (platform) {
        const config = generatePlatformConfig(platform);
        console.log(`${c.bright}${config.name} Configuration:${c.reset}\n`);
        console.log(`  Config path: ${config.path || '(HTTP only)'}`);
        console.log(`  Format: ${config.format}\n`);
        console.log(typeof config.config === 'string' ? config.config : JSON.stringify(config.config, null, 2));
      } else {
        const info = getPlatformInfo();
        console.log(`${c.bright}Supported AI Platforms:${c.reset}\n`);
        for (const p of info) {
          const status = p.installed ? `${c.green}installed${c.reset}` : `${c.yellow}not installed${c.reset}`;
          console.log(`  ${p.installed ? c.green + '●' : c.blue + '○'}${c.reset} ${c.bright}${p.name}${c.reset} (${status})`);
          if (p.configPath) console.log(`    ${p.configPath}`);
        }
        console.log(`\n${c.bright}Tip:${c.reset} Run ${c.cyan}npx 0nmcp engine platforms <name>${c.reset} to see config for a specific platform.`);
        console.log(`     Names: claude_desktop, cursor, windsurf, gemini, continue, cline, openai`);
      }
    } catch (err) {
      console.log(`${c.red}Error: ${err.message}${c.reset}`);
      process.exit(1);
    }
    return;
  }

  if (sub === 'export') {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    const ask = (q) => new Promise(resolve => rl.question(q, resolve));

    try {
      const passphrase = await ask('Bundle passphrase: ');
      if (!passphrase) {
        console.log(`${c.red}Passphrase required.${c.reset}`);
        rl.close();
        process.exit(1);
      }
      const name = await ask(`Bundle name (default: 0n AI Brain): `) || '0n AI Brain';
      rl.close();

      const { createBundle } = await import('./engine/bundler.js');
      const { existsSync, readdirSync, readFileSync } = await import('fs');
      const connectionsDir = path.join(DOT_ON_DIR, 'connections');

      if (!existsSync(connectionsDir)) {
        console.log(`${c.yellow}No connections found.${c.reset}`);
        return;
      }

      const files = readdirSync(connectionsDir).filter(f => f.endsWith('.0n') || f.endsWith('.0n.json'));
      const connections = {};
      for (const file of files) {
        try {
          const data = JSON.parse(readFileSync(path.join(connectionsDir, file), 'utf8'));
          if (data.$0n?.sealed) continue;
          connections[data.service] = {
            credentials: data.auth?.credentials || {},
            name: data.$0n?.name || data.service,
            authType: data.auth?.type || 'api_key',
            environment: data.environment || 'production',
          };
        } catch { /* skip */ }
      }

      if (Object.keys(connections).length === 0) {
        console.log(`${c.yellow}No exportable connections found.${c.reset}`);
        return;
      }

      console.log(`\n${c.bright}Creating AI Brain bundle...${c.reset}\n`);

      const result = createBundle({ connections, passphrase, name, platforms: 'all' });

      console.log(`${c.green}${c.bright}Bundle created!${c.reset}\n`);
      console.log(`  Path:        ${result.path}`);
      console.log(`  Services:    ${result.manifest.services.join(', ')}`);
      console.log(`  Connections: ${result.manifest.connection_count}`);
      console.log(`  Platforms:   ${result.manifest.platform_count}`);
      console.log(`  Encryption:  ${result.manifest.encryption.method}`);
      console.log(`\n${c.bright}Share this file — recipient opens with:${c.reset} ${c.cyan}npx 0nmcp engine open <bundle>${c.reset}`);
    } catch (err) {
      console.log(`${c.red}Error: ${err.message}${c.reset}`);
      process.exit(1);
    }
    return;
  }

  if (sub === 'open') {
    const bundlePath = args[1];
    if (!bundlePath) {
      console.log(`${c.red}Usage: npx 0nmcp engine open <bundle.0n>${c.reset}`);
      process.exit(1);
    }

    try {
      const { inspectBundle, openBundle } = await import('./engine/bundler.js');

      // First inspect
      const info = inspectBundle(bundlePath);
      console.log(`${c.bright}Bundle: ${info.name}${c.reset}\n`);
      console.log(`  Created:  ${info.created}`);
      console.log(`  Services: ${info.services.map(s => s.service).join(', ')}`);
      console.log(`  Platforms: ${info.platforms.join(', ')}`);
      if (info.includes.length > 0) {
        console.log(`  Includes: ${info.includes.map(i => i.name).join(', ')}`);
      }

      const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
      const ask = (q) => new Promise(resolve => rl.question(q, resolve));

      const passphrase = await ask('\nPassphrase to decrypt (leave empty to inspect only): ');
      rl.close();

      if (!passphrase) {
        console.log(`\n${c.yellow}Inspect only — no credentials extracted.${c.reset}`);
        return;
      }

      const result = openBundle(bundlePath, passphrase);

      console.log(`\n${c.green}${c.bright}Bundle opened!${c.reset}\n`);
      console.log(`  Connections imported: ${result.connections.join(', ')}`);
      if (result.includes.length > 0) {
        console.log(`  Files extracted: ${result.includes.join(', ')}`);
      }
      if (result.errors.length > 0) {
        console.log(`\n${c.red}Errors:${c.reset}`);
        for (const err of result.errors) {
          console.log(`  ${c.red}●${c.reset} ${err}`);
        }
      }
      console.log(`\n${c.bright}Tip:${c.reset} Run ${c.cyan}npx 0nmcp engine platforms${c.reset} to install AI platform configs.`);
    } catch (err) {
      console.log(`${c.red}Error: ${err.message}${c.reset}`);
      process.exit(1);
    }
    return;
  }

  console.log(`${c.red}Unknown engine command: ${sub}${c.reset}`);
  console.log(`Run ${c.cyan}npx 0nmcp engine help${c.reset} for usage`);
  process.exit(1);
}

main().catch(console.error);
