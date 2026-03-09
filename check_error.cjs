const puppeteer = require('puppeteer');

(async () => {
  try {
    const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox', '--disable-setuid-sandbox'] });
    const page = await browser.newPage();
    const errors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push("CONSOLE ERRR: " + msg.text());
      }
    });
    page.on('pageerror', err => {
      errors.push("PAGE ERR: " + err.toString());
    });
    await page.goto('http://localhost:5173', { waitUntil: 'networkidle2', timeout: 30000 });
    console.log("ERRORS DETECTED:\n", errors.join("\n"));
    await browser.close();
  } catch (e) {
    console.error(e);
  }
})();
