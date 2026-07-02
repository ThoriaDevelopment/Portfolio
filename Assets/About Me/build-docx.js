const officegen = require('officegen');
const fs = require('fs');
const path = require('path');

const raw = fs.readFileSync(path.join(__dirname, 'resume.txt'), 'utf8');
const lines = raw.split(/\r?\n/);

const docx = officegen('docx');

const styles = {
  title: { font_size: 28, bold: true, align: 'center' },
  subtitle: { font_size: 12, align: 'center', color: '666666' },
  h2: { font_size: 16, bold: true, color: '0B0D10', breakLine: true, spacing: { before: 240, after: 120 } },
  h3: { font_size: 13, bold: true, color: '1f6feb', breakLine: true, spacing: { before: 180, after: 80 } },
  para: { font_size: 11, color: '2a2f36', spacing: { after: 80 } },
  bullet: { font_size: 11, color: '2a2f36', bullet: true, spacing: { after: 40 } },
};

function stripDiscordMarkup(text) {
  return text
    .replace(/<:\w+:\d+>/g, '')
    .replace(/<@!?\d+>/g, '')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

function markdownLinkToHtml(text) {
  return text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '$1 ($2)');
}

function addText(text, style) {
  const p = docx.createP();
  p.options = style;
  p.addText(markdownLinkToHtml(stripDiscordMarkup(text)));
}

addText("THORIA'S MANAGEMENT", styles.title);
addText('Minecraft Server Administrator & Media Manager', styles.subtitle);

let inList = false;
let paragraphBuffer = '';

function flushPara() {
  if (paragraphBuffer.trim()) {
    addText(paragraphBuffer.trim(), styles.para);
    paragraphBuffer = '';
  }
}

lines.forEach((line) => {
  const trimmed = line.trim();
  if (!trimmed) {
    flushPara();
    return;
  }

  if (trimmed.startsWith('## ')) {
    flushPara();
    addText(trimmed.slice(3), styles.h2);
    return;
  }

  if (trimmed.startsWith('### ')) {
    flushPara();
    addText(trimmed.slice(4), styles.h3);
    return;
  }

  const bulletMatch = trimmed.match(/^(?:>\s*[•-]\s*|-\s+)(.*)$/);
  if (bulletMatch) {
    flushPara();
    addText(bulletMatch[1], styles.bullet);
    return;
  }

  if (paragraphBuffer) paragraphBuffer += ' ';
  paragraphBuffer += trimmed;
});
flushPara();

const outPath = path.join(__dirname, 'Thoria-Resume.docx');
const out = fs.createWriteStream(outPath);
docx.generate(out);
out.on('close', () => {
  console.log('Created:', outPath, fs.statSync(outPath).size, 'bytes');
});
out.on('error', (err) => console.error(err));
