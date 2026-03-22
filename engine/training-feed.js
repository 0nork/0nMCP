// ============================================================
// 0nMCP — Training Feed Engine
// ============================================================
// Continuously fetches data from verified public sources and
// feeds it into the 0nAI Training Center. Zero cost — uses
// public RSS feeds, open APIs, and free data endpoints.
//
// Run modes:
//   - Once:   node engine/training-feed.js
//   - Loop:   node engine/training-feed.js --loop 300  (every 5 min)
//   - CLI:    0nmcp feed [--loop <seconds>]
//
// All sources are public, free, no API keys required.
// ============================================================

import { createHash } from "crypto";

// ── Verified Source Registry ────────────────────────────────
// Every source here is public, free, and factual.

export const FEED_SOURCES = [

  // ── AI & ML Industry ──────────────────────────────────────
  {
    id: "hn-ai",
    name: "Hacker News — AI",
    type: "api",
    url: "https://hn.algolia.com/api/v1/search_by_date?query=AI+LLM+MCP&tags=story&hitsPerPage=10",
    category: "ai_industry",
    interval: 600, // 10 min
    parser: "hn",
  },
  {
    id: "arxiv-ai",
    name: "arXiv — AI Papers",
    type: "rss",
    url: "https://export.arxiv.org/api/query?search_query=cat:cs.AI&start=0&max_results=5&sortBy=submittedDate&sortOrder=descending",
    category: "ai_research",
    interval: 3600, // 1 hour
    parser: "arxiv",
  },
  {
    id: "devto-ai",
    name: "Dev.to — AI Articles",
    type: "api",
    url: "https://dev.to/api/articles?tag=ai&per_page=10&top=1",
    category: "ai_industry",
    interval: 900,
    parser: "devto",
  },
  {
    id: "devto-mcp",
    name: "Dev.to — MCP Articles",
    type: "api",
    url: "https://dev.to/api/articles?tag=mcp&per_page=10&top=1",
    category: "ai_industry",
    interval: 900,
    parser: "devto",
  },

  // ── Tech Industry ─────────────────────────────────────────
  {
    id: "hn-top",
    name: "Hacker News — Top Stories",
    type: "api",
    url: "https://hn.algolia.com/api/v1/search?tags=front_page&hitsPerPage=10",
    category: "tech",
    interval: 600,
    parser: "hn",
  },
  {
    id: "github-trending",
    name: "GitHub — Trending Repos",
    type: "api",
    url: "https://api.github.com/search/repositories?q=stars:>100+created:>2026-03-01&sort=stars&order=desc&per_page=10",
    category: "open_source",
    interval: 3600,
    parser: "github_repos",
  },
  {
    id: "npm-mcp",
    name: "npm — MCP Packages",
    type: "api",
    url: "https://registry.npmjs.org/-/v1/search?text=mcp+model+context+protocol&size=10",
    category: "open_source",
    interval: 3600,
    parser: "npm",
  },

  // ── SaaS & API Ecosystem ──────────────────────────────────
  {
    id: "devto-api",
    name: "Dev.to — API Development",
    type: "api",
    url: "https://dev.to/api/articles?tag=api&per_page=10&top=1",
    category: "saas",
    interval: 1800,
    parser: "devto",
  },
  {
    id: "devto-automation",
    name: "Dev.to — Automation",
    type: "api",
    url: "https://dev.to/api/articles?tag=automation&per_page=10&top=1",
    category: "automation",
    interval: 1800,
    parser: "devto",
  },

  // ── Crypto / Web3 (Jaxx origin) ───────────────────────────
  {
    id: "coingecko-global",
    name: "CoinGecko — Market Stats",
    type: "api",
    url: "https://api.coingecko.com/api/v3/global",
    category: "crypto",
    interval: 600,
    parser: "coingecko",
  },

  // ── Public Data / Statistics ──────────────────────────────
  {
    id: "wikipedia-ai",
    name: "Wikipedia — AI Current Events",
    type: "api",
    url: "https://en.wikipedia.org/api/rest_v1/feed/featured/2026/03/22",
    category: "general_knowledge",
    interval: 86400, // daily
    parser: "wikipedia",
  },
];

// ── Parsers ─────────────────────────────────────────────────
// Each parser extracts structured data from a specific API format.

