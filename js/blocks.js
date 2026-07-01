import { prefersReducedMotion } from './utils.js';

export function initBlocks() {
  const canvas = document.getElementById('blocks');
  if (!canvas || prefersReducedMotion()) return;

  const ctx = canvas.getContext('2d');
  let W = 0, H = 0, blocks = [], raf = null, running = true;
  let mouse = { x: -1000, y: -1000 };

  const defaultPalette = ['#10B981', '#0B7A55', '#34D399', '#1B222B', '#2A3340', '#15201A'];
  const mcPalette = ['#5D8C39', '#3E6026', '#7AB84A', '#5A4A3A', '#3A2E22', '#8B7559'];

  function getPalette() {
    return document.documentElement.getAttribute('data-theme') === 'minecraft' ? mcPalette : defaultPalette;
  }

  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = window.innerWidth;
    H = window.innerHeight;
    canvas.width = Math.floor(W * dpr);
    canvas.height = Math.floor(H * dpr);
    canvas.style.width = W + 'px';
    canvas.style.height = H + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const target = Math.min(28, Math.max(10, Math.floor(W / 56)));
    blocks = [];
    for (let k = 0; k < target; k++) blocks.push(make(true));
  }

  function make(initial) {
    const size = 12 + Math.random() * 24;
    return {
      x: Math.random() * W,
      y: initial ? Math.random() * H : -size - Math.random() * 120,
      size,
      vy: 0.18 + Math.random() * 0.55,
      rot: Math.random() * Math.PI,
      vr: (Math.random() - 0.5) * 0.006,
      color: getPalette()[Math.floor(Math.random() * getPalette().length)],
      alpha: 0.02 + Math.random() * 0.05
    };
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);
    for (let i = 0; i < blocks.length; i++) {
      const b = blocks[i];
      b.y += b.vy;
      b.rot += b.vr;

      const dx = b.x - mouse.x;
      const dy = b.y - mouse.y;
      const dist = Math.hypot(dx, dy);
      if (dist < 90) {
        const force = (90 - dist) / 90;
        b.x += (dx / dist) * force * 2;
        b.y += (dy / dist) * force * 2;
        b.rot += 0.02;
      }

      if (b.y > H + b.size) {
        blocks[i] = make(false);
        continue;
      }
      if (b.x < -b.size) b.x = W + b.size;
      if (b.x > W + b.size) b.x = -b.size;

      const s = b.size;
      ctx.save();
      ctx.globalAlpha = b.alpha;
      ctx.translate(b.x, b.y);
      ctx.rotate(b.rot);
      ctx.fillStyle = b.color;
      ctx.fillRect(-s / 2, -s / 2, s, s);
      ctx.fillStyle = 'rgba(255,255,255,.14)';
      ctx.fillRect(-s / 2, -s / 2, s, 2);
      ctx.fillStyle = 'rgba(0,0,0,.20)';
      ctx.fillRect(-s / 2, s / 2 - 2, s, 2);
      ctx.restore();
    }
    if (running) raf = requestAnimationFrame(draw);
  }

  function start() {
    if (!raf) { running = true; raf = requestAnimationFrame(draw); }
  }

  function stop() {
    running = false;
    if (raf) { cancelAnimationFrame(raf); raf = null; }
  }

  function burst(x, y) {
    for (let k = 0; k < 8; k++) {
      const size = 4 + Math.random() * 8;
      const angle = Math.random() * Math.PI * 2;
      const speed = 1 + Math.random() * 3;
      blocks.push({
        x,
        y,
        size,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        rot: Math.random() * Math.PI,
        vr: (Math.random() - 0.5) * 0.05,
        color: getPalette()[Math.floor(Math.random() * getPalette().length)],
        alpha: 0.3 + Math.random() * 0.3,
        life: 1.0,
        isParticle: true
      });
    }
  }

  // Patch draw to handle particles
  const originalDraw = draw;
  draw = function() {
    ctx.clearRect(0, 0, W, H);
    for (let i = blocks.length - 1; i >= 0; i--) {
      const b = blocks[i];
      if (b.isParticle) {
        b.x += b.vx;
        b.y += b.vy;
        b.rot += b.vr;
        b.life -= 0.015;
        b.vy += 0.08;
        if (b.life <= 0) {
          blocks.splice(i, 1);
          continue;
        }
        const s = b.size;
        ctx.save();
        ctx.globalAlpha = b.alpha * b.life;
        ctx.translate(b.x, b.y);
        ctx.rotate(b.rot);
        ctx.fillStyle = b.color;
        ctx.fillRect(-s / 2, -s / 2, s, s);
        ctx.restore();
        continue;
      }

      b.y += b.vy;
      b.rot += b.vr;
      const dx = b.x - mouse.x;
      const dy = b.y - mouse.y;
      const dist = Math.hypot(dx, dy);
      if (dist < 90) {
        const force = (90 - dist) / 90;
        b.x += (dx / dist) * force * 2;
        b.y += (dy / dist) * force * 2;
        b.rot += 0.02;
      }
      if (b.y > H + b.size) { blocks[i] = make(false); continue; }
      if (b.x < -b.size) b.x = W + b.size;
      if (b.x > W + b.size) b.x = -b.size;

      const s = b.size;
      ctx.save();
      ctx.globalAlpha = b.alpha;
      ctx.translate(b.x, b.y);
      ctx.rotate(b.rot);
      ctx.fillStyle = b.color;
      ctx.fillRect(-s / 2, -s / 2, s, s);
      ctx.fillStyle = 'rgba(255,255,255,.14)';
      ctx.fillRect(-s / 2, -s / 2, s, 2);
      ctx.fillStyle = 'rgba(0,0,0,.20)';
      ctx.fillRect(-s / 2, s / 2 - 2, s, 2);
      ctx.restore();
    }
    if (running) raf = requestAnimationFrame(draw);
  };

  resize();
  start();
  window.addEventListener('resize', resize, { passive: true });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) stop(); else start();
  });

  window.addEventListener('mousemove', (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
  }, { passive: true });

  window.addEventListener('click', (e) => {
    const target = e.target.closest('section, header, .hero-bg');
    if (target) burst(e.clientX, e.clientY);
  });

  const heroEl = document.querySelector('.hero');
  if (heroEl) {
    const hio = new IntersectionObserver((entries) => {
      entries.forEach(e => { if (e.isIntersecting) start(); else stop(); });
    }, { threshold: 0 });
    hio.observe(heroEl);
  }

  window.addEventListener('themechange', () => {
    blocks.forEach(b => {
      if (!b.isParticle) b.color = getPalette()[Math.floor(Math.random() * getPalette().length)];
    });
  });
}
