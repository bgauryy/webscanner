const puppeteer = require('puppeteer');
const Scanner = require('../src/index');

(async () => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    await Scanner.setPuppeteerPage(page, {compress: false});
    await page.goto('https://example.com/', {waitUntil: 'domcontentloaded'});
    const data = await page.getData();
    await browser.close();

    console.log('data', data);
})();
