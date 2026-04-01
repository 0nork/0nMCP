/**
 * 0n Knowledge Layers — Patent #5 Prototype Implementation
 *
 * User-Configurable Multi-Layer AI Knowledge Architecture
 * with Cross-Platform Portable Deployment and Automatic
 * Capability Discovery via Service Connection
 *
 * US Provisional Patent — RocketOpp LLC
 * Inventor: Michael A. Mento Jr.
 */

'use strict';

// ── Layer Taxonomy (K1-K7) ──────────────────────────────────────────

const LAYER_SCHEMA = {
  brand_voice: {
    id: 'K1',
    name: 'Brand Voice',
    description: 'Brand identity, tone, communication style',
    composition: 'override', // User layer replaces defaults entirely
    fields: ['tone', 'formality', 'humor', 'vocabulary_additions', 'vocabulary_prohibitions', 'style_rules', 'personality_attributes'],
  },
  terminology: {
    id: 'K2',
    name: 'Terminology',
    description: 'Business-specific terms, acronyms, slang',
    composition: 'merge', // User values merge with defaults
    fields: ['acronyms', 'proper_nouns', 'slang', 'corrections', 'industry_terms'],
  },
  business_structure: {
    id: 'K3',
    name: 'Business Structure',
    description: 'Organizational context, services, team',
    composition: 'merge',
    fields: ['business_name', 'phone', 'email', 'address', 'hours', 'timezone', 'team', 'departments', 'services', 'pricing'],
  },
  visual_identity: {
    id: 'K4',
    name: 'Visual Identity',
    description: 'Brand colors, typography, visual preferences',
    composition: 'override',
    fields: ['primary_color', 'secondary_color', 'accent_color', 'font_display', 'font_body', 'logo_url', 'icon_style', 'theme_preference'],
  },
  domain_knowledge: {
    id: 'K5',
    name: 'Domain Knowledge',
    description: 'Industry expertise, FAQs, procedures',
    composition: 'append', // Adds to defaults, never removes
    fields: ['faq_pairs', 'procedures', 'compliance', 'best_practices', 'competitive_positioning', 'unique_selling_points'],
  },
  credentials: {
    id: 'K6',
    name: 'Credentials',
    description: 'API keys, tokens, service endpoints',
    composition: 'replace', // User layer is sole source
    fields: ['api_keys', 'oauth_tokens', 'webhook_urls', 'mcp_configs', 'service_endpoints'],
    encrypted: true, // Double-encrypted via Argon2id per 0nVault patent
  },
  operational_context: {
    id: 'K7',
    name: 'Operational Context',
    description: 'Runtime state, history, active workflows',
    composition: 'append',
    fields: ['active_workflows', 'recent_interactions', 'pending_tasks', 'calendar_state', 'pipeline_state', 'seasonal_context'],
    system_managed: true, // Updated automatically, not user-edited
  },
};

// ── Known Credential Patterns ───────────────────────────────────────

const CREDENTIAL_PATTERNS = [
  { pattern: /^sk-ant-/, service: 'anthropic', name: 'Anthropic API Key' },
  { pattern: /^sk-[a-zA-Z0-9]{48}/, service: 'openai', name: 'OpenAI API Key' },
  { pattern: /^rk_live_/, service: 'stripe', name: 'Stripe Secret Key' },
  { pattern: /^pk_live_/, service: 'stripe', name: 'Stripe Publishable Key' },
  { pattern: /^whsec_/, service: 'stripe', name: 'Stripe Webhook Secret' },
  { pattern: /^pit-[a-f0-9-]{36}$/, service: 'crm', name: 'CRM PIT Token' },
  { pattern: /^xoxb-/, service: 'slack', name: 'Slack Bot Token' },
  { pattern: /^xoxp-/, service: 'slack', name: 'Slack User Token' },
  { pattern: /^gsk_/, service: 'groq', name: 'Groq API Key' },
  { pattern: /^SG\./, service: 'sendgrid', name: 'SendGrid API Key' },
  { pattern: /^AC[a-f0-9]{32}$/, service: 'twilio', name: 'Twilio Account SID' },
  { pattern: /^ghp_/, service: 'github', name: 'GitHub Personal Access Token' },
  { pattern: /^gho_/, service: 'github', name: 'GitHub OAuth Token' },
  { pattern: /^eyJ[A-Za-z0-9_-]+\.eyJ/, service: 'supabase', name: 'Supabase JWT' },
  { pattern: /^AKIA[A-Z0-9]{16}$/, service: 'aws', name: 'AWS Access Key' },
  { pattern: /^AIza[A-Za-z0-9_-]{35}$/, service: 'google', name: 'Google API Key' },
  { pattern: /^re_[A-Za-z0-9]+$/, service: 'resend', name: 'Resend API Key' },
];

