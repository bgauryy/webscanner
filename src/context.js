const DEFAULT_COLLECT_CONFIGURATION = {
    network: {
        requests: true,
        content: false,  //headers, body
        dataURI: false, //ignore dataURL
        websocket: false,
        cookies: false,
    },
    frames: {
        resources: false,
    },
    workers: {
        content: false,
        workers: false,
        worklets: false,
        serviceWorkers: false,
    },
    css: {
        content: false,
        coverage: false, //style and script coverage
    },
    script: {
        content: false,  //headers, body
        coverage: false, //style and script coverage
    },
    storage: {
        webStorage: false,//localStorage, sessionStorage
        indexedDB: false,
    },
    monitor: {
        errors: false,
        console: false,
        logs: false,
        logsThreshold: 50, //default logs threshold time
    },
    dom: {
        events: false,
        snapshots: false
    },
    performance: {
        metrics: false
    }
};

const DEFAULT_RULES_CONFIGURATION = {
    log: false,
    stealth: true, //TODO: scramle headers
    disableServices: false, //Disable common third party services
    blockedUrls: [], //Set chrome blocked urls
    adBlocking: false, //Enable ad blocking feature
    disableCSP: false, //Disable browser CSP blocking
};

/**
 * Creating scanning context
 * @param page {object} Puppeteer Page object
 * @param collectConf {object} WebScanner scanning collection configuration
 * @param rulesConf {object} WebScanner rules configuration
 * @return {object}
 */
function createContext(page, collectConf = {}, rulesConf = {}) {
    if (!page) {
        throw new Error('Page object is missing');
    }
    const context = {
        page, ...{
            rules: {...DEFAULT_RULES_CONFIGURATION},
            collect: {...DEFAULT_COLLECT_CONFIGURATION}
        }
    };

    for (const prop in DEFAULT_COLLECT_CONFIGURATION) {
        context.collect[prop] = {...collectConf[prop], ...DEFAULT_COLLECT_CONFIGURATION[prop]};
    }
    for (const prop in DEFAULT_RULES_CONFIGURATION) {
        context.rules[prop] = typeof rulesConf[prop] === 'boolean' ? rulesConf[prop] : DEFAULT_RULES_CONFIGURATION[prop];
    }
    return context;
}

module.exports = {
    createContext
};
