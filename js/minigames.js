import { unlock } from './achievements.js';

const ASSET_BASE = 'Assets/Minecraft/assets/minecraft/textures';
const BLOCKS = {
  coal:     `${ASSET_BASE}/block/coal_block.png`,
  iron:     `${ASSET_BASE}/block/iron_block.png`,
  gold:     `${ASSET_BASE}/block/gold_block.png`,
  redstone: `${ASSET_BASE}/block/redstone_block.png`,
  lapis:    `${ASSET_BASE}/block/lapis_ore.png`,
  diamond:  `${ASSET_BASE}/block/diamond_block.png`,
  emerald:  `${ASSET_BASE}/block/emerald_block.png`
};
const ITEMS = {
  emerald: `${ASSET_BASE}/item/emerald.png`,
  diamond: `${ASSET_BASE}/item/diamond.png`,
  coal:    `${ASSET_BASE}/item/coal.png`
};

let activeGame = null;
let cleanupFn = null;

function wrap() {
  let el = document.getElementById('mgOverlay');
  if (!el) {
    el = document.createElement('div');
    el.id = 'mgOverlay';
    el.className = 'mg-overlay';
    el.setAttribute('role', 'dialog');
    el.setAttribute('aria-modal', 'true');
    el.setAttribute('aria-label', 'Mini-game');
    el.innerHTML = `
      <button class="mg-close" type="button" aria-label="Close game">×</button>
      <div class="mg-stage" id="mgStage"></div>
    `;
    document.body.appendChild(el);
    el.querySelector('.mg-close').addEventListener('click', stopGame);
    el.addEventListener('click', (e) => { if (e.target === el) stopGame(); });
  }
  el.classList.add('open');
  document.body.style.overflow = 'hidden';
  return {
    overlay: el,
    stage: el.querySelector('#mgStage')
  };
}

export function stopGame() {
  if (cleanupFn) { cleanupFn(); cleanupFn = null; }
  activeGame = null;
  const el = document.getElementById('mgOverlay');
  if (el) el.classList.remove('open');
  document.body.style.overflow = '';
}

function showStart(title, desc, onStart) {
  const { stage } = wrap();
  stage.innerHTML = `
    <div class="mg-intro">
      <h3>${title}</h3>
      <p>${desc}</p>
      <button class="btn btn-primary mg-start" type="button">Play</button>
    </div>
  `;
  stage.querySelector('.mg-start').addEventListener('click', () => {
    onStart();
  });
}

/* ---------- Whack-a-Block ---------- */
export function startWhack() {
  if (activeGame) return;
  activeGame = 'whack';
  showStart('Whack-a-Block', 'Click the ore blocks before they disappear. Diamond and emerald are worth more points.', runWhack);
}

function runWhack() {
  const { stage } = wrap();
  const scoreEl = document.createElement('div');
  scoreEl.className = 'mg-score';
  scoreEl.textContent = 'Score: 0';
  stage.parentElement.appendChild(scoreEl);

  let score = 0;
  let spawns = 0;
  const maxSpawns = 20;
  let timeoutIds = [];
  const ores = [
    { key: 'coal', points: 10 },
    { key: 'iron', points: 15 },
    { key: 'gold', points: 20 },
    { key: 'redstone', points: 25 },
    { key: 'lapis', points: 30 },
    { key: 'diamond', points: 50 },
    { key: 'emerald', points: 75 }
  ];

  stage.innerHTML = `
    <div class="mg-whack-field" id="mgWhackField"></div>
    <div class="mg-timer" id="mgTimer">20s</div>
  `;

  const field = stage.querySelector('#mgWhackField');
  const timerEl = stage.querySelector('#mgTimer');

  let timeLeft = 20;
  const timerInt = setInterval(() => {
    timeLeft--;
    timerEl.textContent = `${timeLeft}s`;
    if (timeLeft <= 0) endWhack(score);
  }, 1000);
  timeoutIds.push(timerInt);

  function spawn() {
    if (spawns >= maxSpawns) return;
    spawns++;
    const ore = ores[Math.floor(Math.random() * ores.length)];
    const el = document.createElement('button');
    el.className = 'mg-block';
    el.type = 'button';
    el.style.left = `${10 + Math.random() * 80}%`;
    el.style.top = `${10 + Math.random() * 75}%`;
    el.style.backgroundImage = `url(${BLOCKS[ore.key]})`;
    el.setAttribute('aria-label', ore.key);
    el.style.transform = 'scale(0)';
    field.appendChild(el);

    requestAnimationFrame(() => { el.style.transform = 'scale(1)'; });

    let hit = false;
    el.addEventListener('click', () => {
      if (hit) return;
      hit = true;
      score += ore.points;
      scoreEl.textContent = `Score: ${score}`;
      el.style.transform = 'scale(1.3)';
      el.style.opacity = '0';
      setTimeout(() => el.remove(), 150);
    });

    const life = setTimeout(() => {
      if (!hit) {
        el.style.transform = 'scale(0)';
        el.style.opacity = '0';
        setTimeout(() => el.remove(), 150);
      }
    }, 900 + Math.random() * 700);
    timeoutIds.push(life);

    if (spawns < maxSpawns) {
      const next = setTimeout(spawn, 500 + Math.random() * 500);
      timeoutIds.push(next);
    }
  }

  const starter = setTimeout(spawn, 400);
  timeoutIds.push(starter);

  cleanupFn = () => {
    timeoutIds.forEach(id => clearTimeout(id));
    scoreEl.remove();
  };

  function endWhack(finalScore) {
    stopGame();
    if (finalScore >= 100) unlock('prospector');
    setTimeout(() => {
      alert(`Whack-a-Block finished! Score: ${finalScore}`);
    }, 100);
  }
}

