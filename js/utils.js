export const $ = (sel, el = document) => el.querySelector(sel);
export const $$ = (sel, el = document) => Array.from(el.querySelectorAll(sel));

export function throttle(fn, limit) {
  let last;
  return function(...args) {
    const now = performance.now();
    if (!last || now - last >= limit) {
      last = now;
      fn.apply(this, args);
    }
  };
}

export function prefersReducedMotion() {
  return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export function isTouch() {
  return window.matchMedia && window.matchMedia('(pointer: coarse)').matches;
}

export function getCapabilities() {
  const ua = navigator.userAgent || '';
  const cores = navigator.hardwareConcurrency || 2;
  const canvas = document.createElement('canvas');
  const webgl = !!(window.WebGLRenderingContext && (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')));
  const isLegacyWindows = /Windows NT 6\.1|Windows NT 6\.0|Windows NT 5\./i.test(ua);
  const isMobileUA = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua);
  const reduced = prefersReducedMotion();
  const finePointer = window.matchMedia && window.matchMedia('(pointer: fine)').matches;
  const touch = isTouch();

  let tier = 'full';
  if (reduced || touch || isMobileUA || isLegacyWindows || cores < 4 || !webgl) {
    tier = 'reduced';
  }
  if (reduced || isLegacyWindows || (touch && isMobileUA)) {
    tier = 'minimal';
  }

  return {
    motion: !reduced,
    finePointer,
    touch,
    webgl,
    cores,
    isLegacyWindows,
    isMobileUA,
    reduced,
    tier,
    isMinimal: tier === 'minimal',
    isReduced: tier === 'reduced',
    isFull: tier === 'full'
  };
}

export async function copyToClipboard(text) {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    try { await navigator.clipboard.writeText(text); return true; } catch (e) { return false; }
  }
  const ta = document.createElement('textarea');
  ta.value = text;
  document.body.appendChild(ta);
  ta.select();
  let ok = false;
  try { ok = document.execCommand('copy'); } catch (e) { ok = false; }
  document.body.removeChild(ta);
  return ok;
}

export function observeOnce(els, cb, opts = {}) {
  if (!('IntersectionObserver' in window)) {
    els.forEach(cb);
    return;
  }
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        cb(e.target);
        obs.unobserve(e.target);
      }
    });
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.12, ...opts });
  els.forEach(el => obs.observe(el));
}

export function observeAll(els, cb, opts = {}) {
  if (!('IntersectionObserver' in window)) {
    els.forEach(cb);
    return () => {};
  }
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(e => cb(e.target, e.isIntersecting, e));
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.12, ...opts });
  els.forEach(el => obs.observe(el));
  return () => obs.disconnect();
}

export function clamp(n, min, max) { return Math.min(Math.max(n, min), max); }
