// Background service worker
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type === 'POST_TEXT') {
    // Store the post text so popup can access it
    chrome.storage.local.set({ lastPostText: msg.text })
    // Open the popup
    chrome.action.openPopup()
  }
})

// Open side panel when clicking the extension icon
chrome.action.onClicked.addListener((tab) => {
  chrome.sidePanel.open({ tabId: tab.id })
})
