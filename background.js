let lastDownloadTime = 0;
const DOWNLOAD_COOLDOWN = 2000; // 2 seconds delay

chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.get(['user'], (result) => {
    if (!result.user) {
      const adjectives = ['Swift', 'Clever', 'Bright', 'Silent', 'Mystic'];
      const nouns = ['Panda', 'Eagle', 'Wolf', 'Ranger', 'Knight'];
      const username = `${adjectives[Math.floor(Math.random() * 5)]}_${nouns[Math.floor(Math.random() * 5)]}_${Math.floor(Math.random() * 9999)}`;
      
      chrome.storage.local.set({
        user: {
          username: username,
          status: 'FREE',
          downloadsToday: 0,
          lastDate: new Date().toDateString()
        }
      });
    }
  });
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'CHECK_AND_DOWNLOAD') {
    const now = Date.now();
    
    // Check 2-second delay
    if (now - lastDownloadTime < DOWNLOAD_COOLDOWN) {
      sendResponse({ status: 'COOLDOWN' });
      return false;
    }

    chrome.storage.local.get(['user'], (result) => {
      let user = result.user || {};
      const today = new Date().toDateString();

      // Reset count if new day
      if (user.lastDate !== today) {
        user.downloadsToday = 0;
        user.lastDate = today;
      }

      // Check 10-image limit for Free users
      if (user.status === 'FREE' && user.downloadsToday >= 10) {
        sendResponse({ status: 'LIMIT_REACHED' });
        return;
      }

      // Execute Download
      lastDownloadTime = now;
      chrome.downloads.download({
        url: request.url,
        filename: `VisionSave_${now}.jpg`,
        saveAs: false
      }, (downloadId) => {
        if (chrome.runtime.lastError) {
           console.error("Download failed:", chrome.runtime.lastError);
           sendResponse({ status: 'ERROR' });
        } else {
           // Update count
           user.downloadsToday = (user.downloadsToday || 0) + 1;
           chrome.storage.local.set({ user: user });
           sendResponse({ status: 'SUCCESS', count: user.downloadsToday });
        }
      });
    });
    return true; 
  }
});