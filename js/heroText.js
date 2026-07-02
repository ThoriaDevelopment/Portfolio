import { getCapabilities } from './utils.js';

const LETTER_TARGETS = {
  T: { section: 'bio', category: null, label: 'Bio', short: 'Bio' },
  H: { section: 'experience', category: null, label: 'Experience', short: 'Experience' },
  O: { section: 'builds', category: 'kleos', label: 'Kleos', short: 'Kleos' },
  R: { section: 'builds', category: 'iustitia', label: 'Iustitia', short: 'Iustitia' },
  I: { section: 'skills', category: null, label: 'Skills', short: 'Skills' },
  A: { section: 'contact', category: null, label: 'Contact', short: 'Contact' }
};

function navigateFromHero(target) {
  const sectionProgress = {
    hero: 0,
    bio: 0.14,
    experience: 0.31,
    builds: 0.64,
    skills: 0.80,
    contact: 0.98
  };

  // Match the scroll-path track height exactly so the destination aligns with
  // the nav links and snap logic.
  const maxScroll = Math.max(0, window.innerHeight * 8 - window.innerHeight);
  const dest = Math.round((sectionProgress[target.section] ?? 0) * maxScroll);
  if (maxScroll <= 0) return;

  // Tell scroll-path we are auto-scrolling so its snap logic doesn't fight us.
  // A longer timeout (1.1 s) covers the smooth-scroll + settle time.
  window.dispatchEvent(new CustomEvent('thoria-autoscroll', {
    bubbles: true,
    detail: { duration: 1100 }
  }));

  if (target.section === 'builds' && target.category) {
    const grid = document.querySelector('.builds-grid');
    if (grid) {
      grid.classList.toggle('is-kleos', target.category === 'kleos');
      grid.classList.toggle('is-iustitia', target.category === 'iustitia');
    }
    window.dispatchEvent(new CustomEvent('buildscategorychange', {
      detail: { category: target.category, direction: 'hero' }
    }));
  }

  window.scrollTo({ top: dest, behavior: 'smooth' });
}

export function initHeroText() {
  const caps = getCapabilities();
  const rgbText = document.querySelector('.rgb-text');
  if (!rgbText) return;

  const rawText = (rgbText.getAttribute('data-text') || rgbText.textContent).trim();

  // Split into individual letters for the full-width, interactive headline.
  rgbText.innerHTML = rawText.split('').map((l) => {
    const char = l === ' ' ? '&nbsp;' : l;
    return `<span class="rgb-char" data-char="${char}" style="opacity:0;transform:translateY(40px) rotateX(30deg)">${char}</span>`;
  }).join('');

  const chars = Array.from(rgbText.querySelectorAll('.rgb-char'));

  if (!caps.isMinimal) {
    anime({
      targets: chars,
      opacity: [0, 1],
      translateY: [40, 0],
      rotateX: [30, 0],
      delay: anime.stagger(60, { from: 'center' }),
      duration: 900,
      easing: 'easeOutExpo'
    });
  } else {
    chars.forEach(el => {
      el.style.opacity = 1;
      el.style.transform = 'none';
    });
  }

  if (caps.isMinimal) return;

  // Per-letter hover interaction — CSS handles the visual lift/pop.
  chars.forEach(char => {
    char.addEventListener('mouseenter', () => char.classList.add('is-active'));
    char.addEventListener('mouseleave', () => char.classList.remove('is-active'));
    char.addEventListener('focus', () => char.classList.add('is-active'));
    char.addEventListener('blur', () => char.classList.remove('is-active'));

    // Clicking a letter jumps to the mapped section/category.
    const target = LETTER_TARGETS[char.getAttribute('data-char')];
    if (!target) return;

    char.style.cursor = 'pointer';
    char.setAttribute('role', 'link');
    char.setAttribute('aria-label', `Go to ${target.label}`);
    char.setAttribute('tabindex', '0');

    const hint = document.createElement('span');
    hint.className = 'rgb-char-hint';
    hint.textContent = target.short;
    char.appendChild(hint);

    char.addEventListener('click', () => navigateFromHero(target));
    char.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        navigateFromHero(target);
      }
    });
  });

  // Cleanup hook in case initHeroText is ever re-run.
  rgbText.dataset.heroTextInit = 'true';
}
