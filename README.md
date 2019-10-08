
# Web Scanner

!!Under Construction!!

                                 ___
                         /======/
                ____    //      \___       ,/
                 | \\  //           :,   ./
         |_______|__|_//            ;:; /
        _L_____________\o           ;;;/
        
Advanced tool for web applications scanning

### Use cases:
- Gather resources information (all resources from all frames...)
- Network information (headers, length, response, security, ip analysis...)
- Performance metrics (timing, rendering, heap size...)
- Scripts information
- Style sheets information
- Get advanced details using client plugins
- Enrich automation data

### API

#### `Scanner.run(opts <object>)`
- url \<string\>
- userAgent
- logLevel
    -  0: all (default)
    - 1: debug
    - 2: info
    - 3: warn
    - 4: error
    - 5: none
- [chrome](https://github.com/GoogleChrome/chrome-launcher)
	 -   port
	 -   chromeFlags
	 -   handleSIGINT
     -  chromePath
     -  userDataDir
     -  startingUrl
     -  logLeve
     -   ignoreDefaultFlags
	 -   connectionPollInterval
     -   envVars
     -   maxConnectionRetries

#### `Scanner.puppeteer`

- setPage ([page](https://github.com/GoogleChrome/puppeteer/blob/master/docs/api.md#class-page)) 

Sets puppeteer page for scanning

*Example:*
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


