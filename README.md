# Web Scanner


![](./assets/img.jpg)

                                 ___
                         /======/
                ____    //      \___       ,/
                 | \\  //           :,   ./
         |_______|__|_//            ;:; /
        _L_____________\o           ;;;/





Simple API for automated scanning of web applications

 
 # API
 
 
 # Data
 
 
    
# Usage


## [puppeteer](https://github.com/GoogleChrome/puppeteer) Support
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

### Ongoing features    
- Workers
- Service Workers
- Client plugins
    - API
    - Add scripts
    - Object API / Proxy / Reflect
    - client cookies
    - disabled network
    - Errors 
- Enhance API
    - Stealth mode
    - Self execution    
    - CLI
    - data compression
- Style data
- Frame data
- Scripts
    - Performance metrics
    - Coverage metrics
- Network
    - Network
    - more data
- Add raw data
- Release notes
- Tests
- Network blocks (explicit, wildcard)
- Find patterns in scripts (?)


