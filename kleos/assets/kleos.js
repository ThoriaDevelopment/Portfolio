(function () {
  document.documentElement.classList.remove('no-js');
  document.documentElement.classList.add('js');

  // FAQ accordion
  const faqItems = document.querySelectorAll('.faq-item');
  faqItems.forEach(item => {
    const summary = item.querySelector('.faq-summary');
    const answer = item.querySelector('.faq-answer');
    if (!summary || !answer) return;

    summary.addEventListener('click', () => {
      const isOpen = item.classList.contains('is-open');

      faqItems.forEach(i => {
        if (i !== item) {
          i.classList.remove('is-open');
          i.querySelector('.faq-summary')?.setAttribute('aria-expanded', 'false');
        }
      });

      item.classList.toggle('is-open', !isOpen);
      summary.setAttribute('aria-expanded', !isOpen ? 'true' : 'false');

      // match transition height smoothly
      if (!isOpen) {
        answer.style.maxHeight = answer.scrollHeight + 'px';
      } else {
        answer.style.maxHeight = '0px';
      }
    });
  });

  // Scroll reveal
  const revealSel = '.fade-in-scroll, .slide-in-bottom';
  const revealEls = document.querySelectorAll(revealSel);
  if (revealEls.length) {
    const reduced = window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (reduced || !('IntersectionObserver' in window)) {
      revealEls.forEach(el => el.classList.add('in-view'));
    } else {
      const io = new IntersectionObserver(entries => {
        entries.forEach(e => {
          if (e.isIntersecting) {
            e.target.classList.add('in-view');
            io.unobserve(e.target);
          }
        });
      }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });

      revealEls.forEach(el => io.observe(el));
    }
  }

  // Copy Discord username to clipboard
  const copyBtn = document.querySelector('.copy-discord');
  const toast = document.getElementById('toast');
  if (copyBtn && toast) {
    copyBtn.addEventListener('click', async () => {
      const text = copyBtn.dataset.copy || '@inrising';
      let ok = false;

      try {
        if (navigator.clipboard && navigator.clipboard.writeText) {
          await navigator.clipboard.writeText(text);
          ok = true;
        }
      } catch (err) {
        ok = false;
      }

      if (!ok) {
        const ta = document.createElement('textarea');
        ta.value = text;
        document.body.appendChild(ta);
        ta.select();
        try { ok = document.execCommand('copy'); } catch (e) { ok = false; }
        document.body.removeChild(ta);
      }

      toast.classList.add('is-visible');
      setTimeout(() => toast.classList.remove('is-visible'), 2200);
    });
  }
})();
