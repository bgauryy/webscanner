
# Web Scanner (!!UNDER CONSTRUCTION!!)

The perfect tool for web applications automated testing enhancements.
-  Collect and aggregates resources data out of the box (performance,  network, styles..)
- Configurable with simple API
- Integrates with puppeteer

## API

### `Scanner.test(opts <object>)`
   - **opts** \<object> 
	   - **url** \<string> 
	   - **callback [opt]** \<function>
	   callback to be called after the scan is finished
	   - **userAgent [opt]** \<sting>
	   - **stopOnContentLoaded** \<boolean> *default = true*
	   Restrict load event before stop
	   - **scanTime** \<number> *default = 5* 
	   scanning time in seconds (after load event, is exists)
	   -  **chrome  [opt]** \<object>
	   [chrome](https://github.com/GoogleChrome/chrome-launcher) configuration object
	   - **logLevel  [opt]**  \<boolean> *default = 'all'*
	      'all' | 'debug' | 'info' | 'warn' | 'error' | 'none'
	   - **blockedUrls  [opt]**  \<array>
	  urls list to block (wildcard are supported)      
	    - **compress  [opt]**  \<boolean> *default = false
	Compress scanning data object to `Uint8Array` array

   **returns** \<promise>: scanning data Object  


### `Scanner.setPuppeteerPage (page <object>, opts <object>)` 
Register a puppeteer page for a scan
- **page**  \<object> 
	    puppeteer [page](https://github.com/GoogleChrome/puppeteer/blob/master/docs/api.md#class-page) object
 - **opts** \<object> 
	- **compress  [opt]**  \<boolean> *default = false
	Compress scanning data object to `Uint8Array` array
	 - **logLevel  [opt]**  \<boolean> *default = 'none'*
	      'all' | 'debug' | 'info' | 'warn' | 'error' | 'none'
     - **blockedUrls  [opt]**  \<array>
	  urls list to block (wildcard are supported)      

## Client Plugins (!!WIP!!)
dedicated JS client code that will  be integrated into each test for extra data


## Examples

#### Basic scan
```javascript
const Scanner = require('webscanner');

Scanner.test({
    url: 'http://example.com',
    callback: (data) => {
        console.log(data)
    },
    stopOnContentLoaded: true,
    scanTime: 6,
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/77.0.3865.90 Safari/537.36'
});
```

#### Async scan
```javascript
const Scanner = require('webscanner');

(async function () {
    const data = await Scanner.test({
        url: 'http://example.com',
        stopOnContentLoaded: true,
        scanTime: 6
    });
    console.log(data);
})();
```

#### Puppeteer integration 
 ````javascript
const puppeteer = require('puppeteer');
const Scanner = require('webscanner');

(async () => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    await Scanner.setPuppeteerPage(page, {compress: false});
    await page.goto('https://example.com/', {waitUntil: 'domcontentloaded'});
    const data = await page.getData();
    await browser.close();

    console.log('data', data);
})();

````

## Scanning Object  Structure

#### scripts \<array>
- scriptId
- url
- host
- pathname
- port
- path
- query
- isModule 
- source 
- frameURL 
- stackTrace
 -parentScript

#### resources \<array>
- requestId
- url
- host
- pathname
- port
- path
- query
- documentURL
- frame
- timestamp
- initiator
- response
	- status
	- method
	- headers
	- mimeType
	- connectionReused
	- remoteIPAddress
	- ip
	- timezone
	- remotePort
	- fromServiceWorker
	- fromPrefetchCache
	- fromDiskCache
	- encodedDataLength
	- protocol
	- securityState
	- timing
		- requestTime
		- proxyStart
		- proxyEnd
		- dnsStart
		- dnsEnd
		- connectStart
		- connectEnd
		- sslStart
		- sslEnd
		- workerStart
		- workerReady
		- sendStart
		- sendEnd
		- pushStart
		- pushEnd
		- receiveHeadersEnd
	- securityDetails
		- protocol
		- keyExchange
		- keyExchangeGroup
		- cipher
		- certificateId
		- subjectName
		- sanList \<array>
		- issuer
		- validFrom
		- validTo
		- signedCertificateTimestampList
		- certificateTransparencyCompliance

#### styleSheets \<array>
- styleSheetId
- frameId
- sourceURL
- url
- host
- pathname
- port
- path
- origin
- title
- ownerNode
- disabled
- isInline
- startLine
- startColumn
- length
- source

#### frames \<array>
- frameId
- parentFrameId
- state
- url
- host
- pathname
- port
- path
- query
- securityOrigin
- mimeType
- stack

#### metrics \<object>
- Timestamp
- AudioHandlers
- Documents
- Frames
- JSEventListeners
- LayoutObjects
- MediaKeySessions
- MediaKeys
- Nodes
- Resources
- ContextLifecycleStateObservers
- V8PerContextDatas
- WorkerGlobalScopes
- UACSSResources
- RTCPeerConnections
- ResourceFetchers
- AdSubframes
- DetachedScriptStates
- LayoutCount
- RecalcStyleCount
- LayoutDuration
- RecalcStyleDuration
- ScriptDuration
- V8CompileDuration
- TaskDuration
- TaskOtherDuration
- ThreadTime
- JSHeapUsedSize
- JSHeapTotalSize
- FirstMeaningfulPaint
- DomContentLoaded
- NavigationStart
