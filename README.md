
# Web Scanner (!!Under Construction!!)
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
      	   
   **returns** \<promise>: scanning data Object  

#### `Scanner.show(data <Object>, port <number>)`
shows results in a local server
   - data: scanning object  
  

#### `Scanner.puppeteer.setPage (page <Object>)` 

Sets puppeteer page for scanning

---

### Data

---

### Examples

- #### Puppeteer integration 
 ````
const puppeteer = require('puppeteer');
const Scanner = require('webscanner');

(async () => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    
    await Scanner.setPage(page);
    await page.goto('https://example.com');
    await page.content();
    const data = await page.getData();
    await browser.close();
})();
````
