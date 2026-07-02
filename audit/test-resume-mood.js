const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.goto('http://localhost:8080', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);
  await page.click('#loader');
  await page.waitForSelector('#loader', { state: 'hidden', timeout: 10000 });
  await page.waitForTimeout(600);

  const sections = [
    { id: 'top', name: 'hero' },
    { id: 'bio', name: 'bio' },
    { id: 'experience', name: 'experience' },
    { id: 'skills', name: 'skills' },
    { id: 'contact', name: 'contact' },
  ];

  for (const sec of sections) {
    const progressMap = { hero: 0, top: 0, bio: 0.14, experience: 0.31, builds: 0.64, skills: 0.80, contact: 0.98 };
    await page.evaluate((id) => {
      const progress = { hero: 0, top: 0, bio: 0.14, experience: 0.31, builds: 0.64, skills: 0.80, contact: 0.98 }[id] ?? 0.98;
      const maxScroll = window.innerHeight * 8 - window.innerHeight;
      window.dispatchEvent(new CustomEvent('thoria-autoscroll', { bubbles: true }));
      window.scrollTo({ top: Math.round(progress * maxScroll), behavior: 'smooth' });
    }, sec.id);
    await page.waitForTimeout(1500);

    await page.click('#hireToggle');
    await page.waitForTimeout(300);
    await page.click('button[data-action="resume"]');
    await page.waitForTimeout(1200);
    await page.waitForSelector('#resumeContent .resume-header', { timeout: 10000 });

    const styles = await page.evaluate(() => {
      const overlay = document.getElementById('resumeOverlay');
      const panel = overlay?.querySelector('.resume-panel');
      const h1 = overlay?.querySelector('.resume-header h1');
      return {
        bodyMood: document.body.getAttribute('data-mood'),
        overlayBg: overlay ? getComputedStyle(overlay).backgroundColor : null,
        panelBg: panel ? getComputedStyle(panel).backgroundColor : null,
        h1Color: h1 ? getComputedStyle(h1).color : null,
      };
    });
    console.log(sec.name, styles);

    await page.screenshot({ path: `audit/resume-mood-${sec.name}.png`, fullPage: false });

    await page.click('.resume-close');
    await page.waitForTimeout(500);
  }

  await browser.close();
})();
