const puppeteer = require('puppeteer');
const Scanner = require('../src/index');
const fs = require('fs');
const path = require('path');

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
        collect: {
            frames: true,
            scripts: true,
            scriptSource: true,
            scriptDOMEvents: true,
            scriptCoverage: true,
            styles: true,
            styleSource: true,
            styleCoverage: true,
            requests: true,
            responses: true,
            bodyResponse: [],
            dataURI: true,
            websocket: true,
            serviceWorker: true,
            logs: true,
            console: true,
            errors: true,
            storage: true,
            metadata: true,
            cookies: true,
            resources: true,
            JSMetrics: true
        }
    });

    await page.goto('https://perimeterx.com', {waitUntil: 'load'});
    await sleep(5);
    const data = await page.getSessionData();
    await browser.close();
    await saveData(data, path.resolve('result.json'));
})();

async function saveData(data, JSONPath) {
    return new Promise((res) => {
        fs.writeFile(JSONPath, JSON.stringify(data), function (err) {
            if (err) {
                console.log(err);
            }
            res();
        });
    });
}

async function sleep(seconds) {
    return await new Promise(resolve => {
        setTimeout(resolve, seconds * 1000);
    });
}
