const RESUME_PATH = 'Assets/About%20Me/Resume.txt';
const RESUME_PDF_PATH = 'Assets/Thoria/Resume.pdf';

const SECTION_PROGRESS = {
  top: 0,
  hero: 0,
  bio: 0.14,
  experience: 0.31,
  builds: 0.64,
  skills: 0.80,
  contact: 0.98
};

function scrollPathTo(id) {
  const maxScroll = window.innerHeight * 8 - window.innerHeight;
  const progress = SECTION_PROGRESS[id] ?? SECTION_PROGRESS.contact;
  window.dispatchEvent(new CustomEvent('thoria-autoscroll', { bubbles: true }));
  window.scrollTo({ top: Math.round(progress * maxScroll), behavior: 'smooth' });
}

function stripDiscordMarkup(text) {
  return text
    .replace(/<:\w+:\d+>/g, '')
    .replace(/<@!?(\d+)>/g, '')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

function markdownLinkToHtml(text) {
  return text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');
}

function cleanHeading(text) {
  return stripDiscordMarkup(text).replace(/[:#\s]+$/g, '').trim();
}

function parseResumeToHtml(raw) {
  const lines = raw.split(/\r?\n/);
  const sections = [];
  let current = { title: null, html: '', inList: false, paragraphBuffer: '' };

  function flushParagraph(sec) {
    if (sec.paragraphBuffer.trim()) {
      sec.html += `<p>${markdownLinkToHtml(stripDiscordMarkup(sec.paragraphBuffer.trim()))}</p>\n`;
      sec.paragraphBuffer = '';
    }
  }

  function closeList(sec) {
    if (sec.inList) {
      sec.html += '</ul>\n';
      sec.inList = false;
    }
  }

  function closeCurrent() {
    flushParagraph(current);
    closeList(current);
    sections.push(current);
  }

  function startSection(title) {
    closeCurrent();
    current = { title, html: `<h2>${cleanHeading(title)}</h2>\n`, inList: false, paragraphBuffer: '' };
  }

  lines.forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed) {
      flushParagraph(current);
      return;
    }

    if (trimmed.startsWith('## ')) {
      startSection(trimmed.slice(3));
      return;
    }

    if (trimmed.startsWith('### ')) {
      flushParagraph(current);
      closeList(current);
      current.html += `<h3>${cleanHeading(trimmed.slice(4))}</h3>\n`;
      return;
    }

    const bulletMatch = trimmed.match(/^(?:>\s*[•-]\s*|-\s+)(.*)$/);
    if (bulletMatch) {
      flushParagraph(current);
      if (!current.inList) {
        current.html += '<ul>\n';
        current.inList = true;
      }
      current.html += `<li>${markdownLinkToHtml(stripDiscordMarkup(bulletMatch[1]))}</li>\n`;
      return;
    }

    closeList(current);
    if (current.paragraphBuffer) current.paragraphBuffer += ' ';
    current.paragraphBuffer += trimmed;
  });

  closeCurrent();

  const keepTogether = ['Why Me', 'Pricing and Availability', 'References', 'Where to Reach Me'];
  const pageBreakBefore = ['Experience'];
  return sections.map((sec) => {
    let html = sec.html;
    if (sec.title && pageBreakBefore.some((phrase) => sec.title.includes(phrase))) {
      html = `<div class="pdf-page-break">${html}</div>`;
    }
    if (sec.title && keepTogether.some((phrase) => sec.title.includes(phrase))) {
      return `<div class="pdf-keep">\n${html}</div>\n`;
    }
    return html;
  }).join('');
}

let resumeTextCache = '';

async function fetchResumeText() {
  if (resumeTextCache) return resumeTextCache;
  const res = await fetch(RESUME_PATH);
  if (!res.ok) throw new Error('Resume unavailable');
  resumeTextCache = await res.text();
  return resumeTextCache;
}

function buildResumeOverlay() {
  const existing = document.getElementById('resumeOverlay');
  if (existing) return existing;

  const overlay = document.createElement('div');
  overlay.id = 'resumeOverlay';
  overlay.className = 'resume-overlay';
  overlay.setAttribute('aria-hidden', 'true');
  overlay.innerHTML = `
    <div class="resume-panel">
      <button class="resume-download" aria-label="Download resume as PDF" title="Download PDF">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
          <path d="M7 10l5 5 5-5"/>
          <path d="M12 15V3"/>
        </svg>
      </button>
      <button class="resume-close" aria-label="Close resume">×</button>
      <div class="resume-content" id="resumeContent">
        <p class="resume-loading">Loading resume…</p>
      </div>
    </div>
  `;
  document.body.appendChild(overlay);

  overlay.querySelector('.resume-close').addEventListener('click', () => closeResumeOverlay(overlay));
  overlay.querySelector('.resume-download').addEventListener('click', () => downloadResumePdf());
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeResumeOverlay(overlay);
  });

  // Prevent background scroll when the resume content hits its boundaries.
  const content = overlay.querySelector('.resume-content');
  content.addEventListener('wheel', (e) => {
    const atTop = content.scrollTop === 0;
    const atBottom = Math.abs(content.scrollTop + content.clientHeight - content.scrollHeight) <= 1;
    if ((atTop && e.deltaY < 0) || (atBottom && e.deltaY > 0)) {
      e.preventDefault();
    }
  }, { passive: false });

  return overlay;
}

