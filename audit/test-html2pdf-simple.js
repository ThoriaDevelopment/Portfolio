const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

(async () => {
  const downloadDir = path.resolve(__dirname, 'downloads');
  if (!fs.existsSync(downloadDir)) fs.mkdirSync(downloadDir);

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ acceptDownloads: true });
  const page = await context.newPage();

  await page.goto('http://localhost:8080/audit/test-html2pdf-simple.html', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);

  const [download] = await Promise.all([
    page.waitForEvent('download'),
    page.click('button'),
  ]);

  const downloadPath = path.join(downloadDir, download.suggestedFilename());
  await download.saveAs(downloadPath);
  await browser.close();

  const stats = fs.statSync(downloadPath);
  console.log('Downloaded:', downloadPath, 'Size:', stats.size, 'bytes');
  if (stats.size < 3000) {
    console.error('ERROR: Simple PDF is too small / blank');
    process.exit(1);
  } else {
    console.log('Simple PDF generated successfully.');
  }
})();
