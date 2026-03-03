// ============================================================
// 0nMCP — CLI Authentication Module
// ============================================================
// Device Authorization Grant flow (RFC 8628) for CLI login.
// Tokens stored locally in ~/.0n/auth.json, encrypted with
// machine fingerprint (same pattern as vault/cipher.js).
//
// Flow: CLI requests device code → user approves in browser →
//       CLI receives access + refresh tokens → stores encrypted
// ============================================================

import { readFileSync, writeFileSync, existsSync, mkdirSync, unlinkSync } from "fs";
import { join } from "path";
import { homedir } from "os";
import { createCipheriv, createDecipheriv, randomBytes, pbkdf2Sync } from "crypto";

const DOT_ON = join(homedir(), ".0n");
const AUTH_FILE = join(DOT_ON, "auth.json");
const API_BASE = "https://0nmcp.com";

// AES-256-GCM constants for local token encryption
const ALGORITHM = "aes-256-gcm";
const KEY_LENGTH = 32;
const IV_LENGTH = 16;
const SALT_LENGTH = 32;
const TAG_LENGTH = 16;
const PBKDF2_ITERATIONS = 100000;

// Colors
const c = {
  x: "\x1b[0m",
  b: "\x1b[1m",
  r: "\x1b[31m",
  g: "\x1b[32m",
  y: "\x1b[33m",
  bl: "\x1b[34m",
  cy: "\x1b[36m",
  dim: "\x1b[2m",
};

// ── Local Encryption (machine-bound) ─────────────────────────

// Cache fingerprint to avoid repeated imports
let _fingerprint = null;

async function getMachineKey() {
  if (_fingerprint) return _fingerprint;
  const { getFingerprint } = await import("./vault/fingerprint.js");
  _fingerprint = getFingerprint();
  return _fingerprint;
}

async function encryptLocal(plaintext) {
  const salt = randomBytes(SALT_LENGTH);
  const iv = randomBytes(IV_LENGTH);
  const fingerprint = await getMachineKey();
  const key = pbkdf2Sync(fingerprint, salt, PBKDF2_ITERATIONS, KEY_LENGTH, "sha512");

  const cipher = createCipheriv(ALGORITHM, key, iv);
  const encrypted = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();

  return Buffer.concat([salt, iv, tag, encrypted]).toString("base64");
}

async function decryptLocal(sealed) {
  const combined = Buffer.from(sealed, "base64");
  if (combined.length < SALT_LENGTH + IV_LENGTH + TAG_LENGTH + 1) {
    throw new Error("Invalid auth data");
  }

  const salt = combined.subarray(0, SALT_LENGTH);
  const iv = combined.subarray(SALT_LENGTH, SALT_LENGTH + IV_LENGTH);
  const tag = combined.subarray(SALT_LENGTH + IV_LENGTH, SALT_LENGTH + IV_LENGTH + TAG_LENGTH);
  const ciphertext = combined.subarray(SALT_LENGTH + IV_LENGTH + TAG_LENGTH);

  const fingerprint = await getMachineKey();
  const key = pbkdf2Sync(fingerprint, salt, PBKDF2_ITERATIONS, KEY_LENGTH, "sha512");

  const decipher = createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(tag);

  return Buffer.concat([decipher.update(ciphertext), decipher.final()]).toString("utf8");
}

// ── Token Storage ────────────────────────────────────────────

async function saveAuth(authData) {
  if (!existsSync(DOT_ON)) mkdirSync(DOT_ON, { recursive: true });
  const encrypted = await encryptLocal(JSON.stringify(authData));
  writeFileSync(AUTH_FILE, JSON.stringify({ encrypted: true, data: encrypted }));
}

async function loadAuth() {
  if (!existsSync(AUTH_FILE)) return null;
  try {
    const raw = JSON.parse(readFileSync(AUTH_FILE, "utf8"));
    if (raw.encrypted && raw.data) {
      return JSON.parse(await decryptLocal(raw.data));
    }
    return raw;
  } catch {
    return null;
  }
}

function clearAuth() {
  if (existsSync(AUTH_FILE)) unlinkSync(AUTH_FILE);
}

// ── API Helpers ──────────────────────────────────────────────

async function apiPost(path, body = {}, token = null) {
  const headers = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });

  const data = await res.json();
  return { ok: res.ok, status: res.status, data };
}

// ── Public API ───────────────────────────────────────────────

/**
 * Login via Device Authorization Grant (RFC 8628).
 * Opens browser for user to approve, polls for token.
 */
