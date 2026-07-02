const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

(async () => {
  const pdfPath = path.resolve(__dirname, 'downloads', 'Thoria-Resume.pdf');
  if (!fs.existsSync(pdfPath)) {
    console.error('PDF not found');
    process.exit(1);
  }

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  await page.goto('http://localhost:8080/audit/downloads/Thoria-Resume.pdf', { waitUntil: 'networkidle' });
  await page.waitForTimeout(3000);

  // Screenshot the first page of the PDF viewer
  await page.screenshot({ path: 'audit/test-pdf-preview.png', fullPage: false });
  console.log('Saved preview to audit/test-pdf-preview.png');

  // Try to get page count from the viewer title or DOM
  const title = await page.title();
  console.log('Page title:', title);

  await browser.close();
})();
