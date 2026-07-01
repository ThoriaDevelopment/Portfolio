export function initNavHover() {
  // Normalize every .hover-swap element so it contains a single
  // .hover-swap-wrap with .hover-swap-a / .hover-swap-b labels.
  document.querySelectorAll('.hover-swap').forEach(link => {
    // Skip if already normalized
    if (link.querySelector(':scope > .hover-swap-wrap')) return;

    // Collect existing icon(s) and label spans
    const icons = Array.from(link.querySelectorAll(':scope > svg'));
    const a = link.querySelector(':scope > .hover-swap-a');
    const b = link.querySelector(':scope > .hover-swap-b');

    let text = '';
    if (a) text = a.textContent.trim();
    else text = link.textContent.trim();

    // Preserve the original label spans if they exist; otherwise create them.
    const wrap = document.createElement('span');
    wrap.className = 'hover-swap-wrap';
    if (a && b) {
      wrap.appendChild(a);
      wrap.appendChild(b);
    } else {
      wrap.innerHTML = `<span class="hover-swap-a">${text}</span><span class="hover-swap-b">${text}</span>`;
    }

    link.innerHTML = '';
    icons.forEach(icon => link.appendChild(icon));
    link.appendChild(wrap);
  });
}