export async function login() {
  console.log(`\n${c.b}${c.cy}  Authenticating with 0nMCP...${c.x}\n`);

  // 1. Request device code
  const hostname = homedir().split("/").pop() || "cli";
  const { ok, data } = await apiPost("/api/auth/device", {
    device_name: `${hostname} CLI`,
    platform: "cli",
  });

  if (!ok) {
    console.log(`${c.r}  Failed to initiate login: ${data.error || "Unknown error"}${c.x}`);
    return false;
  }

  const { device_code, user_code, verification_uri, interval } = data;

  // 2. Display code prominently
  console.log(`${c.b}  ┌────────────────────────────────────────┐${c.x}`);
  console.log(`${c.b}  │                                        │${c.x}`);
  console.log(`${c.b}  │   Your authorization code:             │${c.x}`);
  console.log(`${c.b}  │                                        │${c.x}`);
  console.log(`${c.b}  │       ${c.g}${user_code}${c.x}${c.b}                      │${c.x}`);
  console.log(`${c.b}  │                                        │${c.x}`);
  console.log(`${c.b}  │   Visit: ${c.cy}${verification_uri}${c.x}${c.b}  │${c.x}`);
  console.log(`${c.b}  │   Enter the code above to authorize.   │${c.x}`);
  console.log(`${c.b}  │                                        │${c.x}`);
  console.log(`${c.b}  └────────────────────────────────────────┘${c.x}\n`);

  // 3. Try to open browser
  try {
    const { exec } = await import("child_process");
    const url = `${verification_uri}?code=${user_code}`;
    const cmd = process.platform === "darwin" ? `open "${url}"` :
                process.platform === "win32" ? `start "${url}"` :
                `xdg-open "${url}"`;
    exec(cmd);
    console.log(`${c.dim}  Browser opened. Waiting for approval...${c.x}\n`);
  } catch {
    console.log(`${c.dim}  Open the URL above in your browser.${c.x}\n`);
  }

  // 4. Poll for approval
  const pollInterval = (interval || 5) * 1000;
  const maxAttempts = 120; // 10 min / 5s

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    await new Promise((r) => setTimeout(r, pollInterval));

    const { ok: pollOk, status, data: pollData } = await apiPost("/api/auth/device/token", {
      device_code,
    });

    if (pollOk && pollData.access_token) {
      // Success!
      await saveAuth({
        access_token: pollData.access_token,
        refresh_token: pollData.refresh_token,
        user_id: pollData.user.id,
        email: pollData.user.email,
        name: pollData.user.name,
        expires_at: new Date(Date.now() + pollData.expires_in * 1000).toISOString(),
      });

      console.log(`${c.g}${c.b}  Authenticated!${c.x}`);
      console.log(`${c.dim}  ${pollData.user.email}${c.x}`);
      console.log(`${c.dim}  Token stored in ~/.0n/auth.json (encrypted)${c.x}\n`);
      return true;
    }

    if (status === 410) {
      console.log(`\n${c.r}  Code expired. Run ${c.b}0nmcp login${c.x}${c.r} again.${c.x}\n`);
      return false;
    }

    if (status === 403) {
      console.log(`\n${c.r}  Authorization denied.${c.x}\n`);
      return false;
    }

    // 428 = still pending, 429 = slow down (just wait)
    if (attempt % 6 === 5) {
      process.stdout.write(`${c.dim}  Still waiting...${c.x}\r`);
    }
  }

  console.log(`\n${c.r}  Timed out waiting for approval.${c.x}\n`);
  return false;
}

/**
 * Logout: revoke token on server and delete local auth.
 */
export async function logout() {
  const auth = await loadAuth();
  if (!auth) {
    console.log(`${c.y}  Not logged in.${c.x}`);
    return;
  }

  // Best-effort revoke on server
  try {
    await apiPost("/api/auth/devices", { revoke_all: false }, auth.access_token);
  } catch {
    // Server revoke is best-effort
  }

  clearAuth();
  console.log(`${c.g}  Logged out.${c.x} Token revoked and local auth cleared.`);
}

/**
 * Show current user info.
 */
export async function whoami() {
  const auth = await loadAuth();
  if (!auth) {
    console.log(`${c.y}  Not logged in.${c.x} Run ${c.cy}0nmcp login${c.x} to authenticate.`);
    return;
  }

  console.log(`\n${c.b}  0nMCP Account${c.x}`);
  console.log(`${c.dim}  ─────────────────────${c.x}`);
  if (auth.email) console.log(`  Email: ${c.cy}${auth.email}${c.x}`);
  if (auth.name) console.log(`  Name:  ${auth.name}`);
  console.log(`  User:  ${c.dim}${auth.user_id}${c.x}`);

  const expiresAt = new Date(auth.expires_at);
  const now = new Date();
  if (expiresAt > now) {
    const mins = Math.round((expiresAt.getTime() - now.getTime()) / 60000);
    console.log(`  Token: ${c.g}valid${c.x} (${mins}m remaining)`);
  } else {
    console.log(`  Token: ${c.y}expired${c.x} (will auto-refresh)`);
  }
  console.log("");
}

/**
 * Check if user is authenticated (with auto-refresh).
 * @returns {Promise<boolean>}
 */
export async function isAuthenticated() {
  const auth = await loadAuth();
  if (!auth || !auth.access_token) return false;

  // Check if token is expired
  const expiresAt = new Date(auth.expires_at);
  if (expiresAt > new Date()) return true;

  // Try to refresh
  if (auth.refresh_token) {
    const refreshed = await refreshToken();
    return refreshed;
  }

  return false;
}

/**
 * Get current access token (auto-refreshes if expired).
 * @returns {Promise<string|null>}
 */
export async function getToken() {
  const auth = await loadAuth();
  if (!auth) return null;

  const expiresAt = new Date(auth.expires_at);
  if (expiresAt > new Date()) return auth.access_token;

  // Auto-refresh
  if (auth.refresh_token) {
    const refreshed = await refreshToken();
    if (refreshed) {
      const newAuth = await loadAuth();
      return newAuth?.access_token || null;
    }
  }

  return null;
}

/**
 * Refresh the access token using the refresh token.
 * Implements token rotation.
 * @returns {Promise<boolean>}
 */
export async function refreshToken() {
  const auth = await loadAuth();
  if (!auth?.refresh_token) return false;

  try {
    const { ok, data } = await apiPost("/api/auth/refresh", {
      refresh_token: auth.refresh_token,
    });

    if (ok && data.access_token) {
      await saveAuth({
        ...auth,
        access_token: data.access_token,
        refresh_token: data.refresh_token,
        expires_at: new Date(Date.now() + data.expires_in * 1000).toISOString(),
      });
      return true;
    }
  } catch {
    // Refresh failed
  }

  return false;
}
