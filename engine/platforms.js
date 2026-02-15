// ============================================================
// 0nMCP — Engine: Platform Config Generator
// ============================================================
// Generates MCP server configurations for all major AI
// platforms: Claude Desktop, Cursor, Windsurf, Gemini,
// Continue, Cline, and OpenAI.
// ============================================================

import { existsSync, readFileSync, writeFileSync, mkdirSync, copyFileSync } from "fs";
import { join, dirname } from "path";
import { homedir, platform as osPlatform } from "os";

const HOME = homedir();
const IS_MAC = osPlatform() === "darwin";
const IS_WIN = osPlatform() === "win32";

// ── Platform definitions ───────────────────────────────────

const PLATFORMS = {
  claude_desktop: {
    name: "Claude Desktop",
    format: "json",
    configPath: () => {
      if (IS_MAC) return join(HOME, "Library", "Application Support", "Claude", "claude_desktop_config.json");
      if (IS_WIN) return join(process.env.APPDATA || "", "Claude", "claude_desktop_config.json");
      return join(HOME, ".config", "Claude", "claude_desktop_config.json");
    },
    generate: (opts) => ({
      mcpServers: {
        "0nmcp": {
          command: opts.command || "npx",
          args: opts.args || ["-y", "0nmcp"],
          ...(opts.env && Object.keys(opts.env).length > 0 ? { env: opts.env } : {}),
        },
      },
    }),
  },

  cursor: {
    name: "Cursor",
    format: "json",
    configPath: () => join(HOME, ".cursor", "mcp.json"),
    generate: (opts) => ({
      mcpServers: {
        "0nmcp": {
          command: opts.command || "npx",
          args: opts.args || ["-y", "0nmcp"],
          ...(opts.env && Object.keys(opts.env).length > 0 ? { env: opts.env } : {}),
        },
      },
    }),
  },

  windsurf: {
    name: "Windsurf",
    format: "json",
    configPath: () => join(HOME, ".codeium", "windsurf", "mcp_config.json"),
    generate: (opts) => {
      if (opts.mode === "http") {
        return {
          mcpServers: {
            "0nmcp": {
              serverUrl: opts.httpUrl || "http://localhost:3000/mcp",
            },
          },
        };
      }
      return {
        mcpServers: {
          "0nmcp": {
            command: opts.command || "npx",
            args: opts.args || ["-y", "0nmcp"],
            ...(opts.env && Object.keys(opts.env).length > 0 ? { env: opts.env } : {}),
          },
        },
      };
    },
  },

  gemini: {
    name: "Gemini",
    format: "json",
    configPath: () => join(HOME, ".gemini", "settings.json"),
    generate: (opts) => ({
      mcpServers: {
        "0nmcp": {
          command: opts.command || "npx",
          args: opts.args || ["-y", "0nmcp"],
        },
      },
    }),
  },

  continue: {
    name: "Continue",
    format: "yaml",
    configPath: () => join(HOME, ".continue", "config.yaml"),
    generate: (opts) => {
      const cmd = opts.command || "npx";
      const args = opts.args || ["-y", "0nmcp"];
      const argsYaml = args.map(a => `      - "${a}"`).join("\n");
      let yaml = `mcpServers:\n  - name: 0nmcp\n    command: ${cmd}\n    args:\n${argsYaml}\n`;
      if (opts.env && Object.keys(opts.env).length > 0) {
        yaml += "    env:\n";
        for (const [k, v] of Object.entries(opts.env)) {
          yaml += `      ${k}: "${v}"\n`;
        }
      }
      return yaml;
    },
  },

  cline: {
    name: "Cline",
    format: "json",
    configPath: () => {
      if (IS_MAC) return join(HOME, "Library", "Application Support", "Code", "User", "globalStorage", "saoudrizwan.claude-dev", "settings", "cline_mcp_settings.json");
      if (IS_WIN) return join(process.env.APPDATA || "", "Code", "User", "globalStorage", "saoudrizwan.claude-dev", "settings", "cline_mcp_settings.json");
      return join(HOME, ".config", "Code", "User", "globalStorage", "saoudrizwan.claude-dev", "settings", "cline_mcp_settings.json");
    },
    generate: (opts) => ({
      mcpServers: {
        "0nmcp": {
          command: opts.command || "npx",
          args: opts.args || ["-y", "0nmcp"],
          ...(opts.env && Object.keys(opts.env).length > 0 ? { env: opts.env } : {}),
          alwaysAllow: [],
          disabled: false,
        },
      },
    }),
  },

  openai: {
    name: "OpenAI",
    format: "json",
    configPath: () => null, // No local config file — HTTP only
    generate: (opts) => ({
      type: "streamable-http",
      url: opts.httpUrl || "http://localhost:3000/mcp",
      instructions: "Start the 0nMCP HTTP server first: npx 0nmcp serve --port 3000. Then add this URL as an MCP connector in OpenAI settings.",
    }),
  },
};

