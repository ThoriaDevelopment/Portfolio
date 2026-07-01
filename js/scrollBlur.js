import { getCapabilities } from './utils.js';

export function initScrollBlur() {
  const caps = getCapabilities();
  if (caps.isMinimal) return;

  const blur = document.getElementById('scrollBlur');
  if (!blur) return;

  let currentDir = null;
  let opacity = 0;
  let targetOpacity = 0;
  let raf = null;
  let active = true;

  function show(dir) {
    currentDir = dir;
    if (!dir) {
      targetOpacity = 0;
      if (!raf) raf = requestAnimationFrame(loop);
      return;
    }
    blur.className = `scroll-blur is-${dir}`;
    targetOpacity = 1;
    if (!raf) raf = requestAnimationFrame(loop);
  }

  function loop() {
    if (!active) { raf = null; return; }

    // Decay target opacity back to 0 unless a transition just fired
    targetOpacity *= 0.94;
    if (targetOpacity < 0.005) targetOpacity = 0;

    opacity += (targetOpacity - opacity) * 0.12;
    blur.style.opacity = opacity.toFixed(3);

    raf = null;
    if (opacity > 0.001 || targetOpacity > 0.001) {
      raf = requestAnimationFrame(loop);
    }
  }

  window.addEventListener('cameratransition', (e) => {
    show(e.detail?.direction);
  });

  function onVisibility() {
    active = !document.hidden;
    if (active && (opacity > 0.001 || targetOpacity > 0.001) && !raf) {
      raf = requestAnimationFrame(loop);
    }
  }
  document.addEventListener('visibilitychange', onVisibility);

  // Start hidden
  blur.style.opacity = '0';
}
