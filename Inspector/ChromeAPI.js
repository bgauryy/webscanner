function Session(context) {
    this.context = context;
    this.client = context.chromeRemoteInterface;
    this.context.data = {
        scripts: [],
        network: {
            requests: [],
            responses: {}
        },
        DOMEvents: [],
        frames: {},
        metrics: null
    };
}

Session.prototype.init = init;
Session.prototype.navigate = navigate;
Session.prototype.getMetrics = getMetrics;
Session.prototype.waitDOMContentLoaded = waitDOMContentLoaded;
Session.prototype.getAllDOMEvents = getAllDOMEvents;
Session.prototype.mouseMove = mouseMove;

async function init() {
    await setClient.call(this);
    setUserAgent.call(this);
    await setNetworkListener.call(this);
    await setFramesListener.call(this);
    await setScriptsListener.call(this);
}

async function setClient() {
    const {Debugger, Network, Page, Runtime, DOM, Performance} = this.client;

    await Performance.enable();
    await Page.enable();
    await DOM.enable();
    await Debugger.enable();

    //TODO  - add by configuration
    await Debugger.setAsyncCallStackDepth({maxDepth: 1000});
    await Runtime.enable();

    //TODO  - add by configuration
    await Runtime.setMaxCallStackSizeToCapture({size: 1000});

    await Network.enable();

    //TODO  - add by configuration
    //await Network.setBlockedURLs({urls: ['*perimeterx.net*', '*/init.js']});

    //Clear storage
    await Network.clearBrowserCache();
    await Network.clearBrowserCookies();
}

function setUserAgent() {
    this.client.Emulation.setUserAgentOverride({userAgent: this.context.userAgent});
}

function setNetworkListener() {
    const network = this.context.data.network;

    this.client.Network.requestWillBeSent((networkObj) => {
        network.requests.push({url: networkObj.request.url, ...networkObj});
    });

    this.client.Network.responseReceived((responseObj) => {
        network.responses[responseObj.requestId] = responseObj;
    });
}

function setFramesListener() {
    const frames = this.context.data.frames;
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

function setScriptsListener() {
    const scripts = this.context.data.scripts;
    this.client.Debugger.scriptParsed((scriptObj) => {
        if (scriptObj.url === '__puppeteer_evaluation_script__') {
            return;
        }
        scripts.push(scriptObj);
    });
}

function getMetrics() {
    this.context.data.metrics = this.client.Performance.getMetrics();
}

function navigate(url) {
    return this.client.Page.navigate({url});
}

function waitDOMContentLoaded() {
    return this.client.Page.domContentEventFired();
}

async function getAllDOMEvents() {
    const DOMEvents = this.context.data.DOMEvents;
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

function mouseMove() {
    return this.client.Input.dispatchMouseEvent({
        type: 'mouseMoved',
        x: 100,
        y: 100
    });
}

module.exports = {
    Session
};
