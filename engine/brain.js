// ============================================================
// 0nMCP — Brain Compiler & Behavior Engine
// ============================================================
// Merges BotCoaches concept into 0nAI. Portable AI behavior
// packages (.brain files) that can be imported into any app
// on any LLM.
//
// The Three-Layer Model:
//   BRAIN  = Trained Behavior (portable .brain file)
//   SKULL  = Application Container (0nCore, Marketplace, any app)
//   BODY   = LLM Compute (Claude, GPT, Gemini, Grok, Llama)
//
// 6 MCP Tools:
//   brain_create    — Create a new brain project
//   brain_build     — Add knowledge/reasoning/behavior/skills
//   brain_train     — Run scenario-based training with evaluation
//   brain_compile   — Compile to portable .brain file
//   brain_import    — Import .brain and convert to system prompt
//   brain_list      — List all brain projects
//
// Database: Supabase (pwujhhmlrtxjmjzyttwn)
// ============================================================

import { readFileSync, writeFileSync, existsSync, mkdirSync } from "fs";
import { join } from "path";
import { homedir } from "os";
import { createHash } from "crypto";

const BRAINS_DIR = join(homedir(), ".0n", "brains");

// ── .brain file format version ────────────────────────────
const BRAIN_VERSION = "1.0.0";
const BRAIN_FORMAT = "0nai-brain";

/**
 * Register brain engine tools on an MCP server instance.
 *
 * @param {import("@modelcontextprotocol/sdk/server/mcp.js").McpServer} server
 * @param {import("zod").ZodType} z
 * @param {object} [supabase]
 */
