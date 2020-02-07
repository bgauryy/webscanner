const fs = require('fs');
const path = require('path');
const LOG = require('./logger.js');
const {getChromeClient} = require('./bridge');
const {isEmptyObject, getRandomString} = require('./utils');
const {getBlockedDomains} = require('../src/assets/blockedDomains.js');
const frame = require('./monitor/iframe.js');
const {getResources} = require('./monitor/resources.js');
const network = require('./monitor/network.js');
const style = require('./monitor/style.js');
//////////////////////////////
const {registerScriptExecution, getScriptCoverage} = require('./monitor/scripts.js');
const {registerStorage, getCookies} = require('./monitor/storage.js');
const {registerLogs, registerConsole, registerErrors} = require('./monitor/monitoring.js');
const {getMetadata} = require('./monitor/metadata.js');

async function getSession(context) {
    context.client = await getChromeClient(context.page);
    context.data = getDataObject();
    await init(context);
    return new Proxy(context.page, {
        get: function (page, prop) {
            if (prop === 'getSessionData') {
                return getData.bind(this, context);
            } else if (prop === 'stop') {
                return stop.bind(this, context);
            } else {
                return page[prop];
            }
        }
    });
}

async function init(context) {
    //Scripts Id's to ignore
    context.ignoredScripts = {};

    await initClient(context);
    await frame.start(context);
    await network.start(context);
    await style.start(context);
    /*
        await registerScriptExecution(context.client, context.data.scripts);
        await registerStorage(context.client, context.data.webSockets);
        await registerLogs(context.client, context.data.logs);
        await registerConsole(context.client, context.data.console);
        await registerErrors(context.client, context.data.errors);*/
}

async function initClient(context) {
    const {client, rules} = context;
    const {Debugger, Network, Page, Runtime, Emulation} = client;

    await Network.enable();
    await Debugger.enable();
    await Runtime.enable();
    await Page.enable();

    await Network.clearBrowserCache();
    await Network.clearBrowserCookies();
    await Debugger.setAsyncCallStackDepth({maxDepth: 1000});
    await Runtime.setMaxCallStackSizeToCapture({size: 1000});
    await Page.setDownloadBehavior({behavior: 'deny'});
    await Page.setAdBlockingEnabled({enabled: Boolean(rules.adBlocking)});
    await Page.setBypassCSP({enabled: Boolean(rules.disableCSP)});

    if (rules.userAgent) {
        await Emulation.setUserAgentOverride({userAgent: rules.userAgent});
    }
    let blockedUrls = rules.blockedUrls || [];
    if (rules.disableServices) {
        const services = getBlockedDomains().map(domain => `*${domain}*`);
        blockedUrls = rules.blockedUrls.concat(services);
    }
    if (blockedUrls.length) {
        await Network.setBlockedURLs({urls: blockedUrls});
    }
    if (rules.stealth) {
        try {
            const stealthUA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/77.0.3865.120 Safari/537.36';
            const {identifier} = await client.Page.addScriptToEvaluateOnNewDocument({source: fs.readFileSync(path.resolve(__dirname, 'plugins', 'stealth.js'), {encoding: 'UTF-8'})});
            context.ignoredScripts[identifier] = 1;
            if (!rules.userAgent) {
                await client.Emulation.setUserAgentOverride({userAgent: stealthUA});
            }
            const randomHeader = getRandomString();
            const addedHeaders = {
                'Accept-Encoding': 'gzip, deflate',
                'Accept-Language': 'en-US,en;q=0.9',
                'Cache-Control': 'no-cache',
                'Connection': 'keep-alive',
                'User-Agent': rules.userAgent ? rules.userAgent : stealthUA,
            };
            addedHeaders[randomHeader] = getRandomString();
            await client.Network.setExtraHTTPHeaders({headers: addedHeaders});
        } catch (e) {
            LOG.error(e);
        }
    }
}

async function getData(context) {
    LOG.debug('Preparing data...');
    const data = {};

    const resources = await getResources(context);
    data.iframes = await frame.stop(context, resources);
    data.network = await network.stop(context);
    data.styles = await style.stop(context);

    context.data = getDataObject();
    /*
        context.data.cookies = await getCookies(context);
        context.data.scriptCoverage = await getScriptCoverage(context);
        context.data.styleCoverage = await getStyleCoverage(context);
        context.data.metadata = await getMetadata(context);
        /////////////////////////////////////////////////////////////////
        context.data.domEvents = await chromeClient.getAllDOMEvents(context.client);
        context.data.JSMetrics = await chromeClient.getExecutionMetrics(context.client);
        */

    for (const prop in data) {
        if (isEmptyObject(data[prop])) {
            delete data[prop];
        }
    }
    return JSON.parse(JSON.stringify(data));
}

async function stop(context) {
    const data = await getData(context);
    //eslint-disable-next-line
    for (const prop in context) {
        //Avoid memory leaks
        context[prop] = null;
    }
    return data;
}

function getDataObject() {
    return {
        scripts: [],
        requests: [],
        responses: [],
        frames: {},
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
