const puppeteer = require('puppeteer');
const Scanner = require('../src/index');
const URL = 'https://example.com';

(async () => {
    const browser = await puppeteer.launch({
        args: ['--proxy-server="direct://"', '--proxy-bypass-list=*', '--disable-web-security']
    });
    const page = await Scanner.getSession(await browser.newPage(), {
        log: true,
        rules: {
            stealth: true,
            userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/79.0.3933.0 Safari/537.36',
            disableCSP: false,
            adBlocking: false,
            disableServices: false,
        },
        collect: {}
    });

    await page.goto(URL, {waitUntil: 'load'});
    await sleep(5);
    const data = await page.getSessionData();
    await browser.close();
    console.log('data', data);

    async function sleep(seconds) {
        return await new Promise(resolve => {
            setTimeout(resolve, seconds * 1000);
        });
    }
})();


