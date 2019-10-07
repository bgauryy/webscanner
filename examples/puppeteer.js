const puppeteer = require('puppeteer');
const Scanner = require('webscanner');

(async () => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    await Scanner.setPage(page);
    await page.goto('https://example.com');
    await page.content();
    const data = await page.getData();
    await browser.close();
})();
