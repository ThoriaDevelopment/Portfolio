import { copyToClipboard } from './utils.js';
import { unlock } from './achievements.js';
import { applyTheme, unlockTheme, lockTheme, isThemeUnlocked } from './theme.js';

const KONAMI = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
let keys = [];
let typedBuffer = '';
let typingTimer = null;

export function initTerminal() {
  const terminal = document.createElement('div');
  terminal.className = 'terminal';
  terminal.setAttribute('role', 'dialog');
  terminal.setAttribute('aria-modal', 'true');
  terminal.setAttribute('aria-label', 'Command terminal');
  terminal.innerHTML = `
    <div class="terminal-window">
      <div class="terminal-header">
        <span class="terminal-dot red"></span>
        <span class="terminal-dot yellow"></span>
        <span class="terminal-dot green"></span>
        <span class="terminal-title">thoria@terminal ~ $</span>
      </div>
      <div class="terminal-body">
        <div class="terminal-line out">Welcome to the hidden terminal. Type a command or &#96;help&#96;.</div>
      </div>
      <div class="terminal-input-wrap">
        <span class="terminal-prompt">$</span>
        <input class="terminal-input" type="text" autocomplete="off" spellcheck="false" />
      </div>
    </div>
  `;
  document.body.appendChild(terminal);

  const body = terminal.querySelector('.terminal-body');
  const input = terminal.querySelector('.terminal-input');

  function print(text, cls = 'out') {
    const line = document.createElement('div');
    line.className = 'terminal-line ' + cls;
    line.textContent = text;
    body.appendChild(line);
    body.scrollTop = body.scrollHeight;
  }

  function exec(raw) {
    const cmd = raw.trim().toLowerCase();
    print('$ ' + raw, 'cmd');
    if (!cmd) return;

    const cmds = {
      help: () => {
        print('Available commands:');
        print('  hire          - scroll to contact / open ticket form');
        print('  discord       - copy Discord username');
        print('  experience    - jump to experience section');
        print('  kleos         - jump to the featured builds section');
        print('  achievements  - list unlocked badges');
        print('  theme         - cycle theme');
        print('  sound         - toggle sound');
        print('  status        - check server statuses');
        print('  whoami        - about Thoria');
        print('  whack         - play Whack-a-Block mini-game');
        print('  memory        - play MineMatch mini-game');
        print('  technoblade   - toggle memorial tribute (unlock or hide)');
      },
      hire: () => { close(); document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' }); },
      discord: () => {
        const techno = document.documentElement.getAttribute('data-theme') === 'technoblade';
        const value = techno ? 'https://discord.com/invite/technoblade' : '@inrising';
        copyToClipboard(value);
        print(`Copied ${value} to clipboard.`);
      },
      experience: () => { close(); document.getElementById('experience')?.scrollIntoView({ behavior: 'smooth' }); },
      kleos: () => {
        close();
        document.getElementById('builds')?.scrollIntoView({ behavior: 'smooth' });
      },
      achievements: () => {
        const saved = JSON.parse(localStorage.getItem('thoria-achievements') || '[]');
        print('Unlocked badges: ' + (saved.length ? saved.join(', ') : 'none yet - keep exploring!'));
      },
      theme: () => { const t = document.getElementById('themeToggle'); if (t) t.click(); print('Theme cycled via theme switcher.'); },
      sound: () => { document.getElementById('soundToggle')?.click(); print('Sound toggled.'); },
      status: () => { close(); document.getElementById('experience')?.scrollIntoView({ behavior: 'smooth' }); print('Scroll to Experience for live status pills.'); },
      whoami: () => {
        const techno = document.documentElement.getAttribute('data-theme') === 'technoblade';
        if (techno) {
          print('Technoblade | Minecraft PvP legend, creator, and charity streamer. So long, Nerds.');
        } else {
          print('Thoria | Minecraft server admin & media manager. 3 years, 400–1000+ player networks.');
        }
      },
      whack: () => { close(); window.__ThoriaMiniGames?.whack(); },
      memory: () => { close(); window.__ThoriaMiniGames?.memory(); },
      technoblade: () => {
        print('June 30, 2022');
        const current = document.documentElement.getAttribute('data-theme');
        if (current === 'technoblade') {
          lockTheme('technoblade');
          applyTheme('default');
          print('Technoblade tribute hidden. Theme reset to default.');
          return;
        }
        if (!isThemeUnlocked('technoblade')) {
          unlockTheme('technoblade');
          unlock('blood_god');
          print('Theme unlocked: technoblade.');
        }
        applyTheme('technoblade');
        print('Technoblade never dies!');
      }
    };

    if (cmds[cmd]) cmds[cmd]();
    else print(`Command not found: ${raw}. Try help.`, 'err');
  }

  function open() {
    terminal.classList.add('open');
    input.focus();
    unlock('commander');
  }

  function close() {
    terminal.classList.remove('open');
  }

  terminal.addEventListener('click', (e) => { if (e.target === terminal) close(); });
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') { exec(input.value); input.value = ''; }
    else if (e.key === 'Escape') { close(); }
  });

  // Konami code listener
  document.addEventListener('keydown', (e) => {
    keys.push(e.key);
    keys = keys.slice(-10);
    if (keys.join(',') === KONAMI.join(',')) open();

    if (e.key === '~' || e.key === '`') {
      e.preventDefault();
      terminal.classList.contains('open') ? close() : open();
    }
    if (e.key === 'F4') {
      e.preventDefault();
      terminal.classList.contains('open') ? close() : open();
    }
  });

  // type "thoria" anywhere to open
  document.addEventListener('keydown', (e) => {
    if (terminal.classList.contains('open')) return;
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    if (!e.key || e.key.length > 1) return;
    typedBuffer += e.key.toLowerCase();
    clearTimeout(typingTimer);
    typingTimer = setTimeout(() => typedBuffer = '', 900);
    if (typedBuffer.endsWith('thoria')) {
      typedBuffer = '';
      open();
    }
  });
}
