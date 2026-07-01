import { initInkCursor, destroyInkCursor } from './cursor.js';

const LOADER_DURATION = 2500;

export function initLoader(onComplete) {
  const loader = document.getElementById('loader');
  const canvas = document.getElementById('loaderCanvas');
  const brand = loader?.querySelector('.loader-brand');
  if (!loader || !canvas) {
    if (onComplete) onComplete();
    return () => {};
  }

  // Guard against missing anime.js CDN load
  if (typeof anime === 'undefined') {
    loader.classList.add('is-hidden');
    loader.style.display = 'none';
    document.body.style.overflow = '';
    if (onComplete) onComplete();
    return () => {};
  }

  // Lock scroll
  document.body.style.overflow = 'hidden';
  loader.classList.add('is-ready');

  const cleanupMesh = initMeshLines(canvas);
  initInkCursor();

  // Brand letter split for reveal
  if (brand && brand.dataset.split === 'letters') {
    const text = brand.textContent.trim();
    brand.innerHTML = text.split('').map(l => `<span style="display:inline-block;opacity:0;transform:translateY(20px)">${l === ' ' ? '&nbsp;' : l}</span>`).join('');
  }

  const tl = anime.timeline({
    easing: 'easeOutExpo',
    duration: LOADER_DURATION,
    complete: () => {
      // Keep the mesh and ink cursor alive until the user scrolls to open the
      // door. The app will call stopLoaderEffects() at that point.
      if (onComplete) onComplete();
    }
  });

  tl.add({
    targets: '.loader-brand span',
    opacity: [0, 1],
    translateY: [20, 0],
    delay: anime.stagger(80),
    duration: 800
  }, 400)
  .add({
    targets: '.loader-pulse',
    scale: [0.9, 1.3],
    opacity: [0.4, 0],
    duration: 800,
    easing: 'easeOutSine'
  }, 1700);

  // Return a combined cleanup that the app invokes once the user scrolls and
  // the door begins to open, so the mesh lines keep animating until that moment.
  return () => {
    destroyInkCursor();
    cleanupMesh();
  };
}

function initMeshLines(canvas) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return () => {};

  let width, height;
  let lines = [];
  const lineCount = 12;
  const pointsPerLine = 40;
  let time = 0;
  let raf = null;
  let active = true;

  const entryFrames = 180;
  let entry = 0;

  function easeOutCubic(t) { return 1 - Math.pow(1 - t, 3); }

  function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
    lines = [];
    for (let i = 0; i < lineCount; i++) {
      // Spread final resting positions so they evenly cover the whole viewport.
      const y = (height / (lineCount + 1)) * (i + 1);
      const amplitude = 20 + Math.random() * 30;
      // Start each wave completely off-canvas above the top so it falls into
      // view over the first few seconds; the tallest wave needs the highest
      // starting position.
      const startY = -(height * 0.55) - amplitude - i * 45;
      lines.push({ y, startY, amplitude, freq: 0.005 + Math.random() * 0.005, phase: Math.random() * Math.PI * 2, speed: 0.02 + Math.random() * 0.02 });
    }
  }

  function draw() {
    if (!active) return;
    ctx.clearRect(0, 0, width, height);
    ctx.strokeStyle = 'rgba(11, 13, 16, 0.25)';
    ctx.lineWidth = 1.5;

    if (entry < 1) entry += 1 / entryFrames;
    const entryT = easeOutCubic(Math.min(1, entry));

    lines.forEach(line => {
      const baseY = line.startY + (line.y - line.startY) * entryT;
      const phaseShift = width * 0.08;
      ctx.beginPath();
      for (let x = -phaseShift; x <= width + phaseShift; x += width / pointsPerLine) {
        const y = baseY + Math.sin((x + phaseShift) * line.freq + time * line.speed + line.phase) * line.amplitude * Math.min(1, time / 60);
        if (x === -phaseShift) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
    });

    time++;
    raf = requestAnimationFrame(draw);
  }

  function onVisibility() {
    if (document.hidden) {
      active = false;
      if (raf) { cancelAnimationFrame(raf); raf = null; }
    } else {
      active = true;
      if (!raf) raf = requestAnimationFrame(draw);
    }
  }

  resize();
  draw();
  window.addEventListener('resize', resize);
  document.addEventListener('visibilitychange', onVisibility);

  // Keep the mesh animation alive until the app explicitly cleans it up
  // when the user scrolls and the door opens.
  return function cleanup() {
    active = false;
    if (raf) cancelAnimationFrame(raf);
    window.removeEventListener('resize', resize);
    document.removeEventListener('visibilitychange', onVisibility);
  };
}