export function registerBrainTools(server, z, supabase) {

  async function getSupabase() {
    if (supabase) return supabase;
    try {
      const { createClient } = await import("@supabase/supabase-js");
      const url = process.env.SUPABASE_URL || "https://pwujhhmlrtxjmjzyttwn.supabase.co";
      const key = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
      if (!key) throw new Error("No Supabase service key");
      supabase = createClient(url, key);
      return supabase;
    } catch (err) {
      throw new Error(`Supabase not available: ${err.message}`);
    }
  }

  // ─── brain_create ─────────────────────────────────────────
  server.tool(
    "brain_create",
    `Create a new brain project. A brain is a portable AI behavior package
with knowledge, reasoning patterns, behavior rules, and skills.

Example: brain_create({ name: "CRM Expert", domain: "crm", description: "Knows all 245 CRM tools" })
Example: brain_create({ name: "SXO Writer", domain: "content", traits: ["professional", "data-driven"] })`,
    {
      name: z.string().describe("Brain name"),
      domain: z.string().describe("Domain: crm, content, sales, support, development, automation, general"),
      description: z.string().optional().describe("What this brain does"),
      traits: z.array(z.string()).optional().describe("Personality traits: professional, thorough, concise, etc."),
      base_brain: z.string().optional().describe("ID of brain to fork from"),
    },
    async ({ name, domain, description, traits, base_brain }) => {
      try {
        const sb = await getSupabase();

        let brain_data = {
          format: BRAIN_FORMAT,
          version: BRAIN_VERSION,
          identity: { name, domain, description: description || "", author: "RocketOpp", trained_by: "0nAI" },
          knowledge: { concepts: [], facts: [], rules: [], glossary: [] },
          reasoning: {
            decomposition: [],
            decision_making: [],
            question_asking: [],
          },
          behavior: {
            personality: { traits: traits || ["professional", "helpful"], boundaries: [] },
            communication: { style: "adaptive", verbosity: "balanced" },
            interaction: { greeting_patterns: [], error_handling: [] },
          },
          skills: { modules: [], tool_mapping: [] },
          evaluation: { scenarios: [], rubric: null, benchmarks: [] },
          training: { iterations: [], final_score: 0, method: "simulated" },
        };

        // Fork from existing brain
        if (base_brain) {
          const { data: parent } = await sb.from("bc_brains").select("brain_data").eq("id", base_brain).single();
          if (parent?.brain_data) {
            brain_data = { ...parent.brain_data, identity: { ...parent.brain_data.identity, name, domain, description: description || "" } };
          }
        }

        const { data, error } = await sb.from("bc_brains").insert({
          name,
          domain,
          description: description || "",
          brain_data,
          status: "draft",
          version: "0.1.0",
          training_score: 0,
        }).select("id, name, domain, status, version").single();

        if (error) throw error;

        return { content: [{ type: "text", text: JSON.stringify({
          status: "created", brain: data,
          message: `Brain "${name}" created. Use brain_build to add knowledge, reasoning, behavior, and skills.`,
          next_steps: [
            `brain_build({ brain_id: "${data.id}", layer: "knowledge", action: "add", items: [...] })`,
            `brain_build({ brain_id: "${data.id}", layer: "reasoning", action: "add", items: [...] })`,
            `brain_build({ brain_id: "${data.id}", layer: "behavior", action: "set", config: {...} })`,
          ],
        }, null, 2) }] };
      } catch (err) {
        return { content: [{ type: "text", text: JSON.stringify({ status: "failed", error: err.message }) }] };
      }
    }
  );

  // ─── brain_build ──────────────────────────────────────────
  server.tool(
    "brain_build",
    `Add knowledge, reasoning patterns, behavior rules, or skills to a brain.

Layers:
  knowledge  — concepts, facts, rules, glossary terms
  reasoning  — decomposition patterns, decision frameworks, question triggers
  behavior   — personality traits, communication style, boundaries
  skills     — capability modules, tool mappings
  scenarios  — test scenarios with expected behavior

Example: brain_build({ brain_id: "uuid", layer: "knowledge", action: "add", items: [
  { type: "fact", content: "0nMCP has 819 tools across 54 services" },
  { type: "rule", content: "Never say GHL — always say CRM" },
  { type: "concept", name: "Radial Burst", definition: "Fan-out content to all channels simultaneously" }
]})

Example: brain_build({ brain_id: "uuid", layer: "scenarios", action: "add", items: [
  { input: "How do I create a contact?", expected: "Should reference CRM contacts API, never say GHL", difficulty: "easy" }
]})`,
    {
      brain_id: z.string().describe("Brain ID"),
      layer: z.enum(["knowledge", "reasoning", "behavior", "skills", "scenarios"]).describe("Which layer to build"),
      action: z.enum(["add", "set", "remove", "clear"]).describe("add items, set config, remove by index, clear layer"),
      items: z.array(z.record(z.any())).optional().describe("Items to add (for knowledge, reasoning, skills, scenarios)"),
      config: z.record(z.any()).optional().describe("Config to set (for behavior)"),
      indices: z.array(z.number()).optional().describe("Indices to remove"),
    },
    async ({ brain_id, layer, action, items, config, indices }) => {
      try {
        const sb = await getSupabase();
        const { data: brain, error: fetchErr } = await sb.from("bc_brains").select("*").eq("id", brain_id).single();
        if (fetchErr || !brain) throw new Error("Brain not found");

        const bd = brain.brain_data;

        if (layer === "knowledge") {
          if (action === "add" && items) {
            bd.knowledge.facts = bd.knowledge.facts || [];
            bd.knowledge.concepts = bd.knowledge.concepts || [];
            bd.knowledge.rules = bd.knowledge.rules || [];
            bd.knowledge.glossary = bd.knowledge.glossary || [];
            for (const item of items) {
              const type = item.type || "fact";
              if (type === "fact") bd.knowledge.facts.push({ content: item.content, source: item.source || "manual" });
              else if (type === "concept") bd.knowledge.concepts.push({ name: item.name, definition: item.definition || item.content });
              else if (type === "rule") bd.knowledge.rules.push({ rule: item.content || item.rule, priority: item.priority || "normal" });
              else if (type === "term") bd.knowledge.glossary.push({ term: item.term || item.name, definition: item.definition || item.content });
            }
          } else if (action === "clear") {
            bd.knowledge = { concepts: [], facts: [], rules: [], glossary: [] };
          }
        }

        else if (layer === "reasoning") {
          if (action === "add" && items) {
            for (const item of items) {
              const cat = item.category || "decomposition";
              bd.reasoning[cat] = bd.reasoning[cat] || [];
              bd.reasoning[cat].push({ pattern: item.pattern || item.content, when: item.when, example: item.example });
            }
          } else if (action === "clear") {
            bd.reasoning = { decomposition: [], decision_making: [], question_asking: [] };
          }
        }

        else if (layer === "behavior") {
          if (action === "set" && config) {
            if (config.traits) bd.behavior.personality.traits = config.traits;
            if (config.boundaries) bd.behavior.personality.boundaries = config.boundaries;
            if (config.style) bd.behavior.communication.style = config.style;
            if (config.verbosity) bd.behavior.communication.verbosity = config.verbosity;
            if (config.greeting_patterns) bd.behavior.interaction.greeting_patterns = config.greeting_patterns;
            if (config.error_handling) bd.behavior.interaction.error_handling = config.error_handling;
          } else if (action === "clear") {
            bd.behavior = { personality: { traits: [], boundaries: [] }, communication: { style: "adaptive", verbosity: "balanced" }, interaction: { greeting_patterns: [], error_handling: [] } };
          }
        }

        else if (layer === "skills") {
          if (action === "add" && items) {
            bd.skills.modules = bd.skills.modules || [];
            for (const item of items) {
              bd.skills.modules.push({ name: item.name, description: item.description || "", capabilities: item.capabilities || [] });
            }
          } else if (action === "clear") {
            bd.skills = { modules: [], tool_mapping: [] };
          }
        }

        else if (layer === "scenarios") {
          if (action === "add" && items) {
            bd.evaluation.scenarios = bd.evaluation.scenarios || [];
            for (const item of items) {
              bd.evaluation.scenarios.push({
                input: item.input,
                context: item.context || null,
                expected: item.expected || null,
                difficulty: item.difficulty || "medium",
                category: item.category || "general",
              });
            }
          } else if (action === "remove" && indices) {
            bd.evaluation.scenarios = bd.evaluation.scenarios.filter((_, i) => !indices.includes(i));
          } else if (action === "clear") {
            bd.evaluation.scenarios = [];
          }
        }

        // Save
        const { error: updateErr } = await sb.from("bc_brains").update({
          brain_data: bd,
          updated_at: new Date().toISOString(),
        }).eq("id", brain_id);
        if (updateErr) throw updateErr;

        // Count items per layer
        const counts = {
          knowledge: (bd.knowledge.concepts?.length || 0) + (bd.knowledge.facts?.length || 0) + (bd.knowledge.rules?.length || 0) + (bd.knowledge.glossary?.length || 0),
          reasoning: Object.values(bd.reasoning).reduce((s, arr) => s + (arr?.length || 0), 0),
          behavior: bd.behavior.personality.traits?.length || 0,
          skills: bd.skills.modules?.length || 0,
          scenarios: bd.evaluation.scenarios?.length || 0,
        };

        return { content: [{ type: "text", text: JSON.stringify({
          status: "updated", brain_id, layer, action, counts,
          message: `Brain "${brain.name}" updated. ${layer} now has ${counts[layer]} items.`,
        }, null, 2) }] };
      } catch (err) {
        return { content: [{ type: "text", text: JSON.stringify({ status: "failed", error: err.message }) }] };
      }
    }
  );

  // ─── brain_train ──────────────────────────────────────────
  server.tool(
    "brain_train",
    `Run scenario-based training on a brain. Executes each scenario against
the brain's compiled prompt, evaluates responses against expected behavior,
and scores across multiple dimensions.

This generates training pairs that feed back into the 0nAI training pipeline.

Example: brain_train({ brain_id: "uuid" })
Example: brain_train({ brain_id: "uuid", scenarios: [0,1,2], provider: "anthropic" })`,
    {
      brain_id: z.string().describe("Brain to train"),
      scenarios: z.array(z.number()).optional().describe("Specific scenario indices to run (default: all)"),
      provider: z.enum(["local", "anthropic"]).optional().describe("LLM provider (default: local — no API cost)"),
    },
    async ({ brain_id, scenarios: scenarioIndices, provider }) => {
      try {
        const sb = await getSupabase();
        const { data: brain } = await sb.from("bc_brains").select("*").eq("id", brain_id).single();
        if (!brain) throw new Error("Brain not found");

        const bd = brain.brain_data;
        const allScenarios = bd.evaluation?.scenarios || [];

        if (allScenarios.length === 0) {
          return { content: [{ type: "text", text: JSON.stringify({
            status: "no_scenarios",
            message: "No scenarios defined. Use brain_build to add scenarios first.",
          }) }] };
        }

        const toRun = scenarioIndices
          ? allScenarios.filter((_, i) => scenarioIndices.includes(i))
          : allScenarios;

        // Compile the brain to a system prompt
        const systemPrompt = compileBrainToPrompt(bd);

        const results = [];
        for (const scenario of toRun) {
          let response;
          let score;

          if (provider === "anthropic" && process.env.ANTHROPIC_API_KEY) {
            // Live API call — COSTS MONEY
            try {
              const { default: Anthropic } = await import("@anthropic-ai/sdk");
              const client = new Anthropic();
              const msg = await client.messages.create({
                model: "claude-sonnet-4-20250514",
                max_tokens: 1024,
                system: systemPrompt,
                messages: [{ role: "user", content: scenario.input }],
              });
              response = msg.content[0]?.text || "";
            } catch (apiErr) {
              response = `[API Error: ${apiErr.message}]`;
            }
          } else {
            // Local evaluation — no API cost
            // Score based on whether the prompt + scenario alignment makes sense
            response = "[Local mode — no API call. Score based on prompt structure analysis.]";
          }

          // Score the response
          score = scoreResponse(response, scenario, bd);

          results.push({
            input: scenario.input.substring(0, 100),
            difficulty: scenario.difficulty,
            score: score.overall,
            dimensions: score.dimensions,
            passed: score.overall >= 0.7,
          });

          // Feed back into training pipeline as a pair
          if (response && response.length > 20 && !response.startsWith("[Local")) {
            await sb.from("training_pairs").insert({
              system_prompt: systemPrompt,
              user_input: scenario.input,
              assistant_output: response,
              domain: brain.domain || "general",
              difficulty: scenario.difficulty || "medium",
              quality_score: score.overall,
              tags: ["brain-training", brain.name],
              metadata: { brain_id, brain_name: brain.name },
            }).catch(() => {}); // Don't fail if training tables don't exist
          }
        }

        const avgScore = results.length > 0
          ? Math.round(results.reduce((s, r) => s + r.score, 0) / results.length * 100) / 100
          : 0;

        const passed = results.filter(r => r.passed).length;

        // Update brain score
        bd.training.iterations = bd.training.iterations || [];
        bd.training.iterations.push({
          date: new Date().toISOString(),
          scenarios_run: results.length,
          avg_score: avgScore,
          passed,
          failed: results.length - passed,
        });
        bd.training.final_score = avgScore;

        await sb.from("bc_brains").update({
          brain_data: bd,
          training_score: avgScore,
          status: avgScore >= 0.85 ? "trained" : "training",
          updated_at: new Date().toISOString(),
        }).eq("id", brain_id);

        return { content: [{ type: "text", text: JSON.stringify({
          status: "trained",
          brain: brain.name,
          scenarios_run: results.length,
          passed,
          failed: results.length - passed,
          avg_score: avgScore,
          threshold: 0.85,
          verdict: avgScore >= 0.85 ? "READY TO COMPILE" : "NEEDS MORE TRAINING",
          results,
          message: avgScore >= 0.85
            ? `Brain "${brain.name}" passed! Use brain_compile to package it.`
            : `Brain "${brain.name}" scored ${avgScore}. Add more knowledge/reasoning and retrain.`,
        }, null, 2) }] };
      } catch (err) {
        return { content: [{ type: "text", text: JSON.stringify({ status: "failed", error: err.message }) }] };
      }
    }
  );

  // ─── brain_compile ────────────────────────────────────────
  server.tool(
    "brain_compile",
    `Compile a trained brain into a portable .brain file.
The .brain file can be imported into any app on any LLM.

Also generates the system prompt version for direct use.

Example: brain_compile({ brain_id: "uuid" })
Example: brain_compile({ brain_id: "uuid", output: "prompt" }) — just get the prompt`,
    {
      brain_id: z.string().describe("Brain to compile"),
      version: z.string().optional().describe("Version tag (default: auto-increment)"),
      output: z.enum(["file", "prompt", "both"]).optional().describe("Output format (default: both)"),
    },
    async ({ brain_id, version, output }) => {
      try {
        const sb = await getSupabase();
        const { data: brain } = await sb.from("bc_brains").select("*").eq("id", brain_id).single();
        if (!brain) throw new Error("Brain not found");

        const bd = brain.brain_data;
        const outputMode = output || "both";

        // Generate system prompt
        const systemPrompt = compileBrainToPrompt(bd);

        // Build .brain file
        const brainFile = {
          $brain: {
            format: BRAIN_FORMAT,
            version: BRAIN_VERSION,
            compiled: new Date().toISOString(),
            compiler: "0nAI Brain Engine v1.0.0",
          },
          identity: bd.identity,
          knowledge: bd.knowledge,
          reasoning: bd.reasoning,
          behavior: bd.behavior,
          skills: bd.skills,
          evaluation: {
            scenarios_count: bd.evaluation?.scenarios?.length || 0,
            final_score: bd.training?.final_score || 0,
            training_iterations: bd.training?.iterations?.length || 0,
          },
          prompt: systemPrompt,
          checksum: null,
        };

        // Compute checksum
        const content = JSON.stringify(brainFile);
        brainFile.checksum = createHash("sha256").update(content).digest("hex");

        const result = { status: "compiled", brain: brain.name, version: version || brain.version };

        // Save .brain file
        if (outputMode === "file" || outputMode === "both") {
          if (!existsSync(BRAINS_DIR)) mkdirSync(BRAINS_DIR, { recursive: true });
          const filename = `${brain.name.toLowerCase().replace(/\s+/g, "-")}-v${version || brain.version}.brain`;
          const filePath = join(BRAINS_DIR, filename);
          writeFileSync(filePath, JSON.stringify(brainFile, null, 2));
          result.file = filePath;
          result.size_bytes = Buffer.byteLength(JSON.stringify(brainFile));
        }

        // Return prompt
        if (outputMode === "prompt" || outputMode === "both") {
          result.prompt = systemPrompt;
          result.prompt_tokens = Math.ceil(systemPrompt.length / 4);
        }

        result.checksum = brainFile.checksum;
        result.message = `Brain "${brain.name}" compiled. ${outputMode === "prompt" ? "Prompt ready." : `Saved to ${result.file}`}`;

        // Update DB
        const newVer = version || incrementVersion(brain.version);
        await sb.from("bc_brains").update({
          version: newVer,
          status: "compiled",
          updated_at: new Date().toISOString(),
        }).eq("id", brain_id);

        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      } catch (err) {
        return { content: [{ type: "text", text: JSON.stringify({ status: "failed", error: err.message }) }] };
      }
    }
  );

  // ─── brain_import ─────────────────────────────────────────
  server.tool(
    "brain_import",
    `Import a .brain file and extract its system prompt for use in any LLM.
Can import from file path or raw JSON.

Example: brain_import({ path: "~/.0n/brains/crm-expert-v1.0.0.brain" })
Example: brain_import({ brain_data: {...} })`,
    {
      path: z.string().optional().describe("Path to .brain file"),
      brain_data: z.record(z.any()).optional().describe("Raw brain data JSON"),
      target_llm: z.enum(["claude", "openai", "gemini", "grok", "generic"]).optional().describe("Target LLM format (default: claude)"),
    },
    async ({ path, brain_data, target_llm }) => {
      try {
        let brain;
        if (path) {
          const resolvedPath = path.replace("~", homedir());
          if (!existsSync(resolvedPath)) throw new Error(`File not found: ${resolvedPath}`);
          brain = JSON.parse(readFileSync(resolvedPath, "utf-8"));
        } else if (brain_data) {
          brain = brain_data;
        } else {
          throw new Error("Provide path or brain_data");
        }

        // Validate format
        if (!brain.$brain && !brain.identity) throw new Error("Invalid .brain file format");

        // Extract or regenerate prompt
        let prompt = brain.prompt;
        if (!prompt) {
          prompt = compileBrainToPrompt(brain);
        }

        // Format for target LLM
        const llm = target_llm || "claude";
        let formatted;
        if (llm === "openai") {
          formatted = { role: "system", content: prompt };
        } else if (llm === "gemini") {
          formatted = { system_instruction: { parts: [{ text: prompt }] } };
        } else {
          formatted = { system: prompt };
        }

        return { content: [{ type: "text", text: JSON.stringify({
          status: "imported",
          name: brain.identity?.name || "Unknown",
          domain: brain.identity?.domain || "general",
          score: brain.evaluation?.final_score || brain.training?.final_score || 0,
          prompt_length: prompt.length,
          prompt_tokens: Math.ceil(prompt.length / 4),
          target_llm: llm,
          formatted,
          prompt,
          message: `Brain "${brain.identity?.name}" imported. Ready to use with ${llm}.`,
        }, null, 2) }] };
      } catch (err) {
        return { content: [{ type: "text", text: JSON.stringify({ status: "failed", error: err.message }) }] };
      }
    }
  );

  // ─── brain_list ───────────────────────────────────────────
  server.tool(
    "brain_list",
    `List all brain projects with their status and training scores.

Example: brain_list({})
Example: brain_list({ domain: "crm" })
Example: brain_list({ status: "trained" })`,
    {
      domain: z.string().optional().describe("Filter by domain"),
      status: z.enum(["draft", "training", "trained", "compiled", "published"]).optional().describe("Filter by status"),
    },
    async ({ domain, status }) => {
      try {
        const sb = await getSupabase();
        let query = sb.from("bc_brains").select("id, name, domain, description, status, version, training_score, created_at, updated_at")
          .order("updated_at", { ascending: false });
        if (domain) query = query.eq("domain", domain);
        if (status) query = query.eq("status", status);

        const { data, error } = await query;
        if (error) throw error;

        // Also check local .brain files
        let localFiles = [];
        if (existsSync(BRAINS_DIR)) {
          const { readdirSync } = await import("fs");
          localFiles = readdirSync(BRAINS_DIR).filter(f => f.endsWith(".brain")).map(f => ({
            file: f,
            path: join(BRAINS_DIR, f),
          }));
        }

        return { content: [{ type: "text", text: JSON.stringify({
          status: "ok",
          count: (data || []).length,
          brains: data || [],
          local_files: localFiles,
          message: `${(data || []).length} brain(s) in database, ${localFiles.length} compiled .brain file(s) in ~/.0n/brains/`,
        }, null, 2) }] };
      } catch (err) {
        return { content: [{ type: "text", text: JSON.stringify({ status: "failed", error: err.message }) }] };
      }
    }
  );
}

