/**
 * 0nMCP — Universal Email Sequence Engine
 * Replaces CRM workflow builder entirely. Every client gets automated
 * sequences triggered by tags/events. Runs as code, not CRM workflows.
 *
 * Used by: SXO, 0nCore, 0nMCP, every future client
 */

const CRM_BASE = 'https://services.leadconnectorhq.com'
const CRM_VERSION = '2021-07-28'

/**
 * Sequence definitions — each has steps with delays and actions
 */
export const SEQUENCES = {

  // ── SXO FREE SCAN ─────────────────────────────────────
  'sxo-free-scan': {
    name: 'SXO Free Scan Follow-Up',
    trigger: 'tag:sxo-scan',
    steps: [
      {
        delay: 60, // 1 minute
        action: 'email',
        subject: 'Your Free SXO Score Report — {{sxo_domain}}',
        body: `Hi {{firstName}},

Your SXO score for {{sxo_domain}} is **{{sxo_score}}/100** (Grade: {{sxo_grade}}).

Here's what that means:
{{#if (gte sxo_score 80)}}Your site is in great shape for AI search. But there's always room to improve.{{/if}}
{{#if (and (gte sxo_score 50) (lt sxo_score 80))}}Your site has a solid foundation but is missing key AI optimization that could cost you 30-50% of future traffic.{{/if}}
{{#if (lt sxo_score 50)}}Your site is at serious risk of losing visibility as AI search grows. 94% of sites score under 50 — you need immediate action.{{/if}}

**View your full breakdown:** https://sxowebsite.com/my-reports

Want the complete report with exact fixes? Get your $8 SXO Living DOM Report:
**https://sxowebsite.com/get-sxo-rewrite**

— SXO Team`,
      },
      {
        delay: 172800, // 2 days
        action: 'email',
        subject: 'Your site scored {{sxo_grade}} — here\'s the fix (just $8)',
        body: `Hey {{firstName}},

Quick follow-up on your SXO scan for {{sxo_domain}}.

For $8, we'll generate a complete Living DOM report that tells you exactly what to change — with specific code snippets, schema markup, table traps, and mutation engine setup.

It's the same architecture powering sxowebsite.com (which scores 98/100).

**Get your $8 report now:** https://sxowebsite.com/get-sxo-rewrite

— SXO Team`,
      },
      {
        delay: 432000, // 5 days
        action: 'email',
        subject: 'Last chance — your SXO report expires in 48 hours',
        body: `{{firstName}},

Your SXO scan data for {{sxo_domain}} expires in 48 hours. After that, you'll need to scan again.

Get the full $8 report while your data is fresh:
**https://sxowebsite.com/get-sxo-rewrite**

After that, I'll stop emailing about this. Promise.

— SXO Team`,
      },
    ],
  },

  // ── SXO $8 REPORT PURCHASED ───────────────────────────
  'sxo-purchased-scan': {
    name: 'SXO $8 Report Delivery',
    trigger: 'tag:sxo-purchased-scan',
    steps: [
      {
        delay: 5, // immediate
        action: 'email',
        subject: 'Your SXO Living DOM Report is Ready — {{sxo_domain}}',
        body: `{{firstName}},

Your SXO Living DOM Report for {{sxo_domain}} is ready.

**Download your report:** {{report_download_url}}

What's inside:
- Complete breakdown of what your domain needs to rank
- BLUF architecture recommendations
- Table trap placements
- JSON-LD schema markup (ready to paste)
- Mutation engine setup instructions
- Dynamic freshness loop configuration
- AI search optimization checklist

**Next step:** Want the actual code snippets ready to install? Get the Full Optimization for $16.79:
https://sxowebsite.com/upgrade

— SXO Team`,
      },
      {
        delay: 259200, // 3 days
        action: 'email',
        subject: 'Ready for the code? Full optimization is $16.79',
        body: `Hey {{firstName}},

Hope you found the SXO report useful for {{sxo_domain}}.

The next step is the Full Optimization — you'll get every specific code snippet you need, plus exact instructions on where and how to install each one.

It's like having a senior developer write your SEO implementation for you.

**Get Full Optimization — $16.79:** https://sxowebsite.com/upgrade

— SXO Team`,
      },
    ],
  },

  // ── SXO FULL OPTIMIZATION PURCHASED ───────────────────
  'sxo-purchased-optimization': {
    name: 'SXO Full Optimization Delivery + Referral',
    trigger: 'tag:sxo-purchased-optimization',
    steps: [
      {
        delay: 5,
        action: 'email',
        subject: 'Your Full SXO Optimization + Code Snippets — {{sxo_domain}}',
        body: `{{firstName}},

Your Full SXO Optimization report for {{sxo_domain}} is ready.

**Download:** {{optimization_download_url}}

This includes every code snippet you need:
- Complete HTML restructuring with BLUF headers
- Schema.org JSON-LD markup (copy-paste ready)
- Mutation engine JavaScript
- Table trap HTML + CSS
- Meta tag optimizations
- llms.txt configuration
- Core Web Vitals fixes
- Installation guide for each snippet

Questions? Just reply to this email.

— SXO Team`,
      },
      {
        delay: 86400, // 1 day
        action: 'email',
        subject: 'Earn money — refer others, get paid per referral',
        body: `{{firstName}},

Now that you've seen what SXO optimization looks like, here's an opportunity:

**Earn a commission on every $8 scan you refer.**

Your referral link: https://sxowebsite.com/scan?ref={{referral_code}}

Share it on social media, send it to clients, put it on your website. Every paid scan = money in your pocket.

Pro tip: You can also scan ANOTHER domain for yourself for just $8 — use a different email if you want a fresh report.

**Start referring:** https://sxowebsite.com/dashboard/refer

— SXO Team`,
      },
      {
        delay: 432000, // 5 days
        action: 'email',
        subject: 'Free AI Business Assessment — on us',
        body: `{{firstName}},

As a thank you for being an SXO customer, we're offering you a free AI Business Assessment.

This goes beyond SEO — it evaluates your entire digital presence through the lens of AI agents, voice search, and conversational AI.

**Get your free assessment:** https://sxowebsite.com/ai-ready

— SXO Team`,
      },
      {
        delay: 691200, // 8 days
        action: 'email',
        subject: 'Build your AI-powered website — 10% off with code WEB0N10',
        body: `{{firstName}},

Last email in this series (promise).

If you want a website that's automatically optimized for both Google AND AI search — built from scratch with Living DOM architecture — we have web0n.

It's an automated website builder that creates AI-ready sites with everything we've been talking about built in from day one.

**Use code WEB0N10 for 10% off:** https://sxowebsite.com/upgrade?coupon=WEB0N10

— SXO Team`,
      },
    ],
  },

  // ── 0nCORE NEW CUSTOMER ───────────────────────────────
  '0ncore-welcome': {
    name: '0nCore Welcome Sequence',
    trigger: 'tag:0ncore-signup',
    steps: [
      {
        delay: 5,
        action: 'email',
        subject: 'Welcome to 0nCore — let\'s get you set up',
        body: `Welcome {{firstName}},

You're in. Here's how to get started:

1. **Connect your CRM** — Settings → Integrations → CRM
2. **Install 0nMCP** — npx 0nmcp@latest
3. **Import your API keys** — 0nmcp engine import
4. **Try your first automation** — "Send a Slack message when a new contact is created"

Your dashboard: https://0ncore.com/dashboard

Questions? Reply to this email or chat with 0nAI in your dashboard.

— Mike @ RocketOpp`,
      },
      {
        delay: 86400, // 1 day
        action: 'email',
        subject: 'Did you connect your first service?',
        body: `Hey {{firstName}},

Just checking in — have you connected your first service to 0nCore yet?

Most people start with:
- **Slack** — get CRM notifications in your team chat
- **Stripe** — track payments in your CRM
- **Gmail** — auto-log email conversations

**Connect now:** https://0ncore.com/dashboard/downloads

If you need help, just reply to this email.

— Mike`,
      },
      {
        delay: 259200, // 3 days
        action: 'email',
        subject: 'Your first automation idea (takes 2 minutes)',
        body: `{{firstName}},

Here's a quick win you can set up in 2 minutes:

**"When someone fills out a form, score them with AI and notify Slack"**

1. Go to your Automations page
2. Describe it in plain English
3. 0nAI generates the .0n SWITCH file
4. Click "Run" — it's live

**Try it:** https://0ncore.com/dashboard/automations

This is what 0nCore does — replaces hours of manual setup with one sentence.

— Mike`,
      },
    ],
  },
}

