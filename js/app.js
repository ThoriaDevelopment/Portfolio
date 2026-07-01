import { getCapabilities, prefersReducedMotion, observeOnce } from './utils.js';
import { initLoader } from './loader.js';
import { initDoor } from './door.js';
import { initScrollPath } from './scrollPath.js';
import { initHeroText } from './heroText.js';
import { initGeodeCursor, destroyGeodeCursor, destroyInkCursor } from './cursor.js';
import { initGlows } from './glows.js';
import { initNavHover } from './navHover.js';
import { initProjectExpand } from './projectExpand.js';
import { initScrollBlur } from './scrollBlur.js';
import { initFaq } from './faqAccordion.js';
import { initGallery } from './gallery.js';
import { initReferences } from './references.js';
import { initServerStatus } from './serverStatus.js';
import { initContactTicket } from './contactTicket.js';
import { initCopyChips } from './copyChips.js';
import { initHireBar } from './hireBar.js';

const SCROLL_PATH_MIN_WIDTH = 980;

function initYear() {
  const y = document.getElementById('year');
  if (y) y.textContent = new Date().getFullYear().toString();
}

function initReveals() {
  if (prefersReducedMotion()) {
    document.querySelectorAll('.reveal').forEach(el => el.classList.add('visible'));
    return;
  }
  observeOnce(document.querySelectorAll('.reveal'), el => {
    el.classList.add('visible');
  }, { rootMargin: '0px 0px -10% 0px', threshold: 0.1 });
}

function shouldUseScrollPath() {
  const caps = getCapabilities();
  return !caps.isMinimal && !caps.touch && window.innerWidth >= SCROLL_PATH_MIN_WIDTH;
}

function setScrollPath(enabled) {
  document.documentElement.classList.toggle('is-scroll-path', enabled);
  const track = document.getElementById('scroll-track');
  if (track) {
    track.style.height = enabled ? (window.innerHeight * 8) + 'px' : '0px';
  }
  if (!enabled) {
    const loader = document.getElementById('loader');
    if (loader) {
      loader.classList.add('is-hidden');
      loader.style.display = 'none';
    }
    document.body.style.overflow = '';
    window.scrollTo({ top: 0, behavior: 'auto' });
  }
}

function boot() {
  document.documentElement.classList.add('js');

  const caps = getCapabilities();
  if (caps.isMinimal) document.documentElement.classList.add('is-reduced-motion');

  initYear();
  initNavHover();
  initCopyChips();
  initGallery();
  initReferences();
  initServerStatus();
  initContactTicket();
  initHireBar();
  initFaq();
  initProjectExpand();
  initHeroText();

  // Motion-heavy features
  if (!caps.isMinimal) {
    initGlows();
  }

  if (!shouldUseScrollPath()) {
    setScrollPath(false);
    initReveals();
    return;
  }

  // Full desktop scroll-path experience
  setScrollPath(true);

  const stopLoaderEffects = initLoader(() => {
    // Wait for the user's first scroll before opening the door.
    // The loader stays visible as the red/magenta intro screen.
    let doorOpened = false;
    function openDoor() {
      if (doorOpened) return;
      doorOpened = true;
      window.removeEventListener('wheel', openDoor, { passive: true });
      window.removeEventListener('keydown', onKeyDown);

      const loader = document.getElementById('loader');
      if (loader) loader.classList.add('is-exiting');
      stopLoaderEffects();

      // Reveal hero content immediately so it is visible behind the opening door.
      document.querySelectorAll('[data-section="hero"] .reveal').forEach(el => el.classList.add('visible'));

      initDoor(() => {
        if (loader) {
          loader.classList.add('is-hidden');
          loader.style.display = 'none';
        }
        document.body.style.overflow = '';
        initScrollPath();
        initScrollBlur();
        initReveals();
        if (!caps.isMinimal && caps.finePointer) {
          initGeodeCursor();
        }
      });
    }

    function onKeyDown(e) {
      if (e.key === 'ArrowDown' || e.key === 'ArrowRight' || e.key === 'PageDown' || e.key === ' ') {
        openDoor();
      }
    }

    window.addEventListener('wheel', openDoor, { passive: true });
    window.addEventListener('keydown', onKeyDown);

    // Escape hatch: click/tap the scroll hint also opens the door
    const scrollHint = document.querySelector('.scroll-hint');
    if (scrollHint) scrollHint.addEventListener('click', openDoor);
  });

  // Re-evaluate layout on resize or reduced-motion change
  let lastScrollPath = true;
  function reevaluate() {
    const now = shouldUseScrollPath();
    if (now === lastScrollPath) return;
    lastScrollPath = now;
    setScrollPath(now);
    if (!now) {
      destroyGeodeCursor();
      // Reveal everything for linear fallback
      document.querySelectorAll('.reveal').forEach(el => el.classList.add('visible'));
    }
  }

  window.addEventListener('resize', () => {
    clearTimeout(window.__reevalTimer);
    window.__reevalTimer = setTimeout(reevaluate, 250);
  });

  const reducedMq = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (reducedMq.addEventListener) {
    reducedMq.addEventListener('change', () => {
      document.documentElement.classList.toggle('is-reduced-motion', prefersReducedMotion());
      reevaluate();
    });
  }
}

boot();