function setBodyScroll(lock) {
  document.documentElement.classList.toggle('is-resume-locked', lock);
}

function openResumeOverlay(overlay) {
  overlay.classList.add('is-visible');
  overlay.setAttribute('aria-hidden', 'false');
  document.documentElement.classList.add('is-resume-open');
  setBodyScroll(true);
}

function closeResumeOverlay(overlay) {
  overlay.classList.remove('is-visible');
  overlay.setAttribute('aria-hidden', 'true');
  document.documentElement.classList.remove('is-resume-open');
  setBodyScroll(false);
}

async function loadResume() {
  const overlay = buildResumeOverlay();
  const content = overlay.querySelector('#resumeContent');

  try {
    const raw = await fetchResumeText();
    content.innerHTML = `
      <header class="resume-header">
        <h1>THORIA'S MANAGEMENT</h1>
        <p class="resume-subtitle">Minecraft Server Administrator &amp; Media Manager</p>
      </header>
      ${parseResumeToHtml(raw)}
    `;
  } catch (err) {
    content.innerHTML = `<p class="resume-error">Couldn’t load the resume. Please try again later.</p>`;
    // eslint-disable-next-line no-console
    console.error(err);
  }

  openResumeOverlay(overlay);
}

function downloadResumePdf() {
  const link = document.createElement('a');
  link.href = RESUME_PDF_PATH;
  link.download = 'Thoria-Resume.pdf';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function initHireBar() {
  const bar = document.createElement('div');
  bar.className = 'hire-bar';
  bar.innerHTML = `
    <div class="hire-dock" id="hireDock">
      <button class="hire-btn" aria-label="Contact" title="Contact" data-action="contact"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><path d="m22 6-10 7L2 6"/></svg></button>
      <a class="hire-btn" aria-label="Open Discord server" title="Discord" href="https://discord.gg/ZUG3tAy9HY" target="_blank" rel="noopener" data-action="discord"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M20.3 4.4A19.8 19.8 0 0 0 15.4 3l-.25.5a18 18 0 0 1 4.3 1.4 16.5 16.5 0 0 0-15 0A18 18 0 0 1 8.85 3.5L8.6 3a19.8 19.8 0 0 0-4.9 1.4C.6 9 .1 13.5.1 18a19.8 19.8 0 0 0 6 3l.5-.7a13 13 0 0 1-2-1l.5-.36A14.2 14.2 0 0 0 12 20.4a14.2 14.2 0 0 0 6.4-1.46l.5.36a13 13 0 0 1-2 1l.5.7a19.8 19.8 0 0 0 6-3c0-4.5-.5-9-3.6-13.6zM8.3 15.3c-1 0-1.8-.9-1.8-2s.8-2 1.8-2 1.8.9 1.8 2-.8 2-1.8 2zm7.4 0c-1 0-1.8-.9-1.8-2s.8-2 1.8-2 1.8.9 1.8 2-.8 2-1.8 2z"/></svg></a>
      <button class="hire-btn" aria-label="View resume" title="Resume" data-action="resume"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6M8 13h8M8 17h8M8 9h2"/></svg></button>
      <a class="hire-btn" aria-label="GitHub" title="GitHub" href="https://github.com/thoriadevelopment" target="_blank" rel="noopener"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.58.11.79-.25.79-.56v-2.02c-3.2.7-3.88-1.54-3.88-1.54-.52-1.33-1.28-1.68-1.28-1.68-1.05-.72.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.77 2.7 1.26 3.36.96.1-.75.4-1.26.73-1.55-2.55-.29-5.24-1.28-5.24-5.69 0-1.26.45-2.29 1.19-3.1-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.18 1.18a11 11 0 0 1 2.9-.39c.98 0 1.97.13 2.9.39 2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.11 3.05.74.81 1.19 1.84 1.19 3.1 0 4.42-2.69 5.39-5.25 5.68.41.36.78 1.07.78 2.16v3.2c0 .31.21.68.8.56A10.52 10.52 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5z"/></svg></a>
    </div>
    <button class="hire-toggle" id="hireToggle" aria-pressed="false" aria-label="Open hire menu">
      <span>Hire Me</span>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:14px;height:14px;flex:none"><path d="m18 15-6-6-6 6"/></svg>
    </button>
  `;
  document.body.appendChild(bar);

  const dock = bar.querySelector('#hireDock');
  const toggle = bar.querySelector('#hireToggle');
  let open = false;

  function setOpen(v) {
    open = v;
    toggle.setAttribute('aria-pressed', open ? 'true' : 'false');
    dock.classList.toggle('visible', open);
  }

  toggle.addEventListener('click', () => setOpen(!open));

  bar.querySelectorAll('[data-action]').forEach(btn => {
    btn.addEventListener('click', () => {
      const action = btn.getAttribute('data-action');
      handleAction(action);
      if (action !== 'resume') setOpen(false);
    });
  });

  function handleAction(action) {
    if (action === 'contact') {
      if (document.documentElement.classList.contains('is-scroll-path')) {
        scrollPathTo('contact');
      } else {
        document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
      }
    } else if (action === 'resume') {
      loadResume();
    }
  }
}
