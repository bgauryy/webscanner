



# Web Scanner

Advanced tool for web applications scanning

### Use cases:
- Gather resources information (all resources from all frames...)
- Network information (headers, length, response, security, ip analysis...)
- Performance metrics (timing, rendering, heap size...)
- Scripts information
- Style sheets information
- Get advanced details using client plugins
- Enrich automation data

---

### API

#### `Scanner.scan({opts})`
   - **url** \<sting> 
   - **callback [opt]** \<function>
   callback to be called after the scan is finished. if not exists, a promise will be returned
   - **userAgent [opt]** \<sting>
   - **stopOnContentLoaded** \<boolean> *default = true*
   Restrict load event before stop
   - **scanTime** \<number> *default = 5* 
   scanning time in seconds (after load event, is exists)
   -  **chrome  [opt]** \<object>
   [chrome](https://github.com/GoogleChrome/chrome-launcher) configuration object
   - **logLevel  [opt]**  \<boolean> *default = 'all'*
      'all' | 'debug' | 'info' | 'warn' | 'error' | 'none'
   - **blockedUrls  [opt]**  \<Array>
  urls list to block (wildcard are supported)      
      
      
      	   
   **returns** \<promise>: scanning data Object  


#### `Scanner.setPuppeteerPage (page <Object>)` 
Register a puppeteer page for a scan
`Page` object will be enhanced with `page.getData` function, which returns the data object
- [page](https://github.com/GoogleChrome/puppeteer/blob/master/docs/api.md#class-page)

#### `Scanner.show (data, port)` 
Preview scanning data (on localhost:port)
   - **data**  \<Object> 
   scanning data object
   - **port**  \<number>  *default = 3333*

---

### Data (TBD)

---

### Examples

#### Basic scan
```javascript
const Scanner = require('webscanner');

Scanner.scan({
    url: 'http://example.com',
    callback: (data) => {
        Scanner.show(data);
    },
    stopOnContentLoaded: true,
    scanTime: 6,
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/77.0.3865.90 Safari/537.36',
    chrome: {},
    logLevel: 'all'
});

```

#### Async scan
```javascript
const Scanner = require('webscanner');

(async function () {
    const data = await Scanner.scan({
        url: 'http://example.com',
        stopOnContentLoaded: true,
        scanTime: 6,
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/77.0.3865.90 Safari/537.36',
        chrome: {},
        logLevel: 'debug'
    });
    Scanner.show(data);
})();
```

#### Puppeteer integration 
 ````javascript
const puppeteer = require('puppeteer');
const Scanner = require('webscanner');

(async () => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    await Scanner.setPuppeteerPage(page);
    await page.goto('https://example.com');
    await page.content();
    const data = await page.getData();
    await browser.close();

    Scanner.show(data);
})();

````
