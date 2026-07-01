const THEME_STORAGE_KEY = 'thoria-theme';
const UNLOCK_STORAGE_KEY = 'thoria-theme-unlocked';
const BASE_THEMES = ['default', 'light', 'minecraft'];

const THEME_ICONS = {
  default:  { src: 'Assets/Minecraft/assets/minecraft/textures/item/clock_31.png', alt: 'Default theme (day clock)' },
  light:    { src: 'Assets/Minecraft/assets/minecraft/textures/item/clock_00.png', alt: 'Light theme (night clock)' },
  minecraft:{ src: 'Assets/Minecraft/assets/minecraft/textures/item/stone_sword.png', alt: 'Minecraft theme (stone sword)' },
  technoblade:{ src: 'Assets/Minecraft/assets/minecraft/textures/item/golden_helmet.png', alt: 'Technoblade memorial theme (golden helmet)' }
};

let unlocked = new Set();

export function initTheme() {
  loadUnlocked();

  let saved = localStorage.getItem(THEME_STORAGE_KEY) || 'default';
  if (saved === 'technoblade' && !unlocked.has('technoblade')) saved = 'default';
  applyTheme(saved);

  const toggle = document.getElementById('themeToggle');
  if (!toggle) return;

  updateToggleIcon(saved);
  toggle.addEventListener('click', () => {
    const current = document.documentElement.getAttribute('data-theme') || 'default';
    const order = themeOrder();
    const idx = order.indexOf(current);
    const next = order[(idx + 1) % order.length];
    applyTheme(next);
  });
}

export function applyTheme(name) {
  const valid = BASE_THEMES.includes(name) || (name === 'technoblade' && isThemeUnlocked('technoblade'));
  const theme = valid ? name : 'default';
  document.documentElement.setAttribute('data-theme', theme);
  try { localStorage.setItem(THEME_STORAGE_KEY, theme); } catch (e) {}
  updateToggleIcon(theme);
  window.dispatchEvent(new CustomEvent('themechange', { detail: theme }));
}

export function unlockTheme(name) {
  if (!unlocked.has(name)) {
    unlocked.add(name);
    saveUnlocked();
  }
}

export function lockTheme(name) {
  if (unlocked.has(name)) {
    unlocked.delete(name);
    saveUnlocked();
  }
}

export function isThemeUnlocked(name) {
  return unlocked.has(name);
}

function saveUnlocked() {
  try {
    const arr = Array.from(unlocked);
    localStorage.setItem(UNLOCK_STORAGE_KEY, JSON.stringify(arr));
  } catch (e) {}
}

function loadUnlocked() {
  try {
    const raw = localStorage.getItem(UNLOCK_STORAGE_KEY);
    const arr = raw ? JSON.parse(raw) : [];
    unlocked = new Set(Array.isArray(arr) ? arr : []);
  } catch (e) {
    unlocked = new Set();
  }
}

function themeOrder() {
  return isThemeUnlocked('technoblade') ? [...BASE_THEMES, 'technoblade'] : BASE_THEMES.slice();
}

function updateToggleIcon(theme) {
  const toggle = document.getElementById('themeToggle');
  if (!toggle) return;
  toggle.setAttribute('data-current', theme);
  const icon = toggle.querySelector('.theme-icon');
  if (!icon) return;

  const cfg = THEME_ICONS[theme] || THEME_ICONS.default;
  icon.innerHTML = `<img src="${cfg.src}" alt="${cfg.alt}" width="22" height="22" decoding="async" />`;
  toggle.title = `Theme: ${theme.charAt(0).toUpperCase() + theme.slice(1)}`;
  toggle.setAttribute('aria-label', `Toggle theme, current: ${theme}`);
}
