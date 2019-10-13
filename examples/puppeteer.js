const puppeteer = require('puppeteer');
const Scanner = require('../src/index');

(async () => {
    const browser = await puppeteer.launch();
    const page = await Scanner.getPuppeteerSession(await browser.newPage(), {
        log: true,
        rules: {
            userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/79.0.3933.0 Safari/537.36',
        },
        collect: {
            research: true,
            content: false,
            scripts: true,
            resources: true,
            styles: true,
            metrics: true,
            frames: true,
            coverage: true
        }
    });

    await page.goto('http://example.com', {waitUntil: 'domcontentloaded'});
    const data = await page.getData();
    await browser.close();
    console.log('data', data);
})();
