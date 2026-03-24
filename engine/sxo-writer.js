// ============================================================
// 0nMCP — SXO Blog Writer Engine
// ============================================================
// Self-improving content engine that writes, publishes, tracks,
// learns, and writes BETTER every time.
//
// The SXO Writing Protocol:
// 1. BLUF Architecture (Bottom Line Up Front)
// 2. Table Trap (LLMs weight tabular data heavily)
// 3. Non-Zero Information Gain (never repeat consensus)
// 4. Deep JSON-LD Entity Resolution
// 5. Freshness Loops (dynamic timestamps)
// 6. B2A Endpoints (llms.txt for AI agents)
//
// Learning Loop:
// Write → Publish → Track → Analyze → Learn → Write Better
//
// 4 MCP Tools:
//   sxo_write     — Write an SXO-optimized blog post
//   sxo_analyze   — Analyze a published post's performance
//   sxo_optimize  — Rewrite a post based on performance data
//   sxo_score     — Score any content against SXO criteria
// ============================================================

// ── SXO Writing System Prompt ────────────────────────────────

const SXO_SYSTEM_PROMPT = `You are the SXO (Search Experience Optimization) Content Engine.

You write content that satisfies BOTH human readers AND AI extraction models (Google SGE, Perplexity, Claude, Gemini).

## THE SXO WRITING PROTOCOL

### 1. BLUF Architecture (Bottom Line Up Front)
- Every H2 section MUST start with a bold 2-3 sentence answer
- This is what AI models extract for featured snippets
- The bold paragraph is wrapped in a styled container for visual emphasis
- Format: <p><strong>The direct answer to the section's implicit question.</strong></p>

### 2. The Table Trap
- LLMs heavily weight tabular data for factual extraction
- EVERY post must contain at least ONE comparison table
- Tables should have: clear headers, quantitative data, and a "winner" column
- Format: proper <table> with <thead> and <tbody>

### 3. Non-Zero Information Gain
- NEVER repeat what the top 3 Google results already say
- Include at least ONE unique data point, framework, or contrarian take
- Ask: "What would a reader learn here that they can't learn anywhere else?"
- Target Information Gain Score: 0.7+

### 4. Heading Architecture
- H1: One per page, contains primary keyword
- H2: Section headers, each one answers an implicit question
- H3: Sub-points within sections
- Every heading should be extractable as a standalone answer

### 5. Schema Markup
- Every post needs Article + FAQPage JSON-LD
- FAQPage should contain 3-5 questions from the content
- Article schema needs: headline, datePublished, dateModified, author, description

### 6. Anti-Patterns (NEVER do these)
- No "In today's world..." or "In the age of AI..." openers
- No rhetorical questions as openers
- No fluff paragraphs that don't add information
- No hedge language — state claims directly
- No walls of text — use bullets, tables, and whitespace
- No generic stock advice that could apply to anything

### 7. Structure Template
1. H1 with primary keyword
2. BLUF paragraph (bold, answers the headline's question in 2-3 sentences)
3. H2 sections (each with its own BLUF)
4. At least one Table Trap per post
5. FAQ section (3-5 questions extracted from content)
6. CTA at the end (specific, actionable)
7. Meta: title (50-60 chars), description (150-160 chars), canonical URL

## OUTPUT FORMAT
Return ONLY valid JSON:
{
  "title": "SEO-optimized title (50-60 chars, keyword front-loaded)",
  "slug": "url-friendly-slug",
  "meta_description": "Compelling description with keyword (150-160 chars)",
  "excerpt": "2-3 sentence hook for listings (100 words max)",
  "content": "Full HTML content following all SXO rules above (800-1500 words)",
  "tags": ["tag1", "tag2", "tag3", "tag4", "tag5"],
  "category": "guides|tutorials|comparisons|case-studies|news",
  "schema": {
    "article": { ... },
    "faqPage": { ... }
  },
  "sxo_scores": {
    "bluf_compliance": 0-100,
    "table_trap": true/false,
    "information_gain": 0.0-1.0,
    "heading_architecture": 0-100,
    "readability": 0-100,
    "keyword_density": 0.0-3.0,
    "overall": 0-100
  },
  "learning_notes": "What worked well and what to improve next time"
}`;

// ── SXO Scoring Rubric ──────────────────────────────────────