/**
 * Execute a sequence step — sends email via CRM API
 */
export async function sendSequenceEmail(params) {
  const { contactId, locationId, subject, body, pit } = params

  const res = await fetch(`${CRM_BASE}/conversations/messages`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${pit}`,
      Version: CRM_VERSION,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      type: 'Email',
      contactId,
      subject,
      body,
      emailFrom: 'noreply@0nmcp.com',
    }),
  })

  return { success: res.ok, status: res.status }
}

/**
 * Resolve template variables in email body
 */
export function resolveTemplate(template, contact) {
  let resolved = template
  const fields = {
    firstName: contact.firstName || contact.name?.split(' ')[0] || 'there',
    lastName: contact.lastName || '',
    email: contact.email || '',
    sxo_score: contact.customFields?.sxo_score || contact.sxo_score || '0',
    sxo_grade: contact.customFields?.sxo_grade || contact.sxo_grade || 'Unknown',
    sxo_domain: contact.customFields?.sxo_domain || contact.sxo_domain || 'your domain',
    report_download_url: contact.customFields?.report_download_url || '#',
    optimization_download_url: contact.customFields?.optimization_download_url || '#',
    referral_code: contact.customFields?.referral_code || contact.referral_code || 'sxo',
  }

  for (const [key, value] of Object.entries(fields)) {
    resolved = resolved.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), value)
  }

  // Handle conditionals (simplified)
  resolved = resolved.replace(/\{\{#if.*?\}\}([\s\S]*?)\{\{\/if\}\}/g, '$1')

  return resolved
}

/**
 * Schedule a sequence for a contact
 * Called when a tag is added. Stores schedule in Supabase.
 */
export async function scheduleSequence(params) {
  const { sequenceId, contactId, locationId, contact, supabase } = params
  const sequence = SEQUENCES[sequenceId]
  if (!sequence) throw new Error(`Unknown sequence: ${sequenceId}`)

  const now = Date.now()
  const scheduledSteps = sequence.steps.map((step, index) => ({
    sequence_id: sequenceId,
    contact_id: contactId,
    location_id: locationId,
    step_index: index,
    action: step.action,
    subject: resolveTemplate(step.subject, contact),
    body: resolveTemplate(step.body, contact),
    scheduled_at: new Date(now + step.delay * 1000).toISOString(),
    status: 'pending',
  }))

  if (supabase) {
    await supabase.from('email_sequence_queue').insert(scheduledSteps)
  }

  return { sequence: sequenceId, stepsScheduled: scheduledSteps.length }
}
