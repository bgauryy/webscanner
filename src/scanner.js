const url = require('url');
const fs = require('fs');
const path = require('path');
const CRI = require('chrome-remote-interface');
const LOG = require('./utils/logger.js');
const {processData} = require('./dataProcessor.js');
const chromeClient = require('./client.js');
const {registerFrameEvents, getResources} = require('./monitor/iframe.js');
const {registerNetworkEvents} = require('./monitor/network.js');
const {registerScriptExecution, getScriptCoverage} = require('./monitor/scripts.js');
const {registerServiceWorkerEvents} = require('./monitor/serviceWorker.js');
const {registerWebsocket} = require('./monitor/websocket.js');
const {registerStorage, getCookies} = require('./monitor/storage.js');
const {startCSSCoverageTracking, registerStyleEvents, getStyleCoverage} = require('./monitor/style.js');
const {registerLogs, registerConsole, registerErrors} = require('./monitor/monitoring.js');
const {getMetadata} = require('./monitor/metadata.js');
const {getBlockedDomains} = require('../src/assets/blockedDomains.js');
const ignoredScripts = {};

async function getSession(context) {
    context.client = await getChromeClient(this.context.page);
    context.data = getDataObj();
    await init(context);
    return new Proxy(context.page, {
        get: function (page, prop) {
            if (prop === 'getData') {
                return getData.bind(context);
            } else {
                return page[prop];
            }
        }
    });
}

async function init(context) {
    await initClient(context.client, context.collect, context.rules);
    await registerFrameEvents(context.client, context.data.frames);
    await registerNetworkEvents(context.client, context.rules, context.collect, context.data.requests, context.data.responses);
    await registerScriptExecution(context.client, context.data.scripts);
    await registerServiceWorkerEvents(context.client, context.data.serviceWorker);
    await registerWebsocket(context.client, context.data.webSockets);
    await registerStorage(context.client, context.data.webSockets);
    await registerStyleEvents(context.client, context.data.styles);
    await registerLogs(context.client, context.data.logs);
    await registerConsole(context.client, context.data.console);
    await registerErrors(context.client, context.data.errors);
}

async function initClient(client, collect, rules) {
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

async function getChromeClient(page) {
    const connection = page._client._connection._url;
    const {hostname, port} = url.parse(connection, true);
    return await CRI({host: hostname, port});
}

async function getData(context) {
    LOG.debug('Preparing data...');
    context.data.cookies = await getCookies(context.client);
    context.data.resources = await getResources(context.client);
    context.data.scriptCoverage = await getScriptCoverage(context.client);
    context.data.styleCoverage = await getStyleCoverage(context.client);
    context.data.metadata = await getMetadata(context.client);
    /////////////////////////////////////////////////////////////////
    context.data.domEvents = await chromeClient.getAllDOMEvents(context.client);
    context.data.JSMetrics = await chromeClient.getExecutionMetrics(context.client);
    const data = await processData(this.data, this.context);
    context.data = getDataObj();
    return data;
}

function getDataObj() {
    return {
        scripts: [],
        requests: [],
        responses: [],
        frames: [],
        serviceWorker: {},
        webSockets: {},
        storage: {},
        styles: {},
        logs: {},
        console: {},
        errors: [],
        ///////////////////////////////
        events: [],
        research: {},
        metrics: null,
        coverage: null,
        contexts: {},
    };
}

module.exports = {
    getSession
};
