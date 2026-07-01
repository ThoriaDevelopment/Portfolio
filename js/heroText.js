import { getCapabilities } from './utils.js';

export function initHeroText() {
  const caps = getCapabilities();
  const rgbText = document.querySelector('.rgb-text');
  if (!rgbText) return;

  // Split into letters for reveal
  const chars = rgbText.childNodes;
  // We need to wrap the actual text content, not the yellow span
  const textNode = Array.from(rgbText.childNodes).find(n => n.nodeType === 3);
  if (textNode) {
    const letters = textNode.textContent.trim().split('').map((l, i) => {
      return `<span class="rgb-char" style="display:inline-block;opacity:0;transform:translateY(40px) rotateX(30deg)">${l === ' ' ? '&nbsp;' : l}</span>`;
    }).join('');
    rgbText.innerHTML = letters;
  }

  if (!caps.isMinimal) {
    rgbText.classList.add('rgb-filter');

    // Build full RGB yellow layer if not present
    if (!rgbText.querySelector('.rgb-yellow')) {
      const yellow = document.createElement('span');
      yellow.className = 'rgb-yellow';
      yellow.setAttribute('aria-hidden', 'true');
      yellow.textContent = rgbText.getAttribute('data-text') || rgbText.textContent;
      rgbText.appendChild(yellow);
    }

    anime({
      targets: '.rgb-char',
      opacity: [0, 1],
      translateY: [40, 0],
      rotateX: [30, 0],
      delay: anime.stagger(60, { from: 'center' }),
      duration: 900,
      easing: 'easeOutExpo'
    });
  } else {
    rgbText.classList.remove('rgb-filter');
    document.querySelectorAll('.rgb-char').forEach(el => {
      el.style.opacity = 1;
      el.style.transform = 'none';
    });
  }

  if (caps.isMinimal) return;

  // Continuous RGB wave — paused when tab hidden
  let t = 0;
  let waveRaf = null;
  let waveActive = true;
  function wave() {
    if (!waveActive) return;
    t += 0.02;
    const x = Math.sin(t) * 4 + Math.cos(t * 1.3) * 2;
    const y = Math.cos(t * 0.7) * 3;
    rgbText.style.setProperty('--rgb-x', x + 'px');
    rgbText.style.setProperty('--rgb-y', y + 'px');
    waveRaf = requestAnimationFrame(wave);
  }
  wave();

  // SVG turbulence animation — paused when tab hidden
  const turbulence = document.querySelector('#rgb-displacement feTurbulence');
  let turbRaf = null;
  let turbActive = true;
  if (turbulence) {
    let tf = 0;
    function animateTurbulence() {
      if (!turbActive) return;
      tf += 0.003;
      const baseX = 0.01 + Math.sin(tf) * 0.005;
      const baseY = 0.02 + Math.cos(tf * 0.7) * 0.01;
      turbulence.setAttribute('baseFrequency', `${baseX} ${baseY}`);
      turbRaf = requestAnimationFrame(animateTurbulence);
    }
    animateTurbulence();
  }

  document.addEventListener('visibilitychange', () => {
    const hidden = document.hidden;
    waveActive = !hidden;
    turbActive = !hidden;
    if (!hidden) {
      if (!waveRaf) wave();
      if (turbulence && !turbRaf) animateTurbulence();
    } else {
      if (waveRaf) { cancelAnimationFrame(waveRaf); waveRaf = null; }
      if (turbRaf) { cancelAnimationFrame(turbRaf); turbRaf = null; }
    }
  });
}