/**
 * Generate config for a single platform.
 * @param {string} platform - Platform key
 * @param {object} options - { command?, args?, env?, mode?, httpUrl? }
 * @returns {{ config: object|string, path: string|null, format: string, name: string }}
 */
export function generatePlatformConfig(platform, options = {}) {
  const p = PLATFORMS[platform];
  if (!p) throw new Error(`Unknown platform: ${platform}. Available: ${Object.keys(PLATFORMS).join(", ")}`);

  return {
    config: p.generate(options),
    path: p.configPath(),
    format: p.format,
    name: p.name,
  };
}

/**
 * Generate configs for all platforms.
 * @param {object} options
 * @returns {Record<string, { config: object|string, path: string|null, format: string, name: string }>}
 */
export function generateAllPlatformConfigs(options = {}) {
  const configs = {};
  for (const key of Object.keys(PLATFORMS)) {
    configs[key] = generatePlatformConfig(key, options);
  }
  return configs;
}

/**
 * Install a platform config to disk.
 * Merges 0nmcp entry into existing config if present. Backs up existing file.
 * @param {string} platform
 * @param {object} options
 * @returns {{ success: boolean, path: string, backed_up?: string, error?: string }}
 */
export function installPlatformConfig(platform, options = {}) {
  const { config, path, format, name } = generatePlatformConfig(platform, options);

  if (!path) {
    return { success: false, path: null, error: `${name} does not use a local config file (HTTP-only).` };
  }

  try {
    const dir = dirname(path);
    if (!existsSync(dir)) mkdirSync(dir, { recursive: true });

    let backed_up;

    if (format === "json") {
      let existing = {};
      if (existsSync(path)) {
        // Backup existing
        backed_up = `${path}.bak.${Date.now()}`;
        copyFileSync(path, backed_up);
        existing = JSON.parse(readFileSync(path, "utf-8"));
      }

      // Merge mcpServers
      if (config.mcpServers) {
        existing.mcpServers = existing.mcpServers || {};
        Object.assign(existing.mcpServers, config.mcpServers);
      }

      writeFileSync(path, JSON.stringify(existing, null, 2));
    } else if (format === "yaml") {
      if (existsSync(path)) {
        backed_up = `${path}.bak.${Date.now()}`;
        copyFileSync(path, backed_up);
        // Append to existing YAML
        const existing = readFileSync(path, "utf-8");
        writeFileSync(path, existing + "\n" + config);
      } else {
        writeFileSync(path, typeof config === "string" ? config : JSON.stringify(config, null, 2));
      }
    }

    return { success: true, path, backed_up, name };
  } catch (err) {
    return { success: false, path, error: err.message };
  }
}

/**
 * Get info about all platforms and whether configs are installed.
 * @returns {Array<{ platform: string, name: string, configPath: string|null, installed: boolean, format: string }>}
 */
export function getPlatformInfo() {
  return Object.entries(PLATFORMS).map(([key, p]) => {
    const path = p.configPath();
    return {
      platform: key,
      name: p.name,
      configPath: path,
      installed: path ? existsSync(path) : false,
      format: p.format,
    };
  });
}

/**
 * Get list of supported platform keys.
 * @returns {string[]}
 */
export function listPlatforms() {
  return Object.keys(PLATFORMS);
}
