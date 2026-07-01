const SFX_FILES = [
  'Assets/Sounds/Click%20Sounds/Amethyst%20Step%202.mp3',
  'Assets/Sounds/Click%20Sounds/Amethyst%20Step%2014.mp3'
];
const BG_FILES = [
  'Assets/Sounds/Background%20Music/Waltz%20of%20The%20Traitor.mp3',
  'Assets/Sounds/Background%20Music/Goodbye%2C%20Sven.mp3',
  'Assets/Sounds/Background%20Music/why%20cant%20you%20remember.mp3',
  'Assets/Sounds/Background%20Music/to%20you%2C%20at%20the%20end.mp3',
  'Assets/Sounds/Background%20Music/erosion%20of%20myself.mp3'
];

let sndOn = false;
let sfxPool = [];
let bgAudio = null;
let bgOrder = [];
let bgIdx = 0;
let audioCtx = null;

export function initSound() {
  // Portfolio always starts muted. The user opts in (or back out) with the sound toggle.
  sndOn = false;

  const btn = document.getElementById('soundToggle');
  if (!btn) return;
  applyState(btn);

  btn.addEventListener('click', () => {
    sndOn = !sndOn;
    applyState(btn);
    if (sndOn) { startBg(); playClick(); } else { stopBg(); }
  });

  if (sndOn) {
    let bgStarted = false;
    function firstGesture() {
      if (bgStarted) return;
      bgStarted = true;
      startBg();
      document.removeEventListener('pointerdown', firstGesture);
      document.removeEventListener('keydown', firstGesture);
    }
    document.addEventListener('pointerdown', firstGesture);
    document.addEventListener('keydown', firstGesture);
  }

  document.addEventListener('click', (e) => {
    if (!sndOn) return;
    const t = e.target.closest('.btn, .chip:not(.chip-static), .proof-thumb, [data-lb-trigger], .lb-close, .lb-prev, .lb-next, .lb-open, .doc-card, .faq summary, .sound-toggle, .hire-btn');
    if (t && !t.classList.contains('sound-toggle')) playClick();
  });
}

function applyState(btn) {
  btn.setAttribute('aria-pressed', sndOn ? 'true' : 'false');
  btn.title = 'Sound ' + (sndOn ? 'on' : 'off');
}

function ensureSfx() {
  if (sfxPool.length) return;
  for (const src of SFX_FILES) {
    try {
      const a = new Audio(src);
      a.volume = 0.6;
      a.preload = 'auto';
      sfxPool.push(a);
    } catch (e) {}
  }
}

function shuffle(arr) {
  const a = arr.slice();
  for (let j = a.length - 1; j > 0; j--) {
    const r = Math.floor(Math.random() * (j + 1));
    [a[j], a[r]] = [a[r], a[j]];
  }
  return a;
}

function startBg() {
  if (!sndOn) return;
  if (!bgAudio) {
    try {
      bgAudio = new Audio();
      bgAudio.volume = 0.32;
      bgAudio.addEventListener('ended', nextBg);
    } catch (e) { return; }
  }
  if (!bgAudio) return;
  if (!bgOrder.length) { bgOrder = shuffle(BG_FILES); bgIdx = 0; }
  if (!bgAudio.src) bgAudio.src = bgOrder[bgIdx];
  try {
    const p = bgAudio.play();
    if (p && p.catch) p.catch(() => {});
  } catch (e) {}
}

function nextBg() {
  if (!sndOn || !bgAudio) return;
  bgIdx++;
  if (bgIdx >= bgOrder.length) { bgOrder = shuffle(BG_FILES); bgIdx = 0; }
  bgAudio.src = bgOrder[bgIdx];
  try {
    const p = bgAudio.play();
    if (p && p.catch) p.catch(() => {});
  } catch (e) {}
}

function stopBg() {
  if (bgAudio) {
    try { bgAudio.pause(); } catch (e) {}
  }
}

function playClick() {
  if (!sndOn) return;

  const theme = document.documentElement.getAttribute('data-theme');
  if (theme === 'minecraft') {
    playNoteBlock();
    return;
  }

  ensureSfx();
  if (!sfxPool.length) return;
  const a = sfxPool[Math.random() < 0.5 ? 0 : (sfxPool.length - 1)];
  try {
    a.currentTime = 0;
    const p = a.play();
    if (p && p.catch) p.catch(() => {});
  } catch (e) {}
}

function playNoteBlock() {
  if (!audioCtx) {
    try { audioCtx = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { return; }
  }
  if (audioCtx.state === 'suspended') audioCtx.resume();
  const notes = [440, 523.25, 659.25, 783.99];
  const freq = notes[Math.floor(Math.random() * notes.length)];
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.type = 'square';
  osc.frequency.value = freq;
  gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.12);
  osc.connect(gain);
  gain.connect(audioCtx.destination);
  osc.start();
  osc.stop(audioCtx.currentTime + 0.12);
}
