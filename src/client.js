const fs = require('fs');
const path = require('path');
const LOG = require('./utils/logger.js');
const researchData = {};

async function initScan(client) {
    const {ServiceWorker, CSS, Debugger, Network, Page, Runtime, DOM, Performance} = client;

    await Performance.enable();
    await Page.enable();
    await DOM.enable();
    await Debugger.enable();
    await CSS.enable();
    await Runtime.enable();
    await Network.enable();
    await ServiceWorker.enable();

    await Debugger.setAsyncCallStackDepth({maxDepth: 1000});
    await Runtime.setMaxCallStackSizeToCapture({size: 1000});

    await Network.clearBrowserCache();
    await Network.clearBrowserCookies();
}

async function initRules(client, {userAgent, blockedUrls, stealth}) {
    if (userAgent) {
        await client.Emulation.setUserAgentOverride({userAgent});
    }
    if (Array.isArray(blockedUrls) && blockedUrls.length > 0) {
        await client.Network.setBlockedURLs({urls: blockedUrls});
    }
    if (stealth) {
        try {
            const ua = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/77.0.3865.120 Safari/537.36';
            //TODO - ignore this scriptId
            await client.Page.addScriptToEvaluateOnNewDocument({source: fs.readFileSync(path.resolve(__dirname, 'plugins', 'stealth.js'), {encoding: 'UTF-8'})});
            if (!userAgent) {
                await client.Emulation.setUserAgentOverride({userAgent: ua});
            }
            await client.Network.setExtraHTTPHeaders({
                headers: {
                    'Accept-Encoding': 'gzip, deflate',
                    'Accept-Language': 'en-US,en;q=0.9',
                    'Cache-Control': 'no-cache',
                    'Connection': 'keep-alive',
                    'User-Agent': userAgent ? userAgent : ua
                }
            });
        } catch (e) {
            LOG.error(e);
        }
    }
    //TODO - add
    //Page.setAdBlockingEnabled
    //Page.setBypassCSP
    //Page.setDeviceMetricsOverride
    //Page.setDeviceOrientationOverride
    //Page.setFontFamilies
    //Page.setFontSizes
    //Page.setDownloadBehavior
    //Page.setGeolocationOverride
    //Browser.setPermission
}

function registerServiceWorkerEvents(client, getContent, registrationHandler, versionHandler, errorHandler) {
    client.ServiceWorker.workerRegistrationUpdated(({registrations}) => {
        const sw = registrations && registrations[0];
        if (sw) {
            registrationHandler(sw);
        }
    });
    client.ServiceWorker.workerErrorReported(obj => {
        errorHandler(obj);
    });
    client.ServiceWorker.workerVersionUpdated(({versions}) => {
        const sw = versions && versions[0]; //registrationId, scriptURL, runningStatus, status, scriptLastModified, scriptResponseTime,controlledClients
        if (sw) {
            versionHandler(sw);
        }
    });
    //ServiceWorker.inspectWorker
}

async function setCoverage(client) {
    await client.CSS.startRuleUsageTracking();
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

function registerScriptExecution(client, getContent, handler) {
    client.Debugger.scriptParsed(async function (scriptObj) {
        const script = {...scriptObj};

        if (script.url !== '__puppeteer_evaluation_script__') {
            if (getContent) {
                try {
                    const source = await client.Debugger.getScriptSource({scriptId: script.scriptId});
                    script.source = source.scriptSource;
                } catch (e) {
                    //ignore
                }
            }
            handler({...script});
        }
    });
}

function registerStyleEvents(client, getContent, handler) {
    client.CSS.styleSheetAdded(async function ({header}) {
        const styleObj = {...header};

        if (getContent) {
            try {
                styleObj.source = await client.CSS.getStyleSheetText({styleSheetId: styleObj.styleSheetId});
            } catch (e) {
                //TODO - check
                styleObj.source = '';
            }
        }

        handler(styleObj);
    });
}

async function getMetrics(client) {
    try {
        const metricsObj = await client.Performance.getMetrics();
        return metricsObj && metricsObj.metrics;
    } catch (e) {
        LOG.error(e);
    }
}

async function initResearch(client) {
    researchData.storage = {};
    researchData.contexts = {};
    researchData.exceptions = [];

    client.Runtime.exceptionRevoked((obj) => {
        researchData.exceptions.push(obj);
    });

    client.Runtime.exceptionThrown(obj => {
        researchData.exceptions.push(obj);
    });

    client.Runtime.executionContextCreated((obj) => {
        const {context: {id, origin, name, auxData}} = obj;
        researchData.contexts[id] = {origin, name, auxData};
    });

    client.Runtime.executionContextDestroyed(({executionContextId}) => {
        const context = researchData.contexts[executionContextId] || {};
        context.destroyed = true;
    });

    client.DOMStorage.domStorageItemAdded(obj => {
        //eslint-disable-next-line
        researchData.storage[obj.key] = researchData.storage[obj.key] || [];
        researchData.storage[obj.key].push(obj);
    });
}

//eslint-disable-next-line
async function getResearch(client, data) {
    const manifest = await client.Page.getAppManifest();
    if (manifest && manifest.url) {
        researchData.manifest = manifest;
    }
    researchData.resourcesTree = await client.Page.getResourceTree();
    researchData.frameTree = await client.Page.getFrameTree();
    //researchData.layoutMetrics = await client.Page.getLayoutMetrics();
    researchData.testReport = await client.Page.generateTestReport({message: 'dd'});
    researchData.heapSize = await client.Runtime.getHeapUsage();


    //eslint-disable-next-line
    for (const contextId in researchData.contexts) {
        const context = researchData.contexts[contextId];
        if (context) {
            const scopes = await client.Runtime.globalLexicalScopeNames({contextId});
            context.scopes = scopes;
        }
    }

    return researchData;
}

async function getSystemInfo(client) {
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

async function getCookies(client) {
    return await client.Page.getCookies();
}

async function getCoverage(client) {
    //await client.CSS.stopRuleUsageTracking();
    researchData.cssCoverage = await client.CSS.takeCoverageDelta();

    const {result} = await client.Profiler.getBestEffortCoverage();
    researchData.coverage = result;
}

module.exports = {
    initScan,
    initRules,
    initResearch,
    registerFrameEvents,
    registerNetworkEvents,
    registerScriptExecution,
    registerStyleEvents,
    registerServiceWorkerEvents,
    getMetrics,
    getResearch,
    getCookies,
    getAllDOMEvents,
    getCoverage,
    setCoverage,
    getSystemInfo,
};
