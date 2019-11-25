const url = require('url');
const CRI = require('chrome-remote-interface');
const LOG = require('./utils/logger.js');
const {processData} = require('./dataProcessor.js');
const chromeClient = require('./client.js');

async function getPuppeteerSession(context) {
    const scanner = new Scanner(context);
    await scanner.init();
    return new Proxy(context.page, {
        get: function (page, prop) {
            switch (prop) {
                case 'getData':
                    return async function () {
                        return await scanner.getData();
                    };
                case 'close':
                    return async function () {
                        return await scanner.close();
                    };
                default:
                    return page[prop];
            }
        }
    });
}

class Scanner {
    constructor(context) {
        this.client = null;
        this.context = context;
        this.data = getCleanDataObject();
    }
}

Scanner.prototype.init = init;
Scanner.prototype.close = close;
Scanner.prototype.getData = getData;

function getCleanDataObject() {
    return {
        scripts: {},
        serviceWorker: {},
        requests: {},
        websockets: {},
        dataURI: {},
        events: [],
        frames: {},
        styles: {},
        research: {},
        metrics: null,
        coverage: null,
        logs: {},
        console: {},
        errors: [],
        contexts: {},
        storage: {}
    };
}

async function init() {
    LOG.debug('Initiating Scanner');
    const collect = this.context.collect;
    this.client = await getChromeClient(this.context.page);

    if (!this.client) {
        LOG.error('Client is missing');
    }

    await chromeClient.initScan(this.client, this.context.collect, this.context.rules);

    chromeClient.registerScriptExecution(this.client, collect.scriptSource, this.data.scripts);
    chromeClient.registerFrameEvents(this.client, this.data.frames);
    chromeClient.setContext(this.client, this.data.contexts);
    chromeClient.registerNetworkEvents(this.client, this.context.rules, this.context.collect, this.data.requests, this.data.scripts, this.data.dataURI);

    if (collect.websocket) {
        await chromeClient.registerWebsocket(this.client, this.data.websockets);
    }
    if (collect.styles) {
        chromeClient.registerStyleEvents(this.client, collect.content, this.data.styles);
    }
    if (collect.serviceWorker) {
        await setSWListener(this.client, collect.content, this.data.serviceWorker);
    }
    if (collect.logs) {
        await chromeClient.setLogs(this.client, this.data.logs, this.context.rules.logsThreshold);
    }
    if (collect.console) {
        await chromeClient.setConsole(this.client, this.data.console);
    }
    if (collect.errors) {
        await chromeClient.setErrors(this.client, this.data.errors);
    }
    if (collect.storage) {
        await chromeClient.setStorage(this.client, this.data.storage);
    }
}

async function close() {
    LOG.debug('Closing Scanner');

    try {
        await this.client.close();
    } catch (e) {
        LOG.error(e);
    }
}

async function getChromeClient(page) {
    const connection = page._client._connection._url;
    const {hostname, port} = url.parse(connection, true);
    return await CRI({host: hostname, port});
}

//TODO - move to client.js
async function setSWListener(client, content, serviceWorkers) {
    await chromeClient.registerServiceWorkerEvents(client, content,
        ({registrationId, scopeURL}) => {
            serviceWorkers[registrationId] = {
                scopeURL
            };
        },
        (_sw) => {
            const sw = serviceWorkers[_sw.registrationId];
            sw.version = sw.version || [];
            sw.runningStatus = sw.runningStatus || [];
            sw.status = sw.status || [];
            sw.clients = sw.clients || [];

            if (_sw.version) {
                sw.version.push(_sw.version);
            }
            if (_sw.runningStatus) {
                sw.runningStatus.push(_sw.runningStatus);
            }
            if (_sw.status) {
                sw.status.push(_sw.status);
            }
            if (_sw.controlledClients && _sw.controlledClients.length) {
                sw.clients.push(_sw.controlledClients);
            }

            sw.scriptResponseTime = sw.scriptResponseTime || _sw.scriptResponseTime;
            sw.scriptLastModified = sw.scriptLastModified || _sw.scriptLastModified;
            sw.url = sw.url || _sw.scriptURL;
            sw.targetId = sw.targetId || _sw.targetId;
        },
        ({registrationId, errorMessage, versionId, lineNumber, columnNumber}) => {
            const sw = serviceWorkers[registrationId];
            if (sw) {
                sw.errors = sw.errors || [];
                sw.errors.push({
                    errorMessage,
                    lineNumber,
                    columnNumber,
                    versionId
                });
            }
        });
}

async function getData() {
    LOG.debug('Preparing data...');
    const collect = this.context.collect;

    if (collect.scriptDOMEvents) {
        this.data.domEvents = await chromeClient.getAllDOMEvents(this.client);
    }
    if (collect.cookies) {
        this.data.cookies = await chromeClient.getCookies(this.client);
    }
    if (collect.resources) {
        this.data.resources = await chromeClient.getResources(this.client);
    }
    if (collect.styleCoverage) {
        this.data.styleCoverage = await chromeClient.getStyleCoverage(this.client);
    }
    if (collect.scriptCoverage) {
        this.data.scriptCoverage = await chromeClient.getScriptCoverage(this.client);
    }
    if (collect.metadata) {
        this.data.metadata = await chromeClient.getMetadata(this.client);
    }
    if (collect.JSMetrics) {
        this.data.JSMetrics = await chromeClient.getExecutionMetrics(this.client);
    }

    const data = await processData(this.data, this.context);

    this.data = getCleanDataObject();
    return data;
}

module.exports = {
    getPuppeteerSession
};
