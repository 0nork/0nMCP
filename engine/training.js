// ============================================================
// 0nMCP — AI Training Engine (0nAI Training Center)
// ============================================================
// Tools for building, curating, scoring, and exporting
// training datasets for the 0nAI model.
//
// 8 MCP Tools:
//   training_ingest     — Ingest raw material from files/memory/code
//   training_generate   — Generate training pairs from sources
//   training_score      — Score pairs against rubrics
//   training_dataset    — Create/manage named datasets
//   training_export     — Export dataset as fine-tuning JSONL
//   training_stats      — Training center analytics
//   training_search     — Search sources and pairs
//   training_review     — Review and approve/reject pairs
//
// Database: Supabase (pwujhhmlrtxjmjzyttwn)
// Tables: training_sources, training_pairs, training_datasets,
//         training_evaluations, training_exports, training_rubrics
// ============================================================

import { readFileSync, readdirSync, existsSync } from "fs";
import { writeFileSync, mkdirSync } from "fs";
import { join, basename, extname } from "path";
import { homedir } from "os";
import { createHash } from "crypto";

const EXPORTS_DIR = join(homedir(), ".0n", "training");
const MEMORY_DIR = join(homedir(), ".claude", "projects", "-Users-rocketopp", "memory");

// ── System prompt for 0nAI ──────────────────────────────────

const ONAI_SYSTEM_PROMPT = `You are Jaxx, the AI engine powering the 0nORK ecosystem. You are an expert in:
- 0nMCP: Universal AI API Orchestrator with 1,171+ tools across 54 services
- The .0n Standard: Universal config format, field resolution, workflow runtime
- CRM integration (NEVER say "GHL" or "GoHighLevel" — always "CRM" or "ROCKET")
- 0nVault: AES-256-GCM encrypted credential storage
- The 0n Network: 0nMCP, 0n-spec, 0nork, 0n Marketplace, 0nCore, 0nmcp.com

Rules:
- Push to main, deploy immediately — no feature branches
- Dark theme UI with brand green #7ed957
- ESM modules, TypeScript strict, Tailwind v4
- Data-driven patterns over code repetition
- Never over-engineer. Simplest solution first.
- Client emails ALWAYS go through CRM built-in email, never SendGrid/Resend`;

/**
 * Register training engine tools on an MCP server instance.
 *
 * @param {import("@modelcontextprotocol/sdk/server/mcp.js").McpServer} server
 * @param {import("zod").ZodType} z
 * @param {object} [supabase] — Supabase client (optional, creates one if missing)
 */
