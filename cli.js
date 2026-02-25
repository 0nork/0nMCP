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
 *   npx 0nmcp commands     List named RUNs from SWITCH file
 *   npx 0nmcp shell        Interactive REPL (type /command)
 *   npx 0nmcp <alias>      Run a named command from SWITCH file
 *   npx 0nmcp migrate      Migrate from ~/.0nmcp to ~/.0n
 *   npx 0nmcp engine       Engine commands (import, verify, platforms, export, open)
 *   npx 0nmcp app          Application commands (run, build, inspect, validate, list)
 * 
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import os from 'os';
import readline from 'readline';
import { loadCommands, listCommands } from './commands.js';
import { runCommand } from './command-runner.js';

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

${c.bright}Vault Container commands (Patent Pending #63/990,046):${c.reset}

  ${c.cyan}npx 0nmcp vault create${c.reset}             Create a .0nv vault container
  ${c.cyan}npx 0nmcp vault open <file>${c.reset}        Open/decrypt a .0nv container
  ${c.cyan}npx 0nmcp vault inspect <file>${c.reset}     Inspect container metadata (no passphrase)
  ${c.cyan}npx 0nmcp vault verify <file>${c.reset}      Verify Seal of Truth + signature
  ${c.cyan}npx 0nmcp vault escrow create${c.reset}      Generate escrow keypairs
  ${c.cyan}npx 0nmcp vault escrow unwrap${c.reset}      Unwrap container with escrow key
  ${c.cyan}npx 0nmcp vault transfer <file>${c.reset}    Register a vault transfer
  ${c.cyan}npx 0nmcp vault revoke <id>${c.reset}        Revoke a transfer ID

${c.bright}Application commands:${c.reset}

  ${c.cyan}npx 0nmcp app run <file>${c.reset}          Start application server
  ${c.cyan}npx 0nmcp app build${c.reset}               Build application bundle
  ${c.cyan}npx 0nmcp app inspect <file>${c.reset}      Show application metadata
  ${c.cyan}npx 0nmcp app validate <file>${c.reset}     Validate application structure
  ${c.cyan}npx 0nmcp app list${c.reset}                List installed applications

${c.bright}Named Runs (Hotkeys):${c.reset}

  ${c.cyan}npx 0nmcp commands${c.reset}                    List named RUNs from SWITCH file
  ${c.cyan}npx 0nmcp <alias>${c.reset}                     Execute a named RUN
  ${c.cyan}npx 0nmcp shell${c.reset}                       Interactive REPL (type /command)

  Define commands in ~/.0n/0n-setup.0n:

  {
    "commands": {
      "launch": { "type": "pipeline", "steps": [{ "action": "verify" }] },
      "score":  { "type": "workflow", "workflow": "lead-scoring" }
    }
  }

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

  // Vault Container
  if (command === 'vault') {
    console.log(BANNER);
    await handleVault(args.slice(1));
    return;
  }

  // App
  if (command === 'app') {
    console.log(BANNER);
    await handleApp(args.slice(1));
    return;
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

  // Commands — list named RUNs from SWITCH file
  if (command === 'commands' || command === 'aliases') {
    console.log(BANNER);
    const cmds = listCommands();
    if (cmds.length === 0) {
      console.log(`${c.yellow}No commands defined.${c.reset}`);
      console.log(`\nAdd a ${c.cyan}"commands"${c.reset} section to ${c.cyan}~/.0n/0n-setup.0n${c.reset}`);
      console.log(`\nExample:`);
      console.log(`  {`);
      console.log(`    "commands": {`);
      console.log(`      "launch": { "type": "pipeline", "steps": [{ "action": "verify" }] }`);
      console.log(`    }`);
      console.log(`  }`);
      return;
    }
    console.log(`${c.bright}Named Runs:${c.reset}\n`);
    for (const cmd of cmds) {
      const typeTag = cmd.type === 'pipeline' ? `${c.blue}pipeline${c.reset}` : `${c.green}workflow${c.reset}`;
      console.log(`  ${c.cyan}0nmcp ${cmd.alias}${c.reset}  ${cmd.description || cmd.name}  [${typeTag}]`);
    }
    console.log(`\n${c.bright}Tip:${c.reset} Run ${c.cyan}0nmcp shell${c.reset} for an interactive REPL where you can type ${c.cyan}/launch${c.reset}, ${c.cyan}/hello${c.reset}, etc.`);
    return;
  }

  // Shell — interactive REPL
  if (command === 'shell' || command === 'repl') {
    console.log(BANNER);
    await startShell();
    return;
  }

  // Dynamic command aliases from SWITCH file
  const switchCommands = loadCommands();
  if (switchCommands.has(command)) {
    console.log(BANNER);
    const def = switchCommands.get(command);
    const cliArgs = args.slice(1);
    await runCommand(command, def, cliArgs);
    return;
  }

  // Unknown command
  console.log(`${c.red}Unknown command: ${command}${c.reset}`);
  const switchCmds = listCommands();
  if (switchCmds.length > 0) {
    console.log(`\n${c.bright}Available named RUNs:${c.reset}`);
    for (const cmd of switchCmds) {
      console.log(`  ${c.cyan}0nmcp ${cmd.alias}${c.reset}  ${cmd.description || cmd.name}`);
    }
  }
  console.log(`\nRun ${c.cyan}npx 0nmcp help${c.reset} for usage`);
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
    path.join(DOT_ON_DIR, 'apps'),
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

// ═══════════════════════════════════════════════════════════
// Vault Container Commands (Patent Pending #63/990,046)
// ═══════════════════════════════════════════════════════════

function promptInput(prompt) {
  return new Promise(resolve => {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    rl.question(prompt, answer => { rl.close(); resolve(answer); });
  });
}

async function handleVault(args) {
  const sub = args[0];

  if (!sub || sub === 'help') {
    console.log(`
${c.bright}Vault Container Commands${c.reset} ${c.yellow}(Patent Pending #63/990,046)${c.reset}

  ${c.cyan}vault create${c.reset}              Create a .0nv vault container
    --layers <names>          Comma-separated layer names (default: all)
    --passphrase <pass>       Encryption passphrase
    --output <file>           Output file path

  ${c.cyan}vault open <file>${c.reset}          Open/decrypt a .0nv container
    --passphrase <pass>       Decryption passphrase
    --layer <name>            Only decrypt this layer

  ${c.cyan}vault inspect <file>${c.reset}       Inspect without decrypting

  ${c.cyan}vault verify <file>${c.reset}        Verify Seal of Truth + Ed25519 signature

  ${c.cyan}vault escrow create${c.reset}        Generate escrow keypairs
    --parties <n>             Number of parties (1-8)

  ${c.cyan}vault transfer <file>${c.reset}      Register a transfer
    --to <recipient>          Recipient identifier

  ${c.cyan}vault revoke <id>${c.reset}          Revoke a transfer ID

${c.bright}7 Semantic Layers:${c.reset}
  workflows, credentials, env_vars, mcp_configs,
  site_profiles, ai_brain, audit_trail
`);
    return;
  }

  if (sub === 'create') {
    const { assembleContainer, saveContainer } = await import('./vault/container.js');
    const { LAYER_NAMES } = await import('./vault/layers.js');

    const passphrase = getFlag(args, '--passphrase') || await promptInput('Passphrase: ');
    const output = getFlag(args, '--output');
    const layerStr = getFlag(args, '--layers');
    const requestedLayers = layerStr ? layerStr.split(',').map(s => s.trim()) : LAYER_NAMES;

    // Build layer data from ~/.0n directory
    const layers = {};
    for (const name of requestedLayers) {
      if (!LAYER_NAMES.includes(name)) {
        console.log(`${c.red}Invalid layer: ${name}${c.reset}`);
        process.exit(1);
      }
      layers[name] = { placeholder: true, created: new Date().toISOString() };
    }

    console.log(`\n${c.bright}Creating vault container...${c.reset}`);
    console.log(`  Layers: ${Object.keys(layers).join(', ')}`);

    try {
      const result = await assembleContainer({ layers, passphrase });
      const homePath = path.join(os.homedir(), '.0n', 'vault');
      if (!fs.existsSync(homePath)) fs.mkdirSync(homePath, { recursive: true });
      const filePath = output || path.join(homePath, `${result.transferId}.0nv`);
      saveContainer(result.buffer, filePath);

      console.log(`\n${c.green}✓ Container created${c.reset}`);
      console.log(`  Transfer ID:   ${c.cyan}${result.transferId}${c.reset}`);
      console.log(`  Seal of Truth: ${c.cyan}${result.sealHex}${c.reset}`);
      console.log(`  Layers:        ${result.layerCount}`);
      console.log(`  Size:          ${result.buffer.length} bytes`);
      console.log(`  File:          ${c.yellow}${filePath}${c.reset}`);
    } catch (err) {
      console.log(`${c.red}Error: ${err.message}${c.reset}`);
      process.exit(1);
    }
    return;
  }

  if (sub === 'open') {
    const file = args[1];
    if (!file) { console.log(`${c.red}Usage: vault open <file.0nv>${c.reset}`); process.exit(1); }

    const { disassembleContainer, loadContainer } = await import('./vault/container.js');
    const passphrase = getFlag(args, '--passphrase') || await promptInput('Passphrase: ');
    const layer = getFlag(args, '--layer');

    try {
      const buffer = loadContainer(file);
      const result = await disassembleContainer(buffer, passphrase, layer ? [layer] : null);

      console.log(`\n${c.green}✓ Container opened${c.reset}`);
      console.log(`  Transfer ID: ${c.cyan}${result.metadata.transferId}${c.reset}`);
      console.log(`  Seal valid:  ${result.seal.valid ? c.green + '✓' : c.red + '✗'}${c.reset}`);
      console.log(`  Sig valid:   ${result.signature.valid ? c.green + '✓' : c.red + '✗'}${c.reset}`);
      console.log(`  Layers:`);
      for (const [name, data] of Object.entries(result.layers)) {
        const preview = JSON.stringify(data).substring(0, 80);
        console.log(`    ${c.cyan}${name}${c.reset}: ${preview}...`);
      }
    } catch (err) {
      console.log(`${c.red}Error: ${err.message}${c.reset}`);
      process.exit(1);
    }
    return;
  }

  if (sub === 'inspect') {
    const file = args[1];
    if (!file) { console.log(`${c.red}Usage: vault inspect <file.0nv>${c.reset}`); process.exit(1); }

    const { inspectContainer, loadContainer } = await import('./vault/container.js');
    try {
      const buffer = loadContainer(file);
      const info = inspectContainer(buffer);
      console.log(`\n${c.bright}Container Inspection${c.reset}`);
      console.log(JSON.stringify(info, null, 2));
    } catch (err) {
      console.log(`${c.red}Error: ${err.message}${c.reset}`);
      process.exit(1);
    }
    return;
  }

  if (sub === 'verify') {
    const file = args[1];
    if (!file) { console.log(`${c.red}Usage: vault verify <file.0nv>${c.reset}`); process.exit(1); }

    const { inspectContainer, loadContainer } = await import('./vault/container.js');
    try {
      const buffer = loadContainer(file);
      const info = inspectContainer(buffer);
      const verified = info.seal.valid && info.signature.valid;

      console.log(`\n${verified ? c.green + '✓ VERIFIED' : c.red + '✗ FAILED'}${c.reset}`);
      console.log(`  Seal of Truth: ${info.seal.valid ? c.green + 'Valid' : c.red + 'Invalid'}${c.reset} (${info.seal.algorithm})`);
      console.log(`  Signature:     ${info.signature.valid ? c.green + 'Valid' : c.red + 'Invalid'}${c.reset} (${info.signature.algorithm})`);
      console.log(`  Transfer ID:   ${info.metadata.transferId}`);
      console.log(`  Created:       ${info.metadata.created}`);
      console.log(`  Patent:        ${info.patent}`);
    } catch (err) {
      console.log(`${c.red}Error: ${err.message}${c.reset}`);
      process.exit(1);
    }
    return;
  }

  if (sub === 'escrow') {
    const escrowSub = args[1];
    if (escrowSub === 'create') {
      const { generatePartyKeys } = await import('./vault/escrow.js');
      const count = parseInt(getFlag(args, '--parties') || '3');

      console.log(`\n${c.bright}Generating ${count} escrow keypairs...${c.reset}`);
      const parties = [];
      for (let i = 0; i < count; i++) {
        const party = generatePartyKeys();
        parties.push(party);
        console.log(`\n  ${c.cyan}Party ${i + 1}${c.reset} (${party.partyId}):`);
        console.log(`    Public:  ${party.publicKey.toString('hex').substring(0, 32)}...`);
        console.log(`    Secret:  ${party.secretKey.toString('hex').substring(0, 32)}...`);
      }
      console.log(`\n${c.green}✓ ${count} keypairs generated${c.reset}`);
      console.log(`  ${c.yellow}Save secret keys securely. Share public keys for container creation.${c.reset}`);
    }
    return;
  }

  if (sub === 'transfer') {
    const file = args[1];
    if (!file) { console.log(`${c.red}Usage: vault transfer <file.0nv>${c.reset}`); process.exit(1); }

    const { inspectContainer, loadContainer } = await import('./vault/container.js');
    const { registerTransfer } = await import('./vault/registry.js');
    const recipient = getFlag(args, '--to');

    try {
      const buffer = loadContainer(file);
      const info = inspectContainer(buffer);
      const result = registerTransfer(info.metadata.transferId, info.seal.hash, { recipient });

      if (result.success) {
        console.log(`\n${c.green}✓ Transfer registered${c.reset}`);
        console.log(`  Transfer ID: ${c.cyan}${info.metadata.transferId}${c.reset}`);
        if (recipient) console.log(`  Recipient:   ${recipient}`);
      } else {
        console.log(`\n${c.red}✗ ${result.error}${c.reset}`);
      }
    } catch (err) {
      console.log(`${c.red}Error: ${err.message}${c.reset}`);
      process.exit(1);
    }
    return;
  }

  if (sub === 'revoke') {
    const transferId = args[1];
    if (!transferId) { console.log(`${c.red}Usage: vault revoke <transferId>${c.reset}`); process.exit(1); }

    const { revokeTransfer } = await import('./vault/registry.js');
    const result = revokeTransfer(transferId);

    if (result.success) {
      console.log(`\n${c.green}✓ Transfer revoked: ${transferId}${c.reset}`);
    } else {
      console.log(`\n${c.red}✗ ${result.error}${c.reset}`);
    }
    return;
  }

  console.log(`${c.red}Unknown vault command: ${sub}${c.reset}`);
  console.log(`Run ${c.cyan}0nmcp vault help${c.reset} for usage.`);
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

async function handleApp(args) {
  const sub = args[0];

  if (!sub || sub === 'help') {
    console.log(`${c.bright}Application Engine — Build & Run .0n Applications${c.reset}\n`);
    console.log(`  ${c.cyan}run <file>${c.reset}        Start application server`);
    console.log(`  ${c.cyan}build${c.reset}             Build application bundle`);
    console.log(`  ${c.cyan}inspect <file>${c.reset}    Show application metadata`);
    console.log(`  ${c.cyan}validate <file>${c.reset}   Validate application structure`);
    console.log(`  ${c.cyan}list${c.reset}              List installed applications\n`);
    return;
  }

  if (sub === 'run') {
    const appFile = args[1];
    if (!appFile) {
      console.log(`${c.red}Usage: npx 0nmcp app run <file.0n> [--port 3000] [--passphrase <pw>]${c.reset}`);
      process.exit(1);
    }

    const port = Number(getFlag(args, '--port', 3000));
    let passphrase = getFlag(args, '--passphrase', null);

    if (!passphrase) {
      const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
      const ask = (q) => new Promise(resolve => rl.question(q, resolve));
      passphrase = await ask('Application passphrase: ');
      rl.close();
    }

    if (!passphrase) {
      console.log(`${c.red}Passphrase required.${c.reset}`);
      process.exit(1);
    }

    try {
      const { openApplication } = await import('./engine/app-builder.js');
      const { Application } = await import('./engine/application.js');
      const { ApplicationServer } = await import('./engine/app-server.js');

      const bundle = openApplication(appFile, passphrase);
      const application = new Application(bundle, { passphrase });
      const server = new ApplicationServer(application);

      await server.start({ port });

      // Keep alive
      process.on('SIGINT', async () => {
        console.log(`\n${c.yellow}Shutting down...${c.reset}`);
        await server.stop();
        process.exit(0);
      });
    } catch (err) {
      console.log(`${c.red}Error: ${err.message}${c.reset}`);
      process.exit(1);
    }
    return;
  }

  if (sub === 'build') {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    const ask = (q) => new Promise(resolve => rl.question(q, resolve));

    try {
      const appName = await ask('Application name: ') || '0n Application';
      const passphrase = await ask('Bundle passphrase: ');
      if (!passphrase) {
        console.log(`${c.red}Passphrase required.${c.reset}`);
        rl.close();
        process.exit(1);
      }
      rl.close();

      const { createApplication } = await import('./engine/app-builder.js');

      // Load local connections
      const connectionsDir = path.join(DOT_ON_DIR, 'connections');
      const connections = {};
      if (fs.existsSync(connectionsDir)) {
        const files = fs.readdirSync(connectionsDir).filter(f => f.endsWith('.0n') || f.endsWith('.0n.json'));
        for (const file of files) {
          try {
            const data = JSON.parse(fs.readFileSync(path.join(connectionsDir, file), 'utf8'));
            if (data.$0n?.sealed) continue;
            connections[data.service] = {
              credentials: data.auth?.credentials || {},
              name: data.$0n?.name || data.service,
              authType: data.auth?.type || 'api_key',
              environment: data.environment || 'production',
            };
          } catch { /* skip */ }
        }
      }

      // Load local workflows
      const { loadLocalWorkflows } = await import('./engine/index.js');
      const workflows = loadLocalWorkflows();

      console.log(`\n${c.bright}Building application...${c.reset}\n`);

      const result = createApplication({
        name: appName,
        passphrase,
        connections,
        workflows,
      });

      console.log(`${c.green}${c.bright}Application built!${c.reset}\n`);
      console.log(`  Path:        ${result.path}`);
      console.log(`  Connections: ${result.manifest.connection_count}`);
      console.log(`  Workflows:   ${result.manifest.workflow_count}`);
      console.log(`\n${c.bright}Run with:${c.reset} ${c.cyan}npx 0nmcp app run ${result.path}${c.reset}`);
    } catch (err) {
      console.log(`${c.red}Error: ${err.message}${c.reset}`);
      process.exit(1);
    }
    return;
  }

  if (sub === 'inspect') {
    const appFile = args[1];
    if (!appFile) {
      console.log(`${c.red}Usage: npx 0nmcp app inspect <file.0n>${c.reset}`);
      process.exit(1);
    }

    try {
      const { inspectApplication } = await import('./engine/app-builder.js');
      const info = inspectApplication(appFile);

      console.log(`${c.bright}Application: ${info.name}${c.reset}\n`);
      console.log(`  Version:     ${info.version}`);
      console.log(`  Author:      ${info.author || '—'}`);
      console.log(`  Created:     ${info.created}`);
      if (info.description) console.log(`  Description: ${info.description}`);
      console.log(`\n  Connections: ${info.connections.map(c2 => c2.service).join(', ') || 'none'}`);
      console.log(`  Workflows:   ${info.workflows.join(', ') || 'none'}`);
      console.log(`  Operations:  ${info.operations.join(', ') || 'none'}`);
      console.log(`  Endpoints:   ${info.endpoints.join(', ') || 'none'}`);
      console.log(`  Automations: ${info.automations.join(', ') || 'none'}`);
    } catch (err) {
      console.log(`${c.red}Error: ${err.message}${c.reset}`);
      process.exit(1);
    }
    return;
  }

  if (sub === 'validate') {
    const appFile = args[1];
    if (!appFile) {
      console.log(`${c.red}Usage: npx 0nmcp app validate <file.0n>${c.reset}`);
      process.exit(1);
    }

    try {
      const { validateApplication } = await import('./engine/app-builder.js');
      const data = JSON.parse(fs.readFileSync(appFile, 'utf8'));
      const result = validateApplication(data);

      if (result.valid) {
        console.log(`${c.green}${c.bright}Application is valid!${c.reset}`);
      } else {
        console.log(`${c.red}${c.bright}Validation failed:${c.reset}\n`);
        for (const err of result.errors) {
          console.log(`  ${c.red}●${c.reset} ${err}`);
        }
      }

      if (result.warnings?.length > 0) {
        console.log(`\n${c.yellow}Warnings:${c.reset}`);
        for (const w of result.warnings) {
          console.log(`  ${c.yellow}○${c.reset} ${w}`);
        }
      }
    } catch (err) {
      console.log(`${c.red}Error: ${err.message}${c.reset}`);
      process.exit(1);
    }
    return;
  }

  if (sub === 'list') {
    const appsDir = path.join(DOT_ON_DIR, 'apps');
    if (!fs.existsSync(appsDir)) {
      console.log(`${c.yellow}No applications installed.${c.reset}`);
      return;
    }

    const files = fs.readdirSync(appsDir).filter(f => f.endsWith('.0n') || f.endsWith('.0n.json'));
    if (files.length === 0) {
      console.log(`${c.yellow}No applications installed.${c.reset}`);
      return;
    }

    console.log(`${c.bright}Installed Applications:${c.reset}\n`);

    for (const file of files) {
      try {
        const data = JSON.parse(fs.readFileSync(path.join(appsDir, file), 'utf8'));
        if (data.$0n?.type !== 'application') continue;

        const wfCount = Object.keys(data.workflows || {}).length;
        const epCount = Object.keys(data.endpoints || {}).length;
        console.log(`  ${c.green}●${c.reset} ${c.bright}${data.$0n.name || file}${c.reset} v${data.$0n.version || '1.0.0'}`);
        console.log(`    ${wfCount} workflows, ${epCount} endpoints`);
        console.log(`    ${file}`);
        console.log('');
      } catch {
        console.log(`  ${c.red}●${c.reset} ${file} (error reading)`);
      }
    }
    return;
  }

  console.log(`${c.red}Unknown app command: ${sub}${c.reset}`);
  console.log(`Run ${c.cyan}npx 0nmcp app help${c.reset} for usage`);
  process.exit(1);
}

async function startShell() {
  const cmds = loadCommands();
  const aliases = [...cmds.keys()];
  const builtins = ['help', 'commands', 'list', 'exit', 'quit'];
  const allCompletions = [...builtins, ...aliases];

  console.log(`${c.bright}0nMCP Interactive Shell${c.reset}`);
  console.log(`Type ${c.cyan}/command${c.reset} to run a named RUN, ${c.cyan}/commands${c.reset} to list, ${c.cyan}/exit${c.reset} to quit.\n`);

  if (aliases.length > 0) {
    console.log(`${c.bright}Available commands:${c.reset} ${aliases.map(a => c.cyan + '/' + a + c.reset).join(', ')}\n`);
  }

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: `${c.green}0n>${c.reset} `,
    completer: (line) => {
      const input = line.startsWith('/') ? line.slice(1) : line;
      const hits = allCompletions.filter(c2 => c2.startsWith(input));
      return [hits.map(h => '/' + h), line];
    },
  });

  rl.prompt();

  rl.on('line', async (line) => {
    const input = line.trim();
    if (!input) {
      rl.prompt();
      return;
    }

    // Strip leading / if present
    const raw = input.startsWith('/') ? input.slice(1) : input;
    const parts = raw.split(/\s+/);
    const cmd = parts[0];
    const cmdArgs = parts.slice(1);

    if (cmd === 'exit' || cmd === 'quit') {
      console.log(`\n${c.cyan}Goodbye!${c.reset}`);
      rl.close();
      process.exit(0);
    }

    if (cmd === 'help') {
      console.log(`\n${c.bright}Shell Commands:${c.reset}`);
      console.log(`  ${c.cyan}/commands${c.reset}   List all named RUNs`);
      console.log(`  ${c.cyan}/list${c.reset}       Show connected services`);
      console.log(`  ${c.cyan}/exit${c.reset}       Exit the shell`);
      if (aliases.length > 0) {
        console.log(`\n${c.bright}Named RUNs:${c.reset}`);
        for (const a of aliases) {
          const def = cmds.get(a);
          console.log(`  ${c.cyan}/${a}${c.reset}  ${def.description || def.name || ''}`);
        }
      }
      console.log('');
      rl.prompt();
      return;
    }

    if (cmd === 'commands') {
      if (aliases.length === 0) {
        console.log(`\n${c.yellow}No commands defined in SWITCH file.${c.reset}\n`);
      } else {
        console.log(`\n${c.bright}Named RUNs:${c.reset}`);
        for (const a of aliases) {
          const def = cmds.get(a);
          console.log(`  ${c.cyan}/${a}${c.reset}  ${def.description || def.name || ''}`);
        }
        console.log('');
      }
      rl.prompt();
      return;
    }

    if (cmd === 'list') {
      const connectionsDir = path.join(DOT_ON_DIR, 'connections');
      if (fs.existsSync(connectionsDir)) {
        const files = fs.readdirSync(connectionsDir).filter(f => f.endsWith('.0n'));
        console.log(`\n${c.bright}Connected Services:${c.reset}`);
        for (const file of files) {
          try {
            const data = JSON.parse(fs.readFileSync(path.join(connectionsDir, file), 'utf8'));
            console.log(`  ${c.green}●${c.reset} ${data.$0n?.name || data.service}`);
          } catch {
            console.log(`  ${c.red}●${c.reset} ${file} (error)`);
          }
        }
        console.log('');
      } else {
        console.log(`\n${c.yellow}No connections found.${c.reset}\n`);
      }
      rl.prompt();
      return;
    }

    // Try to run as a named command
    if (cmds.has(cmd)) {
      console.log('');
      try {
        await runCommand(cmd, cmds.get(cmd), cmdArgs);
      } catch (err) {
        console.log(`${c.red}Error: ${err.message}${c.reset}`);
      }
      console.log('');
      rl.prompt();
      return;
    }

    console.log(`${c.yellow}Unknown command: ${cmd}${c.reset}`);
    console.log(`Type ${c.cyan}/help${c.reset} for available commands.`);
    rl.prompt();
  });

  rl.on('close', () => {
    process.exit(0);
  });
}

main().catch(console.error);
