// Content script — runs on linkedin.com pages
// Adds a floating "0n Reply" button next to LinkedIn posts

function addReplyButtons() {
  const posts = document.querySelectorAll('.feed-shared-update-v2, .occludable-update')

  posts.forEach(post => {
    if (post.dataset.onReply) return
    post.dataset.onReply = 'true'

    const commentBtn = post.querySelector('.comment-button, [aria-label*="Comment"], .social-actions-button')
    if (!commentBtn) return

    const btn = document.createElement('button')
    btn.className = 'on-reply-btn'
    btn.innerHTML = '⚡ 0n Reply'
    btn.title = 'Generate AI reply with 0nMCP'

    btn.addEventListener('click', (e) => {
      e.preventDefault()
      e.stopPropagation()

      // Get post text
      const textEl = post.querySelector('.feed-shared-text, .break-words, .update-components-text')
      const text = textEl?.innerText || ''

      if (text) {
        // Send to popup/sidepanel
        chrome.runtime.sendMessage({ type: 'POST_TEXT', text })

        // Also copy to clipboard for manual paste
        navigator.clipboard.writeText(text).catch(() => {})
      }
    })

    // Insert button near the comment button
    const actionsBar = commentBtn.closest('.social-details-social-counts, .feed-shared-social-action-bar, .social-actions-button')
    if (actionsBar) {
      actionsBar.parentElement.insertBefore(btn, actionsBar.nextSibling)
    }
  })
}

// Run on page load and on scroll (LinkedIn lazy-loads posts)
addReplyButtons()
const observer = new MutationObserver(() => addReplyButtons())
observer.observe(document.body, { childList: true, subtree: true })
