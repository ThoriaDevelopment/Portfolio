const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');
const { execSync } = require('child_process');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
  await page.goto('http://localhost:8765/index.html', { waitUntil: 'domcontentloaded' });

  const shots = [];
  const shotDir = path.resolve(__dirname, 'shot-tmp');
  fs.mkdirSync(shotDir, { recursive: true });

  const t0 = Date.now();
  const captureAt = async (name, msFromStart) => {
    const delay = Math.max(0, msFromStart - (Date.now() - t0));
    if (delay) await page.waitForTimeout(delay);
    const p = path.join(shotDir, `${name}.png`);
    await page.screenshot({ path: p, fullPage: false });
    shots.push(p);
  };

  const setProgress = async (progress, settle = 900) => {
    await page.evaluate((p) => {
      const track = document.getElementById('scroll-track') || document.body;
      const max = track.scrollHeight - window.innerHeight;
      window.scrollTo(0, p * max);
    }, progress);
    await page.waitForTimeout(settle);
  };

  // 1. Loader while it is still visible (~700 ms after navigation)
  await captureAt('01-loader', 700);

  // Wait for the loader intro animation to finish (~2.5 s), then open the door.
  await page.waitForTimeout(2600);
  await page.evaluate(() => {
    window.dispatchEvent(new WheelEvent('wheel', { deltaY: 900, bubbles: true }));
  });

  // 2. Door hold (~2.2 s after the wheel event — MANAGEMENT fully visible)
  await captureAt('02-door', Date.now() - t0 + 2200);

  // 3. Hero after the door has fully opened (~4.8 s after the wheel event)
  await captureAt('03-hero', Date.now() - t0 + 4800);

  // 4. Bio (center of the bio phase)
  await setProgress(0.27, 900);
  await captureAt('04-bio', Date.now() - t0 + 900 + 100);

  // 5. Experience — top of the scrollable content
  await setProgress(0.46, 900);
  await captureAt('05-experience-top', Date.now() - t0 + 900 + 100);

  // 6. Experience — bottom of the scrollable content (VoidSent + proof tabs)
  await setProgress(0.62, 900);
  await captureAt('06-experience-bottom', Date.now() - t0 + 900 + 100);

  // 7. Builds (Kleos stage, before cross-fade swap)
  await setProgress(0.70, 900);
  await captureAt('07-builds', Date.now() - t0 + 900 + 100);

  // 8. Skills (near bottom so references are visible)
  await setProgress(0.90, 900);
  await captureAt('08-skills', Date.now() - t0 + 900 + 100);

  // 9. Contact
  await setProgress(0.96, 900);
  await captureAt('09-contact', Date.now() - t0 + 900 + 100);

  await browser.close();

  // Build 3x3 grid (3840x2160)
  const output = path.resolve(__dirname, 'screenshot-contact-sheet.png');
  const inputs = shots.map((s) => `-i "${s}"`).join(' ');
  const layout = shots.map((_, i) => {
    const x = (i % 3) * 1280;
    const y = Math.floor(i / 3) * 720;
    return `${x}_${y}`;
  }).join('|');
  const maps = shots.map((_, i) => `[${i}:v]`).join('');
  const cmd = `ffmpeg -y ${inputs} -filter_complex "${maps}xstack=inputs=${shots.length}:layout=${layout}" -frames:v 1 -update 1 "${output}"`;
  execSync(cmd, { stdio: 'inherit' });

  fs.rmSync(shotDir, { recursive: true, force: true });
  console.log('Batched screenshot saved to', output);
})();
