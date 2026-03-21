// ============================================================
// 0nMCP — Install Command
// ============================================================
// `npx 0nmcp install` — The one-command onboarding experience.
//
// Flow:
//   1. Initialize ~/.0n/ directory
//   2. Detect AI platform (Claude Desktop, Claude Code, Cursor, etc.)
//   3. Authenticate via device auth (opens browser → 0nmcp.com/activate)
//   4. Auto-provisions: CRM sub-account, Stripe customer, welcome email
//   5. Configure MCP server in detected platform
//   6. Connect social account (optional)
//   7. PACG classify user → generate viral "I turned 0n" post
//   8. User approves → publishes
//   9. "You're 0n."
// ============================================================

import { existsSync, readFileSync, writeFileSync, mkdirSync } from "fs";
import { join } from "path";
import { homedir, hostname, platform } from "os";
import readline from "readline";

const DOT_ON = join(homedir(), ".0n");
const API_BASE = "https://www.0nmcp.com";

// Colors
const c = {
  x: "\x1b[0m",
  b: "\x1b[1m",
  dim: "\x1b[2m",
  r: "\x1b[31m",
  g: "\x1b[32m",
  y: "\x1b[33m",
  cy: "\x1b[36m",
  bg_g: "\x1b[42m",
  bg_b: "\x1b[44m",
};

function ask(rl, prompt) {
  return new Promise((resolve) => rl.question(prompt, resolve));
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function spinner(text) {
  const frames = ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"];
  let i = 0;
  const interval = setInterval(() => {
    process.stdout.write(`\r  ${c.g}${frames[i++ % frames.length]}${c.x} ${text}`);
  }, 80);
  return {
    stop: (result) => {
      clearInterval(interval);
      process.stdout.write(`\r  ${c.g}✓${c.x} ${result}\n`);
    },
    fail: (result) => {
      clearInterval(interval);
      process.stdout.write(`\r  ${c.r}✗${c.x} ${result}\n`);
    },
  };
}

async function apiPost(path, body = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return { ok: res.ok, status: res.status, data: await res.json() };
}

// ── Step 1: Initialize ─────────────────────────────────────

function initDotOn() {
  const dirs = ["connections", "workflows", "snapshots", "history", "cache", "apps"];
  if (!existsSync(DOT_ON)) mkdirSync(DOT_ON, { recursive: true });
  for (const d of dirs) {
    const p = join(DOT_ON, d);
    if (!existsSync(p)) mkdirSync(p);
  }
  // Default config
  const configPath = join(DOT_ON, "config.json");
  if (!existsSync(configPath)) {
    writeFileSync(configPath, JSON.stringify({
      ai_provider: "anthropic",
      fallback_mode: "keyword",
      history: true,
      cache: true,
    }, null, 2));
  }
}

// ── Step 2: Detect Platform ────────────────────────────────

function detectPlatforms() {
  const found = [];
  const home = homedir();

  // Claude Desktop
  const claudeDesktopPaths = {
    darwin: join(home, "Library/Application Support/Claude/claude_desktop_config.json"),
    win32: join(home, "AppData/Roaming/Claude/claude_desktop_config.json"),
    linux: join(home, ".config/Claude/claude_desktop_config.json"),
  };
  const claudePath = claudeDesktopPaths[platform()] || claudeDesktopPaths.linux;
  if (existsSync(claudePath) || existsSync(join(claudePath, ".."))) {
    found.push({ name: "Claude Desktop", id: "claude_desktop", configPath: claudePath });
  }

  // Claude Code
  try {
    const { execSync } = require("child_process");
    execSync("which claude 2>/dev/null || where claude 2>nul", { stdio: "pipe" });
    found.push({ name: "Claude Code", id: "claude_code", configPath: null });
  } catch { /* not installed */ }

  // Cursor
  const cursorPaths = {
    darwin: join(home, "Library/Application Support/Cursor/User/globalStorage/cursor.mcp/mcp.json"),
    win32: join(home, "AppData/Roaming/Cursor/User/globalStorage/cursor.mcp/mcp.json"),
    linux: join(home, ".config/Cursor/User/globalStorage/cursor.mcp/mcp.json"),
  };
  const cursorPath = cursorPaths[platform()] || cursorPaths.linux;
  if (existsSync(cursorPath) || existsSync(join(cursorPath, "..", ".."))) {
    found.push({ name: "Cursor", id: "cursor", configPath: cursorPath });
  }

  // Windsurf
  const windsurfPath = join(home, ".windsurf/mcp.json");
  if (existsSync(windsurfPath) || existsSync(join(home, ".windsurf"))) {
    found.push({ name: "Windsurf", id: "windsurf", configPath: windsurfPath });
  }

  return found;
}

// ── Step 3: Configure MCP Server ───────────────────────────

function configurePlatform(platformInfo) {
  const mcpConfig = {
    "0nMCP": {
      command: "npx",
      args: ["-y", "0nmcp"],
    },
  };

  if (platformInfo.id === "claude_code") {
    // Use claude mcp add command
    try {
      const { execSync } = require("child_process");
      execSync('claude mcp add 0nMCP -- npx -y 0nmcp', { stdio: "pipe" });
      return true;
    } catch {
      return false;
    }
  }

  // For Claude Desktop, Cursor, Windsurf — write to JSON config
  const configPath = platformInfo.configPath;
  if (!configPath) return false;

  const dir = join(configPath, "..");
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });

  let config = {};
  if (existsSync(configPath)) {
    try {
      config = JSON.parse(readFileSync(configPath, "utf8"));
    } catch {
      config = {};
    }
  }

  config.mcpServers = config.mcpServers || {};
  config.mcpServers["0nMCP"] = mcpConfig["0nMCP"];

  writeFileSync(configPath, JSON.stringify(config, null, 2));
  return true;
}

