const url = require('url');
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
const {registerStyleEvents, getStyleCoverage} = require('./monitor/style.js');
const {registerLogs, registerConsole, registerErrors} = require('./monitor/monitoring.js');
const {getMetadata} = require('./monitor/metadata.js');
const {getBlockedDomains} = require('../src/assets/blockedDomains.js');
const fs = require('fs');
const path = require('path');
const ignoredScripts = {};

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
        this.data = getCleanDataObject();
    }
}

Scanner.prototype.init = init;
Scanner.prototype.close = close;
Scanner.prototype.getData = getData;

function getCleanDataObject() {
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

async function init() {
    this.client = await getChromeClient(this.context.page);
    await initClient(this.client, this.context.collect, this.context.rules);

    await registerFrameEvents(this.client, this.data.frames);
    await registerNetworkEvents(this.client, this.context.rules, this.context.collect, this.data.requests, this.data.responses);
    await registerScriptExecution(this.client, this.data.scripts);
    await registerServiceWorkerEvents(this.client, this.data.serviceWorker);
    await registerWebsocket(this.client, this.data.webSockets);
    await registerStorage(this.client, this.data.webSockets);
    await registerStyleEvents(this.client, this.data.styles);
    await registerLogs(this.client, this.data.logs);
    await registerConsole(this.client, this.data.console);
    await registerErrors(this.client, this.data.errors);
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

async function close() {
    LOG.debug('Closing Scanner');

    try {
        await this.client.close();
    } catch (e) {
        LOG.error(e);
    }
}

async function getData() {
    LOG.debug('Preparing data...');
    const collect = this.context.collect;

    this.data.cookies = await getCookies(this.client);
    this.data.resources = await getResources(this.client);
    this.data.scriptCoverage = await getScriptCoverage(this.client);
    this.data.styleCoverage = await getStyleCoverage(this.client);
    this.data.metadata = await getMetadata(this.client);
    /////////////////////////////////////////////////////////////////
    this.data.domEvents = await chromeClient.getAllDOMEvents(this.client);
    this.data.JSMetrics = await chromeClient.getExecutionMetrics(this.client);

    const data = await processData(this.data, this.context);
    this.data = getCleanDataObject();
    return data;
}

module.exports = {
    getPuppeteerSession
};
