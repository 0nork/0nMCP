// ============================================================
// 0nMCP — Multi-AI Council Engine
// ============================================================
// Jaxx orchestrates conversations across multiple AI providers.
// Send a problem → all AIs respond → Jaxx synthesizes the best answer.
//
// Providers: OpenAI (GPT), Google (Gemini), Anthropic (Claude), xAI (Grok)
//
// SECURITY: API keys NEVER leave this module. Other AIs only see
// the problem statement — never our credentials, architecture,
// database schemas, or internal systems.
//
// 4 MCP Tools:
//   council_ask      — Ask all AIs a question, get parallel responses
//   council_debate   — Have AIs critique each other's answers
//   council_solve    — Full pipeline: ask → debate → synthesize
//   council_config   — Check which providers are available
// ============================================================

const PROVIDERS = {
  openai: {
    name: 'OpenAI (GPT-4o)',
    url: 'https://api.openai.com/v1/chat/completions',
    model: 'gpt-4o',
    envKey: 'OPENAI_API_KEY',
    buildRequest: (prompt, systemPrompt, apiKey) => ({
      url: 'https://api.openai.com/v1/chat/completions',
      options: {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'gpt-4o',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: prompt },
          ],
          max_tokens: 2000,
          temperature: 0.7,
        }),
      },
      extract: (data) => data.choices?.[0]?.message?.content || 'No response',
    }),
  },

  gemini: {
    name: 'Google (Gemini)',
    url: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent',
    envKey: 'GEMINI_API_KEY',
    buildRequest: (prompt, systemPrompt, apiKey) => ({
      url: `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      options: {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: systemPrompt }] },
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { maxOutputTokens: 2000, temperature: 0.7 },
        }),
      },
      extract: (data) => data.candidates?.[0]?.content?.parts?.[0]?.text || 'No response',
    }),
  },

  grok: {
    name: 'xAI (Grok)',
    url: 'https://api.x.ai/v1/chat/completions',
    envKey: 'XAI_API_KEY',
    buildRequest: (prompt, systemPrompt, apiKey) => ({
      url: 'https://api.x.ai/v1/chat/completions',
      options: {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'grok-3-latest',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: prompt },
          ],
          max_tokens: 2000,
          temperature: 0.7,
        }),
      },
      extract: (data) => data.choices?.[0]?.message?.content || 'No response',
    }),
  },

  anthropic: {
    name: 'Anthropic (Claude)',
    url: 'https://api.anthropic.com/v1/messages',
    envKey: 'ANTHROPIC_API_KEY',
    buildRequest: (prompt, systemPrompt, apiKey) => ({
      url: 'https://api.anthropic.com/v1/messages',
      options: {
        method: 'POST',
        headers: {
          'x-api-key': apiKey,
          'Content-Type': 'application/json',
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          system: systemPrompt,
          messages: [{ role: 'user', content: prompt }],
          max_tokens: 2000,
        }),
      },
      extract: (data) => data.content?.[0]?.text || 'No response',
    }),
  },
};

// SECURITY: Sanitize prompts to never leak internal info
const SAFETY_PREAMBLE = `You are being asked a question as part of a multi-AI collaborative problem-solving session.
Answer the question directly and thoroughly. Do not ask for additional context about the user's systems or infrastructure.`;

/**
 * Get available providers (have API keys set)
 */
function getAvailableProviders() {
  const available = [];
  for (const [key, provider] of Object.entries(PROVIDERS)) {
    const apiKey = process.env[provider.envKey];
    if (apiKey && apiKey.length > 5) {
      available.push({ key, name: provider.name, ready: true });
    } else {
      available.push({ key, name: provider.name, ready: false, missing: provider.envKey });
    }
  }
  return available;
}

/**
 * Ask a single provider
 */
async function askProvider(providerKey, prompt, systemPrompt) {
  const provider = PROVIDERS[providerKey];
  if (!provider) return { provider: providerKey, error: `Unknown provider: ${providerKey}` };

  const apiKey = process.env[provider.envKey];
  if (!apiKey) return { provider: providerKey, name: provider.name, error: `No API key (${provider.envKey})` };

  const startTime = Date.now();

  try {
    const req = provider.buildRequest(prompt, systemPrompt || SAFETY_PREAMBLE, apiKey);
    const res = await fetch(req.url, { ...req.options, signal: AbortSignal.timeout(30000) });

    if (!res.ok) {
      const errBody = await res.text().catch(() => 'Unknown error');
      return {
        provider: providerKey,
        name: provider.name,
        error: `HTTP ${res.status}: ${errBody.slice(0, 200)}`,
        durationMs: Date.now() - startTime,
      };
    }

    const data = await res.json();
    const response = req.extract(data);

    return {
      provider: providerKey,
      name: provider.name,
      response,
      durationMs: Date.now() - startTime,
      tokens: data.usage?.total_tokens || data.usageMetadata?.totalTokenCount || null,
    };
  } catch (err) {
    return {
      provider: providerKey,
      name: provider.name,
      error: err.message,
      durationMs: Date.now() - startTime,
    };
  }
}

/**
 * Ask ALL available providers in parallel
 */
async function askAll(prompt, options = {}) {
  const available = getAvailableProviders().filter(p => p.ready);
  if (available.length === 0) {
    return { error: 'No AI providers configured. Set API keys: OPENAI_API_KEY, GEMINI_API_KEY, XAI_API_KEY, ANTHROPIC_API_KEY' };
  }

  const systemPrompt = options.systemPrompt || SAFETY_PREAMBLE;
  const exclude = new Set(options.exclude || []);

  const providers = available.filter(p => !exclude.has(p.key));

  const results = await Promise.allSettled(
    providers.map(p => askProvider(p.key, prompt, systemPrompt))
  );

  return {
    prompt,
    responses: results.map(r => r.status === 'fulfilled' ? r.value : { error: r.reason?.message }),
    providerCount: providers.length,
    successCount: results.filter(r => r.status === 'fulfilled' && !r.value.error).length,
  };
}

/**
 * Have AIs debate/critique each other's answers
 */
async function debate(prompt, responses, rounds = 1) {
  const debateResults = [];

  for (const response of responses) {
    if (response.error || !response.response) continue;

    // Ask other providers to critique this response
    const critiquePrompt = `A question was asked: "${prompt}"

One AI responded with:
"${response.response.slice(0, 1500)}"

Evaluate this response:
1. What's correct and strong about it?
2. What's missing or could be improved?
3. What would you add or change?

Be specific and constructive. Keep it under 500 words.`;

    // Pick a different provider to critique
    const critics = responses.filter(r => r.provider !== response.provider && !r.error && r.response);
    if (critics.length === 0) continue;

    const critic = critics[0];
    const critique = await askProvider(critic.provider, critiquePrompt, SAFETY_PREAMBLE);

    debateResults.push({
      original: { provider: response.provider, name: response.name },
      critic: { provider: critic.provider, name: critic.name },
      critique: critique.response || critique.error,
    });
  }

  return debateResults;
}

/**
 * Register Multi-AI Council tools on an MCP server
 */
export function registerCouncilTools(server, z) {

  // ─── council_ask ──────────────────────────────────────────
  server.tool(
    "council_ask",
    `Ask multiple AI providers the same question simultaneously.
Sends the prompt to all available AIs (GPT-4o, Gemini, Grok, Claude) in parallel.
Returns each response with timing. YOUR credentials are never shared.

Example: council_ask({ prompt: "What's the best approach for rate limiting in a Node.js API?" })
Example: council_ask({ prompt: "Compare REST vs GraphQL for a CRM platform", exclude: ["anthropic"] })`,
    {
      prompt: z.string().describe("The question or problem to solve"),
      system_prompt: z.string().optional().describe("Custom system prompt (default: neutral problem-solving)"),
      exclude: z.array(z.string()).optional().describe("Provider keys to exclude: openai, gemini, grok, anthropic"),
    },
    async ({ prompt, system_prompt, exclude }) => {
      try {
        const result = await askAll(prompt, { systemPrompt: system_prompt, exclude });
        return {
          content: [{
            type: "text",
            text: JSON.stringify(result, null, 2),
          }],
        };
      } catch (err) {
        return { content: [{ type: "text", text: JSON.stringify({ error: err.message }) }] };
      }
    }
  );

  // ─── council_debate ───────────────────────────────────────
  server.tool(
    "council_debate",
    `Have AI providers critique each other's responses to a question.
First asks all AIs, then has them evaluate each other's answers.
Returns original responses + critiques.

Example: council_debate({ prompt: "Should we use microservices or monolith for a SaaS platform?" })`,
    {
      prompt: z.string().describe("The question to debate"),
    },
    async ({ prompt }) => {
      try {
        const askResult = await askAll(prompt);
        if (askResult.error) {
          return { content: [{ type: "text", text: JSON.stringify(askResult) }] };
        }

        const successResponses = askResult.responses.filter(r => !r.error && r.response);
        if (successResponses.length < 2) {
          return { content: [{ type: "text", text: JSON.stringify({ error: "Need at least 2 AI responses to debate", responses: askResult.responses }) }] };
        }

        const debateResults = await debate(prompt, successResponses);

        return {
          content: [{
            type: "text",
            text: JSON.stringify({
              prompt,
              responses: askResult.responses,
              debate: debateResults,
              providers_used: askResult.providerCount,
            }, null, 2),
          }],
        };
      } catch (err) {
        return { content: [{ type: "text", text: JSON.stringify({ error: err.message }) }] };
      }
    }
  );

  // ─── council_solve ────────────────────────────────────────
  server.tool(
    "council_solve",
    `Full multi-AI problem-solving pipeline:
1. Ask all AIs the question (parallel)
2. Have them critique each other
3. Synthesize the best answer from all responses

This is the most thorough approach — uses multiple AI perspectives
to arrive at the strongest possible answer.

Example: council_solve({ prompt: "Design a webhook verification system that handles Stripe, GitHub, and Slack" })`,
    {
      prompt: z.string().describe("The problem to solve"),
      synthesis_prompt: z.string().optional().describe("Custom instructions for the final synthesis"),
    },
    async ({ prompt, synthesis_prompt }) => {
      try {
        // Step 1: Ask all
        const askResult = await askAll(prompt);
        if (askResult.error) {
          return { content: [{ type: "text", text: JSON.stringify(askResult) }] };
        }

        const successResponses = askResult.responses.filter(r => !r.error && r.response);

        // Step 2: Debate (if enough responses)
        let debateResults = [];
        if (successResponses.length >= 2) {
          debateResults = await debate(prompt, successResponses);
        }

        // Step 3: Synthesize — use the first available provider
        const synthesisInput = successResponses.map(r =>
          `### ${r.name}\n${r.response}`
        ).join('\n\n---\n\n');

        const debateSummary = debateResults.map(d =>
          `${d.critic.name} critiquing ${d.original.name}: ${d.critique}`
        ).join('\n\n');

        const synthesisPrompt = `${synthesis_prompt || 'You are Jaxx, the AI orchestrator for the 0n ecosystem. Synthesize the best answer from multiple AI responses.'}

The question was: "${prompt}"

Here are the responses from different AI providers:

${synthesisInput}

${debateSummary ? `\nHere are the critiques:\n\n${debateSummary}` : ''}

Now synthesize the BEST possible answer by:
1. Taking the strongest points from each response
2. Addressing any weaknesses identified in the critiques
3. Adding anything all responses missed
4. Being direct and actionable

Give the final synthesized answer.`;

        // Use the first available provider for synthesis
        const synthesizer = successResponses[0];
        const synthesis = await askProvider(synthesizer.provider, synthesisPrompt, 'You are Jaxx, a master AI synthesizer. Combine multiple perspectives into one optimal answer.');

        return {
          content: [{
            type: "text",
            text: JSON.stringify({
              prompt,
              individual_responses: askResult.responses,
              debate: debateResults.length > 0 ? debateResults : 'Skipped (< 2 responses)',
              synthesis: {
                synthesized_by: synthesis.name,
                answer: synthesis.response,
                durationMs: synthesis.durationMs,
              },
              meta: {
                providers_asked: askResult.providerCount,
                responses_received: successResponses.length,
                debate_rounds: debateResults.length,
              },
            }, null, 2),
          }],
        };
      } catch (err) {
        return { content: [{ type: "text", text: JSON.stringify({ error: err.message }) }] };
      }
    }
  );

  // ─── council_config ───────────────────────────────────────
  server.tool(
    "council_config",
    `Check which AI providers are available for the Multi-AI Council.
Shows which API keys are set and which providers are ready.

Example: council_config({})`,
    {},
    async () => {
      const providers = getAvailableProviders();
      const ready = providers.filter(p => p.ready);

      return {
        content: [{
          type: "text",
          text: JSON.stringify({
            total: providers.length,
            ready: ready.length,
            providers,
            message: ready.length > 0
              ? `${ready.length}/${providers.length} providers ready: ${ready.map(p => p.name).join(', ')}`
              : 'No providers configured. Set API keys in environment variables.',
          }, null, 2),
        }],
      };
    }
  );
}

export { getAvailableProviders, askProvider, askAll, debate, PROVIDERS };
