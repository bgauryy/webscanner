const LOG = require('./utils/logger.js');

async function init(client) {
    const {CSS, Debugger, Network, Page, Runtime, DOM, Performance} = client;

    await Performance.enable();
    await Page.enable();
    await DOM.enable();
    await Debugger.enable();
    await CSS.enable();
    await Runtime.enable();
    await Network.enable();

    await Debugger.setAsyncCallStackDepth({maxDepth: 1000});
    await Runtime.setMaxCallStackSizeToCapture({size: 1000});

    await Network.clearBrowserCache();
    await Network.clearBrowserCookies();
}

async function getAllDOMEvents(client,) {
    const DOMEvents = [];

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

    return DOMEvents;
}

function registerFrameEvents(client, handler) {
    client.Page.frameStartedLoading((frame) => {
        handler(frame, 'loading');
    });

    client.Page.frameNavigated(({frame}) => {
        handler(frame, 'navigated');
    });

    client.Page.frameStoppedLoading((frame) => {
        handler(frame, 'stopped');
    });

    client.Page.frameAttached((frame) => {
        handler(frame, 'attached');
    });

    client.Page.frameDetached((frame) => {
        handler(frame, 'detached');
    });

    client.Page.frameResized((frame) => {
        handler(frame, 'resized');
    });

    try {
        client.Page.frameRequestedNavigation((frame) => {
            handler(frame, 'requestNavigation');
        });
        //eslint-disable-next-line
        client.Page.navigatedWithinDocument((frame) => {
            handler(frame, 'navigatedWithinDocument');
        });
    } catch (e) {
        //ignore
    }
}

function registerNetworkEvents(client, onRequest, onResponse) {
    client.Network.requestWillBeSent((networkObj) => {
        const request = {url: networkObj.request.url, ...networkObj};
        onRequest(request);
    });

    client.Network.responseReceived((responseObj) => {
        onResponse({...responseObj});
    });
}

function registerScriptExecution(client, handler) {
    client.Debugger.scriptParsed(async function (scriptObj) {
        const script = {...scriptObj};

        if (script.url !== '__puppeteer_evaluation_script__') {
            try {
                script.source = await client.Debugger.getScriptSource({scriptId: script.scriptId});
            } catch (e) {
                //ignore
            }
            handler({...script});
        }
    });
}

function registerStyleEvents(client, handler) {
    client.CSS.styleSheetAdded(async function ({header}) {
        const styleObj = {...header};
        try {
            styleObj.source = await client.CSS.getStyleSheetText({styleSheetId: styleObj.styleSheetId});
        } catch (e) {
            //TODO - check
            styleObj.source = '';
        }
        handler(styleObj);
    });
}

function setUserAgent(client, userAgent) {
    client.Emulation.setUserAgentOverride({userAgent: userAgent});
}

async function setBlockedURL(client, urls) {
    if (Array.isArray(urls)) {
        await client.Network.setBlockedURLs({urls});
    }
}

async function getMetrics(client) {
    try {
        const metricsObj = await client.Performance.getMetrics();
        return metricsObj && metricsObj.metrics;
    } catch (e) {
        LOG.error(e);
    }
}

async function getBestEffortCoverage(client) {
    try {
        const coverageObj = await client.Profiler.getBestEffortCoverage();
        return coverageObj && coverageObj.result;
    } catch (e) {
        LOG.error(e);
    }
}

module.exports = {
    init,
    getAllDOMEvents,
    registerFrameEvents,
    registerNetworkEvents,
    registerScriptExecution,
    registerStyleEvents,
    setUserAgent,
    setBlockedURL,
    getMetrics,
    getBestEffortCoverage
};
