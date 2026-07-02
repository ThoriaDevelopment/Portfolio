import { copyToClipboard } from './utils.js';

const REFERENCES = [
  {
    name: 'Velt',
    role: 'Administrator · ArchMC Network',
    avatar: 'Assets/Referances/Velt.png',
    discordId: '221025167684403202',
    displayHandle: '@v7lt'
  },
  {
    name: 'MacDonald',
    role: 'Administrator · VoidSentMC',
    avatar: 'Assets/Referances/MacDonald.png',
    discordId: '1063895717346820128',
    displayHandle: '@tertlon'
  },
  {
    name: 'Namen',
    role: 'Senior Moderator · ArchMC',
    avatar: 'Assets/Referances/Namensauswahl.png',
    discordId: '1105363437929898135',
    displayHandle: '@namensauswahl'
  },
  {
    name: 'Sencinion',
    role: 'Owner · DuckyMC',
    avatar: 'Assets/Referances/Sencinion.png',
    discordId: '1402708145025056820',
    displayHandle: 'Sencinion'
  }
];

export function initReferences() {
  const grid = document.getElementById('referencesGrid');
  if (!grid) return;

  grid.innerHTML = REFERENCES.map(r => `
    <article class="reference-card reveal" data-name="${r.name}">
      <div class="ref-avatar" aria-hidden="true">
        <img src="${r.avatar}" alt="" loading="lazy" decoding="async">
      </div>
      <div class="ref-body">
        <h3 class="ref-name">${r.name}</h3>
        <p class="ref-role">${r.role}</p>
        <button class="ref-discord chip" type="button" aria-label="Copy Discord user ID for ${r.name}">
          <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M20.3 4.4A19.8 19.8 0 0 0 15.4 3l-.25.5a18 18 0 0 1 4.3 1.4 16.5 16.5 0 0 0-15 0A18 18 0 0 1 8.85 3.5L8.6 3a19.8 19.8 0 0 0-4.9 1.4C.6 9 .1 13.5.1 18a19.8 19.8 0 0 0 6 3l.5-.7a13 13 0 0 1-2-1l.5-.36A14.2 14.2 0 0 0 12 20.4a14.2 14.2 0 0 0 6.4-1.46l.5.36a13 13 0 0 1-2 1l.5.7a19.8 19.8 0 0 0 6-3c0-4.5-.5-9-3.6-13.6zM8.3 15.3c-1 0-1.8-.9-1.8-2s.8-2 1.8-2 1.8.9 1.8 2-.8 2-1.8 2zm7.4 0c-1 0-1.8-.9-1.8-2s.8-2 1.8-2 1.8.9 1.8 2-.8 2-1.8 2z"/>
          </svg>
          <span class="ref-username">${r.displayHandle}</span>
        </button>
      </div>
    </article>
  `).join('');

  grid.querySelectorAll('.reference-card').forEach(card => {
    const btn = card.querySelector('.ref-discord');
    const label = card.querySelector('.ref-username');
    const ref = REFERENCES.find(r => r.name === card.dataset.name);
    if (!btn || !label || !ref) return;

    const originalText = ref.displayHandle;
    let timer = null;

    function flashCopied() {
      btn.classList.add('copied');
      label.textContent = 'Copied!';
      clearTimeout(timer);
      timer = setTimeout(() => {
        btn.classList.remove('copied');
        label.textContent = originalText;
      }, 1400);
    }

    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      copyToClipboard(ref.discordId).then(ok => { if (ok) flashCopied(); });
    });

    card.addEventListener('click', () => {
      copyToClipboard(ref.discordId).then(ok => { if (ok) flashCopied(); });
    });
  });
}
