const STORAGE_KEY = 'thoria-achievements';

const ACHIEVEMENTS = {
  profiler: { id: 'profiler', title: 'Profiler', desc: 'Viewed all portfolio sections.', icon: '🔍' },
  investigator: { id: 'investigator', title: 'Investigator', desc: 'Opened every proof image.', icon: '🕵️' },
  signal_boosted: { id: 'signal_boosted', title: 'Signal Boosted', desc: 'Copied Discord username.', icon: '📢' },
  sonic_explorer: { id: 'sonic_explorer', title: 'Sonic Explorer', desc: 'Toggled sound on.', icon: '🎵' },
  block_breaker: { id: 'block_breaker', title: 'Block Breaker', desc: 'Interacted with the falling blocks.', icon: '⛏' },
  speedrunner: { id: 'speedrunner', title: 'Speedrunner', desc: 'Reached the contact section quickly.', icon: '⏱️' },
  commander: { id: 'commander', title: 'Commander', desc: 'Opened the hidden terminal.', icon: '⌨️' },
  prospector: { id: 'prospector', title: 'Prospector', desc: 'Scored 100+ in Whack-a-Block.', icon: '💎' },
  archaeologist: { id: 'archaeologist', title: 'Archaeologist', desc: 'Cleared MineMatch memory game.', icon: '🧩' },
  blood_god: { id: 'blood_god', title: 'Blood God', desc: 'Paid tribute to Technoblade.', icon: '👑' }
};

let unlocked = new Set();
let stack;

export function initAchievements() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    unlocked = new Set(saved);
  } catch (e) {
    unlocked = new Set();
  }

  stack = document.createElement('div');
  stack.className = 'toast-stack';
  document.body.appendChild(stack);

  trackSections();
  trackProof();
  trackDiscord();
  trackSound();
  trackBlocks();
  trackSpeedrunner();
}

export function unlock(id) {
  if (unlocked.has(id)) return;
  const a = ACHIEVEMENTS[id];
  if (!a) return;
  unlocked.add(id);
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify([...unlocked])); } catch (e) {}
  showToast(a);
}

function showToast(a) {
  if (!stack) return;
  const t = document.createElement('div');
  t.className = 'toast';
  t.innerHTML = `<span class="toast-title">${a.icon} Achievement unlocked: ${a.title}</span>
                 <span class="toast-desc">${a.desc}</span>`;
  stack.appendChild(t);
  requestAnimationFrame(() => t.classList.add('show'));
  setTimeout(() => {
    t.classList.remove('show');
    setTimeout(() => t.remove(), 500);
  }, 3800);
}

function trackSections() {
  const sections = ['#top', '#bio', '#experience', '#builds', '#skills', '#faq'];
  const seen = new Set();
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        seen.add(e.target.id);
        if (seen.size >= sections.length - 1) unlock('profiler');
      }
    });
  }, { threshold: 0.25 });
  sections.forEach(sel => {
    const el = document.querySelector(sel);
    if (el) io.observe(el);
  });
}

function trackProof() {
  const groups = ['archmc', 'voidsent'];
  const opened = new Set();
  document.addEventListener('click', (e) => {
    const tr = e.target.closest('[data-lb-trigger][data-lb-group]');
    if (!tr) return;
    const g = tr.getAttribute('data-lb-group');
    if (groups.includes(g)) opened.add(g);
    if (opened.size >= groups.length) unlock('investigator');
  });
}

function trackDiscord() {
  document.querySelectorAll('[data-copy="@inrising"]').forEach(btn => {
    btn.addEventListener('click', () => unlock('signal_boosted'));
  });
}

function trackSound() {
  const btn = document.getElementById('soundToggle');
  if (!btn) return;
  btn.addEventListener('click', () => {
    if (btn.getAttribute('aria-pressed') === 'true') unlock('sonic_explorer');
  });
}

function trackBlocks() {
  let burst = false;
  window.addEventListener('click', (e) => {
    if (e.target.closest('#blocks, .hero, section')) {
      if (!burst) unlock('block_breaker');
      burst = true;
    }
  });
}

function trackSpeedrunner() {
  const start = performance.now();
  const footer = document.querySelector('footer');
  if (!footer) return;
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting && performance.now() - start < 25000) unlock('speedrunner');
    });
  }, { threshold: 0.3 });
  io.observe(footer);
}
