const fs = require('fs');
const path = require('path');
const LOG = require('./logger.js');
const {getChromeClient} = require('./bridge');
const {cleanObject, getRandomString} = require('./utils');
const {getBlockedDomains} = require('../src/assets/blockedDomains.js');
const frames = require('./monitor/iframe.js');
const network = require('./monitor/network.js');
const style = require('./monitor/style.js');
const scripts = require('./monitor/scripts.js');
const metadata = require('./monitor/metadata.js');
const storage = require('./monitor/storage.js');
const monitoring = require('./monitor/monitoring.js');
const dom = require('./monitor/dom.js');
const performance = require('./monitor/performance.js');

async function getSession(configuration) {
    const context = {configuration};
    context.client = await getChromeClient(configuration.page);
    context.data = getDataObject();
    context.ignoredScripts = {};

    await start(context);

    const scanningObj = {
        getData: getData.bind(this, context),
        stop: stop.bind(this, context)
    };

    return new Proxy(context.configuration.page, {
        get: function (page, prop) {
            if (prop === 'scanner') {
                return scanningObj;
            } else {
                return page[prop];
            }
        }
    });
}

async function start(context) {
    const configuration = context.configuration;
    LOG.debug('start monitoring', configuration);

    await initSession(context);

    if (configuration.frames) {
        await frames.start(context);
    }
    if (configuration.network) {
        await network.start(context);
    }
    if (configuration.style) {
        await style.start(context);
    }
    if (configuration.scripts) {
        await scripts.start(context);
    }
    if (configuration.metadata) {
        await metadata.start(context);
    }
    if (configuration.storage) {
        await storage.start(context);
    }
    if (configuration.monitoring) {
        await monitoring.start(context);
    }
    if (configuration.performance) {
        await performance.start(context);
    }
}

async function getData(context) {
    LOG.debug('Preparing data...');
    const data = {};

    data.frames = await frames.stop(context);
    data.network = await network.stop(context);
    data.style = await style.stop(context);
    data.scripts = await scripts.stop(context);
    data.metadata = await metadata.stop(context);
    data.storage = await storage.stop(context);
    data.monitoring = await monitoring.stop(context);
    data.performance = await performance.stop(context);
    data.domEvents = await dom.getAllDOMEvents(context.client);

    context.data = getDataObject();

    cleanObject(data, 1);
    return JSON.parse(JSON.stringify(data));
}

async function initSession(context) {
    const {client, configuration} = context;
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
    await Page.setAdBlockingEnabled({enabled: Boolean(configuration.adBlocking)});
    await Page.setBypassCSP({enabled: Boolean(configuration.disableCSP)});

    if (configuration.userAgent) {
        await Emulation.setUserAgentOverride({userAgent: configuration.userAgent});
    }
    let blockedUrls = configuration.blockedUrls || [];
    if (configuration.disableServices) {
        const services = getBlockedDomains().map(domain => `*${domain}*`);
        blockedUrls = configuration.blockedUrls.concat(services);
    }
    if (blockedUrls.length) {
        await Network.setBlockedURLs({urls: blockedUrls});
    }
    if (configuration.stealth) {
        try {
            const stealthUA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/77.0.3865.120 Safari/537.36';
            const {identifier} = await client.Page.addScriptToEvaluateOnNewDocument({source: fs.readFileSync(path.resolve(__dirname, 'plugins', 'stealth.js'), {encoding: 'UTF-8'})});
            context.ignoredScripts[identifier] = 1;
            if (!configuration.userAgent) {
                await client.Emulation.setUserAgentOverride({userAgent: stealthUA});
            }
            const randomHeader = getRandomString();
            const addedHeaders = {
                'Accept-Encoding': 'gzip, deflate',
                'Accept-Language': 'en-US,en;q=0.9',
                'Cache-Control': 'no-cache',
                'Connection': 'keep-alive',
                'User-Agent': configuration.userAgent ? configuration.userAgent : stealthUA,
            };
            addedHeaders[randomHeader] = getRandomString();
            await client.Network.setExtraHTTPHeaders({headers: addedHeaders});
        } catch (e) {
            LOG.error(e);
        }
    }
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