const PARSERS = {
  hn(data) {
    if (!data?.hits) return [];
    return data.hits.map(h => ({
      title: h.title || "",
      content: `${h.title}. ${h.url || ""} — ${h.points || 0} points, ${h.num_comments || 0} comments on Hacker News.`,
      url: h.url || `https://news.ycombinator.com/item?id=${h.objectID}`,
      metadata: { points: h.points, comments: h.num_comments, author: h.author },
    })).filter(h => h.title.length > 5);
  },

  arxiv(data) {
    // arXiv returns Atom XML — parse simply
    const entries = [];
    const entryRegex = /<entry>([\s\S]*?)<\/entry>/g;
    let match;
    while ((match = entryRegex.exec(data)) !== null) {
      const block = match[1];
      const title = (block.match(/<title>([\s\S]*?)<\/title>/) || [])[1]?.trim() || "";
      const summary = (block.match(/<summary>([\s\S]*?)<\/summary>/) || [])[1]?.trim() || "";
      const id = (block.match(/<id>([\s\S]*?)<\/id>/) || [])[1]?.trim() || "";
      entries.push({
        title,
        content: `${title}\n\n${summary.slice(0, 1000)}`,
        url: id,
        metadata: { source: "arxiv" },
      });
    }
    return entries;
  },

  devto(data) {
    if (!Array.isArray(data)) return [];
    return data.map(a => ({
      title: a.title || "",
      content: `${a.title}. ${a.description || ""}. By ${a.user?.name || "unknown"} — ${a.positive_reactions_count || 0} reactions, ${a.comments_count || 0} comments.`,
      url: a.url || "",
      metadata: { reactions: a.positive_reactions_count, comments: a.comments_count, author: a.user?.name, tags: a.tag_list },
    })).filter(a => a.title.length > 5);
  },

  github_repos(data) {
    if (!data?.items) return [];
    return data.items.map(r => ({
      title: `${r.full_name} — ${r.description || "No description"}`,
      content: `GitHub repo: ${r.full_name}. ${r.description || ""}. Language: ${r.language || "unknown"}. Stars: ${r.stargazers_count}. Forks: ${r.forks_count}. Created: ${r.created_at}.`,
      url: r.html_url,
      metadata: { stars: r.stargazers_count, forks: r.forks_count, language: r.language },
    }));
  },

  npm(data) {
    if (!data?.objects) return [];
    return data.objects.map(o => ({
      title: `${o.package?.name} — ${o.package?.description || ""}`,
      content: `npm package: ${o.package?.name}@${o.package?.version}. ${o.package?.description || ""}. Keywords: ${(o.package?.keywords || []).join(", ")}. Weekly downloads estimated from search score: ${o.searchScore || 0}.`,
      url: o.package?.links?.npm || "",
      metadata: { version: o.package?.version, keywords: o.package?.keywords, score: o.searchScore },
    }));
  },

  coingecko(data) {
    if (!data?.data) return [];
    const d = data.data;
    return [{
      title: "Global Crypto Market Stats",
      content: `Global crypto market cap: $${Math.round((d.total_market_cap?.usd || 0) / 1e9)}B. 24h volume: $${Math.round((d.total_volume?.usd || 0) / 1e9)}B. BTC dominance: ${(d.market_cap_percentage?.btc || 0).toFixed(1)}%. Active cryptocurrencies: ${d.active_cryptocurrencies || 0}. Markets: ${d.markets || 0}.`,
      url: "https://www.coingecko.com",
      metadata: { market_cap_usd: d.total_market_cap?.usd, btc_dominance: d.market_cap_percentage?.btc, active_coins: d.active_cryptocurrencies },
    }];
  },

  wikipedia(data) {
    const items = [];
    if (data?.tfa) {
      items.push({
        title: `Wikipedia Featured: ${data.tfa.titles?.normalized || ""}`,
        content: data.tfa.extract || "",
        url: data.tfa.content_urls?.desktop?.page || "",
        metadata: { type: "featured_article" },
      });
    }
    if (data?.mostread?.articles) {
      for (const a of data.mostread.articles.slice(0, 5)) {
        items.push({
          title: `Trending: ${a.titles?.normalized || ""}`,
          content: a.extract || "",
          url: a.content_urls?.desktop?.page || "",
          metadata: { type: "most_read", views: a.views },
        });
      }
    }
    return items;
  },
};

