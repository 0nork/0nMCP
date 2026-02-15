#!/usr/bin/env node
// ============================================================
// 0nMCP — Engine Module Tests
// ============================================================
// Tests for the .0n Conversion Engine: cipher-portable, parser,
// mapper, validator, platforms, bundler.
//
// Run: node --test test-engine.mjs
// ============================================================

import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { writeFileSync, readFileSync, existsSync, mkdirSync, unlinkSync, rmSync } from "fs";
import { join } from "path";
import { tmpdir } from "os";

// ── Cipher Portable ──────────────────────────────────────────

import { sealPortable, unsealPortable, verifyPortable } from "./engine/cipher-portable.js";

describe("cipher-portable", () => {
  it("seal + unseal round-trip", () => {
    const plaintext = "hello world secret data";
    const passphrase = "test-passphrase-123";

    const { sealed } = sealPortable(plaintext, passphrase);
    assert.ok(sealed, "sealed data should exist");
    assert.ok(typeof sealed === "string", "sealed should be a string (base64)");

    const result = unsealPortable(sealed, passphrase);
    assert.equal(result, plaintext);
  });

  it("wrong passphrase fails", () => {
    const { sealed } = sealPortable("secret", "correct-pass");
    assert.throws(() => unsealPortable(sealed, "wrong-pass"));
  });

  it("verify with correct passphrase", () => {
    const { sealed } = sealPortable("data", "pass");
    const result = verifyPortable(sealed, "pass");
    assert.equal(result.valid, true);
    assert.equal(result.error, undefined);
  });

  it("verify with wrong passphrase", () => {
    const { sealed } = sealPortable("data", "pass");
    const result = verifyPortable(sealed, "wrong");
    assert.equal(result.valid, false);
    assert.ok(result.error);
  });

  it("sealed data is base64", () => {
    const { sealed } = sealPortable("test", "pass");
    // Should not throw when decoded as base64
    const buf = Buffer.from(sealed, "base64");
    assert.ok(buf.length > 0);
    // Re-encode should match original
    assert.equal(buf.toString("base64"), sealed);
  });

  it("different passphrases produce different sealed data", () => {
    const { sealed: s1 } = sealPortable("same data", "pass1");
    const { sealed: s2 } = sealPortable("same data", "pass2");
    assert.notEqual(s1, s2);
  });
});

// ── Parser ───────────────────────────────────────────────────

import { parseEnvString, parseCsvString, parseJsonString, detectFormat, parseFile } from "./engine/parser.js";

describe("parser", () => {
  it("parse .env string", () => {
    const content = `
# Comment
STRIPE_SECRET_KEY=sk_test_123
OPENAI_API_KEY="sk-abc-def"
export SLACK_BOT_TOKEN=xoxb-token
EMPTY_VAR=
`;
    const entries = parseEnvString(content);
    assert.ok(Array.isArray(entries));
    assert.ok(entries.length >= 3);

    const stripe = entries.find(e => e.key === "STRIPE_SECRET_KEY");
    assert.equal(stripe.value, "sk_test_123");

    const openai = entries.find(e => e.key === "OPENAI_API_KEY");
    assert.equal(openai.value, "sk-abc-def");

    const slack = entries.find(e => e.key === "SLACK_BOT_TOKEN");
    assert.equal(slack.value, "xoxb-token");
  });

  it("parse CSV string", () => {
    const content = `key,value
STRIPE_API_KEY,sk_test_456
GITHUB_TOKEN,ghp_abc123`;
    const entries = parseCsvString(content);
    assert.ok(Array.isArray(entries));
    assert.equal(entries.length, 2);
    assert.equal(entries[0].key, "STRIPE_API_KEY");
    assert.equal(entries[0].value, "sk_test_456");
  });

  it("parse JSON string (flat)", () => {
    const content = JSON.stringify({
      STRIPE_SECRET_KEY: "sk_test_789",
      OPENAI_API_KEY: "sk-openai",
    });
    const entries = parseJsonString(content);
    assert.ok(Array.isArray(entries));
    assert.equal(entries.length, 2);
  });

  it("parse JSON string (nested)", () => {
    const content = JSON.stringify({
      stripe: { apiKey: "sk_test_nested" },
      openai: { apiKey: "sk-nested" },
    });
    const entries = parseJsonString(content);
    assert.ok(Array.isArray(entries));
    assert.ok(entries.length >= 2);
  });

  it("detect format from extension", () => {
    assert.equal(detectFormat("test.env"), "env");
    assert.equal(detectFormat(".env"), "env");
    assert.equal(detectFormat(".env.local"), "env");
    assert.equal(detectFormat("creds.csv"), "csv");
    assert.equal(detectFormat("config.json"), "json");
  });

  it("parse file from disk", () => {
    const tmpFile = join(tmpdir(), `test-env-${Date.now()}.env`);
    writeFileSync(tmpFile, "TEST_KEY=test_value\n");
    try {
      const result = parseFile(tmpFile);
      assert.equal(result.format, "env");
      assert.equal(result.entries.length, 1);
      assert.equal(result.entries[0].key, "TEST_KEY");
    } finally {
      unlinkSync(tmpFile);
    }
  });
});

