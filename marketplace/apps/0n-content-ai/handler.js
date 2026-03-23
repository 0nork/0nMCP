/**
 * ═══════════════════════════════════════════════════════════════════════════
 * 0n Content AI — Webhook Handler
 * ═══════════════════════════════════════════════════════════════════════════
 * Generates AI-powered content (blog posts, emails, social posts) for CRM
 * users. Triggered via custom webhook with a content request payload.
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { crmRequest } from '../../lib/oauth.js';

/**
 * Supported content types and their generation configs.
 */
const CONTENT_TYPES = {
  blog_post: {
    label: 'Blog Post',
    promptPrefix: 'Write a blog post',
    defaultTokens: 1500,
  },
  email_template: {
    label: 'Email Template',
    promptPrefix: 'Write a marketing email',
    defaultTokens: 800,
  },
  social_post: {
    label: 'Social Media Post',
    promptPrefix: 'Write a social media post',
    defaultTokens: 300,
  },
  sms_template: {
    label: 'SMS Template',
    promptPrefix: 'Write a short SMS message (under 160 characters)',
    defaultTokens: 100,
  },
  ad_copy: {
    label: 'Ad Copy',
    promptPrefix: 'Write compelling advertising copy',
    defaultTokens: 400,
  },
  landing_page: {
    label: 'Landing Page Copy',
    promptPrefix: 'Write landing page copy with headline, subheadline, benefits, and CTA',
    defaultTokens: 1200,
  },
};

/**
 * Handle an incoming content generation request.
 *
 * Expected event.data payload:
 * {
 *   "content_type": "blog_post" | "email_template" | "social_post" | "sms_template" | "ad_copy" | "landing_page",
 *   "topic": "Your content topic or prompt",
 *   "keywords": ["optional", "seo", "keywords"],
 *   "platform": "facebook" | "instagram" | "linkedin" | "twitter" (for social posts),
 *   "cta": "Optional call-to-action text"
 * }
 *
 * @param {object} event    — Webhook event
 * @param {object} context  — Execution context
 * @returns {Promise<object>}
 */
export async function handle(event, context) {
  const { locationId, accessToken, config, execute } = context;
  const data = event.data || event;

  // Extract content request
  const contentType = data.content_type || data.contentType || 'blog_post';
  const topic = data.topic || data.prompt || data.subject;
  const keywords = data.keywords || [];
  const platform = data.platform || '';
  const cta = data.cta || '';

  if (!topic) {
    return { success: false, error: 'Missing required field: topic' };
  }

  const typeConfig = CONTENT_TYPES[contentType];
  if (!typeConfig) {
    return {
      success: false,
      error: `Unknown content_type: ${contentType}. Valid types: ${Object.keys(CONTENT_TYPES).join(', ')}`,
    };
  }

  // Build the generation prompt
  const systemPrompt = buildSystemPrompt(config, typeConfig, platform);
  const userPrompt = buildUserPrompt(topic, keywords, cta, typeConfig);

  // Generate content via AI
  let generatedContent;
  const maxTokens = config.max_tokens || typeConfig.defaultTokens;

  if (execute) {
    try {
      const result = await execute('anthropic_messages_create', {
        model: 'claude-sonnet-4-20250514',
        max_tokens: maxTokens,
        system: systemPrompt,
        messages: [{ role: 'user', content: userPrompt }],
      });
      generatedContent = result?.content?.[0]?.text || result?.text || '';
    } catch (err) {
      return { success: false, error: `AI generation failed: ${err.message}` };
    }
  } else {
    return { success: false, error: 'AI execution not available — 0nMCP execute function required' };
  }

  if (!generatedContent) {
    return { success: false, error: 'AI returned empty content' };
  }

  // Return the generated content
  // The caller can choose to save it to CRM blogs, emails, social planner, etc.
  const result = {
    success: true,
    content_type: contentType,
    topic,
    content: generatedContent,
    word_count: generatedContent.split(/\s+/).length,
    character_count: generatedContent.length,
    generated_at: new Date().toISOString(),
  };

  // If blog post, optionally save to CRM blogs
  if (contentType === 'blog_post' && data.save_to_blog !== false) {
    try {
      const blogResult = await saveBlogPost({
        locationId,
        accessToken,
        title: extractTitle(generatedContent) || topic,
        content: generatedContent,
      });
      result.blog = blogResult;
    } catch (err) {
      result.blog = { saved: false, error: err.message };
    }
  }

  return result;
}

// ─── Prompt Builders ────────────────────────────────────────────

function buildSystemPrompt(config, typeConfig, platform) {
  let prompt = `You are a professional content writer.`;

  if (config.business_name) {
    prompt += ` You are writing for ${config.business_name}.`;
  }
  if (config.business_description) {
    prompt += ` Business context: ${config.business_description}`;
  }
  if (config.target_audience) {
    prompt += ` Target audience: ${config.target_audience}.`;
  }

  prompt += ` Tone: ${config.tone || 'professional'}.`;

  if (platform) {
    const platformGuidance = {
      facebook: 'Optimize for Facebook — conversational, can be longer, use emojis sparingly.',
      instagram: 'Optimize for Instagram — visual storytelling, use relevant hashtags, keep it engaging.',
      linkedin: 'Optimize for LinkedIn — professional tone, industry insights, thought leadership.',
      twitter: 'Optimize for Twitter/X — concise (under 280 characters), punchy, use 1-2 hashtags.',
      tiktok: 'Optimize for TikTok — trendy, casual, hook in the first line.',
    };
    prompt += ` ${platformGuidance[platform] || ''}`;
  }

  prompt += ` Output ONLY the content — no meta-commentary, no "here's your content" preamble.`;

  return prompt;
}

function buildUserPrompt(topic, keywords, cta, typeConfig) {
  let prompt = `${typeConfig.promptPrefix} about: ${topic}`;

  if (keywords.length > 0) {
    prompt += `\n\nInclude these keywords naturally: ${keywords.join(', ')}`;
  }
  if (cta) {
    prompt += `\n\nCall to action: ${cta}`;
  }

  return prompt;
}

// ─── Helpers ────────────────────────────────────────────────────

/**
 * Extract a title from generated blog content (first line or heading).
 */
function extractTitle(content) {
  const lines = content.split('\n').filter(l => l.trim());
  if (!lines.length) return null;

  const first = lines[0].trim();
  // Remove markdown heading markers
  return first.replace(/^#+\s*/, '').trim();
}

/**
 * Save a blog post to CRM.
 */
async function saveBlogPost({ locationId, accessToken, title, content }) {
  try {
    const result = await crmRequest(
      `/blogs/posts`,
      accessToken,
      {
        method: 'POST',
        body: {
          locationId,
          title,
          rawHTML: content.replace(/\n/g, '<br>'),
          status: 'draft',
        },
      }
    );
    return { saved: true, postId: result.data?.id };
  } catch (err) {
    return { saved: false, error: err.message };
  }
}
