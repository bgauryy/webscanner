const fs = require('fs');
const path = require('path');
const LOG = require('../utils/logger');
const NetworkMonitor = require('../monitors/chrome/network');

const ignoredScripts = {};

class ChromeClient {
    constructor(context) {
        this.monitors = [];
        this.context = context;
    }

    async start() {
        const {client, data, collect, rules} = this.context;
        await setRules(client, rules);

        const networkMonitor = new NetworkMonitor(client, data, collect, rules);
        await startMonitoring.call(this, networkMonitor);

        /*    if (collect.styleCoverage) {
                await CSS.enable();
                await client.CSS.startRuleUsageTracking();
             //   await registerStyleEvents(client, collect.content, data.styles);
            }

            if (collect.JSMetrics || collect.scriptCoverage) {
                const Profiler = client.Profiler;
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


            if (collect.network) {
                registerNetworkEvents(client, this.context.rules, this.context.collect, data.requests, data.scripts, data.dataURI);
            }

            _registerScriptExecution(client, collect.scriptSource, data.scripts);
            _registerFrameEvents(client, data.frames);
            _setContext(client, data.contexts);


            if (collect.websocket) {
                await _registerWebsocket(client, data.websockets);
            }
            if (collect.serviceWorker) {
                await _setSWListener(client, collect.content, data.serviceWorker);
            }
            if (collect.logs) {
                await _setLogs(client, data.logs, this.context.rules.logsThreshold);
            }
            if (collect.console) {
                await _setConsole(client, data.console);
            }
            if (collect.errors) {
                await _setErrors(client, data.errors);
            }
            if (collect.storage) {
                await _setStorage(client, data.storage);
            }*/
    }

    async getData() {
        const data = {};
        for (let i = 0; i < this.monitors.length; i++) {
            const dataObj = await this.monitors[i].getData();
            data[dataObj.name] = dataObj.data;
        }
        return data;
    }
}

async function setRules(client, rules) {
    await client.Network.enable();
    await client.Network.clearBrowserCache();
    await client.Network.clearBrowserCookies();
    await client.Debugger.enable();
    await client.Runtime.enable();
    await client.Page.enable();

    await client.Debugger.setAsyncCallStackDepth({maxDepth: 1000});
    await client.Runtime.setMaxCallStackSizeToCapture({size: 1000});
    await client.Page.setDownloadBehavior({behavior: 'deny'});
    await client.Page.setAdBlockingEnabled({enabled: Boolean(rules.adBlocking)});
    await client.Page.setBypassCSP({enabled: Boolean(rules.disableCSP)});
    if (rules.stealth) {
        try {
            const stealthUA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/77.0.3865.120 Safari/537.36';
            const source = fs.readFileSync(path.resolve(__dirname, '../', 'plugins', 'stealth.js'), {encoding: 'UTF-8'});
            const {identifier} = await client.Page.addScriptToEvaluateOnNewDocument({source});
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

async function startMonitoring(monitor) {
    this.monitors.push(monitor);
    await monitor.monitor();
}

function _registerFrameEvents(client, frames) {
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

    function handler(frame, state) {
        const {frameId, id, parentFrameId, loaderId, url, securityOrigin, mimeType, stack, name} = frame;
        const _id = frameId || id;

        frames[_id] = frames[_id] || {};
        frames[_id].url = frames[_id].url || url;
        frames[_id].parentFrameId = frames[_id].parentFrameId || parentFrameId;
        frames[_id].loaderId = frames[_id].loaderId || loaderId;
        frames[_id].securityOrigin = frames[_id].securityOrigin || securityOrigin;
        frames[_id].mimeType = frames[_id].mimeType || mimeType;
        frames[_id].stack = frames[_id].stack || stack; //TODO: get script!
        frames[_id].name = frames[_id].name || name;
        frames[_id].state = frames[_id].state || [];
        enrichURLDetails(frames[_id], 'url');
        frames[_id].state.push(state);
    }
}

async function getResources(client) {
    const resources = await client.Page.getResourceTree();
    return getResourcesFromFrameTree(resources.frameTree);
}

async function registerServiceWorkerEvents(client, getContent, registrationHandler, versionHandler, errorHandler) {
    await client.ServiceWorker.enable();

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


function _registerScriptExecution(client, getScriptSource, scripts) {
    client.Debugger.scriptParsed(async function (scriptObj) {
        const url = scriptObj.url;
        const scriptId = scriptObj.scriptId;
        if (url === '__puppeteer_evaluation_script__' || url === '') {
            return;
        }

        if (getScriptSource) {
            try {
                const {scriptSource} = await client.Debugger.getScriptSource({scriptId});
                scriptObj.source = scriptSource;
            } catch (e) {
                //ignore
            }
        }
        scripts[scriptId] = scriptObj;
    });

    client.Debugger.scriptFailedToParse((scriptObj) => {
        const scriptId = scriptObj.scriptId;

        scripts[scriptId] = scriptObj;
        scripts[scriptId].parseError = true;
    });
}

async function _setStorage(client, storage) {
    await client.DOMStorage.enable();
    client.DOMStorage.domStorageItemAdded(({key, newValue: value, storageId: {securityOrigin, isLocalStorage}}) => {
        const storageType = isLocalStorage ? 'localStorage' : 'sessionStorage';
        storage[securityOrigin] = storage[securityOrigin] || {};
        storage[securityOrigin][storageType] = storage[securityOrigin][storageType] || [];
        storage[securityOrigin][storageType].push({key, value});
    });
}

function _setContext(client, contexts) {
    client.Runtime.executionContextCreated(({context: {id, origin, name, auxData}}) => {
        if (name !== '__puppeteer_utility_world__') {
            contexts[id] = {origin, name, auxData};
        }
    });

    client.Runtime.executionContextDestroyed(({executionContextId}) => {
        const context = contexts[executionContextId];
        if (context) {
            context.destroyed = true;
        }
    });
}

async function _setLogs(client, logs, threshold) {
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

async function _setConsole(client, console) {
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

async function _setErrors(client, errors) {


    /*    client.Runtime.exceptionRevoked(obj => {
            debugger;
        });*/


    client.Runtime.exceptionThrown(({timestamp, exceptionDetails: {url, executionContextId, stackTrace, exception: {description}}}) => {
        errors.push({
            url,
            description,
            executionContextId,
            timestamp,
            stackTrace
        });
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

async function getMetadata(client) {
    const data = {};

    data.layoutMetrics = await client.Page.getLayoutMetrics();
    data.heapSize = await client.Runtime.getHeapUsage();
    data.metrics = await _getMetrics(client);
    data.manifest = await _getManifest(client);
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

async function getExecutionMetrics(client) {
    const {profile: {nodes, samples, timeDeltas, startTime, endTime}} = await client.Profiler.stop();
    return {
        nodes, samples, timeDeltas, startTime, endTime, ignoredScripts
    };
}

//TODO - move to client.js
async function _setSWListener(client, content, serviceWorkers) {
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

module.exports = ChromeClient;
