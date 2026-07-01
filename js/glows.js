import { getCapabilities } from './utils.js';

let glowCleanup = null;

export function initGlows() {
  const caps = getCapabilities();
  if (caps.isMinimal) return;

  const layers = document.querySelectorAll('.glow-layer');
  if (!layers.length) return;

  // Pointer parallax state
  let px = 0, py = 0;
  let targetPx = 0, targetPy = 0;
  if (caps.finePointer) {
    const onMove = (e) => {
      targetPx = (e.clientX / window.innerWidth - 0.5) * 2;
      targetPy = (e.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    glowCleanup = () => window.removeEventListener('pointermove', onMove);
  }

  // Prepare blob state
  const blobState = [];
  layers.forEach(layer => {
    const isHero = layer.classList.contains('hero-glows');
    layer.querySelectorAll('.glow-blob').forEach((blob, i) => {
      blobState.push({
        el: blob,
        isHero,
        speed: 0.22 + i * 0.10,
        phase: Math.random() * Math.PI * 2,
        ampX: 18 + i * 8,
        ampY: 14 + i * 6,
        scaleBase: 0.92 + (i % 3) * 0.08,
        scaleAmp: 0.08 + i * 0.02
      });
    });
  });

  let time = 0;
  let raf = null;
  let active = true;

  function animate() {
    if (!active) { raf = null; return; }
    time += 0.016;
    // Smooth parallax lag
    px += (targetPx - px) * 0.06;
    py += (targetPy - py) * 0.06;

    blobState.forEach(s => {
      const t = time * s.speed + s.phase;
      const x = Math.sin(t) * s.ampX + Math.cos(t * 0.7) * (s.ampX * 0.4);
      const y = Math.cos(t * 0.85) * s.ampY + Math.sin(t * 0.55) * (s.ampY * 0.4);
      const scale = s.scaleBase + Math.sin(t * 1.3) * s.scaleAmp;
      const opacity = 0.55 + Math.sin(t * 0.9) * 0.25;

      let transform = `translate(${x}%, ${y}%) scale(${scale})`;
      if (s.isHero) {
        const factor = 3 + (blobState.indexOf(s) % 3) * 1.5;
        transform += ` translate(${px * factor}%, ${py * factor}%)`;
      }

      s.el.style.transform = transform;
      s.el.style.opacity = opacity;
    });

    raf = requestAnimationFrame(animate);
  }

  function onVisibility() {
    active = !document.hidden;
    if (active && !raf) raf = requestAnimationFrame(animate);
    else if (!active && raf) { cancelAnimationFrame(raf); raf = null; }
  }
  document.addEventListener('visibilitychange', onVisibility);

  raf = requestAnimationFrame(animate);

  const oldCleanup = glowCleanup || (() => {});
  glowCleanup = () => {
    active = false;
    if (raf) cancelAnimationFrame(raf);
    document.removeEventListener('visibilitychange', onVisibility);
    oldCleanup();
  };
}

export function destroyGlows() {
  if (glowCleanup) {
    glowCleanup();
    glowCleanup = null;
  }
}
