function updateUI() {
  chrome.storage.local.get(['user'], (data) => {
    if (data.user) {
      const user = data.user;
      const usernameEl = document.getElementById('username');
      const badgeEl = document.getElementById('statusBadge');
      const usageTextEl = document.getElementById('usageText');
      const progressFillEl = document.getElementById('progressFill');
      const actionBtnEl = document.getElementById('actionBtn');

      if (usernameEl) usernameEl.textContent = user.username;
      
      if (badgeEl) {
        badgeEl.textContent = user.status;
        badgeEl.className = 'status-badge ' + (user.status === 'PREMIUM' ? 'status-premium' : 'status-free');
      }
      
      const count = user.downloadsToday || 0;
      const limit = 10;
      
      if (user.status === 'PREMIUM') {
        if (usageTextEl) usageTextEl.textContent = `Unlimited`;
        if (progressFillEl) {
          progressFillEl.style.width = '100%';
          progressFillEl.style.background = 'linear-gradient(90deg, #22c55e 0%, #4ade80 100%)';
        }
        if (actionBtnEl) {
          actionBtnEl.textContent = 'Premium Dashboard';
          actionBtnEl.classList.add('btn-premium');
        }
      } else {
        if (usageTextEl) usageTextEl.textContent = `${count} / ${limit}`;
        const percentage = Math.min((count / limit) * 100, 100);
        if (progressFillEl) {
          progressFillEl.style.width = percentage + '%';
          if (count >= limit) {
            progressFillEl.style.background = '#ef4444';
          } else {
            progressFillEl.style.background = 'linear-gradient(90deg, #22c55e 0%, #4ade80 100%)';
          }
        }
      }
    }
  });
}

// Initial load
document.addEventListener('DOMContentLoaded', updateUI);

// Listen for storage changes to update UI in real-time
chrome.storage.onChanged.addListener((changes) => {
  if (changes.user) {
    updateUI();
  }
});