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

function findImageUrl(el) {
  // Direct image
  if (el.tagName === 'IMG') return el.src;
  
  // Pinterest specific: Often images are inside a div with a specific structure
  // or the hovered element is an overlay div
  const nestedImg = el.querySelector('img');
  if (nestedImg) return nestedImg.src;

  // Check background image
  const bg = window.getComputedStyle(el).backgroundImage;
  if (bg && bg.startsWith('url(')) {
    return bg.replace(/url\(['"]?(.*?)['"]?\)/, '$1');
  }

  return null;
}

document.addEventListener('mouseover', (e) => {
  const el = e.target;
  const url = findImageUrl(el);
  
  if (url) {
    // Basic filter
    const isLogo = url.toLowerCase().includes('logo') || el.className.toLowerCase().includes('logo');
    if (isLogo) return;

    // Pinterest images often have '736x' or 'originals' in the URL for high res
    // We try to trigger on the container or the image itself
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
          console.log('VisionSave: Waiting 2 seconds between downloads...');
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