// ── Feed Engine Class ───────────────────────────────────────

export class TrainingFeedEngine {
  /**
   * @param {object} [options]
   * @param {object} [options.supabase] — Supabase client
   * @param {string[]} [options.categories] — Only fetch these categories
   * @param {Function} [options.onItem] — Callback per ingested item
   */
  constructor(options = {}) {
    this.supabase = options.supabase || null;
    this.categories = options.categories ? new Set(options.categories) : null;
    this.onItem = options.onItem || null;
    this.lastFetch = new Map(); // source_id → timestamp
    this.stats = { fetched: 0, ingested: 0, duplicates: 0, errors: 0 };
    this._loopTimer = null;
  }

  async _getSupabase() {
    if (this.supabase) return this.supabase;
    const { createClient } = await import("@supabase/supabase-js");
    const url = process.env.SUPABASE_URL || "https://pwujhhmlrtxjmjzyttwn.supabase.co";
    const key = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!key) throw new Error("No Supabase service key");
    this.supabase = createClient(url, key);
    return this.supabase;
  }

  /**
   * Fetch a single source and ingest new items.
   */
  async fetchSource(source) {
    try {
      // Check interval
      const lastTime = this.lastFetch.get(source.id) || 0;
      if (Date.now() - lastTime < source.interval * 1000) return { skipped: true };

      const res = await fetch(source.url, {
        headers: { "User-Agent": "0nMCP-TrainingFeed/1.0", "Accept": "application/json" },
        signal: AbortSignal.timeout(10000),
      });

      if (!res.ok) {
        this.stats.errors++;
        return { error: `HTTP ${res.status}` };
      }

      let rawData;
      const contentType = res.headers.get("content-type") || "";
      if (contentType.includes("xml") || source.parser === "arxiv") {
        rawData = await res.text();
      } else {
        rawData = await res.json();
      }

      // Parse
      const parser = PARSERS[source.parser];
      if (!parser) return { error: `Unknown parser: ${source.parser}` };

      const items = parser(rawData);
      this.stats.fetched += items.length;
      this.lastFetch.set(source.id, Date.now());

      // Deduplicate and ingest
      const sb = await this._getSupabase();
      let ingested = 0;

      for (const item of items) {
        if (!item.title || !item.content) continue;

        // Content hash for dedup
        const hash = createHash("md5").update(item.title + item.url).digest("hex");

        // Check if already ingested
        const { data: existing } = await sb.from("training_sources")
          .select("id")
          .eq("metadata->>content_hash", hash)
          .limit(1);

        if (existing && existing.length > 0) {
          this.stats.duplicates++;
          continue;
        }

        // Insert
        const { error: insertError } = await sb.from("training_sources").insert({
          source_type: "feed",
          source_path: item.url,
          title: item.title.slice(0, 500),
          content: item.content.slice(0, 5000),
          token_count: Math.ceil(item.content.length / 4),
          tags: [source.category, source.id],
          status: "raw",
          metadata: {
            ...item.metadata,
            feed_source: source.id,
            feed_name: source.name,
            content_hash: hash,
            fetched_at: new Date().toISOString(),
          },
        });

        if (!insertError) {
          ingested++;
          this.stats.ingested++;
          if (this.onItem) this.onItem(item, source);
        }
      }

      return { items: items.length, ingested, source: source.name };
    } catch (err) {
      this.stats.errors++;
      return { error: err.message, source: source.name };
    }
  }

  /**
   * Run one full fetch cycle across all sources.
   */
  async fetchAll() {
    const activeSources = FEED_SOURCES.filter(s =>
      !this.categories || this.categories.has(s.category)
    );

    const results = [];
    for (const source of activeSources) {
      const result = await this.fetchSource(source);
      if (!result.skipped) {
        results.push(result);
      }
    }

    return {
      cycle_at: new Date().toISOString(),
      sources_checked: activeSources.length,
      results: results.filter(r => !r.skipped),
      stats: { ...this.stats },
    };
  }

  /**
   * Start a continuous fetch loop.
   * @param {number} intervalSec — Seconds between cycles (default: 300 = 5 min)
   */
  startLoop(intervalSec = 300) {
    console.log(`  → [training-feed] Starting feed loop (every ${intervalSec}s)`);
    console.log(`  → [training-feed] ${FEED_SOURCES.length} sources registered`);

    // Run immediately
    this.fetchAll().then(r => {
      console.log(`  → [training-feed] Cycle complete: ${r.stats.ingested} new items`);
    });

    // Then loop
    this._loopTimer = setInterval(async () => {
      try {
        const result = await this.fetchAll();
        if (result.stats.ingested > 0) {
          console.log(`  → [training-feed] +${result.stats.ingested} items ingested`);
        }
      } catch (err) {
        console.error(`  ✗ [training-feed] Cycle error: ${err.message}`);
      }
    }, intervalSec * 1000);
  }

  /**
   * Stop the feed loop.
   */
  stopLoop() {
    if (this._loopTimer) {
      clearInterval(this._loopTimer);
      this._loopTimer = null;
    }
  }

  /**
   * Get current stats.
   */
  getStats() {
    return {
      ...this.stats,
      sources: FEED_SOURCES.length,
      categories: [...new Set(FEED_SOURCES.map(s => s.category))],
      last_fetches: Object.fromEntries(
        [...this.lastFetch.entries()].map(([k, v]) => [k, new Date(v).toISOString()])
      ),
    };
  }
}

