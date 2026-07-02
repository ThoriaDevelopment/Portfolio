const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.goto('http://localhost:8080', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);
  await page.click('#loader');
  await page.waitForSelector('#loader', { state: 'hidden', timeout: 10000 });
  await page.waitForTimeout(600);

  for (const id of ['top', 'bio', 'experience', 'skills', 'contact']) {
    await page.evaluate((id) => {
      const el = document.getElementById(id);
      if (el) el.scrollIntoView();
    }, id);
    await page.waitForTimeout(2000);
    const info = await page.evaluate(() => {
      const camera = document.getElementById('camera');
      return {
        bodyMood: document.body.getAttribute('data-mood'),
        htmlClasses: document.documentElement.className,
        cameraTransform: camera ? getComputedStyle(camera).transform : null,
        scrollY: window.scrollY,
      };
    });
    console.log(id, info);
  }

  await browser.close();
})();
