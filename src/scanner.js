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
        this.data = {
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
}

Scanner.prototype.init = init;
Scanner.prototype.close = close;
Scanner.prototype.getData = getData;

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
    chromeClient.setContextListenr(this.client, this.data.contexts);
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
        await chromeClient.setLogs(this.client, this.data.logs);
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
        ({registrationId, versionId, runningStatus, status}) => {
            const sw = serviceWorkers[registrationId];
            sw.version = sw.version || [];
            sw.version.push(versionId);
            sw.runningStatus = sw.runningStatus || [];
            sw.runningStatus.push(runningStatus);
            sw.status = sw.status || [];
            sw.status.push(status);
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
    if (collect.metrics) {
        this.data.metrics = await chromeClient.getMetrics(this.client);
    }
    if (collect.cookies) {
        this.data.cookies = await chromeClient.getCookies(this.client);
    }
    if (collect.scriptCoverage || collect.styleCoverage) {
        this.data.coverage = await chromeClient.getCoverage(this.client);
    }
    if (collect.research) {
        this.data.research = await chromeClient.getResearch(this.client, this.data.research);
    }
    return await processData(this.data, this.context);
}

module.exports = {
    getPuppeteerSession
};
