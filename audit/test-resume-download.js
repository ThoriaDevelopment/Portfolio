const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

(async () => {
  const downloadDir = path.resolve(__dirname, 'downloads');
  if (!fs.existsSync(downloadDir)) fs.mkdirSync(downloadDir);

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ acceptDownloads: true });
  const page = await context.newPage();

  await page.goto('http://localhost:8080', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);

  // Dismiss the interactive loader (clicking opens the door)
  await page.click('#loader');
  await page.waitForSelector('#loader', { state: 'hidden', timeout: 10000 });
  await page.waitForTimeout(600);

  // Scroll to a section where the resume is likely to be dark text on light bg
  await page.evaluate(() => {
    const skills = document.getElementById('skills');
    if (skills) skills.scrollIntoView();
  });
  await page.waitForTimeout(800);

  // Open the hire dock
  await page.click('#hireToggle');
  await page.waitForTimeout(300);

  // Open the resume overlay
  await page.click('button[data-action="resume"]');
  await page.waitForTimeout(1200);

  // Wait for resume content to load
  await page.waitForSelector('#resumeContent .resume-header', { timeout: 10000 });

  // Click download and wait for download
  const [download] = await Promise.all([
    page.waitForEvent('download'),
    page.click('.resume-download'),
  ]);

  const downloadPath = path.join(downloadDir, download.suggestedFilename());
  await download.saveAs(downloadPath);
  await browser.close();

  const stats = fs.statSync(downloadPath);
  console.log('Downloaded:', downloadPath, 'Size:', stats.size, 'bytes');

  if (stats.size < 5000) {
    console.error('ERROR: PDF is too small / likely blank');
    process.exit(1);
  } else {
    console.log('PDF generated successfully.');
  }
})();
