
HOW TO PACKAGE AS A CHROME EXTENSION:

1. Create a folder named "VisionSaveExtension" on your computer.
2. Inside it, create three files:
   - manifest.json
   - content.js
   - background.js
   - popup.html

--- manifest.json ---
{
  "manifest_version": 3,
  "name": "VisionSave",
  "version": "1.0",
  "description": "Hover to download images as JPG after 1 second.",
  "permissions": ["storage", "downloads"],
  "action": {
    "default_popup": "popup.html"
  },
  "content_scripts": [
    {
      "matches": ["<all_urls>"],
      "js": ["content.js"],
      "css": ["content.css"]
    }
  ],
  "background": {
    "service_worker": "background.js"
  }
}

--- content.js ---
// Main logic for hovering and glowing
let hoverTimer = null;
const style = document.createElement('style');
style.textContent = `
  .visionsave-glow {
    outline: 4px solid #22c55e !important;
    box-shadow: 0 0 20px rgba(34, 197, 94, 0.6) !important;
    transition: all 0.3s ease !important;
    z-index: 999999 !important;
  }
`;
document.head.appendChild(style);

document.addEventListener('mouseover', (e) => {
  const el = e.target;
  if (el.tagName === 'IMG') {
    // Filter logic: Ignore small icons or logos
    if (el.naturalWidth < 100 || el.naturalHeight < 100 || el.src.includes('logo')) return;

    hoverTimer = setTimeout(() => {
      el.classList.add('visionsave-glow');
      chrome.runtime.sendMessage({ action: 'download', url: el.src });
      setTimeout(() => el.classList.remove('visionsave-glow'), 2000);
    }, 1000);
  }
});

document.addEventListener('mouseout', (e) => {
  if (e.target.tagName === 'IMG') {
    clearTimeout(hoverTimer);
  }
});

--- background.js ---
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'download') {
    // Here you would check for the daily limit from chrome.storage
    chrome.downloads.download({
      url: request.url,
      filename: `VisionSave_${Date.now()}.jpg`
    });
  }
});

3. Go to chrome://extensions in your browser.
4. Enable "Developer mode".
5. Click "Load unpacked" and select your folder.

NOTE: This simulator app's code provides a functional UI for the Admin Panel and a preview of the Extension logic.
