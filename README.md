# Web Scanner

The perfect tool for web applications automated testing enhancements.
-  Collect and aggregates resources data out of the box (performance,  network, styles..)
- Configurable with simple API
- Integrates with puppeteer

## API

### `Scanner.test(opts <object>)`
   - **opts** \<object> 
	   - **url** \<string> 
	   - **callback [opt]** \<function>  callback to be called after the scan is finished
	   -  **chrome  [opt]** \<object>	   [chrome](https://github.com/GoogleChrome/chrome-launcher) process object
	   - **log  [opt]**  \<boolean> *default = false*
	   - **rules [opt]** \<object> 
		   - **userAgent** \<sting>
		   - **stopOnContentLoaded** \<boolean> *default = true*
	   Restrict load event before stop
		   - **scanTime** \<number> *default = 5* 
	   scanning time in seconds (after load event, is exists)
		   - **blockedUrls  [opt]**  \<array>
	  urls list to block (wildcard are supported)      
     - **collect  [opt]**  \<object> *default = all true* 
	     - **content** \<boolean>
		  collect scripts and css sources
	     - **scripts** \<boolean>  *default = true*
	      collect scripts information
	     - **resources** \<boolean> *default = true*
	      collect network information
	     - **styles** \<boolean> *default = true*
	      collect css information
	     - **metrics** \<boolean> *default = true*
	      collect metrics information
	     - **frames** \<boolean> *default = true*
	     collect iframes information
	     - **research** \<boolean> *default = false*
	     collect research details
	     - **serviceWorker** \<boolean> *default = true*
	     collect service workers details
	     
   **returns** \<promise|object>: scanning data Object  


### `Scanner.getPuppeteerSession (page <object>, opts <object>)` 
Register a puppeteer page for a scan
- **page**  \<object> 
	    puppeteer [page](https://github.com/GoogleChrome/puppeteer/blob/master/docs/api.md#class-page) object
 - **opts** \<object> 

**returns** \<object>: page proxy object 
- ***page.getData()***
	-  returns scanning data (*must be called call before closing the browser*)

## Examples

#### Basic scan
```javascript
Scanner.test({
    url: 'http://example.com',
    log: true,
    callback: (data) => {
        console.log('data', data);
    },
    rules: {
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/79.0.3933.0 Safari/537.36',
        stopOnContentLoaded: true,
        scanTime: 5
    },
    collect: {
        research: true,
        content: false,
        scripts: false,
        resources: false,
        styles: false,
        metrics: false,
        frames: true,
        coverage: false
    }
});
```

#### Async scan
```javascript
(async function () {
    const data = await Scanner.test({
        url: 'http://example.com',
        log: true,
        rules: {
            userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/79.0.3933.0 Safari/537.36',
            stopOnContentLoaded: true,
            scanTime: 5
        },
        collect: {
            research: true,
            content: false,
            scripts: false,
            resources: false,
            styles: false,
            metrics: false,
            frames: true,
            coverage: false
        }
    });
    console.log(data);
})();
```

#### Puppeteer integration 
 ````javascript
(async () => {
    const browser = await puppeteer.launch();
    const page = await Scanner.getPuppeteerSession(await browser.newPage(), {
        log: true,
        rules: {
            userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/79.0.3933.0 Safari/537.36',
        },
        collect: {
            research: true,
            content: false,
            scripts: true,
            resources: true,
            styles: true,
            metrics: true,
            frames: true,
            coverage: true
        }
    });

    await page.goto('http://example.com', {waitUntil: 'domcontentloaded'});
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