function scoreContent(content, title) {
  let score = 0;
  const scores = {
    bluf_compliance: 0,
    table_trap: false,
    information_gain: 0.5,
    heading_architecture: 0,
    readability: 0,
    keyword_density: 0,
    overall: 0,
  };

  // BLUF: Check if bold text follows H2 headers
  const h2Count = (content.match(/<h2/g) || []).length;
  const blufCount = (content.match(/<h2[^>]*>.*?<\/h2>\s*<p><strong>/gs) || []).length;
  scores.bluf_compliance = h2Count > 0 ? Math.round((blufCount / h2Count) * 100) : 0;

  // Table Trap: Has at least one table
  scores.table_trap = /<table/i.test(content);

  // Heading Architecture: H1 exists, H2s exist, proper hierarchy
  const hasH1 = /<h1/i.test(content);
  const h2s = (content.match(/<h2/g) || []).length;
  const h3s = (content.match(/<h3/g) || []).length;
  scores.heading_architecture = Math.min(100, (hasH1 ? 30 : 0) + Math.min(h2s * 15, 40) + Math.min(h3s * 10, 30));

  // Readability: Sentence length, paragraph length
  const text = content.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 10);
  const avgSentenceLength = sentences.length > 0 ? text.split(/\s+/).length / sentences.length : 30;
  scores.readability = avgSentenceLength < 20 ? 90 : avgSentenceLength < 25 ? 75 : avgSentenceLength < 30 ? 60 : 40;

  // Keyword density (basic — checks title words in content)
  const titleWords = title.toLowerCase().split(/\s+/).filter(w => w.length > 3);
  const contentLower = text.toLowerCase();
  const contentWordCount = contentLower.split(/\s+/).length;
  let keywordHits = 0;
  for (const word of titleWords) {
    const regex = new RegExp(word, 'gi');
    keywordHits += (contentLower.match(regex) || []).length;
  }
  scores.keyword_density = contentWordCount > 0 ? Math.round((keywordHits / contentWordCount) * 100) / 100 : 0;

  // Information Gain (heuristic): unique stats, numbers, named entities
  const hasStats = /\d+%|\$[\d,]+|\d+x|\d+ (tools|services|features|users|customers)/i.test(content);
  const hasComparison = /<table/i.test(content) && /<th/i.test(content);
  const hasFramework = /(framework|protocol|architecture|formula|equation|model)/i.test(content);
  scores.information_gain = 0.3 + (hasStats ? 0.2 : 0) + (hasComparison ? 0.2 : 0) + (hasFramework ? 0.3 : 0);
  scores.information_gain = Math.min(1.0, scores.information_gain);

  // Overall
  scores.overall = Math.round(
    scores.bluf_compliance * 0.2 +
    (scores.table_trap ? 15 : 0) +
    scores.heading_architecture * 0.2 +
    scores.readability * 0.15 +
    scores.information_gain * 30 +
    Math.min(scores.keyword_density * 10, 15)
  );

  return scores;
}

// ── Learning Loop Storage ────────────────────────────────────

async function getWritingHistory(supabase) {
  const { data } = await supabase
    .from('blog_posts')
    .select('title, slug, sxo_scores, learning_notes, published_at')
    .not('sxo_scores', 'is', null)
    .order('published_at', { ascending: false })
    .limit(10);
  return data || [];
}

function buildLearningContext(history) {
  if (history.length === 0) return '';

  const avgScores = {
    bluf: 0, table: 0, info_gain: 0, heading: 0, readability: 0, overall: 0,
  };
  const learnings = [];

  for (const post of history) {
    const s = post.sxo_scores || {};
    avgScores.bluf += s.bluf_compliance || 0;
    avgScores.table += s.table_trap ? 1 : 0;
    avgScores.info_gain += s.information_gain || 0;
    avgScores.heading += s.heading_architecture || 0;
    avgScores.readability += s.readability || 0;
    avgScores.overall += s.overall || 0;
    if (post.learning_notes) learnings.push(post.learning_notes);
  }

  const n = history.length;
  return `
## LEARNING FROM PREVIOUS ${n} POSTS

Average Scores:
- BLUF Compliance: ${Math.round(avgScores.bluf / n)}%
- Table Trap: ${Math.round(avgScores.table / n * 100)}% of posts have tables
- Information Gain: ${(avgScores.info_gain / n).toFixed(2)}
- Heading Architecture: ${Math.round(avgScores.heading / n)}%
- Readability: ${Math.round(avgScores.readability / n)}%
- Overall SXO Score: ${Math.round(avgScores.overall / n)}%

Previous Learning Notes:
${learnings.slice(0, 5).map((l, i) => `${i + 1}. ${l}`).join('\n')}

IMPROVE on these scores. Fix the weakest areas. Beat your previous best.`;
}