export function registerTrainingTools(server, z, supabase) {

  // Lazy Supabase init
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

  // ─── training_ingest ──────────────────────────────────────
  server.tool(
    "training_ingest",
    `Ingest raw training material from files, memory, code, or text.
Stores in training_sources table for later pair generation.

Sources: memory files, .js/.ts code, .md docs, raw text, API patterns.

Example: training_ingest({ source_type: "memory", path: "~/.claude/projects/-Users-rocketopp/memory/" })
Example: training_ingest({ source_type: "code", path: "~/Github/0nMCP/catalog.js" })
Example: training_ingest({ source_type: "text", title: "CRM Email Rule", content: "Client emails always go through CRM..." })`,
    {
      source_type: z.enum(["memory", "code", "documentation", "api_pattern", "decision", "brand", "text", "conversation"]).describe("Type of source material"),
      path: z.string().optional().describe("File or directory path to ingest"),
      title: z.string().optional().describe("Title (required for text type)"),
      content: z.string().optional().describe("Raw content (for text type, or override file content)"),
      tags: z.array(z.string()).optional().describe("Tags for categorization"),
    },
    async ({ source_type, path, title, content, tags }) => {
      try {
        const sb = await getSupabase();
        const sources = [];

        if (path) {
          const resolvedPath = path.replace("~", homedir());

          if (existsSync(resolvedPath)) {
            const stat = await import("fs").then(fs => fs.statSync(resolvedPath));

            if (stat.isDirectory()) {
              // Ingest all files in directory
              const files = readdirSync(resolvedPath).filter(f =>
                [".md", ".js", ".ts", ".json", ".txt", ".0n"].some(ext => f.endsWith(ext))
              );

              for (const file of files) {
                const filePath = join(resolvedPath, file);
                const fileContent = readFileSync(filePath, "utf-8");
                const tokens = Math.ceil(fileContent.length / 4); // rough estimate

                sources.push({
                  source_type,
                  source_path: filePath,
                  title: basename(file, extname(file)),
                  content: fileContent,
                  token_count: tokens,
                  tags: tags || [],
                  status: "raw",
                  metadata: { file_size: fileContent.length, extension: extname(file) },
                });
              }
            } else {
              // Single file
              const fileContent = content || readFileSync(resolvedPath, "utf-8");
              const tokens = Math.ceil(fileContent.length / 4);

              sources.push({
                source_type,
                source_path: resolvedPath,
                title: title || basename(resolvedPath, extname(resolvedPath)),
                content: fileContent,
                token_count: tokens,
                tags: tags || [],
                status: "raw",
                metadata: { file_size: fileContent.length, extension: extname(resolvedPath) },
              });
            }
          } else {
            return { content: [{ type: "text", text: JSON.stringify({ status: "failed", error: `Path not found: ${resolvedPath}` }) }] };
          }
        } else if (content) {
          // Raw text input
          sources.push({
            source_type,
            source_path: null,
            title: title || `${source_type} source`,
            content,
            token_count: Math.ceil(content.length / 4),
            tags: tags || [],
            status: "raw",
            metadata: {},
          });
        } else {
          return { content: [{ type: "text", text: JSON.stringify({ status: "failed", error: "Provide path or content" }) }] };
        }

        // Insert all sources
        const { data, error } = await sb.from("training_sources").insert(sources).select("id, title, token_count");
        if (error) throw error;

        return {
          content: [{
            type: "text",
            text: JSON.stringify({
              status: "ingested",
              count: data.length,
              total_tokens: data.reduce((s, d) => s + (d.token_count || 0), 0),
              sources: data.map(d => ({ id: d.id, title: d.title, tokens: d.token_count })),
              message: `Ingested ${data.length} source(s). Use training_generate to create pairs.`,
            }, null, 2),
          }],
        };
      } catch (err) {
        return { content: [{ type: "text", text: JSON.stringify({ status: "failed", error: err.message }) }] };
      }
    }
  );

  // ─── training_generate ────────────────────────────────────
  server.tool(
    "training_generate",
    `Generate training pairs (system/user/assistant) from ingested sources.
Creates high-quality Q&A pairs formatted for fine-tuning.

Example: training_generate({ source_id: "uuid", count: 5 })
Example: training_generate({ domain: "crm", count: 10 })
Example: training_generate({ pairs: [{ user_input: "How do I...", assistant_output: "You can..." }] })`,
    {
      source_id: z.string().optional().describe("Generate pairs from a specific source"),
      domain: z.string().optional().describe("Domain filter: architecture, crm, workflow, brand, code, support"),
      count: z.number().optional().describe("Number of pairs to generate (default: 5)"),
      dataset_id: z.string().optional().describe("Add pairs to this dataset"),
      difficulty: z.enum(["easy", "medium", "hard", "expert"]).optional().describe("Target difficulty level"),
      pairs: z.array(z.object({
        user_input: z.string(),
        assistant_output: z.string(),
        system_prompt: z.string().optional(),
        domain: z.string().optional(),
        difficulty: z.string().optional(),
        tags: z.array(z.string()).optional(),
      })).optional().describe("Manually provide pairs to insert"),
    },
    async ({ source_id, domain, count, dataset_id, difficulty, pairs }) => {
      try {
        const sb = await getSupabase();

        if (pairs && pairs.length > 0) {
          // Direct insert of manually provided pairs
          const rows = pairs.map(p => ({
            dataset_id: dataset_id || null,
            system_prompt: p.system_prompt || ONAI_SYSTEM_PROMPT,
            user_input: p.user_input,
            assistant_output: p.assistant_output,
            domain: p.domain || domain || "general",
            difficulty: p.difficulty || difficulty || "medium",
            tags: p.tags || [],
            quality_score: null,
            human_reviewed: false,
            approved: false,
            metadata: { manually_created: true },
          }));

          const { data, error } = await sb.from("training_pairs").insert(rows).select("id");
          if (error) throw error;

          // Update dataset pair count
          if (dataset_id) {
            await sb.rpc("update_dataset_count", { ds_id: dataset_id }).catch(() => {
              // RPC may not exist yet, update manually
              sb.from("training_datasets").update({
                pair_count: data.length,
                updated_at: new Date().toISOString(),
              }).eq("id", dataset_id);
            });
          }

          return {
            content: [{
              type: "text",
              text: JSON.stringify({
                status: "generated",
                count: data.length,
                ids: data.map(d => d.id),
                message: `Created ${data.length} training pair(s). Use training_score to evaluate quality.`,
              }, null, 2),
            }],
          };
        }

        // Generate from source content
        let sourceContent = "";
        let sourceTitle = "";

        if (source_id) {
          const { data: source, error } = await sb.from("training_sources").select("*").eq("id", source_id).single();
          if (error || !source) throw new Error("Source not found");
          sourceContent = source.content;
          sourceTitle = source.title;
        } else {
          // Pull recent unprocessed sources
          let query = sb.from("training_sources").select("*").eq("status", "raw").order("created_at", { ascending: false }).limit(3);
          if (domain) {
            query = query.contains("tags", [domain]);
          }
          const { data: sources } = await query;
          if (!sources || sources.length === 0) {
            return { content: [{ type: "text", text: JSON.stringify({ status: "no_sources", message: "No raw sources found. Use training_ingest first." }) }] };
          }
          sourceContent = sources.map(s => `## ${s.title}\n${s.content}`).join("\n\n---\n\n");
          sourceTitle = sources.map(s => s.title).join(", ");
        }

        // For now, return instructions for manual pair creation
        // (AI generation would require Anthropic API calls which cost money)
        const suggestedPairs = generatePairSuggestions(sourceContent, sourceTitle, domain, count || 5);

        return {
          content: [{
            type: "text",
            text: JSON.stringify({
              status: "suggestions_ready",
              source: sourceTitle,
              suggested_count: suggestedPairs.length,
              pairs: suggestedPairs,
              message: `Generated ${suggestedPairs.length} pair suggestions from "${sourceTitle}". Review and submit with training_generate({ pairs: [...] }) to save.`,
            }, null, 2),
          }],
        };
      } catch (err) {
        return { content: [{ type: "text", text: JSON.stringify({ status: "failed", error: err.message }) }] };
      }
    }
  );

  // ─── training_score ───────────────────────────────────────
  server.tool(
    "training_score",
    `Score training pairs against rubrics for quality assessment.

Example: training_score({ pair_id: "uuid" })
Example: training_score({ dataset_id: "uuid" }) — score all unscored pairs in dataset
Example: training_score({ pair_id: "uuid", scores: { accuracy: 5, brand_voice: 4, helpfulness: 5 } })`,
    {
      pair_id: z.string().optional().describe("Score a specific pair"),
      dataset_id: z.string().optional().describe("Score all unscored pairs in dataset"),
      rubric_id: z.string().optional().describe("Use specific rubric (default: domain-matched or general)"),
      scores: z.record(z.number()).optional().describe("Manual scores: { criterion_name: 1-5 }"),
      auto: z.boolean().optional().describe("Auto-score based on heuristics (no API cost)"),
    },
    async ({ pair_id, dataset_id, rubric_id, scores, auto }) => {
      try {
        const sb = await getSupabase();

        // Get rubric
        let rubric;
        if (rubric_id) {
          const { data } = await sb.from("training_rubrics").select("*").eq("id", rubric_id).single();
          rubric = data;
        }

        // Get pairs to score
        let pairs = [];
        if (pair_id) {
          const { data } = await sb.from("training_pairs").select("*").eq("id", pair_id);
          pairs = data || [];
        } else if (dataset_id) {
          const { data } = await sb.from("training_pairs").select("*").eq("dataset_id", dataset_id).is("quality_score", null).limit(50);
          pairs = data || [];
        }

        if (pairs.length === 0) {
          return { content: [{ type: "text", text: JSON.stringify({ status: "no_pairs", message: "No pairs to score" }) }] };
        }

        const results = [];

        for (const pair of pairs) {
          let finalScore;

          if (scores && pair_id) {
            // Manual scoring
            if (!rubric) {
              const { data: r } = await sb.from("training_rubrics")
                .select("*")
                .or(`domain.is.null,domain.eq.${pair.domain || "general"}`)
                .eq("is_active", true)
                .limit(1)
                .single();
              rubric = r;
            }

            if (rubric) {
              const criteria = rubric.criteria;
              let weightedSum = 0;
              let totalWeight = 0;
              for (const c of criteria) {
                const score = scores[c.name];
                if (score !== undefined) {
                  weightedSum += (score / 5) * c.weight;
                  totalWeight += c.weight;
                }
              }
              finalScore = totalWeight > 0 ? Math.round((weightedSum / totalWeight) * 100) / 100 : null;
            }
          } else if (auto) {
            // Heuristic auto-scoring (free, no API)
            finalScore = autoScore(pair);
          }

          if (finalScore !== null && finalScore !== undefined) {
            await sb.from("training_pairs").update({
              quality_score: finalScore,
              human_reviewed: !!scores,
              updated_at: new Date().toISOString(),
              metadata: { ...pair.metadata, scored_at: new Date().toISOString(), rubric_used: rubric?.name },
            }).eq("id", pair.id);

            results.push({ id: pair.id, score: finalScore, domain: pair.domain });
          }
        }

        return {
          content: [{
            type: "text",
            text: JSON.stringify({
              status: "scored",
              count: results.length,
              avg_score: results.length > 0 ? Math.round(results.reduce((s, r) => s + r.score, 0) / results.length * 100) / 100 : 0,
              results,
            }, null, 2),
          }],
        };
      } catch (err) {
        return { content: [{ type: "text", text: JSON.stringify({ status: "failed", error: err.message }) }] };
      }
    }
  );

  // ─── training_dataset ─────────────────────────────────────
  server.tool(
    "training_dataset",
    `Create or manage training datasets — named collections of pairs.

Example: training_dataset({ action: "create", name: "0nAI-CRM-v1", description: "CRM expertise pairs" })
Example: training_dataset({ action: "list" })
Example: training_dataset({ action: "add_pairs", dataset_id: "uuid", pair_ids: ["uuid1", "uuid2"] })
Example: training_dataset({ action: "auto_fill", dataset_id: "uuid", min_quality: 0.7 })`,
    {
      action: z.enum(["create", "list", "get", "add_pairs", "remove_pairs", "auto_fill", "delete"]).describe("Action to perform"),
      name: z.string().optional().describe("Dataset name (for create)"),
      description: z.string().optional().describe("Dataset description (for create)"),
      target_model: z.string().optional().describe("Target model: claude, openai, gemini, llama"),
      dataset_id: z.string().optional().describe("Dataset ID (for get/add/remove/auto_fill)"),
      pair_ids: z.array(z.string()).optional().describe("Pair IDs to add/remove"),
      min_quality: z.number().optional().describe("Minimum quality score for auto_fill (default: 0.7)"),
      domain: z.string().optional().describe("Domain filter for auto_fill"),
    },
    async ({ action, name, description, target_model, dataset_id, pair_ids, min_quality, domain }) => {
      try {
        const sb = await getSupabase();

        switch (action) {
          case "create": {
            const { data, error } = await sb.from("training_datasets").insert({
              name: name || "Untitled Dataset",
              description: description || "",
              target_model: target_model || "claude",
              status: "building",
            }).select().single();
            if (error) throw error;
            return { content: [{ type: "text", text: JSON.stringify({ status: "created", dataset: data }) }] };
          }

          case "list": {
            const { data, error } = await sb.from("training_datasets").select("*").order("created_at", { ascending: false });
            if (error) throw error;
            return { content: [{ type: "text", text: JSON.stringify({ status: "ok", count: data.length, datasets: data }, null, 2) }] };
          }

          case "get": {
            if (!dataset_id) throw new Error("dataset_id required");
            const { data: ds } = await sb.from("training_datasets").select("*").eq("id", dataset_id).single();
            const { count } = await sb.from("training_pairs").select("id", { count: "exact", head: true }).eq("dataset_id", dataset_id);
            const { data: sample } = await sb.from("training_pairs").select("id, user_input, quality_score, domain, approved").eq("dataset_id", dataset_id).order("quality_score", { ascending: false, nullsFirst: false }).limit(5);
            return { content: [{ type: "text", text: JSON.stringify({ status: "ok", dataset: ds, pair_count: count, sample_pairs: sample }, null, 2) }] };
          }

          case "add_pairs": {
            if (!dataset_id || !pair_ids?.length) throw new Error("dataset_id and pair_ids required");
            const { error } = await sb.from("training_pairs").update({ dataset_id }).in("id", pair_ids);
            if (error) throw error;
            const { count } = await sb.from("training_pairs").select("id", { count: "exact", head: true }).eq("dataset_id", dataset_id);
            await sb.from("training_datasets").update({ pair_count: count, updated_at: new Date().toISOString() }).eq("id", dataset_id);
            return { content: [{ type: "text", text: JSON.stringify({ status: "added", pairs_added: pair_ids.length, total_pairs: count }) }] };
          }

          case "auto_fill": {
            if (!dataset_id) throw new Error("dataset_id required");
            const minQ = min_quality || 0.7;
            let query = sb.from("training_pairs").select("id").gte("quality_score", minQ).is("dataset_id", null);
            if (domain) query = query.eq("domain", domain);
            const { data: eligible } = await query;
            if (!eligible?.length) return { content: [{ type: "text", text: JSON.stringify({ status: "no_pairs", message: `No unassigned pairs with quality >= ${minQ}` }) }] };
            const ids = eligible.map(p => p.id);
            await sb.from("training_pairs").update({ dataset_id }).in("id", ids);
            await sb.from("training_datasets").update({ pair_count: ids.length, updated_at: new Date().toISOString() }).eq("id", dataset_id);
            return { content: [{ type: "text", text: JSON.stringify({ status: "filled", pairs_added: ids.length }) }] };
          }

          case "delete": {
            if (!dataset_id) throw new Error("dataset_id required");
            await sb.from("training_pairs").update({ dataset_id: null }).eq("dataset_id", dataset_id);
            await sb.from("training_datasets").delete().eq("id", dataset_id);
            return { content: [{ type: "text", text: JSON.stringify({ status: "deleted" }) }] };
          }

          default:
            return { content: [{ type: "text", text: JSON.stringify({ status: "failed", error: `Unknown action: ${action}` }) }] };
        }
      } catch (err) {
        return { content: [{ type: "text", text: JSON.stringify({ status: "failed", error: err.message }) }] };
      }
    }
  );

  // ─── training_export ──────────────────────────────────────
  server.tool(
    "training_export",
    `Export a training dataset as a fine-tuning JSONL file.
Supports Anthropic, OpenAI, Alpaca, and ShareGPT formats.

Example: training_export({ dataset_id: "uuid", format: "anthropic_jsonl" })
Example: training_export({ dataset_id: "uuid", format: "openai_jsonl", min_quality: 0.8 })`,
    {
      dataset_id: z.string().describe("Dataset to export"),
      format: z.enum(["anthropic_jsonl", "openai_jsonl", "alpaca", "sharegpt"]).describe("Export format"),
      min_quality: z.number().optional().describe("Minimum quality score to include (default: 0)"),
      approved_only: z.boolean().optional().describe("Only export approved pairs (default: false)"),
      output: z.string().optional().describe("Output file path (default: ~/.0n/training/)"),
    },
    async ({ dataset_id, format, min_quality, approved_only, output }) => {
      try {
        const sb = await getSupabase();

        // Fetch pairs
        let query = sb.from("training_pairs").select("*").eq("dataset_id", dataset_id).order("quality_score", { ascending: false, nullsFirst: false });
        if (min_quality) query = query.gte("quality_score", min_quality);
        if (approved_only) query = query.eq("approved", true);

        const { data: pairs, error } = await query;
        if (error) throw error;
        if (!pairs?.length) return { content: [{ type: "text", text: JSON.stringify({ status: "no_pairs", message: "No pairs match criteria" }) }] };

        // Format pairs
        let lines;
        switch (format) {
          case "anthropic_jsonl":
            lines = pairs.map(p => JSON.stringify({
              messages: [
                { role: "system", content: p.system_prompt || ONAI_SYSTEM_PROMPT },
                { role: "user", content: p.user_input },
                { role: "assistant", content: p.assistant_output },
              ],
            }));
            break;

          case "openai_jsonl":
            lines = pairs.map(p => JSON.stringify({
              messages: [
                { role: "system", content: p.system_prompt || ONAI_SYSTEM_PROMPT },
                { role: "user", content: p.user_input },
                { role: "assistant", content: p.assistant_output },
              ],
            }));
            break;

          case "alpaca":
            lines = pairs.map(p => JSON.stringify({
              instruction: p.user_input,
              input: "",
              output: p.assistant_output,
              system: p.system_prompt || ONAI_SYSTEM_PROMPT,
            }));
            break;

          case "sharegpt":
            lines = pairs.map(p => JSON.stringify({
              conversations: [
                { from: "system", value: p.system_prompt || ONAI_SYSTEM_PROMPT },
                { from: "human", value: p.user_input },
                { from: "gpt", value: p.assistant_output },
              ],
            }));
            break;
        }

        const content = lines.join("\n") + "\n";
        const hash = createHash("sha256").update(content).digest("hex");

        // Save file
        if (!existsSync(EXPORTS_DIR)) mkdirSync(EXPORTS_DIR, { recursive: true });
        const filename = `0nai-${format}-${Date.now()}.jsonl`;
        const filePath = output || join(EXPORTS_DIR, filename);
        writeFileSync(filePath, content);

        // Record export
        await sb.from("training_exports").insert({
          dataset_id,
          format,
          pair_count: pairs.length,
          file_size_bytes: Buffer.byteLength(content),
          file_hash: hash,
          export_path: filePath,
          config: { min_quality, approved_only },
        });

        // Update dataset status
        await sb.from("training_datasets").update({ status: "exported", updated_at: new Date().toISOString() }).eq("id", dataset_id);

        return {
          content: [{
            type: "text",
            text: JSON.stringify({
              status: "exported",
              format,
              pairs: pairs.length,
              file: filePath,
              size_bytes: Buffer.byteLength(content),
              hash,
              message: `Exported ${pairs.length} pairs to ${filePath}`,
            }, null, 2),
          }],
        };
      } catch (err) {
        return { content: [{ type: "text", text: JSON.stringify({ status: "failed", error: err.message }) }] };
      }
    }
  );

  // ─── training_stats ───────────────────────────────────────
  server.tool(
    "training_stats",
    `Get analytics for the 0nAI Training Center.

Example: training_stats({})`,
    {},
    async () => {
      try {
        const sb = await getSupabase();

        const [sources, pairs, datasets, exports, runs, knowledge] = await Promise.all([
          sb.from("training_sources").select("id, source_type, status, token_count", { count: "exact" }),
          sb.from("training_pairs").select("id, domain, quality_score, approved, dataset_id", { count: "exact" }),
          sb.from("training_datasets").select("*"),
          sb.from("training_exports").select("id, format, pair_count, created_at", { count: "exact" }),
          sb.from("training_runs").select("id, entries_added, avg_composite_score", { count: "exact" }),
          sb.from("council_knowledge").select("id, domain, composite_score", { count: "exact" }),
        ]);

        const sourcesByType = {};
        for (const s of sources.data || []) {
          sourcesByType[s.source_type] = (sourcesByType[s.source_type] || 0) + 1;
        }

        const pairsByDomain = {};
        let approvedCount = 0;
        let scoredCount = 0;
        let totalScore = 0;
        for (const p of pairs.data || []) {
          pairsByDomain[p.domain || "unset"] = (pairsByDomain[p.domain || "unset"] || 0) + 1;
          if (p.approved) approvedCount++;
          if (p.quality_score) { scoredCount++; totalScore += Number(p.quality_score); }
        }

        const totalTokens = (sources.data || []).reduce((s, d) => s + (d.token_count || 0), 0);

        return {
          content: [{
            type: "text",
            text: JSON.stringify({
              status: "ok",
              training_center: {
                sources: { total: sources.count || 0, by_type: sourcesByType, total_tokens: totalTokens },
                pairs: {
                  total: pairs.count || 0,
                  by_domain: pairsByDomain,
                  approved: approvedCount,
                  scored: scoredCount,
                  avg_quality: scoredCount > 0 ? Math.round(totalScore / scoredCount * 100) / 100 : 0,
                },
                datasets: {
                  total: (datasets.data || []).length,
                  list: (datasets.data || []).map(d => ({ id: d.id, name: d.name, pairs: d.pair_count, status: d.status })),
                },
                exports: { total: exports.count || 0 },
                council: {
                  training_runs: runs.count || 0,
                  knowledge_entries: knowledge.count || 0,
                  avg_score: (knowledge.data || []).length > 0
                    ? Math.round((knowledge.data || []).reduce((s, k) => s + Number(k.composite_score || 0), 0) / knowledge.data.length * 100) / 100
                    : 0,
                },
              },
            }, null, 2),
          }],
        };
      } catch (err) {
        return { content: [{ type: "text", text: JSON.stringify({ status: "failed", error: err.message }) }] };
      }
    }
  );

  // ─── training_search ──────────────────────────────────────
  server.tool(
    "training_search",
    `Search training sources and pairs by keyword or domain.

Example: training_search({ query: "CRM contacts", table: "pairs" })
Example: training_search({ domain: "crm", min_quality: 0.8 })`,
    {
      query: z.string().optional().describe("Search keyword"),
      table: z.enum(["sources", "pairs", "both"]).optional().describe("Which table to search (default: both)"),
      domain: z.string().optional().describe("Filter by domain"),
      min_quality: z.number().optional().describe("Minimum quality score"),
      limit: z.number().optional().describe("Max results (default: 20)"),
    },
    async ({ query, table, domain, min_quality, limit: maxResults }) => {
      try {
        const sb = await getSupabase();
        const lim = maxResults || 20;
        const results = { sources: [], pairs: [] };

        if (table !== "pairs") {
          let q = sb.from("training_sources").select("id, title, source_type, status, token_count, tags, created_at").order("created_at", { ascending: false }).limit(lim);
          if (query) q = q.textSearch("fts", query.split(" ").join(" & "));
          const { data } = await q;
          results.sources = data || [];
        }

        if (table !== "sources") {
          let q = sb.from("training_pairs").select("id, user_input, assistant_output, domain, quality_score, approved, dataset_id, created_at").order("created_at", { ascending: false }).limit(lim);
          if (query) q = q.textSearch("fts", query.split(" ").join(" & "));
          if (domain) q = q.eq("domain", domain);
          if (min_quality) q = q.gte("quality_score", min_quality);
          const { data } = await q;
          results.pairs = data || [];
        }

        return {
          content: [{
            type: "text",
            text: JSON.stringify({
              status: "ok",
              sources: results.sources.length,
              pairs: results.pairs.length,
              results,
            }, null, 2),
          }],
        };
      } catch (err) {
        return { content: [{ type: "text", text: JSON.stringify({ status: "failed", error: err.message }) }] };
      }
    }
  );

  // ─── training_review ──────────────────────────────────────
  server.tool(
    "training_review",
    `Review and approve/reject training pairs.

Example: training_review({ pair_id: "uuid", action: "approve" })
Example: training_review({ pair_id: "uuid", action: "reject", reason: "Inaccurate API path" })
Example: training_review({ action: "pending", limit: 10 }) — get unreviewed pairs`,
    {
      action: z.enum(["approve", "reject", "pending", "edit"]).describe("Review action"),
      pair_id: z.string().optional().describe("Pair to review"),
      reason: z.string().optional().describe("Rejection reason"),
      user_input: z.string().optional().describe("Updated user input (for edit)"),
      assistant_output: z.string().optional().describe("Updated assistant output (for edit)"),
      limit: z.number().optional().describe("Number of pending pairs to show (default: 10)"),
    },
    async ({ action, pair_id, reason, user_input, assistant_output, limit: maxResults }) => {
      try {
        const sb = await getSupabase();

        switch (action) {
          case "approve": {
            if (!pair_id) throw new Error("pair_id required");
            await sb.from("training_pairs").update({ approved: true, human_reviewed: true, updated_at: new Date().toISOString() }).eq("id", pair_id);
            return { content: [{ type: "text", text: JSON.stringify({ status: "approved", pair_id }) }] };
          }

          case "reject": {
            if (!pair_id) throw new Error("pair_id required");
            await sb.from("training_pairs").update({ approved: false, human_reviewed: true, rejection_reason: reason || null, updated_at: new Date().toISOString() }).eq("id", pair_id);
            return { content: [{ type: "text", text: JSON.stringify({ status: "rejected", pair_id, reason }) }] };
          }

          case "pending": {
            const { data } = await sb.from("training_pairs")
              .select("id, user_input, assistant_output, domain, quality_score, tags")
              .eq("human_reviewed", false)
              .order("created_at", { ascending: true })
              .limit(maxResults || 10);
            return { content: [{ type: "text", text: JSON.stringify({ status: "ok", count: data?.length || 0, pairs: data }, null, 2) }] };
          }

          case "edit": {
            if (!pair_id) throw new Error("pair_id required");
            const updates = { updated_at: new Date().toISOString() };
            if (user_input) updates.user_input = user_input;
            if (assistant_output) updates.assistant_output = assistant_output;
            await sb.from("training_pairs").update(updates).eq("id", pair_id);
            return { content: [{ type: "text", text: JSON.stringify({ status: "edited", pair_id }) }] };
          }
        }
      } catch (err) {
        return { content: [{ type: "text", text: JSON.stringify({ status: "failed", error: err.message }) }] };
      }
    }
  );
}

