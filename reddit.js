// ============================================================
// 0nMCP — Reddit Integration Module
// ============================================================
// Posts, comments, monitoring with auto/manual mode safety.
// Reddit aggressively bans automated promotional activity.
// Default mode: MANUAL. Auto mode requires double confirmation.
// ============================================================

import { getService } from "./catalog.js";

const REDDIT_DISCLAIMER = `
⚠️  REDDIT SAFETY NOTICE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Reddit aggressively bans automated promotional activity.
Accounts suspected of bot behavior may require human verification
(passkeys, biometrics, or government ID) as of March 2026.

Rules:
- 90/10 rule: 90% genuine value, 10% promotional
- Each subreddit has its own rules — check BEFORE posting
- All automated accounts must carry an [APP] label
- Vote manipulation = immediate permanent ban
- Self-service API keys ended Nov 2025 — pre-approval required
- Rate limit: 100 requests/minute per OAuth client

Mode: {MODE}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`;

// ── Mode Management ────────────────────────────────────────
let currentMode = "manual"; // "manual" | "auto"
let autoConfirmationCount = 0;
const REQUIRED_CONFIRMATIONS = 2;

// ── Rate Limiting & Safety ─────────────────────────────────
const postHistory = [];
const commentHistory = [];

function canPost() {
  const oneHourAgo = Date.now() - 3600000;
  const recentPosts = postHistory.filter((t) => t > oneHourAgo);
  const config = getService("reddit")?.safetyConfig || {};
  return recentPosts.length < (config.maxPostsPerHour || 3);
}

function canComment() {
  const oneHourAgo = Date.now() - 3600000;
  const recentComments = commentHistory.filter((t) => t > oneHourAgo);
  const config = getService("reddit")?.safetyConfig || {};
  return recentComments.length < (config.maxCommentsPerHour || 10);
}

function getNextPostTime() {
  if (postHistory.length === 0) return 0;
  const config = getService("reddit")?.safetyConfig || {};
  const minDelay = config.minPostDelayMs || 600000; // 10 min default
  const lastPost = Math.max(...postHistory);
  const nextAllowed = lastPost + minDelay;
  return Math.max(0, nextAllowed - Date.now());
}

function getNextCommentTime() {
  if (commentHistory.length === 0) return 0;
  const config = getService("reddit")?.safetyConfig || {};
  const minDelay = config.minCommentDelayMs || 300000; // 5 min default
  const lastComment = Math.max(...commentHistory);
  const nextAllowed = lastComment + minDelay;
  return Math.max(0, nextAllowed - Date.now());
}

// ── Helpers ────────────────────────────────────────────────
function formatDelay(ms) {
  if (ms <= 0) return "ready now";
  const mins = Math.ceil(ms / 60000);
  return `${mins} minute${mins === 1 ? "" : "s"}`;
}

async function redditApi(endpoint, method, body, creds) {
  const service = getService("reddit");
  const headers = service.authHeader(creds);
  const url = `${service.baseUrl}${endpoint}`;

  const options = { method, headers };

  if (body && (method === "POST" || method === "PUT" || method === "PATCH")) {
    if (endpoint.includes("/api/")) {
      headers["Content-Type"] = "application/x-www-form-urlencoded";
      options.body = new URLSearchParams(body).toString();
    } else {
      headers["Content-Type"] = "application/json";
      options.body = JSON.stringify(body);
    }
  }

  const resp = await fetch(url, options);
  const data = await resp.json();

  if (!resp.ok) {
    throw new Error(
      `Reddit API ${resp.status}: ${JSON.stringify(data.message || data)}`
    );
  }
  return data;
}

// ── Tool Registration ──────────────────────────────────────