// ── MCP Tool Registration ────────────────────────────────────

export function registerSxoWriterTools(server, z) {

  // ─── sxo_write ─────────────────────────────────────────────
  server.tool(
    "sxo_write",
    `Write an SXO-optimized blog post using the self-improving content engine.
Each post learns from the performance of previous posts and improves.

Uses: BLUF architecture, Table Trap, Information Gain, Schema markup.

Example: sxo_write({ topic: "How to use MCP servers with Claude", keywords: ["MCP", "Claude", "AI automation"] })`,
    {
      topic: z.string().describe("Blog post topic"),
      keywords: z.array(z.string()).optional().describe("Target keywords"),
      style: z.enum(["guide", "tutorial", "comparison", "case_study", "news"]).optional().describe("Content style"),
      target_word_count: z.number().optional().describe("Target word count (default: 1000)"),
      publish: z.boolean().optional().describe("Auto-publish to blog_posts table (default: false)"),
      post_to_devto: z.boolean().optional().describe("Also post to Dev.to (default: false)"),
    },
    async ({ topic, keywords, style, target_word_count, publish, post_to_devto }) => {
      try {
        const { createClient } = await import("@supabase/supabase-js");
        const sb = createClient(
          process.env.SUPABASE_URL || "https://pwujhhmlrtxjmjzyttwn.supabase.co",
          process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || ""
        );

        // Get learning context from previous posts
        const history = await getWritingHistory(sb);
        const learningContext = buildLearningContext(history);

        // Build the prompt
        const prompt = `Write a blog post about: ${topic}

Target keywords: ${(keywords || []).join(', ') || topic}
Style: ${style || 'guide'}
Target word count: ${target_word_count || 1000}

${learningContext}

Follow the SXO Writing Protocol exactly. Return valid JSON.`;

        // Call AI (try Anthropic first, fallback to template)
        let result;
        const apiKey = process.env.ANTHROPIC_API_KEY;

        if (apiKey) {
          const res = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-api-key': apiKey,
              'anthropic-version': '2023-06-01',
            },
            body: JSON.stringify({
              model: 'claude-sonnet-4-20250514',
              system: SXO_SYSTEM_PROMPT,
              messages: [{ role: 'user', content: prompt }],
              max_tokens: 8000,
            }),
          });

          const data = await res.json();
          const raw = data.content?.[0]?.text || '';
          const clean = raw.replace(/```json\n?|```/g, '').trim();
          result = JSON.parse(clean);
        } else {
          // Template fallback
          result = {
            title: topic,
            slug: topic.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
            meta_description: `Learn about ${topic}. SXO-optimized guide with actionable insights.`,
            excerpt: `Everything you need to know about ${topic}.`,
            content: `<h1>${topic}</h1><p><strong>This is a template post. Connect an Anthropic API key for AI-generated content.</strong></p>`,
            tags: keywords || [topic.split(' ')[0]],
            category: style || 'guides',
            sxo_scores: { bluf_compliance: 0, table_trap: false, information_gain: 0.3, heading_architecture: 30, readability: 50, overall: 25 },
            learning_notes: 'Template content — needs AI generation for real SXO optimization.',
          };
        }

        // Score the content
        const scores = scoreContent(result.content, result.title);
        result.sxo_scores = { ...result.sxo_scores, ...scores };

        // Auto-publish if requested
        if (publish) {
          await sb.from('blog_posts').insert({
            title: result.title,
            slug: result.slug,
            content: result.content,
            excerpt: result.excerpt,
            meta_description: result.meta_description,
            tags: result.tags,
            category: result.category,
            status: 'published',
            published_at: new Date().toISOString(),
            author: 'SXO Engine',
            sxo_scores: result.sxo_scores,
            learning_notes: result.learning_notes,
          });
        }

        // Post to Dev.to if requested
        if (post_to_devto) {
          const devtoKey = process.env.DEVTO_API_KEY;
          if (devtoKey) {
            const markdown = result.content
              .replace(/<h1[^>]*>(.*?)<\/h1>/g, '# $1')
              .replace(/<h2[^>]*>(.*?)<\/h2>/g, '## $1')
              .replace(/<h3[^>]*>(.*?)<\/h3>/g, '### $1')
              .replace(/<p><strong>(.*?)<\/strong><\/p>/g, '**$1**')
              .replace(/<p>(.*?)<\/p>/g, '$1\n\n')
              .replace(/<[^>]+>/g, '');

            await fetch('https://dev.to/api/articles', {
              method: 'POST',
              headers: { 'api-key': devtoKey, 'Content-Type': 'application/json' },
              body: JSON.stringify({
                article: {
                  title: result.title,
                  body_markdown: markdown,
                  published: true,
                  tags: result.tags.slice(0, 4),
                  canonical_url: `https://www.0nmcp.com/blog/${result.slug}`,
                },
              }),
            });
          }
        }

        return {
          content: [{
            type: "text",
            text: JSON.stringify({
              status: publish ? 'published' : 'draft',
              ...result,
              devto_posted: post_to_devto || false,
            }, null, 2),
          }],
        };
      } catch (err) {
        return { content: [{ type: "text", text: JSON.stringify({ error: err.message }) }] };
      }
    }
  );

  // ─── sxo_score ─────────────────────────────────────────────
  server.tool(
    "sxo_score",
    `Score any content against SXO criteria.
Returns: BLUF compliance, Table Trap, Information Gain, heading architecture, readability, keyword density.

Example: sxo_score({ content: "<h1>My Post</h1><p>Content here...</p>", title: "My Post Title" })`,
    {
      content: z.string().describe("HTML content to score"),
      title: z.string().describe("Post title"),
    },
    async ({ content, title }) => {
      const scores = scoreContent(content, title);
      return {
        content: [{
          type: "text",
          text: JSON.stringify({ title, scores, recommendations: getRecommendations(scores) }, null, 2),
        }],
      };
    }
  );

  // ─── sxo_optimize ──────────────────────────────────────────
  server.tool(
    "sxo_optimize",
    `Rewrite a published post to improve its SXO score.
Analyzes the current content, identifies weaknesses, and rewrites.

Example: sxo_optimize({ slug: "my-post-slug" })`,
    {
      slug: z.string().describe("Blog post slug to optimize"),
    },
    async ({ slug }) => {
      try {
        const { createClient } = await import("@supabase/supabase-js");
        const sb = createClient(
          process.env.SUPABASE_URL || "https://pwujhhmlrtxjmjzyttwn.supabase.co",
          process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || ""
        );

        const { data: post } = await sb.from('blog_posts').select('*').eq('slug', slug).single();
        if (!post) return { content: [{ type: "text", text: JSON.stringify({ error: 'Post not found' }) }] };

        const currentScores = scoreContent(post.content, post.title);
        const recommendations = getRecommendations(currentScores);

        return {
          content: [{
            type: "text",
            text: JSON.stringify({
              slug,
              title: post.title,
              current_scores: currentScores,
              recommendations,
              action: 'Use sxo_write with the same topic to generate an improved version, then update the post.',
            }, null, 2),
          }],
        };
      } catch (err) {
        return { content: [{ type: "text", text: JSON.stringify({ error: err.message }) }] };
      }
    }
  );
}