// ── MCP Tool Registration ───────────────────────────────────

/**
 * Register training feed tools on an MCP server.
 */
export function registerFeedTools(server, z) {
  let feedEngine = null;

  function getFeed() {
    if (!feedEngine) feedEngine = new TrainingFeedEngine();
    return feedEngine;
  }

  server.tool(
    "training_feed",
    `Manage the 0nAI training feed — continuous data ingestion from verified public sources.
Fetches from ${FEED_SOURCES.length} sources: Hacker News, arXiv, Dev.to, GitHub, npm, CoinGecko, Wikipedia.

Example: training_feed({ action: "fetch" }) — run one fetch cycle
Example: training_feed({ action: "start", interval: 300 }) — start 5-min loop
Example: training_feed({ action: "stop" }) — stop the loop
Example: training_feed({ action: "sources" }) — list all sources
Example: training_feed({ action: "stats" }) — show feed statistics`,
    {
      action: z.enum(["fetch", "start", "stop", "sources", "stats"]).describe("Feed action"),
      interval: z.number().optional().describe("Loop interval in seconds (default: 300)"),
      categories: z.array(z.string()).optional().describe("Only fetch these categories"),
    },
    async ({ action, interval, categories }) => {
      try {
        const feed = getFeed();
        if (categories) feed.categories = new Set(categories);

        switch (action) {
          case "fetch": {
            const result = await feed.fetchAll();
            return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
          }

          case "start": {
            feed.startLoop(interval || 300);
            return { content: [{ type: "text", text: JSON.stringify({ status: "started", interval: interval || 300, sources: FEED_SOURCES.length }) }] };
          }

          case "stop": {
            feed.stopLoop();
            return { content: [{ type: "text", text: JSON.stringify({ status: "stopped", stats: feed.getStats() }) }] };
          }

          case "sources": {
            return {
              content: [{
                type: "text",
                text: JSON.stringify({
                  count: FEED_SOURCES.length,
                  categories: [...new Set(FEED_SOURCES.map(s => s.category))],
                  sources: FEED_SOURCES.map(s => ({
                    id: s.id,
                    name: s.name,
                    category: s.category,
                    interval: `${s.interval}s`,
                    url: s.url.slice(0, 80) + "...",
                  })),
                }, null, 2),
              }],
            };
          }

          case "stats": {
            return { content: [{ type: "text", text: JSON.stringify({ status: "ok", ...feed.getStats() }, null, 2) }] };
          }
        }
      } catch (err) {
        return { content: [{ type: "text", text: JSON.stringify({ status: "failed", error: err.message }) }] };
      }
    }
  );
}

// ── CLI Entry Point ─────────────────────────────────────────

const isMain = process.argv[1]?.endsWith("training-feed.js");
if (isMain) {
  const loopFlag = process.argv.indexOf("--loop");
  const interval = loopFlag > -1 ? parseInt(process.argv[loopFlag + 1]) || 300 : 0;

  const feed = new TrainingFeedEngine();

  if (interval > 0) {
    feed.startLoop(interval);
    console.log(`Press Ctrl+C to stop.`);
  } else {
    feed.fetchAll().then(result => {
      console.log(JSON.stringify(result, null, 2));
      process.exit(0);
    });
  }
}