// ── Mapper ───────────────────────────────────────────────────

import { mapEnvVars, groupByService, validateMapping } from "./engine/mapper.js";

describe("mapper", () => {
  it("maps known env vars", () => {
    const entries = [
      { key: "STRIPE_SECRET_KEY", value: "sk_test_123" },
      { key: "OPENAI_API_KEY", value: "sk-openai" },
      { key: "SLACK_BOT_TOKEN", value: "xoxb-token" },
      { key: "UNKNOWN_VAR", value: "something" },
    ];
    const { mapped, unmapped } = mapEnvVars(entries);
    assert.ok(mapped.length >= 3, `expected >= 3 mapped, got ${mapped.length}`);
    assert.ok(unmapped.length >= 1, `expected >= 1 unmapped, got ${unmapped.length}`);

    const stripe = mapped.find(m => m.service === "stripe");
    assert.ok(stripe, "stripe should be mapped");
    assert.equal(stripe.field, "apiKey");
  });

  it("groups by service", () => {
    const entries = [
      { key: "TWILIO_ACCOUNT_SID", value: "AC123" },
      { key: "TWILIO_AUTH_TOKEN", value: "token123" },
    ];
    const { mapped } = mapEnvVars(entries);
    const groups = groupByService(mapped);
    assert.ok(groups.twilio, "twilio group should exist");
    assert.ok(groups.twilio.credentials.accountSid, "accountSid should be present");
    assert.ok(groups.twilio.credentials.authToken, "authToken should be present");
  });

  it("validates complete service mapping", () => {
    const result = validateMapping("stripe", { apiKey: "sk_test" });
    assert.equal(result.valid, true);
    assert.equal(result.missing.length, 0);
  });

  it("validates incomplete service mapping", () => {
    const result = validateMapping("twilio", { accountSid: "AC123" });
    assert.equal(result.valid, false);
    assert.ok(result.missing.includes("authToken"));
  });

  it("pattern matching fallback", () => {
    const entries = [
      { key: "CALENDLY_API_KEY", value: "cal_key" },
    ];
    const { mapped } = mapEnvVars(entries);
    assert.ok(mapped.length > 0, "calendly should be mapped");
  });
});

// ── Platforms ────────────────────────────────────────────────

import { generatePlatformConfig, generateAllPlatformConfigs, listPlatforms, getPlatformInfo } from "./engine/platforms.js";

describe("platforms", () => {
  it("lists 7 platforms", () => {
    const platforms = listPlatforms();
    assert.equal(platforms.length, 7);
    assert.ok(platforms.includes("claude_desktop"));
    assert.ok(platforms.includes("cursor"));
    assert.ok(platforms.includes("openai"));
  });

  it("generates Claude Desktop config", () => {
    const config = generatePlatformConfig("claude_desktop");
    assert.ok(config.config.mcpServers);
    assert.ok(config.config.mcpServers["0nmcp"]);
    assert.equal(config.format, "json");
    assert.ok(config.path);
  });

  it("generates all platform configs", () => {
    const configs = generateAllPlatformConfigs();
    assert.equal(Object.keys(configs).length, 7);
  });

  it("OpenAI config has HTTP endpoint", () => {
    const config = generatePlatformConfig("openai");
    assert.ok(config.config.url || config.config.type === "streamable-http");
  });

  it("Windsurf supports HTTP mode", () => {
    const config = generatePlatformConfig("windsurf", { mode: "http" });
    assert.ok(config.config.mcpServers["0nmcp"].serverUrl);
  });

  it("throws on unknown platform", () => {
    assert.throws(() => generatePlatformConfig("unknown_platform"));
  });

  it("getPlatformInfo returns install status", () => {
    const info = getPlatformInfo();
    assert.equal(info.length, 7);
    assert.ok(info[0].platform);
    assert.ok(typeof info[0].installed === "boolean");
  });
});

// ── Bundler ──────────────────────────────────────────────────

import { createBundle, openBundle, inspectBundle, verifyBundle } from "./engine/bundler.js";

