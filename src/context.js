const CRI = require('chrome-remote-interface');
const url = require('url');

const defaultConfiguration = {
    log: false,
    //rules
    stealth: true,
    disableServices: false, //Disable common third party services
    blockedUrls: [], //Set chrome blocked urls
    adBlocking: false, //Enable ad blocking feature
    disableCSP: false, //Disable browser CSP blocking
    logsThreshold: 50, //default logs threshold
    //collect
    frames: true,
    network: true,
    style: true,
    scripts: true,
    metadata: true,
    storage: true,
    monitoring: true,
    performance: false, //experimental
    //metadata
    domEvents: false,
    content: true,
    coverage: false,
    networkContent: false,
    dataURI: false,
    bodyResponse: [],
    //Events
};

async function getContext(page, configuration = {}) {
    if (!page) {
        throw new Error('page is missing');
    }
    return {
        client: await getChromeClient(page),
        configuration: {...defaultConfiguration, ...configuration},
        data: getDataObject(),
        ignoredScripts: {}
    };
}

async function getChromeClient(page) {
    if (page.hostname && page.port) {
        return await CRI({host: page.hostname, port: page.port});
    } else {
        const connection = page._client._connection._url;
        const {hostname, port} = url.parse(connection, true);

        return await CRI({host: hostname, port});
    }
}

function getDataObject() {
    return {
        scripts: [],
        requests: [],
        responses: [],
        frames: {},
        serviceWorker: {},
        webSockets: {},
        monitoring: {},
        storage: {},
        styles: {},
        metrics: null,
    };
}

module.exports = {
    getContext
};
