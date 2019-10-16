const fs = require('fs');
const path = require('path');
const url = require('url');
const chromeLauncher = require('chrome-launcher');
const CRI = require('chrome-remote-interface');
const LOG = require('./utils/logger.js');
const {processData} = require('./dataProcessor.js');
const chromeAPI = require('./chromeAPI.js');

class Scanner {
    constructor(opts) {
        this.opts = opts;
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

Scanner.prototype.start = start;
Scanner.prototype.stop = stop;
Scanner.prototype.getData = getData;
Scanner.prototype.navigate = navigate;
Scanner.prototype.waitDOMContentLoaded = waitDOMContentLoaded;
Scanner.prototype.collectAllDOMEvents = collectAllDOMEvents;

async function start() {
    const connection = await createConnection(this.opts);
    const collectObj = this.opts.collect;
    LOG.debug('Starting scanning', collectObj);

    this.client = connection.client;
    this.chrome = connection.chrome;
    if (!this.client) {
        throw new Error('Client is missing');
    }

    await chromeAPI.initScan(this.client, this.opts);
    await chromeAPI.initRules(this.client, this.opts.rules);

    if (collectObj.resources) {
        await setNetworkListener(this.client, this.data.resources);
    }
    if (collectObj.frames) {
        await setFramesListener(this.client, this.data.frames);
    }
    if (collectObj.scripts) {
        await setScriptsListener(this.client, collectObj.content, this.data.scripts);
    }
    if (collectObj.styles) {
        await setStyleListener(this.client, collectObj.content, this.data.style);
    }
    if (collectObj.serviceWorker) {
        await setSWListener(this.client, collectObj.content, this.data.serviceWorker);
    }

    if (this.opts.plugins) {
        await handlePlugins(this.client, this.opts.plugins);
    }
}

async function handlePlugins(client, plugins) {
    let regexPlugin;

    try {
        regexPlugin = fs.readFileSync(path.resolve(__dirname, 'plugins', 'regex.js'), {encoding: 'UTF-8'});
    } catch (e) {
        LOG.error(e);
    }

    if (plugins.regex) {
        //TODO - ignore this scriptId
        await client.Page.addScriptToEvaluateOnNewDocument({source: regexPlugin});
    }
}

async function getRegexData(client) {
    const {result} = await client.Runtime.evaluate({
        expression: 'window[".__regex"].data',
        returnByValue: true
    });
    return JSON.parse(JSON.stringify(result.value));
}

async function createConnection(opts) {
    let client, chrome;

    if (opts.puppeteerPage) {
        LOG.debug('Hooking to puppeteer connection');
        const page = opts.puppeteerPage;
        const connection = page._client._connection._url;
        const {hostname, port} = url.parse(connection, true);
        client = await CRI({host: hostname, port});
    } else {
        LOG.debug('Creating chrome websocket connection');
        chrome = await chromeLauncher.launch(opts.chrome);
        client = await CRI();
    }

    return {client, chrome};
}

async function stop() {
    LOG.debug('Closing chrome process');

    if (this.opts.puppeteerPage) {
        LOG.debug('puppeteer session - not closing session');
        return;
    }
    try {
        if (this.client) {
            await this.client.close();
            LOG.debug('chrome client closed');
        }
    } catch (e) {
        LOG.error(e, e);
    }
    try {
        if (this.chrome) {
            await this.chrome.kill();
            LOG.debug('chrome process closed');
        }
    } catch (e) {
        LOG.error(e, e);
    }
}

function setStyleListener(client, getContent, styles) {
    chromeAPI.registerStyleEvents(client, getContent, (styleObject) => {
        styles[styleObject.styleSheetId] = styleObject;
    });
}

function setSWListener(client, getContent, serviceWorkers) {
    chromeAPI.registerServiceWorkerEvents(client, getContent,
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

function setNetworkListener(client, network) {
    chromeAPI.registerNetworkEvents(client,
        (request) => {
            network.requests.push(request);
        },
        (response) => {
            network.responses[response.requestId] = response;
        });
}

function setFramesListener(client, frames) {
    chromeAPI.registerFrameEvents(client, (frame, state) => {
        const frameId = frame.frameId || frame.id;
        frames[frameId] = frames[frameId] || {};
        frames[frameId] = Object.assign(frames[frameId], frame);
        frames[frameId].state = frames[frameId].state || [];
        frames[frameId].state.push(state);
    });
}

function setScriptsListener(client, getContent, scripts) {
    chromeAPI.registerScriptExecution(client, getContent, (scriptObj) => {
        scripts.push(scriptObj);
    });
}

function navigate(url) {
    return this.client.Page.navigate({url});
}

function waitDOMContentLoaded() {
    return this.client.Page.domContentEventFired();
}

async function collectAllDOMEvents() {
    this.data.events = await chromeAPI.getAllDOMEvents(this.client);
}

async function getData() {
    const collectObj = this.opts.collect;

    if (collectObj.metrics) {
        this.data.metrics = await chromeAPI.getMetrics(this.client);
    }

    if (collectObj.research) {
        this.data.research = await chromeAPI.getResearch(this.client, this.data);
    }

    const regexData = await getRegexData(this.client);
    if (regexData) {
        this.data.plugins = {};
        this.data.plugins.regex = regexData;
    }

    return await processData(this.data, this.opts);
}

module.exports = {
    Scanner
};