// ── Knowledge Layer Manager ─────────────────────────────────────────

class KnowledgeLayers {

  constructor(locationId) {
    this.locationId = locationId;
    this.layers = {};
    this.completion = { total: 0, filled: 0, pct: 0, missing: [] };
  }

  /**
   * Load layers from vault data.
   */
  load(vaultData) {
    for (const [key, schema] of Object.entries(LAYER_SCHEMA)) {
      this.layers[key] = {
        ...schema,
        data: vaultData?.[key] || {},
        version: vaultData?.[key]?._version || 1,
        updated_at: vaultData?.[key]?._updated_at || null,
      };
    }
    return this;
  }

  /**
   * Update a specific field in a layer.
   */
  updateField(layerKey, field, value) {
    if (!this.layers[layerKey]) throw new Error(`Unknown layer: ${layerKey}`);
    if (!this.layers[layerKey].data) this.layers[layerKey].data = {};
    this.layers[layerKey].data[field] = value;
    this.layers[layerKey].version++;
    this.layers[layerKey].updated_at = new Date().toISOString();
    return this;
  }

  /**
   * Compose layers using the defined strategies.
   * Merges user data with defaults according to each layer's composition type.
   */
  compose(defaults = {}) {
    const result = {};

    for (const [key, layer] of Object.entries(this.layers)) {
      const userLayer = layer.data || {};
      const defaultLayer = defaults[key] || {};
      const strategy = layer.composition;

      switch (strategy) {
        case 'override':
          // User layer completely replaces default
          result[key] = Object.keys(userLayer).length > 0 ? userLayer : defaultLayer;
          break;

        case 'merge':
          // Merge: user values take precedence for duplicate keys
          result[key] = { ...defaultLayer, ...userLayer };
          break;

        case 'append':
          // Append: combine arrays, merge objects, user values added
          result[key] = {};
          for (const field of new Set([...Object.keys(defaultLayer), ...Object.keys(userLayer)])) {
            const dv = defaultLayer[field];
            const uv = userLayer[field];
            if (Array.isArray(dv) && Array.isArray(uv)) {
              result[key][field] = [...dv, ...uv];
            } else if (typeof dv === 'object' && typeof uv === 'object' && dv && uv) {
              result[key][field] = { ...dv, ...uv };
            } else {
              result[key][field] = uv !== undefined ? uv : dv;
            }
          }
          break;

        case 'replace':
          // Replace: user layer only, ignore defaults
          result[key] = userLayer;
          break;

        default:
          result[key] = { ...defaultLayer, ...userLayer };
      }
    }

    return result;
  }

  /**
   * Resolve cross-layer template references.
   * "Always refer to {{business_structure.business_name}} in full"
   * → "Always refer to The Spa In Ligonier in full"
   */
  resolveReferences(text, composedLayers) {
    return text.replace(/\{\{(\w+)\.(\w+)\}\}/g, (match, layerKey, field) => {
      const layer = composedLayers[layerKey];
      if (layer && layer[field] !== undefined) {
        return String(layer[field]);
      }
      return match; // Keep unresolved references as-is
    });
  }

  /**
   * Adapt composed layers to a specific platform format.
   */
  adaptForPlatform(platform, composedLayers) {
    const adapters = {
      'openai': () => this._adaptOpenAI(composedLayers),
      'anthropic': () => this._adaptAnthropic(composedLayers),
      'gemini': () => this._adaptGemini(composedLayers),
      'ollama': () => this._adaptOllama(composedLayers),
      'mcp': () => this._adaptMCP(composedLayers),
      'wordpress': () => this._adaptWordPress(composedLayers),
      'slack': () => this._adaptSlack(composedLayers),
      'system_prompt': () => this._adaptSystemPrompt(composedLayers),
    };

    const adapter = adapters[platform] || adapters['system_prompt'];
    return adapter();
  }

