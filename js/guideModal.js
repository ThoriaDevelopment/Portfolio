import { $ } from './utils.js';

export function initGuideModal() {
  const trigger = $('#guideTrigger');
  const modal = $('#guideModal');
  if (!trigger || !modal) return;

  const searchInput = $('#guideSearch', modal);
  const body = $('#guideBody', modal);
  const sections = [...modal.querySelectorAll('.guide-section')];
  const countEl = $('#guideCount', modal);
  const closeSelectors = '[data-guide-close]';

  function setOpen(open) {
    modal.classList.toggle('open', open);
    modal.setAttribute('aria-hidden', String(!open));
    document.body.style.overflow = open ? 'hidden' : '';
    if (open && searchInput) {
      searchInput.value = '';
      filter('');
      setTimeout(() => searchInput.focus(), 50);
    }
  }

  function filter(query) {
    const q = query.trim().toLowerCase();
    let visible = 0;
    sections.forEach((section) => {
      const text = (section.textContent + ' ' + (section.dataset.keywords || '')).toLowerCase();
      const matches = !q || text.includes(q);
      section.classList.toggle('hidden', !matches);
      if (matches) visible++;
    });
    if (countEl) countEl.textContent = `${visible} interaction${visible === 1 ? '' : 's'}`;
    if (body) {
      const empty = body.querySelector('.guide-empty');
      if (empty) empty.classList.toggle('show', visible === 0);
    }
  }

  trigger.addEventListener('click', () => setOpen(true));

  modal.addEventListener('click', (e) => {
    if (e.target.closest(closeSelectors)) setOpen(false);
  });

  window.addEventListener('keydown', (e) => {
    if (!modal.classList.contains('open')) return;
    if (e.key === 'Escape') {
      e.preventDefault();
      setOpen(false);
    }
  });

  if (searchInput) {
    searchInput.addEventListener('input', (e) => filter(e.target.value));
  }
}
