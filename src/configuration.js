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
    style: false,
    scripts: false,
    metadata: false,
    storage: false,
    monitoring: false,
    performance: false, //experimental
    //metadata
    domEvents: false,
    content: false,
    coverage: false,
    networkContent: false,
    dataURI: false,
    bodyResponse: [],
    //Events
};

function getConfiguration(page, configuration = {}) {
    if (!page) {
        throw new Error('page is missing');
    }
    return {
        page,
        ...defaultConfiguration,
        ...configuration
    };
}

module.exports = {
    getConfiguration
};
