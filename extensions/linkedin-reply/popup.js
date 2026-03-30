let currentTone = 'thoughtful'
let apiKey = ''
let profileContext = ''

// Load saved settings
chrome.storage.local.get(['groqKey', 'profileContext'], (data) => {
  if (data.groqKey) {
    apiKey = data.groqKey
    document.getElementById('api-key').value = '••••••••••••'
  }
  if (data.profileContext) {
    profileContext = data.profileContext
    document.getElementById('profile-context').value = profileContext
  }
})

function switchTab(tab) {
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'))
  document.querySelector(`[data-tab="${tab}"]`).classList.add('active')
  document.querySelectorAll('.section').forEach(s => s.classList.add('hidden'))
  document.getElementById(`tab-${tab}`).classList.remove('hidden')
}

function setTone(tone) {
  currentTone = tone
  document.querySelectorAll('.btn-secondary').forEach(b => {
    b.style.borderColor = '#1E293B'
    b.style.color = '#E8EAED'
  })
  event.target.style.borderColor = '#6EE05A'
  event.target.style.color = '#6EE05A'
}

async function callGroq(messages) {
  if (!apiKey) {
    showStatus('reply', 'Set your Groq API key in Settings first', 'error')
    return null
  }

  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      messages,
      max_tokens: 500,
      temperature: 0.8,
    }),
  })

  if (!res.ok) {
    const err = await res.text()
    showStatus('reply', `Groq error: ${res.status}`, 'error')
    return null
  }

  const data = await res.json()
  return data.choices?.[0]?.message?.content || ''
}

async function generateReply() {
  const postContent = document.getElementById('post-content').value.trim()
  if (!postContent) {
    showStatus('reply', 'Paste a post to reply to', 'error')
    return
  }

  const btn = document.getElementById('generate-btn')
  btn.textContent = '⏳ Generating...'
  btn.disabled = true

  const toneGuides = {
    thoughtful: 'Write a thoughtful, insightful reply that adds value. Share a relevant perspective or experience. Ask a follow-up question.',
    supportive: 'Write an encouraging, supportive reply. Validate their point, amplify their message, add your own positive take.',
    contrarian: 'Write a respectful but contrarian reply. Challenge their assumption with data or a different angle. Be bold but professional.',
    expert: 'Write an expert-level reply that demonstrates deep knowledge. Share specific insights, tools, or frameworks they might not know about.',
    funny: 'Write a witty, clever reply that makes people smile. Use humor naturally — not forced. Still add value alongside the humor.',
  }

  const profileLine = profileContext ? `\nYour profile: ${profileContext}` : ''

  const reply = await callGroq([
    {
      role: 'system',
      content: `You are a LinkedIn engagement expert. Generate ONE reply to a LinkedIn post. ${toneGuides[currentTone]}${profileLine}

Rules:
- 2-4 sentences max. LinkedIn rewards concise, punchy comments.
- Start with a hook — don't start with "Great post" or "I agree"
- End with a question or call to action when possible
- Sound human, not AI. No emojis unless the post uses them.
- No hashtags in replies.
- Return ONLY the reply text. No quotes, no "Here's a reply:", no meta-commentary.`
    },
    { role: 'user', content: `LinkedIn post:\n\n${postContent}` }
  ])

  btn.textContent = '⚡ Generate Reply'
  btn.disabled = false

  if (reply) {
    document.getElementById('reply-text').textContent = reply
    document.getElementById('reply-tone').textContent = `Tone: ${currentTone}`
    document.getElementById('reply-output').classList.remove('hidden')
  }
}

async function findPosts() {
  const topic = document.getElementById('find-topic').value.trim()
  if (!topic) return

  const list = document.getElementById('posts-list')
  list.innerHTML = '<div class="loading">🔍 Finding trending posts...</div>'

  const result = await callGroq([
    {
      role: 'system',
      content: `You are a LinkedIn content strategist. Generate 5 realistic trending LinkedIn post scenarios about the given topic that would be great to comment on for visibility.

For each post, return this EXACT format (no markdown, no numbering):

AUTHOR: [realistic name and title]
POST: [2-3 sentence post content that sounds real]
WHY: [one sentence on why commenting here is strategic]
REPLY: [a ready-to-use reply]
---

Make them diverse: mix of hot takes, questions, stories, data-driven posts, and personal experiences.`
    },
    { role: 'user', content: `Topic: ${topic}` }
  ])

  if (!result) {
    list.innerHTML = '<div class="loading">Failed to find posts. Check your API key.</div>'
    return
  }

  const posts = result.split('---').filter(p => p.trim())
  list.innerHTML = ''

  posts.forEach((post, i) => {
    const authorMatch = post.match(/AUTHOR:\s*(.+)/i)
    const postMatch = post.match(/POST:\s*(.+?)(?=WHY:|REPLY:|$)/is)
    const whyMatch = post.match(/WHY:\s*(.+?)(?=REPLY:|$)/is)
    const replyMatch = post.match(/REPLY:\s*(.+?)$/is)

    const card = document.createElement('div')
    card.className = 'post-card'
    card.innerHTML = `
      <div class="post-author">${authorMatch?.[1]?.trim() || 'LinkedIn User'}</div>
      <div class="post-preview">${postMatch?.[1]?.trim() || post.trim().slice(0, 150)}</div>
      <div class="post-engagement">💡 ${whyMatch?.[1]?.trim() || 'High engagement potential'}</div>
      ${replyMatch ? `<div style="margin-top:8px;padding-top:8px;border-top:1px solid #1E293B;">
        <div style="font-size:10px;color:#6EE05A;font-weight:600;margin-bottom:4px;">SUGGESTED REPLY:</div>
        <div style="font-size:12px;color:#E8EAED;line-height:1.4;">${replyMatch[1].trim()}</div>
        <button class="copy-btn" style="margin-top:4px;" onclick="copyText(this, '${replyMatch[1].trim().replace(/'/g, "\\'")}')">📋 Copy Reply</button>
      </div>` : ''}
    `
    list.appendChild(card)
  })
}

function copyReply() {
  const text = document.getElementById('reply-text').textContent
  navigator.clipboard.writeText(text)
  showStatus('reply', '✓ Copied to clipboard!', 'success')
}

function copyText(btn, text) {
  navigator.clipboard.writeText(text)
  btn.textContent = '✓ Copied!'
  setTimeout(() => { btn.textContent = '📋 Copy Reply' }, 1500)
}

function saveKey() {
  const key = document.getElementById('api-key').value.trim()
  if (!key || key === '••••••••••••') return
  apiKey = key
  chrome.storage.local.set({ groqKey: key })
  document.getElementById('api-key').value = '••••••••••••'
  showStatus('settings', '✓ API key saved', 'success')
}

function saveProfile() {
  profileContext = document.getElementById('profile-context').value.trim()
  chrome.storage.local.set({ profileContext })
  showStatus('settings', '✓ Profile saved', 'success')
}

function showStatus(tab, msg, type) {
  const el = document.getElementById(`status-${tab}`)
  el.textContent = msg
  el.className = `status ${type}`
  el.classList.remove('hidden')
  setTimeout(() => el.classList.add('hidden'), 3000)
}
