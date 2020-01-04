const puppeteer = require('puppeteer');
const Scanner = require('../src/index');
const fs = require('fs');
const path = require('path');

(async () => {
    const browser = await puppeteer.launch({
        args: ['--proxy-server="direct://"', '--proxy-bypass-list=*', '--disable-web-security']
    });
    const page = await Scanner.getSession(await browser.newPage(), {
            network: {
                requests: true,
                content: true,  //headers, body
                dataURI: true, //ignore dataURL
                websocket: true,
                cookies: true,
            },
            frames: {
                resources: true,
            },
            workers: {
                content: true,
                workers: true,
                worklets: true,
                serviceWorkers: true,
            },
            css: {
                content: true,
                coverage: true, //style and script coverage
            },
            script: {
                content: true,  //headers, body
                coverage: true, //style and script coverage
            },
            storage: {
                webStorage: true,//localStorage, sessionStorage
                indexedDB: true,
            },
            monitor: {
                errors: true,
                console: true,
                logs: true,
            },
            dom: {
                events: true,
                snapshots: true
            },
            performance: {
                metrics: true
            }
        }, {
            log: true,
            stealth: true,
            userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/79.0.3933.0 Safari/537.36',
            disableCSP: true,
            adBlocking: true,
            disableServices: true,
        }
    );

    await page.goto('https://example.com', {waitUntil: 'load'});
    await sleep(10);
    const data = await page.getData();
    debugger;
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
