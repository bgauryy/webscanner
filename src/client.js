const {enrichURLDetails, getInitiator, getResourcesFromFrameTree} = require('../src/utils/clientHelper.js');
const {handleRequests, handleResponse} = require('./monitor/network');
const {handleIframeEvent} = require('./monitor/iframe');
const {getBlockedDomains} = require('../src/assets/blockedDomains.js');
const fs = require('fs');
const path = require('path');
const LOG = require('./utils/logger.js');
const ignoredScripts = {};

async function initScan(client, collect, rules) {
    const {Profiler, CSS, Debugger, Network, Page, Runtime, DOM} = client;

    await Page.enable();
    await DOM.enable();
    await CSS.enable();
    await Debugger.enable();
    await Runtime.enable();
    await Network.enable();
    await Network.clearBrowserCache();
    await Network.clearBrowserCookies();
    await client.Debugger.setAsyncCallStackDepth({maxDepth: 1000});
    await client.Runtime.setMaxCallStackSizeToCapture({size: 1000});
    await client.Page.setDownloadBehavior({behavior: 'deny'});
    await client.Page.setAdBlockingEnabled({enabled: Boolean(rules.adBlocking)});
    await client.Page.setBypassCSP({enabled: Boolean(rules.disableCSP)});

    if (collect.styleCoverage) {
        await startCSSCoverageTracking(client);
    }

    if (collect.JSMetrics || collect.scriptCoverage) {
        await Profiler.enable();
        await Profiler.setSamplingInterval({interval: 1000});
        await Profiler.start();
    }

    if (rules.userAgent) {
        await client.Emulation.setUserAgentOverride({userAgent: rules.userAgent});
    }

    let blockedUrls = rules.blockedUrls;
    if (rules.disableServices) {
        const services = getBlockedDomains().map(domain => `*${domain}*`);
        blockedUrls = rules.blockedUrls.concat(services);
    }

    if (blockedUrls.length) {
        await client.Network.setBlockedURLs({urls: blockedUrls});
    }
    if (rules.stealth) {
        try {
            const stealthUA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/77.0.3865.120 Safari/537.36';
            const {identifier} = await client.Page.addScriptToEvaluateOnNewDocument({source: fs.readFileSync(path.resolve(__dirname, 'plugins', 'stealth.js'), {encoding: 'UTF-8'})});
            ignoredScripts[identifier] = 1;
            if (!rules.userAgent) {
                await client.Emulation.setUserAgentOverride({userAgent: stealthUA});
            }
            await client.Network.setExtraHTTPHeaders({
                headers: {
                    'Accept-Encoding': 'gzip, deflate',
                    'Accept-Language': 'en-US,en;q=0.9',
                    'Cache-Control': 'no-cache',
                    'Connection': 'keep-alive',
                    'User-Agent': rules.userAgent ? rules.userAgent : stealthUA
                }
            });
        } catch (e) {
            LOG.error(e);
        }
    }
}

function registerFrameEvents(client, frames) {
    client.Page.frameStartedLoading((frame) => {
        handleIframeEvent(frame, 'loading', frames);
    });
    client.Page.frameNavigated(({frame}) => {
        handleIframeEvent(frame, 'navigated', frames);
    });
    client.Page.frameStoppedLoading((frame) => {
        handleIframeEvent(frame, 'stopped', frames);
    });
    client.Page.frameAttached((frame) => {
        handleIframeEvent(frame, 'attached', frames);
    });
    client.Page.frameDetached((frame) => {
        handleIframeEvent(frame, 'detached', frames);

    });
    client.Page.frameResized((frame) => {
        handleIframeEvent(frame, 'resized', frames);
    });
    try {
        client.Page.frameRequestedNavigation((frame) => {
            handleIframeEvent(frame, 'requestNavigation', frames);
        });
        client.Page.navigatedWithinDocument((frame) => {
            handleIframeEvent(frame, 'navigatedWithinDocument', frames);
        });
    } catch (e) {
        //ignore
    }
}

function registerNetworkEvents(client, rules, collect, requests, responses) {
    handleRequests(client, rules, collect, requests);
    handleResponse(client, rules, collect, responses);
}