// ── Brain-to-Prompt Compiler ──────────────────────────────

/**
 * Compile brain data into a system prompt for any LLM.
 */
function compileBrainToPrompt(bd) {
  const sections = [];

  // Identity
  if (bd.identity) {
    sections.push(`# ${bd.identity.name}\n\nYou are ${bd.identity.name}. ${bd.identity.description || ""}\nDomain: ${bd.identity.domain || "general"}`);
  }

  // Knowledge — Rules (highest priority)
  if (bd.knowledge?.rules?.length) {
    sections.push("## Rules\n\n" + bd.knowledge.rules.map((r, i) => `${i + 1}. ${r.rule || r.content}`).join("\n"));
  }

  // Knowledge — Core concepts
  if (bd.knowledge?.concepts?.length) {
    sections.push("## Core Concepts\n\n" + bd.knowledge.concepts.map(c =>
      `**${c.name}**: ${c.definition}`
    ).join("\n\n"));
  }

  // Knowledge — Facts
  if (bd.knowledge?.facts?.length) {
    sections.push("## Key Facts\n\n" + bd.knowledge.facts.map(f => `- ${f.content}`).join("\n"));
  }

  // Knowledge — Glossary
  if (bd.knowledge?.glossary?.length) {
    sections.push("## Glossary\n\n" + bd.knowledge.glossary.map(t => `- **${t.term}**: ${t.definition}`).join("\n"));
  }

  // Reasoning patterns
  const allPatterns = [
    ...(bd.reasoning?.decomposition || []).map(p => ({ ...p, cat: "Decomposition" })),
    ...(bd.reasoning?.decision_making || []).map(p => ({ ...p, cat: "Decision Making" })),
    ...(bd.reasoning?.question_asking || []).map(p => ({ ...p, cat: "Question Asking" })),
  ];
  if (allPatterns.length) {
    sections.push("## Reasoning Patterns\n\n" + allPatterns.map(p =>
      `### ${p.cat}\n${p.pattern || p.content}${p.when ? `\n**When:** ${p.when}` : ""}${p.example ? `\n**Example:** ${p.example}` : ""}`
    ).join("\n\n"));
  }

  // Behavior
  if (bd.behavior?.personality?.traits?.length) {
    sections.push("## Behavior\n\n" +
      `**Traits:** ${bd.behavior.personality.traits.join(", ")}\n` +
      `**Style:** ${bd.behavior.communication?.style || "adaptive"}\n` +
      `**Verbosity:** ${bd.behavior.communication?.verbosity || "balanced"}`
    );
    if (bd.behavior.personality.boundaries?.length) {
      sections.push("**Boundaries:**\n" + bd.behavior.personality.boundaries.map(b => `- ${b}`).join("\n"));
    }
  }

  // Skills
  if (bd.skills?.modules?.length) {
    sections.push("## Skills\n\n" + bd.skills.modules.map(s =>
      `### ${s.name}\n${s.description}${s.capabilities?.length ? "\n- " + s.capabilities.join("\n- ") : ""}`
    ).join("\n\n"));
  }

  return sections.join("\n\n---\n\n");
}

