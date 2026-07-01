import { getCapabilities, observeAll } from './utils.js';

export function initScrollPath() {
  const caps = getCapabilities();
  if (caps.isMinimal || window.innerWidth < 980) return;

  const html = document.documentElement;
  if (!html.classList.contains('is-scroll-path')) return;

  const camera = document.getElementById('camera');
  if (!camera) return;

  const track = document.getElementById('scroll-track') || (() => {
    const el = document.createElement('div');
    el.id = 'scroll-track';
    el.style.position = 'absolute';
    el.style.top = '0';
    el.style.left = '0';
    el.style.width = '1px';
    el.style.pointerEvents = 'none';
    el.style.visibility = 'hidden';
    document.body.appendChild(el);
    return el;
  })();

  const sections = Array.from(document.querySelectorAll('[data-section]'));
  const sectionEls = Object.fromEntries(sections.map(s => [s.getAttribute('data-section'), s]));
  const repeatTexts = Array.from(document.querySelectorAll('.repeat-text'));
  const skillsContent = sectionEls.skills?.querySelector('.track-content');
  const expContent = sectionEls.exp?.querySelector('.track-content');

  // Waypoints are tuned so long reading phases (Experience, Builds, Skills)
  // are stationary and centered while the user reads, with short transitions
  // between them. The Builds cross-fade only swaps once the user has scrolled
  // well into the section.
  const waypoints = [
    { p: 0,    x: 0,      y: 0,      mood: 'hero' },
    { p: 0.15, x: 0,      y: 0,      mood: 'hero' },
    { p: 0.18, x: 0,      y: -100,   mood: 'bio' },
    { p: 0.33, x: 0,      y: -100,   mood: 'bio' },
    { p: 0.36, x: -100,   y: -100,   mood: 'exp' },
    { p: 0.63, x: -100,   y: -100,   mood: 'exp' },
    { p: 0.66, x: -200,   y: -100,   mood: 'builds' },
    { p: 0.80, x: -200,   y: -100,   mood: 'builds' },
    { p: 0.83, x: -200,   y: -200,   mood: 'skills' },
    { p: 0.95, x: -200,   y: -200,   mood: 'skills' },
    { p: 0.98, x: -300,   y: -200,   mood: 'contact' },
    { p: 1,    x: -300,   y: -200,   mood: 'contact' }
  ];

  const phases = [
    { name: 'hero',  start: 0,    end: 0.18, direction: 'bottom' },
    { name: 'bio',   start: 0.18, end: 0.36, direction: 'right' },
    { name: 'exp',   start: 0.36, end: 0.66, direction: 'right' },
    { name: 'builds',start: 0.66, end: 0.83, direction: 'none' },
    { name: 'skills',start: 0.83, end: 0.95, direction: 'bottom' },
    { name: 'contact',start:0.95, end: 1,    direction: 'right' }
  ];

  const boundaries = [0.18, 0.36, 0.66, 0.83, 0.95];
  const snapThreshold = 0.05;
  const snapDelay = 1800;
  const verticalDeadzone = 0.12;
  const skillsHoldEnd = 0.02;

  function getTrackHeight() { return window.innerHeight * 8; }

  let currentMood = 'hero';
  function setMood(mood) {
    if (mood === currentMood) return;
    currentMood = mood;
    document.body.setAttribute('data-mood', mood);
    sections.forEach(sec => sec.classList.toggle('is-active', sec.getAttribute('data-section') === mood));
    repeatTexts.forEach(rt => rt.classList.toggle('is-visible', mood === 'contact'));
  }

  function lerp(a, b, t) { return a + (b - a) * t; }

  function sample(progress) {
    for (let i = 0; i < waypoints.length - 1; i++) {
      const a = waypoints[i];
      const b = waypoints[i + 1];
      if (progress >= a.p && progress <= b.p) {
        const t = (progress - a.p) / (b.p - a.p);
        return {
          x: lerp(a.x, b.x, t),
          y: lerp(a.y, b.y, t),
          mood: t < 0.5 ? a.mood : b.mood
        };
      }
    }
    return waypoints[waypoints.length - 1];
  }

  function getPhase(progress) {
    for (const ph of phases) {
      if (progress >= ph.start && progress < ph.end) return ph;
    }
    return phases[phases.length - 1];
  }

  let targetX = 0, targetY = 0;
  let currentX = 0, currentY = 0;
  let raf = null;
  let lastPhase = null;
  let snapTimer = null;
  let lastScrollY = window.scrollY;
  let isAutoScrolling = false;

  function dispatchTransition(dir) {
    if (!dir) return;
    window.dispatchEvent(new CustomEvent('cameratransition', { detail: { direction: dir } }));
  }

  function dispatchBuildsFade(value) {
    document.documentElement.style.setProperty('--builds-fade', value.toFixed(3));
  }

  function update() {
    const trackHeight = getTrackHeight();
    track.style.height = trackHeight + 'px';
    const maxScroll = trackHeight - window.innerHeight;
    const progress = Math.max(0, Math.min(1, window.scrollY / maxScroll));
    const s = sample(progress);
    targetX = s.x;
    targetY = s.y;
    setMood(s.mood);

    // Camera smoothing — use a strong lerp so panels actually settle
    // centered in the viewport instead of lagging behind.
    const dist = Math.hypot(targetX - currentX, targetY - currentY);
    const lerpFactor = dist > 30 ? 0.35 : 0.18;
    currentX += (targetX - currentX) * lerpFactor;
    currentY += (targetY - currentY) * lerpFactor;
    camera.style.transform = `translate(${currentX}vw, ${currentY}vh)`;

    // Builds cross-fade — hold Kleos for the first half of the section, then
    // fade to Iustitia over a narrow band so users can stop and read either card.
    let fade;
    if (progress < 0.72) {
      fade = 0;
    } else if (progress > 0.77) {
      fade = 1;
    } else {
      const k = (progress - 0.72) / 0.05;
      fade = k * k * (3 - 2 * k);
    }
    dispatchBuildsFade(fade);

    const buildsGrid = sectionEls.builds?.querySelector('.builds-grid');
    if (buildsGrid) {
      buildsGrid.classList.toggle('is-fade-a', fade < 0.45);
      buildsGrid.classList.toggle('is-fade-b', fade > 0.55);
      buildsGrid.classList.toggle('is-fade-mix', fade >= 0.45 && fade <= 0.55);
    }

    // Vertical-track internal scroll while camera is pinned.
    // A deadzone at the top and bottom of the phase keeps the content still
    // while the user is entering or leaving the section, so reading isn't
    // interrupted by sudden content movement. The middle of the phase maps
    // smoothly through the full content height.
    function syncVerticalScroll(el, start, end) {
      if (!el) return;
      const maxScroll = el.scrollHeight - el.clientHeight;
      if (maxScroll <= 0) return;
      if (progress >= start && progress <= end) {
        const p = (progress - start) / (end - start);
        let q;
        if (p < verticalDeadzone) {
          q = 0;
        } else if (p > 1 - verticalDeadzone) {
          q = 1;
        } else {
          q = (p - verticalDeadzone) / (1 - 2 * verticalDeadzone);
        }
        const eased = q * q * (3 - 2 * q);
        el.scrollTop = eased * maxScroll;
      } else if (progress < start) {
        el.scrollTop = 0;
      } else if (progress > end) {
        el.scrollTop = maxScroll;
      }
    }

    syncVerticalScroll(expContent, 0.36, 0.66);
    syncVerticalScroll(skillsContent, 0.83, 0.95);

    const phase = getPhase(progress);
    if (phase && phase.name !== lastPhase) {
      const dir = phase.direction || null;
      if (dir && lastPhase !== null) dispatchTransition(dir);
      lastPhase = phase.name;
    }

    lastScrollY = window.scrollY;
    raf = null;
    if (Math.abs(targetX - currentX) > 0.05 || Math.abs(targetY - currentY) > 0.05) {
      raf = requestAnimationFrame(update);
    }
  }

  function snapToNearestPhase(progress) {
    if (isAutoScrolling) return;

    const dy = window.scrollY - lastScrollY;
    const maxScroll = getTrackHeight() - window.innerHeight;
    const longPhases = [
      { name: 'experience', start: 0.36, end: 0.66 },
      { name: 'builds',     start: 0.66, end: 0.83 },
      { name: 'skills',     start: 0.83, end: 0.95 }
    ];

    // Inside a long reading phase: only snap when the user is clearly leaving
    // through the boundary they are scrolling toward. Otherwise let them stop
    // and read anywhere inside the section.
    for (const ph of longPhases) {
      if (progress >= ph.start && progress <= ph.end) {
        // At the very end of Skills/References, require the user to scroll
        // deeper (past the last reference card hold) before snapping to Contact.
        const effectiveEnd = ph.name === 'skills'
          ? ph.end - skillsHoldEnd
          : ph.end;
        const distStart = Math.abs(progress - ph.start);
        const distEnd = Math.abs(progress - effectiveEnd);
        if (distStart <= snapThreshold && dy < -0.5) {
          const target = Math.max(0, ph.start - snapThreshold - 0.015);
          doSnap(target * maxScroll);
          return;
        }
        if (progress > effectiveEnd && dy > 0.5) {
          const target = Math.min(1, ph.end + snapThreshold + 0.015);
          doSnap(target * maxScroll);
          return;
        }
        return;
      }
    }

    // Short phases: snap to the nearest boundary, but never snap *into* the
    // start of a long reading phase when the user is scrolling toward it — let
    // them land at the top of the long phase instead.
    let nearest = null, minDist = Infinity;
    for (const b of boundaries) {
      const d = Math.abs(progress - b);
      if (d < minDist) { minDist = d; nearest = b; }
    }
    if (!nearest || minDist > snapThreshold) return;

    const isLongStart = longPhases.some(ph => ph.start === nearest);
    const isLongEnd = longPhases.some(ph => ph.end === nearest);
    if (isLongStart && progress < nearest && dy > 0.5) return;
    if (isLongEnd && progress > nearest && dy < -0.5) return;

    let targetProgress;
    if (dy > 0.5) {
      targetProgress = nearest + snapThreshold + 0.015;
    } else if (dy < -0.5) {
      targetProgress = nearest - snapThreshold - 0.015;
    } else {
      targetProgress = progress > nearest ? nearest + snapThreshold + 0.015 : nearest - snapThreshold - 0.015;
    }

    targetProgress = Math.max(0, Math.min(1, targetProgress));
    doSnap(targetProgress * maxScroll);
  }

  function doSnap(targetTop) {
    isAutoScrolling = true;
    window.scrollTo({ top: targetTop, behavior: 'smooth' });
    setTimeout(() => { isAutoScrolling = false; }, 450);
  }

  function onScroll() {
    if (!isAutoScrolling) {
      const maxScroll = getTrackHeight() - window.innerHeight;
      const progress = Math.max(0, Math.min(1, window.scrollY / maxScroll));
      if (snapTimer) clearTimeout(snapTimer);
      snapTimer = setTimeout(() => snapToNearestPhase(progress), snapDelay);
    }
    if (!raf) raf = requestAnimationFrame(update);
  }

  window.addEventListener('scroll', onScroll, { passive: true });

  // Resize: recalc track height and camera position
  let resizeRaf = null;
  window.addEventListener('resize', () => {
    if (resizeRaf) cancelAnimationFrame(resizeRaf);
    resizeRaf = requestAnimationFrame(() => {
      track.style.height = getTrackHeight() + 'px';
      update();
    });
  });

  // Nav links: smooth-scroll to section progress
  const sectionProgress = {
    top: 0,
    hero: 0,
    bio: 0.18,
    experience: 0.36,
    builds: 0.66,
    skills: 0.83,
    contact: 0.97
  };

  function onNavClick(e) {
    const link = e.currentTarget;
    const id = link.getAttribute('href').replace('#', '');
    if (!(id in sectionProgress)) return;
    e.preventDefault();
    const maxScroll = getTrackHeight() - window.innerHeight;
    const targetY = Math.round(sectionProgress[id] * maxScroll);
    isAutoScrolling = true;
    window.scrollTo({ top: targetY, behavior: 'smooth' });
    setTimeout(() => { isAutoScrolling = false; }, 600);
  }

  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', onNavClick);
  });

  update();
  observeAll(document.querySelectorAll('.reveal'), (el, visible) => {
    if (visible) el.classList.add('visible');
  }, { threshold: 0.2 });
}
