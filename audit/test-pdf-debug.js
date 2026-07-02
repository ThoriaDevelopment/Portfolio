const { chromium } = require('playwright');
const path = require('path');

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

  // Open resume overlay
  await page.locator('#hireToggle').click();
  await page.waitForTimeout(300);
  await page.locator('[data-action="resume"]').click();
  await page.waitForTimeout(800);

  // Inject debug: make the PDF source visible instead of off-screen
  await page.evaluate(() => {
    const original = window.downloadResumePdf;
  });

  // Build the source manually via console and screenshot it
  const hasSource = await page.evaluate(() => {
    const content = document.getElementById('resumeContent');
    if (!content) return false;
    const source = document.createElement('div');
    source.className = 'resume-pdf-source';
    source.innerHTML = content.innerHTML;
    source.style.position = 'absolute';
    source.style.left = '50px';
    source.style.top = '50px';
    source.style.zIndex = '99999';
    source.id = 'debugPdfSource';
    document.body.appendChild(source);
    return true;
  });

  if (hasSource) {
    await page.waitForTimeout(500);
    await page.screenshot({ path: path.join(outDir, 'resume-pdf-source-debug.png'), fullPage: false });
  }

  await browser.close();
  console.log('PDF source debug shot saved');
})();
