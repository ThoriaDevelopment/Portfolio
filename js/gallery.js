export function initGallery() {
  const lb = document.getElementById('lightbox');
  if (!lb) return;

  const lbImg = lb.querySelector('.lb-img');
  const lbPdf = lb.querySelector('.lb-pdf');
  const lbCap = lb.querySelector('.lb-caption');
  const lbOpen = lb.querySelector('.lb-open');
  const lbClose = lb.querySelector('.lb-close');
  const lbPrev = lb.querySelector('.lb-prev');
  const lbNext = lb.querySelector('.lb-next');

  const groups = {};
  Array.prototype.forEach.call(document.querySelectorAll('[data-lb-src]'), (el) => {
    const g = el.getAttribute('data-lb-group') || '_';
    (groups[g] = groups[g] || []).push({
      src: el.getAttribute('data-lb-src'),
      cap: el.getAttribute('data-lb-caption') || '',
      el
    });
  });

  let cur = { g: null, i: 0 };
  let lastFocus = null;
  let pdfMode = false;

  function showImg(m) {
    pdfMode = false;
    lbImg.src = m.src;
    lbImg.alt = m.cap;
    lbImg.style.display = '';
    lbPdf.style.display = 'none';
    lbPdf.src = '';
    lbCap.textContent = m.cap;
    lbOpen.setAttribute('href', m.src);
    const multi = (groups[cur.g] || []).length > 1;
    lbPrev.style.display = multi ? '' : 'none';
    lbNext.style.display = multi ? '' : 'none';
  }

  function showPdf(src, cap) {
    pdfMode = true;
    cur.g = null;
    lbImg.style.display = 'none';
    lbPdf.style.display = '';
    lbPdf.src = src;
    lbCap.textContent = cap || 'PDF preview';
    lbOpen.setAttribute('href', src);
    lbPrev.style.display = 'none';
    lbNext.style.display = 'none';
  }

  function open() {
    lb.classList.add('open');
    lb.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    lastFocus = document.activeElement;
    lbClose.focus();
  }

  function close() {
    lb.classList.remove('open');
    lb.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    lbImg.src = '';
    lbPdf.src = '';
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }

  function nav(d) {
    if (pdfMode || !cur.g) return;
    const arr = groups[cur.g];
    if (!arr || arr.length < 2) return;
    cur.i = (cur.i + d + arr.length) % arr.length;
    showImg(arr[cur.i]);
  }

  function focusables() {
    return [lbClose, lbPrev, lbNext, lbOpen].filter(el => el && el.style.display !== 'none');
  }

  document.addEventListener('click', (e) => {
    const tr = e.target.closest('[data-lb-trigger]');
    if (tr) {
      const g = tr.getAttribute('data-lb-group') || '_';
      const arr = groups[g];
      if (!arr) return;
      let idx = -1;
      idx = arr.findIndex(item => item.el === tr);
      if (idx < 0) idx = 0;
      cur = { g, i: idx };
      showImg(arr[idx]);
      open();
      return;
    }

    const pdfBtn = e.target.closest('[data-pdf]');
    if (pdfBtn) {
      showPdf(pdfBtn.getAttribute('data-pdf'), pdfBtn.getAttribute('data-pdf-caption') || 'PDF preview');
      open();
      return;
    }

  });

  lb.addEventListener('click', (e) => { if (e.target === lb) close(); });
  lbClose.addEventListener('click', close);
  lbPrev.addEventListener('click', (e) => { e.stopPropagation(); nav(-1); });
  lbNext.addEventListener('click', (e) => { e.stopPropagation(); nav(1); });

  document.addEventListener('keydown', (e) => {
    if (!lb.classList.contains('open')) return;
    if (e.key === 'Escape') close();
    else if (e.key === 'ArrowLeft' && lbPrev.style.display !== 'none') nav(-1);
    else if (e.key === 'ArrowRight' && lbNext.style.display !== 'none') nav(1);
    else if (e.key === 'Tab') {
      const f = focusables();
      if (!f.length) return;
      const first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });
}
