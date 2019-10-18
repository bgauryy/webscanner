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
            scripts: [],
            serviceWorker: {},
            resources: {
                requests: [],
                responses: {}
            },
            events: [],
            frames: {},
            style: {},
            metrics: null,
            coverage: null
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
        throw new Error('Client is missing');
    }

    await chromeClient.initScan(this.client, this.context);
    await chromeClient.initRules(this.client, this.context.rules);

    if (collect.requests || collect.responses) {
        await setNetworkListener(this.client, collect, this.data.resources);
    }
    if (collect.frames) {
        await setFramesListener(this.client, this.data.frames);
    }
    if (collect.scripts) {
        await setScriptsListener(this.client, collect.content, this.data.scripts);
    }
    if (collect.styles) {
        await setStyleListener(this.client, collect.content, this.data.style);
    }
    if (collect.serviceWorker) {
        await setSWListener(this.client, collect.content, this.data.serviceWorker);
    }
    if (collect.coverage) {
        await chromeClient.setCoverage(this.client);
    }
    if (collect.research) {
        await chromeClient.initResearch(this.client);
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

function setStyleListener(client, getContent, styles) {
    chromeClient.registerStyleEvents(client, getContent, (styleObject) => {
        styles[styleObject.styleSheetId] = styleObject;
    });
}

function setSWListener(client, getContent, serviceWorkers) {
    chromeClient.registerServiceWorkerEvents(client, getContent,
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

function setNetworkListener(client, opts, network) {
    chromeClient.registerNetworkEvents(client,
        (request) => {
            if (opts.requests) {
                network.requests.push(request);
            }
        },
        (response) => {
            if (opts.responses) {
                network.responses[response.requestId] = response;
            }
        });
}

function setFramesListener(client, frames) {
    chromeClient.registerFrameEvents(client, (frame, state) => {
        const frameId = frame.frameId || frame.id;
        frames[frameId] = frames[frameId] || {};
        frames[frameId] = Object.assign(frames[frameId], frame);
        frames[frameId].state = frames[frameId].state || [];
        frames[frameId].state.push(state);
    });
}

function setScriptsListener(client, getContent, scripts) {
    chromeClient.registerScriptExecution(client, getContent, (scriptObj) => {
        scripts.push(scriptObj);
    });
}

async function getData() {
    LOG.debug('Preparing data...');
    const collect = this.context.collect;

    if (collect.domEvents) {
        this.data.domEvents = await chromeClient.getAllDOMEvents(this.client);
    }
    if (collect.metrics) {
        this.data.metrics = await chromeClient.getMetrics(this.client);
    }
    if (collect.cookies) {
        this.data.cookies = await chromeClient.getCookies(this.client);
    }
    if (collect.coverage) {
        this.data.coverage = await chromeClient.getCoverage(this.client);
    }

    if (collect.research) {
        this.data.research = await chromeClient.getResearch(this.client, this.data);
    }
    return await processData(this.data, this.opts);
}

module.exports = {
    getPuppeteerSession
};
