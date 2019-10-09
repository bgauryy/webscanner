const puppeteer = require('puppeteer');
const Scanner = require('../src/index');

(async () => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    await Scanner.setPuppeteerPage(page);
    await page.goto('https://perimeterx.com');
    await page.content();
    const data = await page.getData();
    await browser.close();

    console.log(data);
})();
