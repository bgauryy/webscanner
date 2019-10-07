const puppeteer = require('puppeteer');
const scanner = require('webscanner');

(async () => {
    const browser = await puppeteer.launch({
        headless: true
    });
    const page = await browser.newPage();
    const scannerObj = await scanner.setPage(page);

    await page.goto('https://example.com');
    await page.content();
    const data = await scannerObj.getData();
    await browser.close();

    console.log(data);
})();
