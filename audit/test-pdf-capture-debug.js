const { chromium } = require('playwright');
const fs = require('fs');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  // Intercept html2pdf calls to capture the source element
  await page.addInitScript(() => {
    window.__pdfSources = [];
    const origHtml2pdf = window.html2pdf;
    Object.defineProperty(window, 'html2pdf', {
      get() {
        return function(...args) {
          const chain = {
            set(opts) { window.__pdfOptions = opts; return this; },
            from(src) {
              window.__pdfSources.push(src);
              // Don't actually generate; return a save promise that resolves
              return { save: () => Promise.resolve() };
            }
          };
          return chain;
        };
      },
      configurable: true
    });
  });

  await page.goto('http://localhost:8080', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);
  await page.click('#loader');
  await page.waitForSelector('#loader', { state: 'hidden', timeout: 10000 });
  await page.waitForTimeout(600);

  await page.evaluate(() => document.getElementById('skills')?.scrollIntoView());
  await page.waitForTimeout(800);
  await page.click('#hireToggle');
  await page.waitForTimeout(300);
  await page.click('button[data-action="resume"]');
  await page.waitForTimeout(1200);
  await page.waitForSelector('#resumeContent .resume-header', { timeout: 10000 });

  await page.click('.resume-download');
  await page.waitForTimeout(800);

  const info = await page.evaluate(() => {
    const sources = window.__pdfSources;
    return sources.map(s => ({
      nodeName: s?.nodeName,
      className: s?.className,
      innerHTMLLength: s?.innerHTML?.length,
      textLength: s?.textContent?.length,
      childCount: s?.children?.length,
      styles: s ? {
        position: s.style.position,
        left: s.style.left,
        top: s.style.top,
        zIndex: s.style.zIndex,
        width: s.style.width,
        display: getComputedStyle(s).display,
        visibility: getComputedStyle(s).visibility,
        opacity: getComputedStyle(s).opacity
      } : null
    }));
  });
  console.log('Captured sources:', JSON.stringify(info, null, 2));

  await browser.close();
})();