describe("bundler", () => {
  const testDir = join(tmpdir(), `0nmcp-test-${Date.now()}`);
  const passphrase = "test-bundle-pass";

  it("create + inspect + verify + open round-trip", () => {
    mkdirSync(testDir, { recursive: true });

    const connections = {
      stripe: {
        credentials: { apiKey: "sk_test_roundtrip" },
        name: "Stripe Test",
        authType: "api_key",
        environment: "test",
      },
      openai: {
        credentials: { apiKey: "sk-openai-test" },
        name: "OpenAI Test",
        authType: "api_key",
      },
    };

    const outPath = join(testDir, "test-bundle.0n");

    // Create
    const result = createBundle({
      connections,
      passphrase,
      outputPath: outPath,
      name: "Test AI Brain",
      platforms: "all",
    });

    assert.ok(existsSync(outPath), "bundle file should exist");
    assert.equal(result.manifest.connection_count, 2);
    assert.ok(result.manifest.services.includes("stripe"));
    assert.ok(result.manifest.services.includes("openai"));
    assert.equal(result.manifest.platform_count, 7);

    // Inspect (no passphrase needed)
    const info = inspectBundle(outPath);
    assert.equal(info.name, "Test AI Brain");
    assert.equal(info.services.length, 2);
    assert.ok(info.services[0].sealed);

    // Verify
    const verification = verifyBundle(outPath, passphrase);
    assert.equal(verification.valid, true);
    assert.equal(verification.errors.length, 0);

    // Verify wrong passphrase
    const badVerify = verifyBundle(outPath, "wrong-pass");
    assert.equal(badVerify.valid, false);
    assert.ok(badVerify.errors.length > 0);

    // Open (extract connections — we won't install to ~/.0n in test, just verify extraction)
    const opened = openBundle(outPath, passphrase, { installConnections: false });
    assert.ok(opened.connections.includes("stripe"));
    assert.ok(opened.connections.includes("openai"));
    assert.equal(opened.errors.length, 0);

    // Cleanup
    rmSync(testDir, { recursive: true, force: true });
  });

  it("unsealed bundle (no encryption)", () => {
    mkdirSync(testDir, { recursive: true });

    const connections = {
      github: {
        credentials: { token: "ghp_test" },
        name: "GitHub",
      },
    };

    const outPath = join(testDir, "unsealed.0n");

    const result = createBundle({
      connections,
      passphrase: "unused",
      outputPath: outPath,
      seal: false,
    });

    assert.equal(result.manifest.encryption.method, "none");

    // Should be readable as plain JSON
    const raw = JSON.parse(readFileSync(outPath, "utf-8"));
    assert.equal(raw.connections[0].sealed, false);
    assert.equal(raw.connections[0].credentials.token, "ghp_test");

    rmSync(testDir, { recursive: true, force: true });
  });

  it("rejects invalid bundle files", () => {
    const tmpFile = join(tmpdir(), `not-a-bundle-${Date.now()}.0n`);
    writeFileSync(tmpFile, JSON.stringify({ notABundle: true }));
    assert.throws(() => inspectBundle(tmpFile), /Not a valid .0n bundle/);
    unlinkSync(tmpFile);
  });
});

// ── Integration: Full Pipeline ───────────────────────────────

describe("full pipeline", () => {
  it("parse → map → bundle → open round-trip", () => {
    const testDir = join(tmpdir(), `0nmcp-pipeline-${Date.now()}`);
    mkdirSync(testDir, { recursive: true });

    // 1. Create a test .env file
    const envFile = join(testDir, "test.env");
    writeFileSync(envFile, `STRIPE_SECRET_KEY=sk_test_pipeline_key
OPENAI_API_KEY=sk-pipeline-openai
GITHUB_TOKEN=ghp_pipeline_token
RANDOM_VALUE=should_be_unmapped
`);

    // 2. Parse
    const { entries } = parseFile(envFile);
    assert.ok(entries.length >= 3);

    // 3. Map
    const { mapped, unmapped } = mapEnvVars(entries);
    assert.ok(mapped.length >= 3);
    assert.ok(unmapped.length >= 1);

    // 4. Group
    const groups = groupByService(mapped);
    assert.ok(groups.stripe);
    assert.ok(groups.openai);
    assert.ok(groups.github);

    // 5. Bundle
    const connections = {};
    for (const [service, group] of Object.entries(groups)) {
      connections[service] = {
        credentials: group.credentials,
        name: service,
      };
    }

    const bundlePath = join(testDir, "pipeline.0n");
    const bundle = createBundle({
      connections,
      passphrase: "pipeline-pass",
      outputPath: bundlePath,
      name: "Pipeline Test Brain",
    });

    assert.ok(existsSync(bundlePath));
    assert.equal(bundle.manifest.connection_count, 3);

    // 6. Open
    const opened = openBundle(bundlePath, "pipeline-pass", { installConnections: false });
    assert.equal(opened.connections.length, 3);
    assert.equal(opened.errors.length, 0);

    // Cleanup
    rmSync(testDir, { recursive: true, force: true });
  });
});

// ── Cipher Portable vs Vault Cipher Isolation ────────────────

import { seal as vaultSeal, unseal as vaultUnseal } from "./vault/cipher.js";

describe("cipher isolation", () => {
  it("portable seal cannot be opened by vault unseal", () => {
    const { sealed } = sealPortable("secret data", "same-pass");
    // Vault unseal uses machine fingerprint in key derivation — should fail
    assert.throws(() => vaultUnseal(sealed, "same-pass"));
  });

  it("vault seal cannot be opened by portable unseal", () => {
    const { sealed } = vaultSeal("secret data", "same-pass");
    // Portable unseal doesn't use fingerprint — different key — should fail
    assert.throws(() => unsealPortable(sealed, "same-pass"));
  });
});
