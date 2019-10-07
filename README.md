# Web Inspector

- events: events registration on the main page (per initiator) 
- frames in document (iframes)
- network: network requests per frame, per initiator
    
### Installing

Install dependencies
````
yarn install

cd ui
yarn install
yarn start
````

## Running
Run simple inspection

````
yarn inspect --url=https://www.example.com --uiPort=3333 --logLevel=1

````

- See results at http://localhost:3333

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