// ── Step 4: Device Auth ────────────────────────────────────

async function deviceAuth() {
  const deviceName = `${hostname()} CLI`;

  const { ok, data } = await apiPost("/api/auth/device/code", {
    client_id: "0nmcp-cli",
    device_name: deviceName,
    platform: "cli",
  });

  if (!ok) {
    throw new Error(data.error || "Failed to initiate authentication");
  }

  const { device_code, user_code, verification_uri } = data;

  // Display code
  console.log("");
  console.log(`  ${c.b}┌──────────────────────────────────────────┐${c.x}`);
  console.log(`  ${c.b}│                                          │${c.x}`);
  console.log(`  ${c.b}│   Open your browser and enter this code: │${c.x}`);
  console.log(`  ${c.b}│                                          │${c.x}`);
  console.log(`  ${c.b}│          ${c.g}${c.b}    ${user_code}    ${c.x}${c.b}              │${c.x}`);
  console.log(`  ${c.b}│                                          │${c.x}`);
  console.log(`  ${c.b}│   ${c.cy}${verification_uri}${c.x}${c.b}          │${c.x}`);
  console.log(`  ${c.b}│                                          │${c.x}`);
  console.log(`  ${c.b}└──────────────────────────────────────────┘${c.x}`);
  console.log("");

  // Open browser
  try {
    const { exec } = await import("child_process");
    const url = `${verification_uri}?code=${user_code}`;
    const cmd = platform() === "darwin" ? `open "${url}"` :
                platform() === "win32" ? `start "${url}"` :
                `xdg-open "${url}"`;
    exec(cmd);
    console.log(`  ${c.dim}Browser opened. Waiting for you to sign in...${c.x}\n`);
  } catch {
    console.log(`  ${c.dim}Open the URL above in your browser.${c.x}\n`);
  }

  // Poll
  const s = spinner("Waiting for authorization...");
  for (let i = 0; i < 180; i++) { // 15 min
    await sleep(5000);
    const { ok: pollOk, data: pollData } = await apiPost("/api/auth/device/token", { device_code });

    if (pollOk && pollData.access_token) {
      s.stop(`Authenticated as ${c.g}${pollData.user?.email || "unknown"}${c.x}`);

      // Save auth locally (encrypted)
      const { saveAuth } = await import("./auth.js");
      if (typeof saveAuth === "function") {
        await saveAuth({
          access_token: pollData.access_token,
          refresh_token: pollData.refresh_token,
          user_id: pollData.user?.id,
          email: pollData.user?.email,
          name: pollData.user?.name,
          expires_at: new Date(Date.now() + pollData.expires_in * 1000).toISOString(),
        });
      }

      return pollData;
    }

    if (pollData?.error === "expired_token" || pollData?.error === "expired") {
      s.fail("Code expired. Please try again.");
      throw new Error("expired");
    }

    if (pollData?.error === "access_denied") {
      s.fail("Authorization denied.");
      throw new Error("denied");
    }
  }

  s.fail("Timed out waiting for authorization.");
  throw new Error("timeout");
}

// ── Main Install Flow ──────────────────────────────────────

