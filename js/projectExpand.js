function getBuildsFade() {
  const raw = getComputedStyle(document.documentElement).getPropertyValue('--builds-fade').trim();
  const val = parseFloat(raw);
  return Number.isFinite(val) ? val : 0;
}

function isVisibleBuildCard(card) {
  if (!document.documentElement.classList.contains('is-scroll-path')) return true;
  const stage = card.closest('.builds-grid');
  if (!stage) return true;
  const cards = Array.from(stage.querySelectorAll('.project-card'));
  const idx = cards.indexOf(card);
  if (idx === -1) return true;
  const fade = getBuildsFade();
  if (idx === 0) return fade < 0.55;
  if (idx === 1) return fade > 0.45;
  return true;
}

export function initProjectExpand() {
  document.querySelectorAll('[data-project-toggle]').forEach(header => {
    const card = header.closest('.project-card');
    if (!card) return;

    header.addEventListener('click', () => {
      // In scroll-path mode, ignore clicks on the invisible cross-faded card
      if (!isVisibleBuildCard(card)) return;

      const isOpen = card.classList.contains('is-open');

      // Close others
      document.querySelectorAll('.project-card.is-open').forEach(c => {
        if (c !== card) {
          c.classList.remove('is-open');
          c.querySelector('[data-project-toggle]')?.setAttribute('aria-expanded', 'false');
        }
      });

      card.classList.toggle('is-open', !isOpen);
      header.setAttribute('aria-expanded', !isOpen ? 'true' : 'false');
    });

    header.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        header.click();
      }
    });
  });
}
