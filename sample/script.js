const puppeteer = require('puppeteer');
const Scanner = require('../src/index');
const url = require('url');
const URL = 'http://example.com';

(async () => {
    const browser = await puppeteer.launch({
        args: ['--proxy-server="direct://"', '--proxy-bypass-list=*', '--disable-web-security']
    });
    let page = await browser.newPage();
    page = await Scanner.getSession(page, {
        stealth: true,
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/79.0.3933.0 Safari/537.36',
        disableCSP: true,
        adBlocking: false,
        disableServices: false,
        performance: true,
        scripts: true,
        content: true
    });

    await page.goto(URL, {waitUntil: 'load'});
    await sleep(5);
    const data = await page.scanner.getData();

    const requests = {};
    for (let i = 0; i < data.network.requests.length; i++) {
        try {
            const request = data.network.requests[i];
            const obj = url.parse(request.url);
            requests[obj.host] = requests[obj.host] || [];
            requests[obj.host].push(request);
        } catch (e) {
            //ignore
        }
    }

    await browser.close();

    async function sleep(seconds) {
        return await new Promise(resolve => {
            setTimeout(resolve, seconds * 1000);
        });
    }
})();