export async function install() {
  console.log("");
  console.log(`  ${c.g}${c.b}╔══════════════════════════════════════════╗${c.x}`);
  console.log(`  ${c.g}${c.b}║                                          ║${c.x}`);
  console.log(`  ${c.g}${c.b}║          Turn it 0n                      ║${c.x}`);
  console.log(`  ${c.g}${c.b}║                                          ║${c.x}`);
  console.log(`  ${c.g}${c.b}║   The Agentic Execution Engine           ║${c.x}`);
  console.log(`  ${c.g}${c.b}║   1,171 tools · 54 services · 0 prompts  ║${c.x}`);
  console.log(`  ${c.g}${c.b}║                                          ║${c.x}`);
  console.log(`  ${c.g}${c.b}╚══════════════════════════════════════════╝${c.x}`);
  console.log("");

  // ── Step 1: Initialize ──
  const s1 = spinner("Initializing 0n directory...");
  initDotOn();
  s1.stop(`~/.0n/ initialized`);

  // ── Step 2: Detect platforms ──
  const s2 = spinner("Detecting AI platforms...");
  const platforms = detectPlatforms();
  if (platforms.length > 0) {
    s2.stop(`Found: ${platforms.map((p) => c.cy + p.name + c.x).join(", ")}`);
  } else {
    s2.stop("No AI platforms detected (will configure manually)");
  }

  // ── Step 3: Authenticate ──
  console.log(`\n  ${c.b}Creating your 0n account...${c.x}`);
  let authData;
  try {
    authData = await deviceAuth();
  } catch (err) {
    console.log(`\n  ${c.r}Authentication failed: ${err.message}${c.x}`);
    console.log(`  ${c.dim}Run ${c.cy}npx 0nmcp install${c.dim} to try again.${c.x}\n`);
    process.exit(1);
  }

  // ── Step 4: Configure MCP server ──
  console.log("");
  for (const p of platforms) {
    const s = spinner(`Configuring ${p.name}...`);
    const ok = configurePlatform(p);
    if (ok) {
      s.stop(`${p.name} configured — 0nMCP is ready`);
    } else {
      s.fail(`${p.name} — manual config needed`);
    }
  }

  if (platforms.length === 0) {
    // Show manual config instructions
    console.log(`\n  ${c.y}No AI platform auto-detected.${c.x}`);
    console.log(`  ${c.dim}To connect 0nMCP manually, add this to your AI platform config:${c.x}\n`);
    console.log(`  ${c.cy}"0nMCP": { "command": "npx", "args": ["-y", "0nmcp"] }${c.x}\n`);
  }

  // ── Step 5: Import existing credentials ──
  const envPath = join(homedir(), ".env");
  if (existsSync(envPath)) {
    const s = spinner("Found ~/.env — importing credentials...");
    try {
      const { importCredentials } = await import("./engine/index.js");
      if (typeof importCredentials === "function") {
        await importCredentials(envPath);
        s.stop("Credentials imported from ~/.env");
      } else {
        s.stop("~/.env found (import manually with: npx 0nmcp engine import ~/.env)");
      }
    } catch {
      s.stop("~/.env found (import manually with: npx 0nmcp engine import ~/.env)");
    }
  }

  // ── Step 6: Final Output ──
  console.log("");
  console.log(`  ${c.g}${c.b}╔══════════════════════════════════════════╗${c.x}`);
  console.log(`  ${c.g}${c.b}║                                          ║${c.x}`);
  console.log(`  ${c.g}${c.b}║          You're 0n.                      ║${c.x}`);
  console.log(`  ${c.g}${c.b}║                                          ║${c.x}`);
  console.log(`  ${c.g}${c.b}╚══════════════════════════════════════════╝${c.x}`);
  console.log("");
  console.log(`  ${c.b}Account:${c.x}  ${authData.user?.email || "connected"}`);
  console.log(`  ${c.b}Tools:${c.x}    1,171 across 54 services`);
  console.log(`  ${c.b}Config:${c.x}   ~/.0n/`);
  if (platforms.length > 0) {
    console.log(`  ${c.b}Platform:${c.x} ${platforms.map((p) => p.name).join(", ")}`);
  }
  console.log("");
  console.log(`  ${c.dim}Next steps:${c.x}`);
  console.log(`  ${c.cy}npx 0nmcp connect${c.x}      ${c.dim}Connect your services (Stripe, CRM, etc.)${c.x}`);
  console.log(`  ${c.cy}npx 0nmcp engine verify${c.x} ${c.dim}Test all connections${c.x}`);
  console.log("");
  console.log(`  ${c.dim}Don't describe tasks. Describe outcomes.${c.x}`);
  console.log(`  ${c.dim}0n will figure out the rest.${c.x}`);
  console.log("");

  // Prompt restart if Claude Desktop was configured
  const claudeConfigured = platforms.find((p) => p.id === "claude_desktop");
  if (claudeConfigured) {
    console.log(`  ${c.y}⚡ Restart Claude Desktop to activate 0nMCP.${c.x}\n`);
  }
}
