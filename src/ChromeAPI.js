const chromeLauncher = require('chrome-launcher');
const CRI = require('chrome-remote-interface');
const Logger = require('./utils/Logger.js');
const {processData} = require('./DataProcessor.js');
const url = require('url');

function Session(opts) {
    this.opts = opts;
    this.data = {
        scripts: [],
        network: {
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

Session.prototype.start = start;
Session.prototype.getData = getData;
Session.prototype.navigate = navigate;
Session.prototype.waitDOMContentLoaded = waitDOMContentLoaded;
Session.prototype.getAllDOMEvents = getAllDOMEvents;

async function start() {
    await _createSocket.call(this);
    await _initChromeClient.call(this);
    await _setNetworkListener.call(this);
    await _setFramesListener.call(this);
    await _setScriptsListener.call(this);
    await _setStyleListener.call(this);

    _setUserAgent.call(this);

    return this;
}

async function getData() {
    this.data.metrics = await this.client.Performance.getMetrics();
    this.data.coverage = await this.client.Profiler.getBestEffortCoverage();

    for (let i = 0; i < this.data.scripts.length; i++) {
        const script = this.data.scripts[i];
        const source = await this.client.Debugger.getScriptSource({scriptId: script.scriptId});
        if (source && source.scriptSource) {
            this.data.scripts[i].source = source.scriptSource;
        }
    }

    return await processData(this);
}

async function _createSocket() {
    let chrome;

    if (this.opts.puppeteer) {
        const page = this.opts.puppeteer.page;
        const connection = page._client._connection._url;
        const urlObj = url.parse(connection, true);
        this.client = await CRI({host: urlObj.hostname, port: urlObj.port});
    } else {
        chrome = await chromeLauncher.launch(this.opts.chrome || {
            port: 9222,
            chromeFlags: ['--headless', '--disable-gpu']
        });
        this.client = await CRI();
    }

    if (!this.client) {
        throw new Error('Process client is missing');
    }

    this.kill = async function () {
        if (this.opts.puppeteer) {
            Logger.debug('puppeteer session. Ignore teardown');
            return;
        }
        try {
            await this.client.close();
            Logger.debug('closed chrome client');
        } catch (e) {
            Logger.error(e);
        }
        try {
            await chrome.kill();
            Logger.debug('closed chrome process');
        } catch (e) {
            Logger.error(e);
        }
    };
}

async function _initChromeClient() {
    const {CSS, Debugger, Network, Page, Runtime, DOM, Performance} = this.client;

    await Performance.enable();
    await Page.enable();
    await DOM.enable();
    await Debugger.enable();
    await CSS.enable();

    //TODO  - add by configuration
    await Debugger.setAsyncCallStackDepth({maxDepth: 1000});
    await Runtime.enable();

    //TODO  - add by configuration
    await Runtime.setMaxCallStackSizeToCapture({size: 1000});

    await Network.enable();

    if (Array.isArray(this.opts.blockedURLs)) {
        await Network.setBlockedURLs({urls: this.opts.blockedURLs});
    }

    await Network.clearBrowserCache();
    await Network.clearBrowserCookies();
}

function _setUserAgent() {
    if (this.opts.userAgent) {
        this.client.Emulation.setUserAgentOverride({userAgent: this.opts.userAgent});
    }
}

function _setStyleListener() {
    this.client.CSS.styleSheetAdded(async function ({header}) {
        const styleObj = JSON.parse(JSON.stringify(header));
        styleObj.source = await this.client.CSS.getStyleSheetText({styleSheetId: styleObj.styleSheetId});
        this.data.style[header.styleSheetId] = styleObj;
    }.bind(this));
}

function _setNetworkListener() {
    const network = this.data.network;

    this.client.Network.requestWillBeSent((networkObj) => {
        network.requests.push({url: networkObj.request.url, ...networkObj});
    });

    this.client.Network.responseReceived((responseObj) => {
        network.responses[responseObj.requestId] = responseObj;
    });
}

function _setFramesListener() {
    const frames = this.data.frames;
    const client = this.client;

    client.Page.frameStartedLoading((frame) => {
        frameEventHandler(frame, frames, 'loading');
    });

    client.Page.frameNavigated(({frame}) => {
        frameEventHandler(frame, frames, 'navigated');
    });

    client.Page.frameStoppedLoading((frame) => {
        frameEventHandler(frame, frames, 'stopped');
    });

    client.Page.frameAttached((frame) => {
        frameEventHandler(frame, frames, 'attached');
    });

    client.Page.frameDetached((frame) => {
        frameEventHandler(frame, frames, 'detached');
    });

    client.Page.frameResized((frame) => {
        frameEventHandler(frame, frames, 'resized');
    });

    try {
        client.Page.frameRequestedNavigation((frame) => {
            frameEventHandler(frame, frames, 'requestNavigation');
        });
        //eslint-disable-next-line
        client.Page.navigatedWithinDocument((frame) => {
            //nothing
        });
    } catch (e) {
        //ignore
    }
}

function frameEventHandler(frame, frames, state) {
    const frameId = frame.frameId || frame.id;
    frames[frameId] = frames[frameId] || {};
    frames[frameId] = Object.assign(frames[frameId], frame);
    frames[frameId].state = frames[frameId].state || [];
    frames[frameId].state.push(state);
}

function _setScriptsListener() {
    const scripts = this.data.scripts;
    this.client.Debugger.scriptParsed((scriptObj) => {
        if (scriptObj.url === '__puppeteer_evaluation_script__') {
            return;
        }
        scripts.push(scriptObj);
    });
}

function navigate(url) {
    return this.client.Page.navigate({url});
}

function waitDOMContentLoaded() {
    return this.client.Page.domContentEventFired();
}

async function getAllDOMEvents() {
    const DOMEvents = this.data.events;
    const client = this.client;

    let evaluationRes = await client.Runtime.evaluate({expression: 'document.querySelectorAll("*");'});
    const {result} = await client.Runtime.getProperties({objectId: evaluationRes.result.objectId});
    const elementsObjects = result.map(e => e.value);

    for (let i = 0; i < elementsObjects.length; i++) {
        const object = elementsObjects[i];

        if (!object || !object.objectId) {
            continue;
        }
        const events = await client.DOMDebugger.getEventListeners({objectId: object.objectId});
        for (let i = 0; i < events.listeners.length; i++) {
            delete object.objectId;
            delete object.subtype;
            delete object.type;
            DOMEvents.push({...events.listeners[i], ...object});
        }
    }

    evaluationRes = await client.Runtime.evaluate({expression: 'document'});
    const documentEvents = await client.DOMDebugger.getEventListeners({objectId: evaluationRes.result.objectId});
    if (documentEvents && documentEvents.listeners) {
        for (let i = 0; i < documentEvents.listeners.length; i++) {
            const object = {className: 'HTMLDocument', description: 'document'};
            DOMEvents.push({...documentEvents.listeners[i], ...object});
        }
    }

    evaluationRes = await client.Runtime.evaluate({expression: 'window'});
    const windowEvents = await client.DOMDebugger.getEventListeners({objectId: evaluationRes.result.objectId});
    if (windowEvents && windowEvents.listeners) {
        for (let i = 0; i < windowEvents.listeners.length; i++) {
            const object = {className: 'Window', description: 'Window'};
            DOMEvents.push({...windowEvents.listeners[i], ...object});
        }
    }
}

module.exports = {
    Session
};