async function registerServiceWorkerEvents(client, content, serviceWorkers) {
    await client.ServiceWorker.enable();

    client.ServiceWorker.workerRegistrationUpdated(async (res) => {
        res = {...res, ...res.registrations};
        const serviceWorkerObj = res.registrations && res.registrations[0];
        if (serviceWorkerObj) {
            serviceWorkers[serviceWorkerObj.registrationId] = serviceWorkerObj;
        }
    });

    client.ServiceWorker.workerErrorReported(serviceWorkerObj => {
        debugger;
    });

    client.ServiceWorker.workerVersionUpdated(async (res) => {
        res = {...res, ...res.versions};
        let serviceWorkerObj = res.versions && res.versions[0];
        if (serviceWorkerObj) {
            //TODO: change code to handle status changes
            const serviceWorkerObjOld = serviceWorkers[serviceWorkerObj.registrationId] || {};
            serviceWorkerObj = {...serviceWorkerObjOld, ...serviceWorkerObj};
            serviceWorkers[serviceWorkerObj.registrationId] = serviceWorkerObj;
        }
    });
}

async function startCSSCoverageTracking(client) {
    await client.CSS.startRuleUsageTracking();
}

async function getAllDOMEvents(client) {
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

function registerScriptExecution(client, getScriptSource, scripts) {
    client.Debugger.scriptParsed(async function (scriptObj) {
        if (scriptObj.url === '__puppeteer_evaluation_script__' || scriptObj.url === '') {
            return;
        }
        scriptObj = {...scriptObj, ...scriptObj.executionContextAuxData};
        delete scriptObj.executionContextAuxData;
        const {scriptSource} = await client.Debugger.getScriptSource({scriptId: scriptObj.scriptId});
        scriptObj.source = scriptSource;
        scripts[scriptObj.scriptId] = scriptObj;
    });

    client.Debugger.scriptFailedToParse((scriptObj) => {
        scriptObj = {...scriptObj, ...scriptObj.executionContextAuxData};
        delete scriptObj.executionContextAuxData;
        scripts[scriptObj.scriptId] = scripts[scriptObj.scriptId] || scriptObj;
        scripts[scriptObj.scriptId].parseError = true;
    });
}

async function registerWebsocket(client, websockets) {
    client.Network.webSocketCreated(({requestId, url, initiator}) => {
        const wsObj = {url, initiator};
        wsObj.Initiatorscript = getInitiator(initiator);
        websockets[requestId] = wsObj;
    });
    client.Network.webSocketFrameSent(({requestId, timestamp, response}) => {
        const ws = websockets[requestId];
        if (!ws) {
            LOG.debug(`Websocket is missing ${requestId}`);
            return;
        }
        ws.frames = ws.frames || [];
        ws.frames.push({
            ...response,
            timestamp,
            type: 'sent'
        });
    });
    client.Network.webSocketFrameReceived(({requestId, timestamp, response}) => {
        const ws = websockets[requestId];
        if (!ws) {
            LOG.debug(`Websocket is missing ${requestId}`);
            return;
        }
        ws.frames = ws.frames || [];
        ws.frames.push({
            ...response,
            timestamp,
            type: 'received'
        });
    });
    client.Network.webSocketClosed(({requestId, timestamp}) => {
        const ws = websockets[requestId];
        if (!ws) {
            LOG.debug(`Websocket is missing ${requestId}`);
        }
        ws.closed = timestamp;
    });
    client.Network.webSocketFrameError(({requestId, timestamp, errorMessage}) => {
        const ws = websockets[requestId];
        if (!ws) {
            LOG.debug(`Websocket is missing ${requestId}`);
        }
        ws.errors = ws.errors || [];
        ws.errors.push({timestamp, errorMessage});
    });
}

function registerStyleEvents(client, getContent, styles) {
    client.CSS.styleSheetAdded(async function (styleObj) {
        styleObj = {...styleObj.header};
        enrichURLDetails(styleObj, 'url');
        if (styleObj.ownerNode) {
            //TODO: get content from inline scripts/nodes
            const {node} = await client.DOM.describeNode({backendNodeId: styleObj.ownerNode});
        }
        const {scriptSource} = await client.CSS.getStyleSheetText({styleSheetId: styleObj.styleSheetId});
        styleObj.source = scriptSource;
        styles[styleObj.styleSheetId] = styleObj;
    });
}

async function setStorage(client, storage) {
    await client.DOMStorage.enable();
    client.DOMStorage.domStorageItemAdded(({key, newValue: value, storageId: {securityOrigin, isLocalStorage}}) => {
        const storageType = isLocalStorage ? 'localStorage' : 'sessionStorage';
        storage[securityOrigin] = storage[securityOrigin] || {};
        storage[securityOrigin][storageType] = storage[securityOrigin][storageType] || [];
        storage[securityOrigin][storageType].push({key, value});
    });
}

function setContext(client, contexts) {
    client.Runtime.executionContextCreated(({context}) => {
        const contextObj = {...context, ...context.auxData};
        delete contextObj.auxData;
        if (contextObj.name === '__puppeteer_utility_world__') {
            return;
        }
        contexts[contextObj.id] = contextObj;
    });

    client.Runtime.executionContextDestroyed((executionObj) => {
        const context = contexts[executionObj.executionContextId] || {executionContextId: executionObj.executionContextId};
        context.destroyed = true;
        contexts[executionObj.executionContextId] = context;
    });
}

async function setLogs(client, logs, threshold) {
    await client.Log.enable();
    await client.Log.startViolationsReport({
        config: [
            {name: 'longTask', threshold},
            {name: 'longLayout', threshold},
            {name: 'blockedEvent', threshold},
            {name: 'blockedParser', threshold},
            {name: 'discouragedAPIUse', threshold},
            {name: 'handler', threshold},
            {name: 'recurringHandler', threshold},
        ]
    });

    client.Log.entryAdded(({entry: {source, level, text, timestamp, url}}) => {
        logs[level] = logs[level] || [];
        logs[level].push({text, source, timestamp, url});
    });
}

async function setConsole(client, console) {
    client.Runtime.consoleAPICalled(({type, executionContextId, timestamp, stackTrace, args}) => {
        console[type] = console[type] || [];
        console[type].push({
            value: args[0].value,
            executionContextId,
            timestamp,
            stackTrace
        });
    });
}

async function setErrors(client, errors) {
    client.Runtime.exceptionThrown((errorObj) => {
        errorObj = {...errorObj, ...errorObj.exceptionDetails};
        delete errorObj.exceptionDetails;
        delete errorObj.exception.preview;
        //TODO: get objectId
        errors.push(errorObj);
    });
}

async function getCookies(client) {
    return await client.Page.getCookies();
}

async function getStyleCoverage(client) {
    const {coverage} = await client.CSS.takeCoverageDelta();
    return coverage;
}

async function getScriptCoverage(client) {
    const {result} = await client.Profiler.getBestEffortCoverage();
    return result;
}

async function getResources(client) {
    const resources = await client.Page.getResourceTree();
    return getResourcesFromFrameTree(resources.frameTree);
}

async function getMetadata(client) {
    const data = {};

    data.layoutMetrics = await client.Page.getLayoutMetrics();
    data.heapSize = await client.Runtime.getHeapUsage();
    data.metrics = await _getMetrics(client);
    data.manifest = await _getManifest(client);
    data.systemInfo = await _getSystemInfo(client);

    return data;
}

async function _getMetrics(client) {
    try {
        await client.Performance.enable();
        const metricsObj = await client.Performance.getMetrics();
        return metricsObj && metricsObj.metrics;
    } catch (e) {
        LOG.error(e);
    }
}

async function _getManifest(client) {
    const manifest = await client.Page.getAppManifest();
    if (manifest && manifest.url) {
        return manifest;
    }
}

async function _getSystemInfo(client) {
    try {
        const info = await client.SystemInfo.getInfo();
        const process = await client.SystemInfo.getProcessInfo();
        return {
            info,
            process
        };
    } catch (e) {
        LOG.error(e);
    }
}

async function getExecutionMetrics(client) {
    const {profile: {nodes, samples, timeDeltas, startTime, endTime}} = await client.Profiler.stop();
    return {
        nodes, samples, timeDeltas, startTime, endTime, ignoredScripts
    };
}

module.exports = {
    initScan,
    registerFrameEvents,
    registerNetworkEvents,
    registerScriptExecution,
    registerStyleEvents,
    registerServiceWorkerEvents,
    getCookies,
    getAllDOMEvents,
    getStyleCoverage,
    getScriptCoverage,
    setLogs,
    setConsole,
    setErrors,
    setContext,
    setStorage,
    registerWebsocket,
    getExecutionMetrics,
    getMetadata,
    getResources,
};
