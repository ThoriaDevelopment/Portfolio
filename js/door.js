import { getCapabilities } from './utils.js';

const DOOR_TEXT = 'MANAGEMENT  ADMINISTRATION  ';

export function initDoor(options) {
  const onComplete = typeof options === 'function' ? options : options?.onComplete;
  const onBeforeOpen = typeof options === 'function' ? null : options?.onBeforeOpen;

  const door = document.getElementById('door');
  if (!door) {
    if (onComplete) onComplete();
    return;
  }

  const caps = getCapabilities();
  if (caps.isMinimal) {
    door.style.display = 'none';
    if (onComplete) onComplete();
    return;
  }

  // Guard against missing anime.js
  if (typeof anime === 'undefined') {
    door.style.display = 'none';
    if (onComplete) onComplete();
    return;
  }

  const grid = door.querySelector('.door-grid');

  // Build the Stanley-style repeating text wall.
  function buildTextWall() {
    if (!grid) return;
    grid.innerHTML = '';
    grid.classList.add('door-wall');
    const rowCount = 14;
    const phrase = DOOR_TEXT.repeat(6);
    for (let i = 0; i < rowCount; i++) {
      const row = document.createElement('div');
      row.className = 'door-wall-row';
      row.innerHTML = `<span>${phrase}</span><span>${phrase}</span>`;
      // alternate rows get different starting offsets for the cascade
      row.style.setProperty('--row-offset', `${-i * 8}vw`);
      row.style.setProperty('--row-dir', i % 2 === 0 ? 'normal' : 'reverse');
      grid.appendChild(row);
    }
  }

  buildTextWall();

  // If reduced motion, skip the wall and reveal hero immediately.
  if (caps.prefersReducedMotion) {
    door.classList.add('is-active', 'is-revealing', 'is-opening');
    setTimeout(() => {
      door.classList.remove('is-active', 'is-revealing', 'is-opening');
      door.style.display = 'none';
      door.style.clipPath = '';
      if (onBeforeOpen) onBeforeOpen();
      if (onComplete) onComplete();
    }, 50);
    return;
  }

  door.style.opacity = '0';
  door.classList.add('is-active', 'is-revealing');
  document.body.style.overflow = 'hidden';

  function finishDoor() {
    door.classList.remove('is-active', 'is-revealing', 'is-opening');
    door.style.display = 'none';
    door.style.opacity = '';
    door.style.clipPath = '';
    document.body.style.overflow = '';
    if (onComplete) onComplete();
  }

  // Crossfade the door in over the fading loader, then pop in the wall.
  anime.timeline({ easing: 'easeOutExpo' })
    .add({
      targets: door,
      opacity: [0, 1],
      duration: 600
    })
    .add({
      targets: '.door-wall-row',
      opacity: [0, function(el, i) { return i === 6 || i === 7 ? 0.95 : 0.18; }],
      translateY: [40, 0],
      delay: anime.stagger(50, { from: 'first' }),
      duration: 700
    })
    // Showcase the wall for ~1.2 seconds before revealing the hero.
    .add({
      targets: door,
      duration: 1200,
      easing: 'linear'
    })
    .finished.then(() => {
      // Hide the loader and reveal the hero now so it shows through the door as it opens.
      if (onBeforeOpen) onBeforeOpen();

      // Begin the circular reveal and the outward ripple together.
      door.classList.add('is-opening');

      anime({
        targets: '.door-wall-row',
        opacity: 0,
        scale: 1.08,
        duration: 700,
        delay: anime.stagger(30, { from: 'last' }),
        easing: 'easeInOutExpo'
      }).finished.then(finishDoor);
    });
}
