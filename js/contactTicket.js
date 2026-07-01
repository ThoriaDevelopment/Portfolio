const FORM_ENDPOINT = 'https://formspree.io/f/mrevvjnw';

export function initContactTicket() {
  const form = document.getElementById('contactTicketForm');
  if (!form) return;
  const status = document.getElementById('ticketStatus');
  const submitBtn = form.querySelector('button[type="submit"]');
  const COOLDOWN_MS = 60000;
  let cooldownUntil = 0;

  function remainingMs() { return Math.max(0, cooldownUntil - Date.now()); }
  function setSubmitEnabled(enabled, remaining = 0) {
    if (!submitBtn) return;
    submitBtn.disabled = !enabled;
    submitBtn.textContent = enabled ? 'Send message' : `Wait ${Math.ceil(remaining / 1000)}s...`;
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const remaining = remainingMs();
    if (remaining > 0) {
      showStatus(`Please wait ${Math.ceil(remaining / 1000)} seconds before sending another message.`, true);
      setSubmitEnabled(false, remaining);
      return;
    }

    const data = new FormData(form);
    const name = data.get('name')?.toString().trim();
    const contact = data.get('contact')?.toString().trim();
    const role = data.get('role')?.toString();
    const message = data.get('message')?.toString().trim();

    let ok = true;
    form.querySelectorAll('input, select, textarea').forEach(el => el.classList.remove('error'));

    if (!name) {
      form.querySelector('[name="name"]').classList.add('error');
      ok = false;
    }
    if (!contact || contact.length < 3) {
      form.querySelector('[name="contact"]').classList.add('error');
      ok = false;
    }
    if (!role) {
      form.querySelector('[name="role"]').classList.add('error');
      ok = false;
    }
    if (!message || message.length < 10) {
      form.querySelector('[name="message"]').classList.add('error');
      ok = false;
    }
    if (!ok) {
      showStatus('Please fill all fields correctly.', true);
      return;
    }

    if (!FORM_ENDPOINT) {
      showStatus('Form endpoint not configured yet. Email officialthoria@gmail.com directly.', true);
      return;
    }

    try {
      const res = await fetch(FORM_ENDPOINT, {
        method: 'POST',
        body: data,
        headers: { Accept: 'application/json' }
      });
      if (res.ok) {
        showStatus('✓ Message sent. Thoria will respond soon.');
        form.reset();
        cooldownUntil = Date.now() + COOLDOWN_MS;
        setSubmitEnabled(false, COOLDOWN_MS);
        setTimeout(() => setSubmitEnabled(true), COOLDOWN_MS);
      } else {
        showStatus('Something went wrong. Please email directly.', true);
      }
    } catch (e) {
      showStatus('Network error. Please email directly.', true);
    }
  });

  function showStatus(msg, isError = false) {
    if (!status) return;
    status.textContent = msg;
    status.classList.toggle('show', true);
    status.classList.toggle('error', isError);
    status.classList.toggle('success', !isError);
    setTimeout(() => status.classList.remove('show'), 5000);
  }
}
