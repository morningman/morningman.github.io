import pkg from '/Users/morningman/Tools/node/node-v23.9.0-darwin-arm64/lib/node_modules/playwright/index.js';
const { chromium } = pkg;

const [,, url, out, theme] = process.argv;
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1400, height: 900 } });
await page.goto(url);
await page.evaluate((t) => document.documentElement.setAttribute('data-theme', t), theme);
await page.waitForTimeout(1500);
await page.screenshot({ path: out, fullPage: true });
await browser.close();
console.log('wrote', out);
