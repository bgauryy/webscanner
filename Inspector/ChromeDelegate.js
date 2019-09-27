let client;

async function setClient(_client, disablePX) {
    client = _client;

    const { Debugger, Network, Page, Runtime, DOM, Performance } = client;

    //Enable browser permissions
    await Performance.enable();
    await Page.enable();
    await DOM.enable();
    await Debugger.enable();
    await Debugger.setAsyncCallStackDepth({ maxDepth: 1000 });
    await Runtime.enable();
    await Runtime.setMaxCallStackSizeToCapture({ size: 1000 });
    await Network.enable();

    if (disablePX) {
        await Network.setBlockedURLs({ urls: ['*perimeterx.net*', '*/init.js'] });
    }

    //Clear storage
    await Network.clearBrowserCache();
    await Network.clearBrowserCookies();
}

function getMetrics() {
    return client.Performance.getMetrics();
}

function navigate(url) {
    return client.Page.navigate({ url });
}

function waitDOMContentLoaded() {
    return client.Page.domContentEventFired();
}

function scriptParsedHandler(scripts) {
    client.Debugger.scriptParsed((scriptObj) => {
        if (scriptObj.url === '__puppeteer_evaluation_script__') {
            return;
        }
        scripts.push(scriptObj);
    });
}

function registerFrameEvents(frames) {
    client.Page.frameStartedLoading((frame) => {
        frameEventHandler(frame, frames, 'loading');
    });

    client.Page.frameNavigated(({ frame }) => {
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

function setOnNetworkRequestObj(network) {
    network.responses = {};

    client.Network.requestWillBeSent((networkObj) => {
        network.push({ url: networkObj.request.url, ...networkObj });
    });

    client.Network.responseReceived((responseObj) => {
        network.responses[responseObj.requestId] = responseObj;
    });
}

function setUserAgent(userAgent) {
    return client.Emulation.setUserAgentOverride({ userAgent });
}

async function getAllDOMEvents(DOMEvents) {
    let evaluationRes = await client.Runtime.evaluate({ expression: `document.querySelectorAll("*");` });
    const { result } = await client.Runtime.getProperties({ objectId: evaluationRes.result.objectId });
    const elementsObjects = result.map(e => e.value);

    for (let i = 0; i < elementsObjects.length; i++) {
        const object = elementsObjects[i];

        if (!object || !object.objectId) {
            continue;
        }
        const events = await client.DOMDebugger.getEventListeners({ objectId: object.objectId });
        for (let i = 0; i < events.listeners.length; i++) {
            delete object.objectId;
            delete object.subtype;
            delete object.type;
            DOMEvents.push({ ...events.listeners[i], ...object });
        }
    }

    evaluationRes = await client.Runtime.evaluate({ expression: `document` });
    const documentEvents = await client.DOMDebugger.getEventListeners({ objectId: evaluationRes.result.objectId });
    if (documentEvents && documentEvents.listeners) {
        for (let i = 0; i < documentEvents.listeners.length; i++) {
            const object = { className: "HTMLDocument", description: "document" };
            DOMEvents.push({ ...documentEvents.listeners[i], ...object });
        }
    }

    evaluationRes = await client.Runtime.evaluate({ expression: `window` });
    const windowEvents = await client.DOMDebugger.getEventListeners({ objectId: evaluationRes.result.objectId });
    if (windowEvents && windowEvents.listeners) {
        for (let i = 0; i < windowEvents.listeners.length; i++) {
            const object = { className: "Window", description: "Window" };
            DOMEvents.push({ ...windowEvents.listeners[i], ...object });
        }
    }
}

function movemouse() {
    return client.Input.dispatchMouseEvent({
        type: 'mouseMoved',
        x: 100,
        y: 100
    });
}

module.exports = {
    navigate,
    setUserAgent,
    waitDOMContentLoaded,
    setClient,
    scriptParsedHandler,
    setOnNetworkRequestObj,
    getAllDOMEvents,
    getMetrics,
    registerFrameEvents,
    movemouse
};
