const fs = require('fs');
const path = require('path');
const LOG = require('./logger.js');
const {cleanObject, getRandomString} = require('./utils');
const {getBlockedDomains} = require('../src/assets/blockedDomains.js');
const frames = require('./monitor/iframe.js');
const network = require('./monitor/network.js');
const style = require('./monitor/style.js');
const scripts = require('./monitor/scripts.js');
const metadata = require('./monitor/metadata.js');
const storage = require('./monitor/storage.js');
const monitoring = require('./monitor/monitoring.js');
const performance = require('./monitor/performance.js');

async function getSession(context) {
    await start(context);
    return {
        getData: getData.bind(null, context)
    };
}

async function start(context) {
    LOG.debug('start scanning', context);
    await initSession(context);
    await frames.start(context);
    await network.start(context);
    await style.start(context);
    await scripts.start(context);
    await metadata.start(context);
    await storage.start(context);
    await monitoring.start(context);
    await performance.start(context);
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
    cleanObject(data, 1);
    return JSON.parse(JSON.stringify(data));
}

module.exports = {
    getSession
};
