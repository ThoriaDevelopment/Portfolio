import { isTouch, prefersReducedMotion } from './utils.js';

export function initTilt() {
  if (isTouch() || prefersReducedMotion()) return;
  document.querySelectorAll('.card').forEach(card => {
    card.style.willChange = 'transform';
    card.addEventListener('mouseenter', () => {
      // Disable CSS transitions while hovering so the tilt tracks the cursor
      // without the reveal-grid stagger delay getting in the way.
      card.style.transition = 'none';
    });
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const cx = rect.width / 2;
      const cy = rect.height / 2;
      const rx = ((y - cy) / cy) * -8;
      const ry = ((x - cx) / cx) * 8;
      card.style.transform = `perspective(800px) rotateX(${rx}deg) rotateY(${ry}deg) translateY(-4px)`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
      card.style.transition = '';
    });
  });
}