// ── Helpers ──────────────────────────────────────────────────

/**
 * Auto-score a training pair using heuristics (no API cost).
 */
function autoScore(pair) {
  let score = 0.5; // baseline

  const output = pair.assistant_output || "";
  const input = pair.user_input || "";

  // Length checks
  if (output.length > 100) score += 0.05;
  if (output.length > 300) score += 0.05;
  if (output.length > 50 && output.length < 2000) score += 0.05;

  // Has code blocks
  if (output.includes("```")) score += 0.05;

  // Doesn't say GHL
  if (!output.toLowerCase().includes("ghl") && !output.toLowerCase().includes("go high level") && !output.toLowerCase().includes("highlevel")) {
    score += 0.1;
  } else {
    score -= 0.3; // severe penalty
  }

  // References 0n ecosystem
  if (output.includes("0nMCP") || output.includes("0nmcp") || output.includes(".0n")) score += 0.05;

  // Has structure (bullet points, headers)
  if (output.includes("- ") || output.includes("* ") || output.includes("1.")) score += 0.05;

  // Input/output relevance (shared words)
  const inputWords = new Set(input.toLowerCase().split(/\s+/).filter(w => w.length > 3));
  const outputWords = new Set(output.toLowerCase().split(/\s+/).filter(w => w.length > 3));
  let overlap = 0;
  for (const w of inputWords) if (outputWords.has(w)) overlap++;
  if (inputWords.size > 0) score += Math.min(0.1, (overlap / inputWords.size) * 0.1);

  return Math.min(1.0, Math.max(0.0, Math.round(score * 100) / 100));
}

