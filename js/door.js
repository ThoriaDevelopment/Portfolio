import { getCapabilities } from './utils.js';

export function initDoor(onComplete) {
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

  door.classList.add('is-active', 'is-revealing');
  document.body.style.overflow = 'hidden';

  const grid = door.querySelector('.door-grid');
  const cells = door.querySelectorAll('.door-cell');

  function finishDoor() {
    door.classList.remove('is-active', 'is-revealing', 'is-opening');
    door.style.display = 'none';
    door.style.clipPath = '';
    document.body.style.overflow = '';
    if (onComplete) onComplete();
  }

  // Letters pop in from the left in a wave, then hold for ~1 second so the
  // word MANAGEMENT is readable before the circular reveal starts.
  anime.timeline({ easing: 'easeInOutExpo' })
    .add({
      targets: cells,
      scale: [0.85, 1],
      opacity: function(el, i) {
        const base = [0.9, 0.75, 0.6, 0.75, 0.5];
        return [0, base[i % 5]];
      },
      delay: anime.stagger(55, { from: 'first' }),
      duration: 700
    })
    // Showcase the word MANAGEMENT for ~0.6 second before revealing the hero.
    .add({
      targets: grid,
      scale: 1,
      duration: 600,
      easing: 'linear'
    })
    .finished.then(() => {
      // Begin the circular reveal and the outward ripple together.
      door.classList.add('is-opening');

      anime.timeline({ easing: 'easeInOutExpo' })
        .add({
          targets: grid,
          scale: [1, 1.35],
          duration: 900,
          easing: 'cubicBezier(0.45, 0, 0.15, 1)'
        })
        .add({
          targets: cells,
          opacity: 0,
          scale: 1.15,
          duration: 500,
          delay: anime.stagger(20, { from: 'last' })
        }, '+=100')
        .finished.then(finishDoor);
    });
}