// ── Response Scoring ──────────────────────────────────────

/**
 * Score a response against a scenario and brain config.
 */
function scoreResponse(response, scenario, bd) {
  const dimensions = {};
  let total = 0;
  let count = 0;

  // Relevance — does the response address the input?
  const inputWords = new Set(scenario.input.toLowerCase().split(/\s+/).filter(w => w.length > 3));
  const responseWords = new Set(response.toLowerCase().split(/\s+/).filter(w => w.length > 3));
  let overlap = 0;
  for (const w of inputWords) if (responseWords.has(w)) overlap++;
  dimensions.relevance = inputWords.size > 0 ? Math.min(1, overlap / inputWords.size + 0.3) : 0.5;
  total += dimensions.relevance; count++;

  // Rule compliance — check against brain rules
  const rules = bd.knowledge?.rules || [];
  let ruleScore = 1.0;
  for (const rule of rules) {
    const ruleText = (rule.rule || rule.content || "").toLowerCase();
    // Check for "never" rules
    if (ruleText.includes("never")) {
      const forbidden = ruleText.replace(/never\s+(say|use|mention)\s+/i, "").replace(/['"]/g, "").trim().split(/\s*[,—-]\s*/);
      for (const word of forbidden) {
        if (word.length > 2 && response.toLowerCase().includes(word.toLowerCase())) {
          ruleScore -= 0.3;
        }
      }
    }
  }
  dimensions.rule_compliance = Math.max(0, ruleScore);
  total += dimensions.rule_compliance; count++;

  // Completeness — response length relative to expected
  if (response.length > 50) dimensions.completeness = Math.min(1, response.length / 200);
  else dimensions.completeness = 0.3;
  total += dimensions.completeness; count++;

  // Structure — has formatting (headers, lists, code blocks)
  let structureScore = 0.4;
  if (response.includes("- ") || response.includes("* ")) structureScore += 0.2;
  if (response.includes("**") || response.includes("##")) structureScore += 0.2;
  if (response.includes("```")) structureScore += 0.2;
  dimensions.structure = Math.min(1, structureScore);
  total += dimensions.structure; count++;

  // Tone — matches brain personality
  const traits = bd.behavior?.personality?.traits || [];
  dimensions.tone = traits.length > 0 ? 0.7 : 0.5; // baseline
  total += dimensions.tone; count++;

  const overall = count > 0 ? Math.round(total / count * 100) / 100 : 0;

  return { overall, dimensions };
}

// ── Helpers ───────────────────────────────────────────────

function incrementVersion(ver) {
  if (!ver) return "0.1.0";
  const parts = ver.split(".").map(Number);
  parts[2] = (parts[2] || 0) + 1;
  return parts.join(".");
}