  // ── Platform Adapters ───────────────────────────────────────────

  _adaptSystemPrompt(layers) {
    let prompt = '';

    // K1: Brand Voice
    if (layers.brand_voice?.tone) {
      prompt += `## Communication Style\nTone: ${layers.brand_voice.tone}\n`;
      if (layers.brand_voice.formality !== undefined) prompt += `Formality level: ${layers.brand_voice.formality}/1.0\n`;
      if (layers.brand_voice.style_rules?.length) {
        prompt += 'Rules:\n' + layers.brand_voice.style_rules.map(r => `- ${r}`).join('\n') + '\n';
      }
      if (layers.brand_voice.vocabulary_prohibitions?.length) {
        prompt += `Never use: ${layers.brand_voice.vocabulary_prohibitions.join(', ')}\n`;
      }
      prompt += '\n';
    }

    // K2: Terminology
    if (layers.terminology?.acronyms && Object.keys(layers.terminology.acronyms).length) {
      prompt += '## Terminology\n';
      for (const [abbr, full] of Object.entries(layers.terminology.acronyms)) {
        prompt += `- ${abbr} = ${full}\n`;
      }
      if (layers.terminology.proper_nouns) {
        for (const [noun, rule] of Object.entries(layers.terminology.proper_nouns)) {
          prompt += `- "${noun}": ${rule}\n`;
        }
      }
      prompt += '\n';
    }

    // K3: Business Structure
    if (layers.business_structure?.business_name) {
      prompt += '## Business Information\n';
      const bs = layers.business_structure;
      if (bs.business_name) prompt += `Business: ${bs.business_name}\n`;
      if (bs.phone) prompt += `Phone: ${bs.phone}\n`;
      if (bs.email) prompt += `Email: ${bs.email}\n`;
      if (bs.address) prompt += `Address: ${bs.address}\n`;
      if (bs.hours) prompt += `Hours: ${JSON.stringify(bs.hours)}\n`;
      if (bs.services?.length) {
        prompt += '\nServices:\n';
        for (const svc of bs.services) {
          prompt += `- ${svc.name}${svc.price ? ` (${svc.price})` : ''}${svc.duration ? ` — ${svc.duration}` : ''}\n`;
        }
      }
      prompt += '\n';
    }

    // K5: Domain Knowledge
    if (layers.domain_knowledge?.faq_pairs?.length) {
      prompt += '## FAQ\n';
      for (const faq of layers.domain_knowledge.faq_pairs) {
        prompt += `Q: ${faq.q}\nA: ${faq.a}\n\n`;
      }
    }

    return { type: 'system_prompt', content: prompt.trim() };
  }

  _adaptOpenAI(layers) {
    const systemPrompt = this._adaptSystemPrompt(layers);
    // OpenAI GPTs have 128K context — we can include everything
    return {
      type: 'openai_gpt',
      instructions: systemPrompt.content,
      knowledge_files: this._extractKnowledgeFiles(layers),
    };
  }

  _adaptAnthropic(layers) {
    const systemPrompt = this._adaptSystemPrompt(layers);
    return {
      type: 'anthropic_project',
      system: systemPrompt.content,
      project_knowledge: this._extractKnowledgeFiles(layers),
    };
  }

  _adaptGemini(layers) {
    const systemPrompt = this._adaptSystemPrompt(layers);
    // Gemini Gems have 4K char limit — truncate by priority
    const truncated = systemPrompt.content.substring(0, 4000);
    return {
      type: 'gemini_gem',
      instructions: truncated,
      truncated: systemPrompt.content.length > 4000,
      original_length: systemPrompt.content.length,
    };
  }

  _adaptOllama(layers) {
    const systemPrompt = this._adaptSystemPrompt(layers);
    return {
      type: 'ollama_brain',
      system: systemPrompt.content,
      brain_file: this._generateBrainFile(layers),
    };
  }

