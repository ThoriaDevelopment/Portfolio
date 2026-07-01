import { prefersReducedMotion, observeOnce } from './utils.js';

export function initScrollEffects() {
  initReveal();
  initCountUp();
  initTypewriter();
  initParallax();
}

function initReveal() {
  const reduced = prefersReducedMotion();
  document.querySelectorAll('.reveal-grid').forEach(grid => {
    const items = grid.querySelectorAll('.reveal');
    items.forEach((el, i) => { el.style.transitionDelay = (i * 0.07) + 's'; });
  });

  if (reduced) {
    document.querySelectorAll('.reveal').forEach(el => el.classList.add('visible'));
    return;
  }

  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        io.unobserve(e.target);
      }
    });
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.12 });

  document.querySelectorAll('.reveal').forEach(el => io.observe(el));
  setTimeout(() => {
    document.querySelectorAll('.reveal:not(.visible)').forEach(el => el.classList.add('visible'));
  }, 1600);
}

function initCountUp() {
  const reduced = prefersReducedMotion();
  const statsGrids = Array.from(document.querySelectorAll('.stats'));

  statsGrids.forEach(grid => {
    grid.querySelectorAll('.stat[data-count]').forEach(el => {
      if (!reduced) {
        const b = el.querySelector('b');
        if (b) b.textContent = '0';
      }
    });
  });

  if (!statsGrids.length) return;

  const cio = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.querySelectorAll('.stat[data-count]').forEach(animateCount);
        cio.unobserve(e.target);
      }
    });
  }, { threshold: 0.3 });

  statsGrids.forEach(grid => cio.observe(grid));

  // Re-animate the stats grid for the newly visible theme if it was hidden during initial scroll.
  window.addEventListener('themechange', () => {
    statsGrids.forEach(grid => {
      if (grid.style.display === 'none') return;
      grid.querySelectorAll('.stat[data-count]').forEach(el => {
        const b = el.querySelector('b');
        const target = parseFloat(el.getAttribute('data-count'));
        const suffix = el.getAttribute('data-suffix') || '';
        if (b && b.textContent !== fmtNum(target) + suffix) animateCount(el);
      });
    });
  });
}

function fmtNum(n) {
  if (n >= 100) return Math.round(n).toString();
  if (n % 1 !== 0) return (Math.round(n * 10) / 10).toString();
  return Math.round(n).toString();
}

function animateCount(el) {
  const target = parseFloat(el.getAttribute('data-count'));
  const suffix = el.getAttribute('data-suffix') || '';
  const b = el.querySelector('b');
  if (!b) return;
  if (prefersReducedMotion()) {
    b.textContent = fmtNum(target) + suffix;
    return;
  }
  const dur = 900;
  let start = null;
  function step(ts) {
    if (start === null) start = ts;
    const p = Math.min((ts - start) / dur, 1);
    const e2 = 1 - Math.pow(1 - p, 3);
    b.textContent = fmtNum(target * e2) + suffix;
    if (p < 1) requestAnimationFrame(step);
    else b.textContent = fmtNum(target) + suffix;
  }
  requestAnimationFrame(step);
}

function initTypewriter() {
  const nameEl = document.getElementById('typeName');
  if (!nameEl || prefersReducedMotion()) return;
  const full = nameEl.textContent.trim();
  nameEl.textContent = '';
  const caret = document.createElement('span');
  caret.className = 'caret';
  nameEl.parentNode.insertBefore(caret, nameEl.nextSibling);
  let i = 0;
  function tick() {
    if (i <= full.length) {
      nameEl.textContent = full.slice(0, i);
      i++;
      setTimeout(tick, 70);
    }
  }
  setTimeout(tick, 380);
}

function initParallax() {
  const heroBg = document.querySelector('.hero-bg');
  if (!heroBg || prefersReducedMotion()) return;
  let ticking = false;
  window.addEventListener('scroll', () => {
    if (ticking) return;
    window.requestAnimationFrame(() => {
      const y = window.scrollY || 0;
      if (y < window.innerHeight) {
        heroBg.style.transform = 'translate3d(0,' + (y * 0.22) + 'px,0) scale(1.05)';
      }
      ticking = false;
    });
    ticking = true;
  }, { passive: true });
}

