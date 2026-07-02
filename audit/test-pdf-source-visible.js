const { chromium } = require('playwright');
const fs = require('fs');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.goto('http://localhost:8080', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);
  await page.click('#loader');
  await page.waitForSelector('#loader', { state: 'hidden', timeout: 10000 });
  await page.waitForTimeout(600);

  // Scroll to skills section and open resume
  await page.evaluate(() => document.getElementById('skills')?.scrollIntoView());
  await page.waitForTimeout(800);
  await page.click('#hireToggle');
  await page.waitForTimeout(300);
  await page.click('button[data-action="resume"]');
  await page.waitForTimeout(1200);
  await page.waitForSelector('#resumeContent .resume-header', { timeout: 10000 });

  // Watch for the hidden source element and reveal it as soon as it appears
  await page.evaluate(() => {
    window.__pdfSourceRevealed = false;
    const obs = new MutationObserver(() => {
      const s = document.querySelector('.resume-pdf-source');
      if (s && !window.__pdfSourceRevealed) {
        window.__pdfSourceRevealed = true;
        s.style.zIndex = '100000';
        s.style.opacity = '1';
        s.style.pointerEvents = 'none';
      }
    });
    obs.observe(document.body, { childList: true, subtree: true });
  });

  // Trigger download so the source is created
  await Promise.all([
    page.waitForEvent('download', { timeout: 30000 }),
    page.click('.resume-download'),
  ]);
  await page.waitForTimeout(1200);
  await page.waitForTimeout(500);
  await page.screenshot({ path: 'audit/test-pdf-source-visible.png', fullPage: false });

  // Also report its dimensions
  const dims = await page.evaluate(() => {
    const s = document.querySelector('.resume-pdf-source');
    return s ? { width: s.offsetWidth, height: s.offsetHeight, textLength: s.textContent.length } : null;
  });
  console.log('Source dimensions:', dims);

  await browser.close();
})();