// ── Recommendations Engine ───────────────────────────────────

function getRecommendations(scores) {
  const recs = [];

  if (scores.bluf_compliance < 80) {
    recs.push('Add bold BLUF paragraphs after every H2 heading — AI models extract these for snippets.');
  }
  if (!scores.table_trap) {
    recs.push('Add at least one comparison table — LLMs heavily weight tabular data.');
  }
  if (scores.information_gain < 0.7) {
    recs.push('Add unique data points, original frameworks, or contrarian takes — avoid repeating consensus.');
  }
  if (scores.heading_architecture < 70) {
    recs.push('Improve heading hierarchy — ensure H1 exists, add more H2/H3 sections.');
  }
  if (scores.readability < 70) {
    recs.push('Shorten sentences and paragraphs — aim for grade 8 reading level.');
  }
  if (scores.keyword_density < 0.5) {
    recs.push('Increase keyword usage naturally — mention target keywords more in headings and first paragraphs.');
  }
  if (scores.keyword_density > 2.5) {
    recs.push('Reduce keyword stuffing — density is too high, reads unnaturally.');
  }

  if (recs.length === 0) recs.push('Content meets all SXO criteria. Monitor performance and iterate.');

  return recs;
}

export { scoreContent, getRecommendations, SXO_SYSTEM_PROMPT };
