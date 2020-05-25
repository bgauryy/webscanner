
# Web Scanner - !!WIP!!

The missing piece of web automation sessions.
WebScanner is a puppeteer extension that enriches web automation sessions with important data using advanced [chrome devtools protocol API](https://chromedevtools.github.io/devtools-protocol/)

**Collected data:**
- Resources data
- Page content
- Performance and timing metrics 
- CSS and JS coverage
- Service workers
- DOM events
- Error logs

## API

### `Scanner.getPuppeteerSession (page <object>, opts <object>)` 
Register a puppeteer page for a scan
- **page**  \<object> 
	     [puppeteer page](https://github.com/GoogleChrome/puppeteer/blob/master/docs/api.md#class-page) 
 - **opts** \<object> 

**returns** \<object>: page proxy object 
- ***page.getData()***
	-  returns scanning data (*must be called call before closing the browser*)

## Example

 ````javascript
const puppeteer = require('puppeteer');
const Scanner = require('webscanner');
const URL = 'http://example.com';

(async () => {
    const browser = await puppeteer.launch({
        args: ['--proxy-server="direct://"', '--proxy-bypass-list=*', '--disable-web-security']
    });
    let page = await browser.newPage();
    //Page can be also an object with this structure {host: <string>, port: <string>}
    //--remote-debugging-port=<debuggingPort>
    const session = await Scanner.getSession(page, {
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
    const data = await session.getData();
    await browser.close();
    console.log('data', data);

    async function sleep(seconds) {
        return await new Promise(resolve => {
            setTimeout(resolve, seconds * 1000);
        });
    }
})();
````
## API Structure (WIP)
## Data Structure (WIP)



