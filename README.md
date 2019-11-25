
# Web Scanner

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
(async () => {
    const browser = await puppeteer.launch({
        args: ['--proxy-server="direct://"', '--proxy-bypass-list=*', '--enable-precise-memory-info']
    });
    const page = await Scanner.getSession(await browser.newPage(), {
        log: false,
        rules: {
            stealth: true,
            userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/79.0.3933.0 Safari/537.36',
            disableCSP: false,
            adBlocking: false,
            disableServices: false,
	    logsThreshold: 50,
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
            cookies: true,
        }
    });
    const url = 'https://example.com';
    await page.goto(url, {waitUntil: ['domcontentloaded', 'load'], timeout: 0});
    //<Your Automation Code>
    const data = await page.getData();
    await browser.close();
})();
````

## Scanning Object  Structure (WIP)
- **log** \<boolean> enable console logging 
- **rules**\<object>
  - **userAgent** \<string> automation user agent
  - **disableCSP**  \<boolean> disable CSP restriction
  - **adBlocking** \<boolean> enable ad blocking feature
  - **disableServices** \<boolean> disable common third party services 
- **collect** <obj>
	- **frames** \<boolean> Collect iframes
	- **scripts** \<boolean> Collect scripts
	- **scriptSource**\<boolean> Get scripts sources
	- **scriptDOMEvents**\<boolean> DOM Events registration
	- **scriptCoverage**\<boolean> Calculate scripts coverage
	- **styles**\<boolean> Collect CSS 
	- **styleSource**\<boolean>  Get CSS sources
	- **styleCoverage**\<boolean>  Calculate CSS coverage
	- **serviceWorker**\<boolean> Collect Service workers data
	- **requests**\<boolean> Collect page requests data
	- 	**dataURI**\<boolean>, //Collect data URI requests (returns url hash)
	- **responses**\<boolean>  Collect responses 
	- **bodyResponse**: [\<string>]  Collects response body (by *src/dest* regex array)
	- **websocket**\<boolean> Collect websocket connections
	- **cookies**\<boolean>  Returns all cookies from the page
	- **storage**\<boolean> Collect localStorage and sessionStorage entities
	- **logs**\<boolean> Collect browser logs 
	- **console**\<boolean> Collect console API usage
	- **errors**\<boolean> Collect unhandled page errors

## Received Data Structure (WIP)



