# Web Inspector (This is still under Development!!!)

Simple tool that enables inspect websites behavior remotely using chrome dev tools API
https://chromedevtools.github.io/devtools-protocol

Inspection results:

- scripts: scripts in the page (per frame)
- events: events registration on the main page (per initiator) 
- frames in document (iframes)
- network: network requests per frame, per initiator
    
### Installing

Install dependencies
````
yarn install
````

## Running
Run simple inspection

````
yarn inspect -u https://perimeterx.com

````

- See results at http://localhost:3333

Run advanced inspection

````  
yarn inspect -u [URL] -ua [USER-AGENT] -rp [RESULTS_PORT] -x [true/false]

````

- URL (u): Test URL (default 'https://www.example.com')
- Disable PX scripts (x)  default false
- User Agent (ua): User agent for the test (default 'pxWebInspector')
- Results Port (rp): Port for results view (default 3333)


## Usage 

![](../../../IdeaProjects/pxWebInspector/assets/installPX.gif)

## View Results

![](../../../IdeaProjects/pxWebInspector/assets/localhost.gif)


## Future features
- set default cookie on domain
- crawl
- fuzz
- add elements
- UI API
- Improved CLI
- Better protocol
- Execute Chrome on any host/port and enable execution on local chrome 
- Enable go behind proxy
- UI control (dispatch registered events)
- Screenshots  
- Network blocks (explicit, wildcard)
- Run as service
- add fake JS fingerpint
- Add hook for Regex check (for location.href)
- Add full stack for events
- Dockerize solution
- Disable define properties