/* ---------- MineMatch Memory ---------- */
const MEMORY_CARDS = ['diamond', 'emerald', 'coal', 'iron', 'gold', 'redstone'];
export function startMemory() {
  if (activeGame) return;
  activeGame = 'memory';
  showStart('MineMatch', 'Flip cards to find matching Minecraft ores. Match all pairs.', runMemory);
}

function runMemory() {
  const { stage } = wrap();
  const pairs = [...MEMORY_CARDS, ...MEMORY_CARDS].sort(() => Math.random() - 0.5);
  let moves = 0;
  let matched = 0;
  let flipped = [];
  let locked = false;

  stage.innerHTML = `
    <div class="mg-memory">
      <div class="mg-memory-grid" id="mgMemoryGrid"></div>
      <div class="mg-status" id="mgStatus">Moves: 0 · Pairs: 0/6</div>
    </div>
  `;

  const grid = stage.querySelector('#mgMemoryGrid');
  const status = stage.querySelector('#mgStatus');

  pairs.forEach((type, i) => {
    const card = document.createElement('button');
    card.className = 'mg-memory-card';
    card.type = 'button';
    card.dataset.type = type;
    card.dataset.index = i;
    card.setAttribute('aria-label', 'Hidden card');
    card.style.backgroundImage = `url(${BLOCKS.stone})`;
    grid.appendChild(card);

    card.addEventListener('click', () => {
      if (locked || card.classList.contains('flipped') || card.classList.contains('matched')) return;
      card.classList.add('flipped');
      card.style.backgroundImage = `url(${BLOCKS[type]})`;
      card.setAttribute('aria-label', type);
      flipped.push(card);

      if (flipped.length === 2) {
        moves++;
        locked = true;
        const [a, b] = flipped;
        if (a.dataset.type === b.dataset.type) {
          matched++;
          status.textContent = `Moves: ${moves} · Pairs: ${matched}/6`;
          a.classList.add('matched');
          b.classList.add('matched');
          flipped = [];
          locked = false;
          if (matched === 6) {
            setTimeout(() => {
              stopGame();
              unlock('archaeologist');
              alert(`MineMatch cleared in ${moves} moves!`);
            }, 400);
          }
        } else {
          status.textContent = `Moves: ${moves} · Pairs: ${matched}/6`;
          setTimeout(() => {
            a.classList.remove('flipped');
            b.classList.remove('flipped');
            a.style.backgroundImage = `url(${BLOCKS.stone})`;
            b.style.backgroundImage = `url(${BLOCKS.stone})`;
            a.setAttribute('aria-label', 'Hidden card');
            b.setAttribute('aria-label', 'Hidden card');
            flipped = [];
            locked = false;
          }, 700);
        }
      }
    });
  });

  cleanupFn = () => {};
}

/* ---------- Subtle triggers on the page ---------- */
export function initMiniGameTriggers() {
  // 1. A tiny dirt speck in the hero background starts Whack-a-Block.
  const hero = document.querySelector('.hero');
  if (hero && !document.getElementById('mgDirtSpeck')) {
    const speck = document.createElement('button');
    speck.id = 'mgDirtSpeck';
    speck.className = 'mg-trigger mg-dirt-speck';
    speck.type = 'button';
    speck.setAttribute('aria-label', 'A suspicious dirt speck');
    speck.title = '?';
    hero.appendChild(speck);
    speck.addEventListener('click', (e) => { e.stopPropagation(); startWhack(); });
  }

  // 2. The year in the footer copyright launches MineMatch.
  const yearEl = document.getElementById('year');
  if (yearEl && !yearEl.dataset.mg) {
    yearEl.dataset.mg = 'memory';
    yearEl.classList.add('mg-trigger-year');
    yearEl.addEventListener('click', (e) => { e.stopPropagation(); startMemory(); });
  }

}

// Allow global access for terminal commands
window.__ThoriaMiniGames = { whack: startWhack, memory: startMemory };