  _adaptMCP(layers) {
    const systemPrompt = this._adaptSystemPrompt(layers);
    return {
      type: 'mcp_context',
      system_prefix: systemPrompt.content,
      tool_context: layers.credentials || {},
    };
  }

  _adaptWordPress(layers) {
    const systemPrompt = this._adaptSystemPrompt(layers);
    return {
      type: 'wordpress_onpress',
      chat_system_prompt: systemPrompt.content,
      theme_colors: layers.visual_identity || {},
      business_info: layers.business_structure || {},
    };
  }

  _adaptSlack(layers) {
    const systemPrompt = this._adaptSystemPrompt(layers);
    return {
      type: 'slack_bot',
      bot_personality: systemPrompt.content,
      slash_commands: this._generateSlashCommands(layers),
    };
  }

  _extractKnowledgeFiles(layers) {
    const files = [];
    if (layers.domain_knowledge?.procedures?.length) {
      files.push({ name: 'procedures.md', content: layers.domain_knowledge.procedures.join('\n\n---\n\n') });
    }
    if (layers.domain_knowledge?.faq_pairs?.length) {
      const faqContent = layers.domain_knowledge.faq_pairs.map(f => `## ${f.q}\n\n${f.a}`).join('\n\n');
      files.push({ name: 'faq.md', content: faqContent });
    }
    return files;
  }

  _generateBrainFile(layers) {
    return {
      format: '0n-brain-v1',
      layers: Object.fromEntries(
        Object.entries(layers).filter(([k]) => k !== 'credentials')
      ),
      generated_at: new Date().toISOString(),
    };
  }

  _generateSlashCommands(layers) {
    const commands = ['/0n help'];
    if (layers.business_structure?.services?.length) commands.push('/0n services');
    if (layers.business_structure?.hours) commands.push('/0n hours');
    if (layers.credentials?.api_keys?.stripe) commands.push('/0n invoice');
    return commands;
  }
}

// ── Credential Harvester ────────────────────────────────────────────

class CredentialHarvester {

  /**
   * Analyze a set of key-value pairs and identify credentials.
   * Works with .env files, JSON configs, process.env, etc.
   */
  static harvest(keyValuePairs) {
    const discovered = [];

    for (const [key, value] of Object.entries(keyValuePairs)) {
      if (!value || typeof value !== 'string') continue;

      for (const pattern of CREDENTIAL_PATTERNS) {
        if (pattern.pattern.test(value)) {
          discovered.push({
            key,
            service: pattern.service,
            name: pattern.name,
            value_preview: value.substring(0, 8) + '...',
            // Actual value stored only in encrypted K6 layer
          });
          break;
        }
      }
    }

    return discovered;
  }

  /**
   * Verify a discovered credential by making a health-check API call.
   */
  static async verify(service, value) {
    const healthChecks = {
      anthropic: () => fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST', headers: { 'x-api-key': value, 'anthropic-version': '2023-06-01', 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: 'claude-haiku-4-5-20251001', max_tokens: 1, messages: [{ role: 'user', content: 'hi' }] }),
      }),
      openai: () => fetch('https://api.openai.com/v1/models', { headers: { Authorization: `Bearer ${value}` } }),
      stripe: () => fetch('https://api.stripe.com/v1/balance', { headers: { Authorization: `Bearer ${value}` } }),
      groq: () => fetch('https://api.groq.com/openai/v1/models', { headers: { Authorization: `Bearer ${value}` } }),
      github: () => fetch('https://api.github.com/user', { headers: { Authorization: `Bearer ${value}` } }),
    };

    const check = healthChecks[service];
    if (!check) return { verified: false, reason: 'No health check available' };

    try {
      const res = await check();
      return { verified: res.status < 400, status: res.status };
    } catch (err) {
      return { verified: false, reason: err.message };
    }
  }
}

// ── Exports ─────────────────────────────────────────────────────────

module.exports = {
  LAYER_SCHEMA,
  CREDENTIAL_PATTERNS,
  KnowledgeLayers,
  CredentialHarvester,
};
