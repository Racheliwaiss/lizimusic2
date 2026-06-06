
const { chromium } = require('@playwright/test');

(async () => {
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto('http://localhost:5174/');
  await page.screenshot({ path: 'ss_home.png' });
  console.log('home done');
  await browser.close();
})();