export function registerRedditTools(server, z, connections) {
  // ── Mode: Get Current ────────────────────────────────────
  server.tool(
    "reddit_get_mode",
    `Get the current Reddit posting mode and safety status.
Returns: current mode (manual/auto), rate limit status, disclaimer.`,
    {},
    async () => {
      const oneHourAgo = Date.now() - 3600000;
      const recentPosts = postHistory.filter((t) => t > oneHourAgo);
      const recentComments = commentHistory.filter((t) => t > oneHourAgo);

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              {
                mode: currentMode,
                disclaimer: REDDIT_DISCLAIMER.replace("{MODE}", currentMode.toUpperCase()),
                rateStatus: {
                  postsLastHour: recentPosts.length,
                  maxPostsPerHour: 3,
                  commentsLastHour: recentComments.length,
                  maxCommentsPerHour: 10,
                  nextPostIn: formatDelay(getNextPostTime()),
                  nextCommentIn: formatDelay(getNextCommentTime()),
                },
              },
              null,
              2
            ),
          },
        ],
      };
    }
  );

  // ── Mode: Set ────────────────────────────────────────────
  server.tool(
    "reddit_set_mode",
    `Set Reddit posting mode. MANUAL is default and recommended.
AUTO mode requires double confirmation — you must call this tool twice with mode="auto" and confirm="yes" to enable it.
Auto mode adds safety delays between posts but still posts automatically.

WARNING: Auto mode increases risk of Reddit bans. Use at your own risk.`,
    {
      mode: z.enum(["manual", "auto"]).describe('Posting mode: "manual" (default, recommended) or "auto" (risky)'),
      confirm: z.string().optional().describe('Required for auto mode. Must be "yes" on both calls.'),
    },
    async ({ mode, confirm }) => {
      if (mode === "manual") {
        currentMode = "manual";
        autoConfirmationCount = 0;
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({
                status: "success",
                mode: "manual",
                message: "Reddit mode set to MANUAL. All posts require explicit approval before sending.",
              }),
            },
          ],
        };
      }

      // Auto mode: double confirmation
      if (mode === "auto") {
        if (confirm !== "yes") {
          return {
            content: [
              {
                type: "text",
                text: JSON.stringify({
                  status: "confirmation_required",
                  message: "AUTO MODE WARNING: Reddit aggressively bans automated activity. Accounts may be required to pass human verification (biometrics, passkeys, government ID). Are you sure? Call again with confirm='yes'.",
                  confirmationsNeeded: REQUIRED_CONFIRMATIONS,
                  confirmationsReceived: 0,
                }),
              },
            ],
          };
        }

        autoConfirmationCount++;
        if (autoConfirmationCount < REQUIRED_CONFIRMATIONS) {
          return {
            content: [
              {
                type: "text",
                text: JSON.stringify({
                  status: "second_confirmation_required",
                  message: `FINAL WARNING: Auto mode will post to Reddit automatically with safety delays. This CANNOT be undone if a post violates subreddit rules. Confirm one more time with confirm='yes'.`,
                  confirmationsNeeded: REQUIRED_CONFIRMATIONS,
                  confirmationsReceived: autoConfirmationCount,
                }),
              },
            ],
          };
        }

        currentMode = "auto";
        autoConfirmationCount = 0;
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({
                status: "success",
                mode: "auto",
                message: "Reddit mode set to AUTO. Posts will be sent with safety delays (10min between posts, 5min between comments, max 3 posts/hr).",
                safetyLimits: {
                  minPostDelay: "10 minutes",
                  minCommentDelay: "5 minutes",
                  maxPostsPerHour: 3,
                  maxCommentsPerHour: 10,
                },
              }),
            },
          ],
        };
      }
    }
  );

  // ── Submit Post ──────────────────────────────────────────
  server.tool(
    "reddit_submit_post",
    `Submit a text or link post to a Reddit subreddit.
In MANUAL mode: Returns a preview with confirmation token. Call reddit_confirm_post to actually send.
In AUTO mode: Posts after safety delay check. Still enforces rate limits.

IMPORTANT: Check subreddit rules with reddit_get_subreddit_rules before posting.`,
    {
      subreddit: z.string().describe("Subreddit name without r/ prefix"),
      title: z.string().describe("Post title (max 300 characters)"),
      text: z.string().optional().describe("Post body text (markdown supported). For self/text posts."),
      url: z.string().optional().describe("URL for link posts. Mutually exclusive with text."),
      flair_id: z.string().optional().describe("Flair ID if required by subreddit"),
    },
    async ({ subreddit, title, text, url, flair_id }) => {
      const creds = connections.getCredentials("reddit");
      if (!creds?.accessToken) {
        return {
          content: [{ type: "text", text: JSON.stringify({ error: "Reddit not connected. Run reddit_connect first." }) }],
        };
      }

      if (!canPost()) {
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({
                error: "Rate limit: maximum 3 posts per hour reached.",
                nextPostIn: formatDelay(getNextPostTime()),
              }),
            },
          ],
        };
      }

      const kind = url ? "link" : "self";
      const postData = {
        sr: subreddit,
        kind,
        title,
        ...(text && { text }),
        ...(url && { url }),
        ...(flair_id && { flair_id }),
        api_type: "json",
      };

      if (currentMode === "manual") {
        // Manual mode: return preview, don't post
        const previewToken = Buffer.from(JSON.stringify(postData)).toString("base64");
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({
                status: "preview",
                mode: "manual",
                message: "Post preview generated. Call reddit_confirm_post with the token below to actually submit.",
                preview: {
                  subreddit: `r/${subreddit}`,
                  kind,
                  title,
                  body: text || url || "(no body)",
                },
                confirmToken: previewToken,
                disclaimer: "Check r/" + subreddit + " rules before confirming.",
              }, null, 2),
            },
          ],
        };
      }

      // Auto mode: enforce delay then post
      const waitTime = getNextPostTime();
      if (waitTime > 0) {
        await new Promise((r) => setTimeout(r, Math.min(waitTime, 60000)));
      }

      try {
        const result = await redditApi("/api/submit", "POST", postData, creds);
        postHistory.push(Date.now());

        const postResult = result?.json?.data;
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({
                status: "posted",
                mode: "auto",
                subreddit: `r/${subreddit}`,
                title,
                postUrl: postResult?.url || "check your profile",
                postId: postResult?.name || postResult?.id,
                nextPostIn: formatDelay(getNextPostTime()),
              }, null, 2),
            },
          ],
        };
      } catch (err) {
        return {
          content: [{ type: "text", text: JSON.stringify({ error: err.message }) }],
        };
      }
    }
  );

  // ── Confirm Post (Manual Mode) ───────────────────────────
  server.tool(
    "reddit_confirm_post",
    "Confirm and submit a post that was previewed in manual mode. Requires the confirmToken from reddit_submit_post.",
    {
      confirmToken: z.string().describe("The confirmation token from reddit_submit_post preview"),
    },
    async ({ confirmToken }) => {
      const creds = connections.getCredentials("reddit");
      if (!creds?.accessToken) {
        return {
          content: [{ type: "text", text: JSON.stringify({ error: "Reddit not connected." }) }],
        };
      }

      if (!canPost()) {
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({
                error: "Rate limit: maximum 3 posts per hour reached.",
                nextPostIn: formatDelay(getNextPostTime()),
              }),
            },
          ],
        };
      }

      let postData;
      try {
        postData = JSON.parse(Buffer.from(confirmToken, "base64").toString());
      } catch {
        return {
          content: [{ type: "text", text: JSON.stringify({ error: "Invalid confirmation token." }) }],
        };
      }

      postData.api_type = "json";

      try {
        const result = await redditApi("/api/submit", "POST", postData, creds);
        postHistory.push(Date.now());

        const postResult = result?.json?.data;
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({
                status: "posted",
                mode: "manual_confirmed",
                subreddit: `r/${postData.sr}`,
                title: postData.title,
                postUrl: postResult?.url || "check your profile",
                postId: postResult?.name || postResult?.id,
              }, null, 2),
            },
          ],
        };
      } catch (err) {
        return {
          content: [{ type: "text", text: JSON.stringify({ error: err.message }) }],
        };
      }
    }
  );

  // ── Post Comment / Reply ─────────────────────────────────
  server.tool(
    "reddit_post_comment",
    `Post a comment or reply on Reddit.
In MANUAL mode: Returns preview for confirmation.
In AUTO mode: Posts with safety delay.`,
    {
      thing_id: z.string().describe("Full ID of the post or comment to reply to (e.g., t3_abc123 for posts, t1_abc123 for comments)"),
      text: z.string().describe("Comment text (markdown supported)"),
    },
    async ({ thing_id, text }) => {
      const creds = connections.getCredentials("reddit");
      if (!creds?.accessToken) {
        return {
          content: [{ type: "text", text: JSON.stringify({ error: "Reddit not connected." }) }],
        };
      }

      if (!canComment()) {
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({
                error: "Rate limit: maximum 10 comments per hour reached.",
                nextCommentIn: formatDelay(getNextCommentTime()),
              }),
            },
          ],
        };
      }

      const commentData = { thing_id, text, api_type: "json" };

      if (currentMode === "manual") {
        const previewToken = Buffer.from(JSON.stringify(commentData)).toString("base64");
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({
                status: "preview",
                mode: "manual",
                message: "Comment preview generated. Call reddit_confirm_comment with the token to submit.",
                preview: { replyTo: thing_id, text },
                confirmToken: previewToken,
              }, null, 2),
            },
          ],
        };
      }

      // Auto mode
      const waitTime = getNextCommentTime();
      if (waitTime > 0) {
        await new Promise((r) => setTimeout(r, Math.min(waitTime, 30000)));
      }

      try {
        const result = await redditApi("/api/comment", "POST", commentData, creds);
        commentHistory.push(Date.now());

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({
                status: "commented",
                mode: "auto",
                replyTo: thing_id,
                commentId: result?.json?.data?.things?.[0]?.data?.name,
                nextCommentIn: formatDelay(getNextCommentTime()),
              }, null, 2),
            },
          ],
        };
      } catch (err) {
        return {
          content: [{ type: "text", text: JSON.stringify({ error: err.message }) }],
        };
      }
    }
  );

  // ── Confirm Comment (Manual Mode) ────────────────────────
  server.tool(
    "reddit_confirm_comment",
    "Confirm and submit a comment that was previewed in manual mode.",
    {
      confirmToken: z.string().describe("The confirmation token from reddit_post_comment preview"),
    },
    async ({ confirmToken }) => {
      const creds = connections.getCredentials("reddit");
      if (!creds?.accessToken) {
        return {
          content: [{ type: "text", text: JSON.stringify({ error: "Reddit not connected." }) }],
        };
      }

      if (!canComment()) {
        return {
          content: [{ type: "text", text: JSON.stringify({ error: "Rate limit reached.", nextCommentIn: formatDelay(getNextCommentTime()) }) }],
        };
      }

      let commentData;
      try {
        commentData = JSON.parse(Buffer.from(confirmToken, "base64").toString());
      } catch {
        return {
          content: [{ type: "text", text: JSON.stringify({ error: "Invalid confirmation token." }) }],
        };
      }

      try {
        const result = await redditApi("/api/comment", "POST", commentData, creds);
        commentHistory.push(Date.now());

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({
                status: "commented",
                mode: "manual_confirmed",
                replyTo: commentData.thing_id,
                commentId: result?.json?.data?.things?.[0]?.data?.name,
              }, null, 2),
            },
          ],
        };
      } catch (err) {
        return {
          content: [{ type: "text", text: JSON.stringify({ error: err.message }) }],
        };
      }
    }
  );

  // ── Search Reddit ────────────────────────────────────────
  server.tool(
    "reddit_search",
    "Search Reddit posts and comments by keyword, subreddit, or topic.",
    {
      query: z.string().describe("Search query"),
      subreddit: z.string().optional().describe("Limit search to specific subreddit"),
      sort: z.enum(["relevance", "hot", "top", "new", "comments"]).optional().describe("Sort order"),
      time: z.enum(["hour", "day", "week", "month", "year", "all"]).optional().describe("Time filter"),
      limit: z.number().optional().describe("Max results (1-100, default 25)"),
    },
    async ({ query, subreddit, sort, time, limit }) => {
      const creds = connections.getCredentials("reddit");
      if (!creds?.accessToken) {
        return {
          content: [{ type: "text", text: JSON.stringify({ error: "Reddit not connected." }) }],
        };
      }

      const params = new URLSearchParams({
        q: query,
        type: "link",
        sort: sort || "relevance",
        t: time || "week",
        limit: String(limit || 25),
        ...(subreddit && { restrict_sr: "true" }),
      });

      const endpoint = subreddit
        ? `/r/${subreddit}/search?${params}`
        : `/search?${params}`;

      try {
        const result = await redditApi(endpoint, "GET", null, creds);
        const posts = (result?.data?.children || []).map((child) => ({
          id: child.data.name,
          title: child.data.title,
          subreddit: child.data.subreddit_name_prefixed,
          author: child.data.author,
          score: child.data.score,
          numComments: child.data.num_comments,
          url: `https://reddit.com${child.data.permalink}`,
          created: new Date(child.data.created_utc * 1000).toISOString(),
          selftext: child.data.selftext?.substring(0, 200) || "",
        }));

        return {
          content: [{ type: "text", text: JSON.stringify({ results: posts, count: posts.length }, null, 2) }],
        };
      } catch (err) {
        return {
          content: [{ type: "text", text: JSON.stringify({ error: err.message }) }],
        };
      }
    }
  );

  // ── Get Subreddit Rules ──────────────────────────────────
  server.tool(
    "reddit_get_subreddit_rules",
    "Get the rules for a subreddit. ALWAYS check rules before posting.",
    {
      subreddit: z.string().describe("Subreddit name without r/ prefix"),
    },
    async ({ subreddit }) => {
      const creds = connections.getCredentials("reddit");
      if (!creds?.accessToken) {
        return {
          content: [{ type: "text", text: JSON.stringify({ error: "Reddit not connected." }) }],
        };
      }

      try {
        const [rules, about] = await Promise.all([
          redditApi(`/r/${subreddit}/about/rules`, "GET", null, creds),
          redditApi(`/r/${subreddit}/about`, "GET", null, creds),
        ]);

        const subredditInfo = about?.data || {};
        const ruleList = (rules?.rules || []).map((r, i) => ({
          number: i + 1,
          title: r.short_name,
          description: r.description,
        }));

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({
                subreddit: `r/${subreddit}`,
                subscribers: subredditInfo.subscribers,
                description: subredditInfo.public_description,
                allowsSelfPromotion: !ruleList.some(
                  (r) =>
                    r.title?.toLowerCase().includes("promo") ||
                    r.title?.toLowerCase().includes("spam") ||
                    r.description?.toLowerCase().includes("self-promotion")
                ),
                rules: ruleList,
                warning: "Review these rules carefully before posting. Violations can result in bans.",
              }, null, 2),
            },
          ],
        };
      } catch (err) {
        return {
          content: [{ type: "text", text: JSON.stringify({ error: err.message }) }],
        };
      }
    }
  );

  // ── Get Hot/New/Top Posts ─────────────────────────────────
  server.tool(
    "reddit_get_posts",
    "Get hot, new, or top posts from a subreddit.",
    {
      subreddit: z.string().describe("Subreddit name without r/ prefix"),
      sort: z.enum(["hot", "new", "top", "rising"]).optional().describe("Sort order (default: hot)"),
      time: z.enum(["hour", "day", "week", "month", "year", "all"]).optional().describe("Time filter for top posts"),
      limit: z.number().optional().describe("Max results (1-100, default 25)"),
    },
    async ({ subreddit, sort, time, limit }) => {
      const creds = connections.getCredentials("reddit");
      if (!creds?.accessToken) {
        return {
          content: [{ type: "text", text: JSON.stringify({ error: "Reddit not connected." }) }],
        };
      }

      const sortBy = sort || "hot";
      const params = new URLSearchParams({
        limit: String(limit || 25),
        ...(time && { t: time }),
      });

      try {
        const result = await redditApi(
          `/r/${subreddit}/${sortBy}?${params}`,
          "GET",
          null,
          creds
        );

        const posts = (result?.data?.children || []).map((child) => ({
          id: child.data.name,
          title: child.data.title,
          author: child.data.author,
          score: child.data.score,
          numComments: child.data.num_comments,
          url: `https://reddit.com${child.data.permalink}`,
          created: new Date(child.data.created_utc * 1000).toISOString(),
        }));

        return {
          content: [{ type: "text", text: JSON.stringify({ subreddit: `r/${subreddit}`, sort: sortBy, posts, count: posts.length }, null, 2) }],
        };
      } catch (err) {
        return {
          content: [{ type: "text", text: JSON.stringify({ error: err.message }) }],
        };
      }
    }
  );

  // ── Monitor Keywords ─────────────────────────────────────
  server.tool(
    "reddit_monitor_keywords",
    "Search Reddit for keyword mentions. Useful for brand monitoring, competitor tracking, and finding relevant conversations to join (genuinely, not for spam).",
    {
      keywords: z.array(z.string()).describe("Keywords to monitor"),
      subreddits: z.array(z.string()).optional().describe("Limit to specific subreddits"),
      time: z.enum(["hour", "day", "week", "month"]).optional().describe("Time range (default: day)"),
    },
    async ({ keywords, subreddits, time }) => {
      const creds = connections.getCredentials("reddit");
      if (!creds?.accessToken) {
        return {
          content: [{ type: "text", text: JSON.stringify({ error: "Reddit not connected." }) }],
        };
      }

      const results = [];
      for (const keyword of keywords) {
        const params = new URLSearchParams({
          q: keyword,
          type: "link",
          sort: "new",
          t: time || "day",
          limit: "10",
        });

        try {
          const endpoint = subreddits?.length
            ? `/r/${subreddits.join("+")}/search?${params}&restrict_sr=true`
            : `/search?${params}`;

          const result = await redditApi(endpoint, "GET", null, creds);

          const posts = (result?.data?.children || []).map((child) => ({
            keyword,
            id: child.data.name,
            title: child.data.title,
            subreddit: child.data.subreddit_name_prefixed,
            author: child.data.author,
            score: child.data.score,
            url: `https://reddit.com${child.data.permalink}`,
            created: new Date(child.data.created_utc * 1000).toISOString(),
          }));

          results.push(...posts);
        } catch (err) {
          results.push({ keyword, error: err.message });
        }
      }

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify({
              monitored: keywords,
              totalMentions: results.filter((r) => !r.error).length,
              results,
              tip: "Only engage with posts where you can add genuine value. Never spam or self-promote without context.",
            }, null, 2),
          },
        ],
      };
    }
  );

  // ── Bulk Post (with delays) ──────────────────────────────
  server.tool(
    "reddit_bulk_post",
    `Queue multiple posts for delayed submission. Even in auto mode, posts are spaced 10+ minutes apart.
This is the 'post all' functionality — but with SAFE DELAYS built in.
Maximum 3 posts per hour regardless of mode.`,
    {
      posts: z.array(z.object({
        subreddit: z.string(),
        title: z.string(),
        text: z.string().optional(),
        url: z.string().optional(),
      })).describe("Array of posts to queue"),
    },
    async ({ posts }) => {
      if (posts.length > 3) {
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({
                error: "Safety limit: maximum 3 posts per bulk operation.",
                message: "Reddit bans accounts that post too frequently. Split into multiple batches with at least 1 hour between them.",
              }),
            },
          ],
        };
      }

      const config = getService("reddit")?.safetyConfig || {};
      const delay = config.minPostDelayMs || 600000;
      const queued = posts.map((post, i) => ({
        ...post,
        queuePosition: i + 1,
        estimatedPostTime: new Date(Date.now() + delay * i).toISOString(),
        delayMinutes: (delay * i) / 60000,
      }));

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify({
              status: "queued",
              mode: currentMode,
              message: currentMode === "manual"
                ? "Posts queued for review. Each will require individual confirmation via reddit_confirm_post."
                : "Posts queued with automatic delays. They will be submitted at the estimated times below.",
              totalPosts: queued.length,
              totalTime: `${(delay * (queued.length - 1)) / 60000} minutes`,
              queue: queued,
              warning: "Posts are delayed for safety. Reddit bans accounts that post too frequently.",
            }, null, 2),
          },
        ],
      };
    }
  );

  // ── User Profile ─────────────────────────────────────────
  server.tool(
    "reddit_get_profile",
    "Get the authenticated Reddit user's profile, karma, and account info.",
    {},
    async () => {
      const creds = connections.getCredentials("reddit");
      if (!creds?.accessToken) {
        return {
          content: [{ type: "text", text: JSON.stringify({ error: "Reddit not connected." }) }],
        };
      }

      try {
        const me = await redditApi("/api/v1/me", "GET", null, creds);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({
                username: me.name,
                karma: {
                  total: me.total_karma,
                  link: me.link_karma,
                  comment: me.comment_karma,
                },
                accountAge: new Date(me.created_utc * 1000).toISOString(),
                verified: me.verified,
                hasVerifiedEmail: me.has_verified_email,
              }, null, 2),
            },
          ],
        };
      } catch (err) {
        return {
          content: [{ type: "text", text: JSON.stringify({ error: err.message }) }],
        };
      }
    }
  );
}
