import { copyToClipboard } from './utils.js';

export function initCopyChips() {
  document.querySelectorAll('[data-copy]').forEach(btn => {
    btn.addEventListener('click', async () => {
      const text = btn.getAttribute('data-copy');
      await copyToClipboard(text);
      const labels = btn.querySelectorAll('.hover-swap-a, .hover-swap-b, .chip-label');
      btn.classList.add('copied');
      const originalTexts = Array.from(labels).map(l => l.textContent);
      labels.forEach(l => l.textContent = 'Copied!');
      setTimeout(() => {
        btn.classList.remove('copied');
        labels.forEach((l, i) => l.textContent = originalTexts[i]);
      }, 1600);
    });
  });
}
