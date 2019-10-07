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
    await page.screenshot({path: 'screenshot.png'});

    console.log(scannerObj.data);

    await browser.close();
})();
