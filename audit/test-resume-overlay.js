const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
  await page.goto('http://localhost:8765/index.html', { waitUntil: 'networkidle' });

  await page.waitForTimeout(3200);
  await page.evaluate(() => {
    window.dispatchEvent(new WheelEvent('wheel', { deltaY: 900, bubbles: true }));
  });
  await page.waitForTimeout(5200);

  const outDir = path.resolve(__dirname, 'shot-tmp');

  // Open hire dock and resume overlay
  await page.locator('#hireToggle').click();
  await page.waitForTimeout(300);
  await page.locator('[data-action="resume"]').click();
  await page.waitForTimeout(800);
  await page.screenshot({ path: path.join(outDir, 'resume-overlay.png'), fullPage: false });

  // Trigger PDF download and check if a file is saved
  const [download] = await Promise.all([
    page.waitForEvent('download'),
    page.locator('.resume-download').click()
  ]);
  const downloadPath = await download.path();
  const stats = fs.statSync(downloadPath);
  console.log('PDF downloaded:', download.suggestedFilename(), 'size:', stats.size, 'bytes');

  await browser.close();
  console.log('Resume overlay test complete');
})();
