const { chromium } = require('playwright');

(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1280, height: 720 } });
  await p.goto('http://localhost:8765/index.html', { waitUntil: 'domcontentloaded' });
  await p.waitForTimeout(3000);
  await p.evaluate(() => window.dispatchEvent(new WheelEvent('wheel', { deltaY: 900, bubbles: true })));
  await p.waitForTimeout(4000);

  const set = async (progress) => {
    await p.evaluate((pr) => {
      const track = document.getElementById('scroll-track') || document.body;
      const max = track.scrollHeight - window.innerHeight;
      window.scrollTo(0, pr * max);
    }, progress);
    await p.waitForTimeout(1200);
  };

  for (const pr of [0.07, 0.14, 0.23, 0.31, 0.47, 0.60, 0.64, 0.70, 0.78, 0.85, 0.92, 0.99]) {
    await set(pr);
    const state = await p.evaluate(() => ({
      scrollY: window.scrollY,
      maxScroll: document.getElementById('scroll-track').scrollHeight - window.innerHeight,
      camera: document.getElementById('camera').style.transform,
      mood: document.body.getAttribute('data-mood')
    }));
    console.log(pr.toFixed(2), state);
  }
  await b.close();
})();
