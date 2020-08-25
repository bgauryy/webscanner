

# WebScanner

The missing piece of web automation sessions.
px-scanner is chromium process extension that enriches automated sessions with important data using [chrome devtools protocol API](https://chromedevtools.github.io/devtools-protocol/)

**Collected data:**
- Resources data
- Page content
- Performance and timing metrics 
- CSS and JS coverage
- Service workers
- DOM events
- Error logs
...

## API

`Scanner.getSession(page <object>, opts <object>)`
Register chromium process for scanning and returns proxy to the page object
- `page`  \<object> [puppeteer page](https://github.com/GoogleChrome/puppeteer/blob/master/docs/api.md#class-page) **or** an object with the structure of {host: \<chromium host>, port: \<chromium port> (\*requires\* *--remote-debugging-port* flag)
 - `opts` \<object> 


`<page>.scanner.getData()`

returns collected data 

## Example

 ````javascript
const puppeteer = require('puppeteer');
const Scanner = require('../src/index');
const URL = 'http://example.com';

(async () => {
    const browser = await puppeteer.launch({
        args: ['--proxy-server="direct://"', '--proxy-bypass-list=*', '--disable-web-security']
    });
    let page = await browser.newPage();
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
    await sleep(5);
    const data = await page.scanner.getData();
    await browser.close();
    console.log('data', data);

    async function sleep(seconds) {
        return await new Promise(resolve => {
            setTimeout(resolve, seconds * 1000);
        });
    }
})();
````
