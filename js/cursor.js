import { getCapabilities } from './utils.js';

let geodeCleanup = null;

export function initGeodeCursor() {
  const caps = getCapabilities();
  if (!caps.finePointer || caps.isMinimal) return;

  const cursor = document.getElementById('geode-cursor');
  if (!cursor) return;

  let mx = 0, my = 0, cx = 0, cy = 0;
  let prevX = 0, prevY = 0;
  let velocityX = 0, velocityY = 0;
  let raf = null;
  let hoverCount = 0;
  let active = true;

  function move(x, y) {
    mx = x; my = y;
    if (!raf && active) raf = requestAnimationFrame(loop);
  }

  function loop() {
    if (!active) { raf = null; return; }

    cx += (mx - cx) * 0.15;
    cy += (my - cy) * 0.15;

    const vx = mx - prevX;
    const vy = my - prevY;
    velocityX += (vx - velocityX) * 0.25;
    velocityY += (vy - velocityY) * 0.25;
    prevX = mx;
    prevY = my;

    const speed = Math.hypot(velocityX, velocityY);
    const angle = Math.atan2(velocityY, velocityX) * (180 / Math.PI);
    const stretch = Math.min(1 + speed * 0.03, 2.2);
    const squash = Math.max(1 - speed * 0.015, 0.5);

    cursor.style.transform = `translate(${cx}px, ${cy}px) translate(-50%, -50%) rotate(${angle}deg) scale(${stretch}, ${squash})`;

    raf = null;
    if (Math.abs(mx - cx) > 0.1 || Math.abs(my - cy) > 0.1) {
      raf = requestAnimationFrame(loop);
    }
  }

  const onMove = (e) => move(e.clientX, e.clientY);
  window.addEventListener('pointermove', onMove, { passive: true });

  requestAnimationFrame(() => cursor.classList.add('is-ready'));

  const hoverTargets = 'a, button, [role="button"], .chip, .project-header, .faq-summary, .skill-card, .ref-card, .reference-card, [data-copy]';
  const onOver = (e) => {
    const t = e.target.closest(hoverTargets);
    if (!t) return;
    hoverCount++;
    cursor.classList.add('is-hover');
  };
  const onOut = (e) => {
    const t = e.target.closest(hoverTargets);
    if (!t) return;
    hoverCount = Math.max(0, hoverCount - 1);
    if (hoverCount === 0) cursor.classList.remove('is-hover');
  };
  document.addEventListener('pointerover', onOver);
  document.addEventListener('pointerout', onOut);

  function onVisibility() {
    active = !document.hidden;
    if (active && !raf) raf = requestAnimationFrame(loop);
    else if (!active && raf) { cancelAnimationFrame(raf); raf = null; }
  }
  document.addEventListener('visibilitychange', onVisibility);

  // click ripples
  const onClick = (e) => {
    const t = e.target.closest('.btn, .chip, .project-header, .faq-summary, .skill-card, .ref-card, .reference-card, [data-copy]');
    if (!t) return;
    const rect = t.getBoundingClientRect();
    const r = document.createElement('span');
    r.className = 'ripple';
    const size = Math.max(rect.width, rect.height);
    r.style.width = r.style.height = size + 'px';
    r.style.left = (e.clientX - rect.left - size / 2) + 'px';
    r.style.top = (e.clientY - rect.top - size / 2) + 'px';
    r.style.position = 'absolute';
    r.style.pointerEvents = 'none';
    r.style.overflow = 'hidden';
    const wrapper = document.createElement('span');
    wrapper.style.position = 'relative';
    wrapper.style.display = 'inline-block';
    wrapper.style.overflow = 'hidden';
    wrapper.appendChild(r);
    t.appendChild(wrapper);
    setTimeout(() => wrapper.remove(), 520);
  };
  document.addEventListener('click', onClick);

  geodeCleanup = () => {
    active = false;
    if (raf) cancelAnimationFrame(raf);
    window.removeEventListener('pointermove', onMove);
    document.removeEventListener('pointerover', onOver);
    document.removeEventListener('pointerout', onOut);
    document.removeEventListener('visibilitychange', onVisibility);
    document.removeEventListener('click', onClick);
    cursor.classList.remove('is-ready');
  };
}

export function destroyGeodeCursor() {
  if (geodeCleanup) {
    geodeCleanup();
    geodeCleanup = null;
  }
}

let inkCleanup = null;

export function initInkCursor() {
  const ink = document.getElementById('ink-cursor');
  if (!ink) return;

  let mx = window.innerWidth / 2, my = window.innerHeight / 2;
  let cx = mx, cy = my;
  let raf = null;
  let active = true;

  function loop() {
    if (!active) { raf = null; return; }
    cx += (mx - cx) * 0.08;
    cy += (my - cy) * 0.08;
    ink.style.transform = `translate(${cx}px, ${cy}px) translate(-50%, -50%)`;
    raf = null;
    if (Math.abs(mx - cx) > 0.2 || Math.abs(my - cy) > 0.2) {
      raf = requestAnimationFrame(loop);
    }
  }

  const onMove = (e) => {
    mx = e.clientX; my = e.clientY;
    if (!raf && active) raf = requestAnimationFrame(loop);
  };
  window.addEventListener('pointermove', onMove, { passive: true });

  function onVisibility() {
    active = !document.hidden;
    if (active && !raf) raf = requestAnimationFrame(loop);
    else if (!active && raf) { cancelAnimationFrame(raf); raf = null; }
  }
  document.addEventListener('visibilitychange', onVisibility);

  ink.classList.add('is-ready');
  if (!raf) raf = requestAnimationFrame(loop);

  inkCleanup = () => {
    active = false;
    if (raf) cancelAnimationFrame(raf);
    window.removeEventListener('pointermove', onMove);
    document.removeEventListener('visibilitychange', onVisibility);
    ink.remove();
  };
}

export function destroyInkCursor() {
  if (inkCleanup) {
    inkCleanup();
    inkCleanup = null;
  }
}
