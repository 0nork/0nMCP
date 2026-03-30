# 0n LinkedIn — AI Reply Generator

Chrome extension that generates killer LinkedIn replies using AI (Groq/Llama 3.3 — FREE).

## Install

1. Open `chrome://extensions/`
2. Enable "Developer mode" (top right toggle)
3. Click "Load unpacked"
4. Select this `linkedin-reply` folder
5. Click the extension icon → Settings → paste your Groq API key (free at console.groq.com)

## Features

### Reply Tab
- Paste any LinkedIn post text
- Pick a tone: Thoughtful, Supportive, Contrarian, Expert, Funny
- AI generates a 2-4 sentence reply optimized for engagement
- One-click copy to clipboard

### Find Posts Tab
- Enter a topic/industry
- AI generates 5 trending post scenarios with ready-to-use replies
- Each includes: author, post content, why it's strategic, suggested reply

### On-Page Buttons
- Green "⚡ 0n Reply" buttons appear next to LinkedIn posts
- Click to grab post text and open the reply generator

## Tech
- Groq API (Llama 3.3 70B) — free, fast, no OpenAI key needed
- Chrome Manifest V3
- Zero dependencies
