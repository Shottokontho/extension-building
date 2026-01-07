let hoverTimer = null;
const GLOW_CLASS = 'visionsave-hover-glow';

const style = document.createElement('style');
style.textContent = `
  .${GLOW_CLASS} {
    outline: 5px solid #22c55e !important;
    outline-offset: -5px !important;
    box-shadow: 0 0 30px rgba(34, 197, 94, 0.8) !important;
    transition: all 0.3s ease-in-out !important;
    cursor: cell !important;
    position: relative !important;
    z-index: 2147483647 !important;
  }
`;
document.head.appendChild(style);

function getHighResUrl(url) {
  if (!url) return null;

  // Unsplash high res extraction
  if (url.includes('unsplash.com')) {
    const urlObj = new URL(url);
    urlObj.searchParams.delete('w');
    urlObj.searchParams.delete('h');
    urlObj.searchParams.delete('crop');
    urlObj.searchParams.set('q', '100'); // Max quality
    return urlObj.toString();
  }

  // Google Images / GStatic high res
  if (url.includes('gstatic.com') || url.includes('google.com/imgres')) {
    // Attempting to extract from data-src or source
    return url;
  }

  // Pinterest originals
  if (url.includes('pinimg.com')) {
    return url.replace(/\/(236x|474x|564x|736x)\//, '/originals/');
  }

  return url;
}

function findImageUrl(el) {
  let url = null;
  if (el.tagName === 'IMG') {
    url = el.src;
  } else {
    const nestedImg = el.querySelector('img');
    if (nestedImg) url = nestedImg.src;
  }

  if (!url) {
    const bg = window.getComputedStyle(el).backgroundImage;
    if (bg && bg.startsWith('url(')) {
      url = bg.replace(/url\(['"]?(.*?)['"]?\)/, '$1');
    }
  }

  return getHighResUrl(url);
}

document.addEventListener('mouseover', (e) => {
  const el = e.target;
  const url = findImageUrl(el);
  
  if (url) {
    const isLogo = url.toLowerCase().includes('logo') || el.className.toLowerCase().includes('logo') || el.id.toLowerCase().includes('logo');
    if (isLogo) return;

    const targetToGlow = el.tagName === 'IMG' ? el : (el.querySelector('img') || el);

    hoverTimer = setTimeout(() => {
      targetToGlow.classList.add(GLOW_CLASS);
      chrome.runtime.sendMessage({ 
        action: 'CHECK_AND_DOWNLOAD', 
        url: url 
      }, (response) => {
        if (response && response.status === 'LIMIT_REACHED') {
          targetToGlow.classList.remove(GLOW_CLASS);
          alert('VisionSave: Daily free limit (10) reached. Upgrade to Premium for unlimited downloads!');
        } else if (response && response.status === 'COOLDOWN') {
          targetToGlow.classList.remove(GLOW_CLASS);
        } else {
          setTimeout(() => targetToGlow.classList.remove(GLOW_CLASS), 1500);
        }
      });
    }, 1000);
  }
});

document.addEventListener('mouseout', (e) => {
  if (hoverTimer) clearTimeout(hoverTimer);
  const el = e.target;
  el.classList.remove(GLOW_CLASS);
  const nested = el.querySelector('img');
  if (nested) nested.classList.remove(GLOW_CLASS);
});