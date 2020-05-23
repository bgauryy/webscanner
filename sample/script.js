const puppeteer = require('puppeteer');
const Scanner = require('../dist/index.cjs.js');
const URL = 'http://example.com';

debugger;
/*(async () => {
    const browser = await puppeteer.launch({
        headless: false,
        args: ['--proxy-server="direct://"', '--proxy-bypass-list=*', '--disable-web-security']
    });
    let page = await browser.newPage();
    //Page can be also an object with this structure {host: <string>, port: <string>}
    //--remote-debugging-port=<debuggingPort>
    page = await Scanner.getSession(page, {
        stealth: true,
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/79.0.3933.0 Safari/537.36',
        disableCSP: false,
        adBlocking: false,
        disableServices: false,
        scripts: true,
        content: true
    });

    await page.goto(URL, {waitUntil: 'load'});
    await sleep(1);
    const data = await page.getSessionData();
    await browser.close();
    console.log('data', data);

    async function sleep(seconds) {
        return await new Promise(resolve => {
            setTimeout(resolve, seconds * 1000);
        });
    }
})();*/


