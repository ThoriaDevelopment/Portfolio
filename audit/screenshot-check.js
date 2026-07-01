const { chromium } = require('playwright');
const path = require('path');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
  const file = path.resolve(__dirname, '..', 'index.html');
  await page.goto('file://' + file);

  // Wait for loader + settle
  await page.waitForTimeout(3000);
  await page.screenshot({ path: 'audit/screenshot-hero.png', fullPage: false });

  // Trigger door with scroll
  await page.mouse.wheel(0, 500);
  await page.waitForTimeout(1500);
  await page.screenshot({ path: 'audit/screenshot-bio.png', fullPage: false });

  await browser.close();
})();
