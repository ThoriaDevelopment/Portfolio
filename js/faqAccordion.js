export function initFaq() {
  document.querySelectorAll('.faq-item').forEach(item => {
    const summary = item.querySelector('.faq-summary');
    const answer = item.querySelector('.faq-answer');
    if (!summary || !answer) return;

    summary.addEventListener('click', () => {
      const isOpen = item.classList.contains('is-open');

      // Close others
      document.querySelectorAll('.faq-item.is-open').forEach(i => {
        if (i !== item) {
          i.classList.remove('is-open');
          i.querySelector('.faq-summary')?.setAttribute('aria-expanded', 'false');
        }
      });

      item.classList.toggle('is-open', !isOpen);
      summary.setAttribute('aria-expanded', !isOpen ? 'true' : 'false');
    });
  });
}