/**
 * Generate pair suggestions from source content (no API cost).
 * Returns structured suggestions the user can review and submit.
 */
function generatePairSuggestions(content, title, domain, count) {
  const suggestions = [];
  const lines = content.split("\n").filter(l => l.trim().length > 20);

  // Extract potential Q&A from headers and content
  for (let i = 0; i < lines.length && suggestions.length < count; i++) {
    const line = lines[i].trim();

    // Headers become questions
    if (line.startsWith("#") || line.startsWith("##")) {
      const topic = line.replace(/^#+\s*/, "");
      if (topic.length > 10) {
        const context = lines.slice(i + 1, i + 5).join(" ").slice(0, 500);
        suggestions.push({
          user_input: `What is ${topic} in the 0n ecosystem?`,
          assistant_output: context || `${topic} is a component of the 0nORK platform.`,
          domain: domain || "general",
          source: title,
        });
      }
    }

    // Code patterns
    if (line.includes("function ") || line.includes("export ") || line.includes("class ")) {
      suggestions.push({
        user_input: `How does the ${line.slice(0, 60).replace(/[{(]/g, "")} work?`,
        assistant_output: `[Review and write explanation based on: ${line.slice(0, 200)}]`,
        domain: domain || "code",
        source: title,
      });
    }

    // Config/endpoint patterns
    if (line.includes("baseUrl") || line.includes("endpoint") || line.includes("path:")) {
      suggestions.push({
        user_input: `What API endpoint does this use?`,
        assistant_output: `[Review and explain the endpoint from: ${line.slice(0, 200)}]`,
        domain: domain || "api_pattern",
        source: title,
      });
    }
  }

  return suggestions.slice(0, count);
}
