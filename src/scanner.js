const fs = require('fs');
const path = require('path');
const LOG = require('./logger.js');
const {getChromeClient} = require('./bridge');
const {cleanObject, getRandomString} = require('./utils');
const {getBlockedDomains} = require('../src/assets/blockedDomains.js');
const frame = require('./monitor/iframe.js');
const network = require('./monitor/network.js');
const style = require('./monitor/style.js');
const scripts = require('./monitor/scripts.js');
const metadata = require('./monitor/metadata.js');
const storage = require('./monitor/storage.js');
const monitoring = require('./monitor/monitoring.js');
const metrics = require('./monitor/metrics.js');

async function getSession(context) {
    context.client = await getChromeClient(context.page);
    context.data = getDataObject();
    await start(context);
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

async function start(context) {
    context.ignoredScripts = {};

    await initSession(context);
    await frame.start(context);
    await network.start(context);
    await style.start(context);
    await scripts.start(context);
    await metadata.start(context);
    await metadata.start(context);
    await storage.start(context);
    await monitoring.start(context);
    await metrics.start(context);
}

async function initSession(context) {
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

    data.iframes = await frame.stop(context);
    data.network = await network.stop(context);
    data.styles = await style.stop(context);
    data.scripts = await scripts.stop(context);
    data.metadata = await metadata.stop(context);
    data.storage = await storage.stop(context);
    data.monitoring = await monitoring.stop(context);
    data.metrics = await metrics.stop(context);
    context.data = getDataObject();

    cleanObject(data, 1);
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
        monitoring: {},
        storage: {},
        styles: {},
        metrics: null,
    };
}

module.exports = {
    getSession
};
