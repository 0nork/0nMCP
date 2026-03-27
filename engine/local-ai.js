// ============================================================
// 0nMCP — Local AI Engine (0nAI ↔ Ollama/Llama)
// ============================================================
// Direct interface to local Llama models via Ollama.
// Zero cost, fully private, no data leaves the machine.
//
// 5 MCP Tools:
//   ai_chat     — Chat with local Llama (with optional brain)
//   ai_generate — One-shot text generation
//   ai_models   — List/pull/manage local models
//   ai_embed    — Create embeddings locally
//   ai_bench    — Benchmark a prompt across local + cloud models
//
// Requires: Ollama running at localhost:11434
// ============================================================

const OLLAMA_BASE = process.env.OLLAMA_URL || "http://localhost:11434";
const DEFAULT_MODEL = process.env.OLLAMA_MODEL || "llama3.1";

/**
 * Register local AI tools on an MCP server instance.
 *
 * @param {import("@modelcontextprotocol/sdk/server/mcp.js").McpServer} server
 * @param {import("zod").ZodType} z
 */
export function registerLocalAITools(server, z) {

  // ─── ai_chat ──────────────────────────────────────────────
  server.tool(
    "ai_chat",
    `Chat with your local Llama model. Zero cost, fully private.
Supports multi-turn conversation, system prompts, and .brain file loading.

Example: ai_chat({ message: "Explain MCP servers in simple terms" })
Example: ai_chat({ message: "What is 0nMCP?", system: "You are a tech expert" })
Example: ai_chat({ message: "Score this content", brain: "~/.0n/brains/sxo-writer.brain" })
Example: ai_chat({ message: "Continue from before", history: [...previous messages...] })
Example: ai_chat({ message: "Hello", model: "mistral" })`,
    {
      message: z.string().describe("Your message to the AI"),
      system: z.string().optional().describe("System prompt (or use brain parameter)"),
      brain: z.string().optional().describe("Path to .brain file to load as system prompt"),
      model: z.string().optional().describe(`Model to use (default: ${DEFAULT_MODEL})`),
      history: z.array(z.object({
        role: z.enum(["user", "assistant", "system"]),
        content: z.string(),
      })).optional().describe("Previous conversation messages for context"),
      temperature: z.number().optional().describe("Creativity (0-2, default: 0.7)"),
      max_tokens: z.number().optional().describe("Max response length (default: 2048)"),
    },
    async ({ message, system, brain, model, history, temperature, max_tokens }) => {
      try {
        // Load brain file as system prompt if provided
        let systemPrompt = system || "";
        if (brain) {
          const { readFileSync, existsSync } = await import("fs");
          const { homedir } = await import("os");
          const resolvedPath = brain.replace("~", homedir());
          if (existsSync(resolvedPath)) {
            const brainData = JSON.parse(readFileSync(resolvedPath, "utf-8"));
            systemPrompt = brainData.prompt || "";
            if (!systemPrompt && brainData.identity) {
              // Compile on the fly
              const { compileBrainToPrompt } = await import("./brain.js").catch(() => ({}));
              if (compileBrainToPrompt) systemPrompt = compileBrainToPrompt(brainData);
            }
          }
        }

        // Build messages
        const messages = [];
        if (systemPrompt) messages.push({ role: "system", content: systemPrompt });
        if (history) messages.push(...history);
        messages.push({ role: "user", content: message });

        const startTime = Date.now();
        const res = await fetch(`${OLLAMA_BASE}/api/chat`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            model: model || DEFAULT_MODEL,
            messages,
            stream: false,
            options: {
              temperature: temperature ?? 0.7,
              num_predict: max_tokens || 2048,
            },
          }),
        });

        if (!res.ok) {
          const errText = await res.text();
          throw new Error(`Ollama error ${res.status}: ${errText}`);
        }

        const data = await res.json();
        const duration = Date.now() - startTime;
        const response = data.message?.content || "";

        return { content: [{ type: "text", text: JSON.stringify({
          status: "ok",
          model: data.model || model || DEFAULT_MODEL,
          response,
          stats: {
            duration_ms: duration,
            eval_count: data.eval_count,
            eval_duration_ms: data.eval_duration ? Math.round(data.eval_duration / 1e6) : null,
            tokens_per_second: data.eval_count && data.eval_duration
              ? Math.round(data.eval_count / (data.eval_duration / 1e9) * 10) / 10
              : null,
            prompt_tokens: data.prompt_eval_count,
            total_duration_ms: data.total_duration ? Math.round(data.total_duration / 1e6) : duration,
          },
          provider: "ollama-local",
          cost: "$0.00",
        }, null, 2) }] };
      } catch (err) {
        if (err.message?.includes("ECONNREFUSED")) {
          return { content: [{ type: "text", text: JSON.stringify({
            status: "offline",
            error: "Ollama is not running. Start it with: ollama serve",
            help: "Install: https://ollama.com | Pull a model: ollama pull llama3.1",
          }) }] };
        }
        return { content: [{ type: "text", text: JSON.stringify({ status: "failed", error: err.message }) }] };
      }
    }
  );

  // ─── ai_generate ──────────────────────────────────────────
  server.tool(
    "ai_generate",
    `One-shot text generation with local Llama. No conversation context.
Good for: summarization, code generation, analysis, content creation.

Example: ai_generate({ prompt: "Write a Python function to sort a list" })
Example: ai_generate({ prompt: "Summarize this: ...", model: "llama3.1" })`,
    {
      prompt: z.string().describe("The prompt to generate from"),
      model: z.string().optional().describe(`Model (default: ${DEFAULT_MODEL})`),
      system: z.string().optional().describe("System prompt"),
      temperature: z.number().optional().describe("Creativity (0-2, default: 0.7)"),
      max_tokens: z.number().optional().describe("Max tokens (default: 2048)"),
      format: z.enum(["text", "json"]).optional().describe("Response format"),
    },
    async ({ prompt, model, system, temperature, max_tokens, format }) => {
      try {
        const startTime = Date.now();
        const body = {
          model: model || DEFAULT_MODEL,
          prompt,
          stream: false,
          options: {
            temperature: temperature ?? 0.7,
            num_predict: max_tokens || 2048,
          },
        };
        if (system) body.system = system;
        if (format === "json") body.format = "json";

        const res = await fetch(`${OLLAMA_BASE}/api/generate`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });

        if (!res.ok) throw new Error(`Ollama error ${res.status}: ${await res.text()}`);

        const data = await res.json();
        const duration = Date.now() - startTime;

        return { content: [{ type: "text", text: JSON.stringify({
          status: "ok",
          model: data.model || model || DEFAULT_MODEL,
          response: data.response || "",
          stats: {
            duration_ms: duration,
            eval_count: data.eval_count,
            tokens_per_second: data.eval_count && data.eval_duration
              ? Math.round(data.eval_count / (data.eval_duration / 1e9) * 10) / 10
              : null,
          },
          cost: "$0.00",
        }, null, 2) }] };
      } catch (err) {
        return { content: [{ type: "text", text: JSON.stringify({ status: "failed", error: err.message }) }] };
      }
    }
  );

  // ─── ai_models ────────────────────────────────────────────
  server.tool(
    "ai_models",
    `Manage local AI models. List installed, pull new ones, get model info.

Example: ai_models({ action: "list" })
Example: ai_models({ action: "pull", name: "mistral" })
Example: ai_models({ action: "info", name: "llama3.1" })
Example: ai_models({ action: "running" })`,
    {
      action: z.enum(["list", "pull", "info", "delete", "running"]).describe("Action to perform"),
      name: z.string().optional().describe("Model name (for pull/info/delete)"),
    },
    async ({ action, name }) => {
      try {
        switch (action) {
          case "list": {
            const res = await fetch(`${OLLAMA_BASE}/api/tags`);
            const data = await res.json();
            const models = (data.models || []).map(m => ({
              name: m.name,
              size_gb: Math.round(m.size / 1e9 * 10) / 10,
              modified: m.modified_at,
              family: m.details?.family,
              parameters: m.details?.parameter_size,
              quantization: m.details?.quantization_level,
            }));
            return { content: [{ type: "text", text: JSON.stringify({
              status: "ok", count: models.length, models,
              message: models.length === 0
                ? "No models installed. Pull one with: ai_models({ action: 'pull', name: 'llama3.1' })"
                : `${models.length} model(s) installed locally.`,
            }, null, 2) }] };
          }

          case "running": {
            const res = await fetch(`${OLLAMA_BASE}/api/ps`);
            const data = await res.json();
            return { content: [{ type: "text", text: JSON.stringify({
              status: "ok",
              running: (data.models || []).map(m => ({
                name: m.name, size_gb: Math.round(m.size / 1e9 * 10) / 10,
                expires: m.expires_at,
              })),
            }, null, 2) }] };
          }

          case "info": {
            if (!name) throw new Error("Model name required");
            const res = await fetch(`${OLLAMA_BASE}/api/show`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ name }),
            });
            const data = await res.json();
            return { content: [{ type: "text", text: JSON.stringify({
              status: "ok", model: name,
              details: data.details,
              parameters: data.model_info,
              template: data.template,
              system: data.system?.substring(0, 200),
              license: data.license?.substring(0, 200),
            }, null, 2) }] };
          }

          case "pull": {
            if (!name) throw new Error("Model name required");
            const res = await fetch(`${OLLAMA_BASE}/api/pull`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ name, stream: false }),
            });
            const data = await res.json();
            return { content: [{ type: "text", text: JSON.stringify({
              status: data.status || "pulling",
              model: name,
              message: `Model "${name}" ${data.status || "pull initiated"}. This may take a while for large models.`,
            }, null, 2) }] };
          }

          case "delete": {
            if (!name) throw new Error("Model name required");
            const res = await fetch(`${OLLAMA_BASE}/api/delete`, {
              method: "DELETE",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ name }),
            });
            return { content: [{ type: "text", text: JSON.stringify({
              status: res.ok ? "deleted" : "failed",
              model: name,
            }) }] };
          }
        }
      } catch (err) {
        return { content: [{ type: "text", text: JSON.stringify({ status: "failed", error: err.message }) }] };
      }
    }
  );

  // ─── ai_embed ─────────────────────────────────────────────
  server.tool(
    "ai_embed",
    `Create text embeddings locally using Ollama. Free, private.
Useful for: semantic search, similarity matching, RAG pipelines.

Example: ai_embed({ text: "What is MCP?" })
Example: ai_embed({ text: ["Hello world", "Hi there"], model: "llama3.1" })`,
    {
      text: z.union([z.string(), z.array(z.string())]).describe("Text(s) to embed"),
      model: z.string().optional().describe(`Model (default: ${DEFAULT_MODEL})`),
    },
    async ({ text, model }) => {
      try {
        const input = Array.isArray(text) ? text : [text];
        const res = await fetch(`${OLLAMA_BASE}/api/embed`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ model: model || DEFAULT_MODEL, input }),
        });
        if (!res.ok) throw new Error(`Ollama error ${res.status}`);
        const data = await res.json();

        return { content: [{ type: "text", text: JSON.stringify({
          status: "ok",
          model: data.model || model || DEFAULT_MODEL,
          count: (data.embeddings || []).length,
          dimensions: data.embeddings?.[0]?.length || 0,
          embeddings: (data.embeddings || []).map((e, i) => ({
            text: input[i]?.substring(0, 50) + (input[i]?.length > 50 ? "..." : ""),
            vector_preview: e.slice(0, 5),
            dimensions: e.length,
          })),
          cost: "$0.00",
        }, null, 2) }] };
      } catch (err) {
        return { content: [{ type: "text", text: JSON.stringify({ status: "failed", error: err.message }) }] };
      }
    }
  );

  // ─── ai_bench ─────────────────────────────────────────────
  server.tool(
    "ai_bench",
    `Benchmark a prompt across local Llama AND cloud models side by side.
Compare speed, quality, and cost. Cloud calls use real API keys (cost money).

Example: ai_bench({ prompt: "Explain quantum computing in one paragraph" })
Example: ai_bench({ prompt: "Write a haiku about AI", providers: ["local", "anthropic"] })`,
    {
      prompt: z.string().describe("Prompt to benchmark"),
      system: z.string().optional().describe("System prompt"),
      providers: z.array(z.enum(["local", "anthropic", "openai", "gemini"])).optional()
        .describe("Providers to test (default: [local]). WARNING: cloud providers cost money."),
    },
    async ({ prompt, system, providers }) => {
      const targets = providers || ["local"];
      const results = [];

      for (const provider of targets) {
        const start = Date.now();
        let response = "";
        let tokens = 0;
        let cost = "$0.00";
        let error = null;

        try {
          if (provider === "local") {
            const body = { model: DEFAULT_MODEL, prompt, stream: false, options: { temperature: 0.7, num_predict: 512 } };
            if (system) body.system = system;
            const res = await fetch(`${OLLAMA_BASE}/api/generate`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(body),
            });
            const data = await res.json();
            response = data.response || "";
            tokens = data.eval_count || 0;
          }

          else if (provider === "anthropic") {
            if (!process.env.ANTHROPIC_API_KEY) throw new Error("No ANTHROPIC_API_KEY");
            const { default: Anthropic } = await import("@anthropic-ai/sdk");
            const client = new Anthropic();
            const msg = await client.messages.create({
              model: "claude-sonnet-4-20250514",
              max_tokens: 512,
              system: system || undefined,
              messages: [{ role: "user", content: prompt }],
            });
            response = msg.content[0]?.text || "";
            tokens = (msg.usage?.input_tokens || 0) + (msg.usage?.output_tokens || 0);
            cost = `~$${(tokens * 0.000003).toFixed(4)}`;
          }

          else if (provider === "openai") {
            if (!process.env.OPENAI_API_KEY) throw new Error("No OPENAI_API_KEY");
            const messages = [];
            if (system) messages.push({ role: "system", content: system });
            messages.push({ role: "user", content: prompt });
            const res = await fetch("https://api.openai.com/v1/chat/completions", {
              method: "POST",
              headers: { "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`, "Content-Type": "application/json" },
              body: JSON.stringify({ model: "gpt-4o", messages, max_tokens: 512 }),
            });
            const data = await res.json();
            response = data.choices?.[0]?.message?.content || "";
            tokens = (data.usage?.total_tokens || 0);
            cost = `~$${(tokens * 0.000005).toFixed(4)}`;
          }

          else if (provider === "gemini") {
            if (!process.env.GEMINI_API_KEY) throw new Error("No GEMINI_API_KEY");
            const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`;
            const body = { contents: [{ parts: [{ text: prompt }] }], generationConfig: { maxOutputTokens: 512 } };
            if (system) body.system_instruction = { parts: [{ text: system }] };
            const res = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
            const data = await res.json();
            response = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
            tokens = data.usageMetadata?.totalTokenCount || 0;
            cost = `~$${(tokens * 0.0000001).toFixed(6)}`;
          }
        } catch (e) {
          error = e.message;
        }

        const duration = Date.now() - start;
        results.push({
          provider,
          model: provider === "local" ? DEFAULT_MODEL : provider === "anthropic" ? "claude-sonnet" : provider === "openai" ? "gpt-4o" : "gemini-2.0-flash",
          response: response.substring(0, 300) + (response.length > 300 ? "..." : ""),
          response_length: response.length,
          duration_ms: duration,
          tokens,
          tokens_per_second: tokens > 0 && duration > 0 ? Math.round(tokens / (duration / 1000)) : null,
          cost,
          error,
        });
      }

      return { content: [{ type: "text", text: JSON.stringify({
        status: "ok",
        prompt: prompt.substring(0, 100),
        results,
        fastest: results.filter(r => !r.error).sort((a, b) => a.duration_ms - b.duration_ms)[0]?.provider || "none",
        cheapest: results.filter(r => !r.error).sort((a, b) => parseFloat(a.cost.replace(/[^0-9.]/g, "")) - parseFloat(b.cost.replace(/[^0-9.]/g, "")))[0]?.provider || "local",
      }, null, 2) }] };
    }
  );
}
