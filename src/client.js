const fs = require('fs');
const path = require('path');
const CRI = require('chrome-remote-interface');
const url = require('url');
const LOG = require('./utils/logger');
const {getBlockedDomains} = require('./assets/blockedDomains');
const NetworkMonitor = require('./monitors/network');
const IFrameMonitor = require('./monitors/iframes');
const ScriptMonitor = require('./monitors/script');
const STEALTH_JS_PATH = path.resolve(__dirname, 'plugins', 'stealth.js');
const ignoredScripts = {};

class Client {
    constructor(context) {
        this.monitors = [];
        this.context = context;
    }

    async start() {
        const client = await getChromeWebSocketConnection(this.context.page);
        const {data, collect, rules} = this.context;
        await setRules(client, rules);

        //collect.scripts
        await startMonitoring(this.monitors, new ScriptMonitor(client, data, collect, rules));
        //collect.network
        await startMonitoring(this.monitors, new NetworkMonitor(client, data, collect, rules));
        //collect.frames
        await startMonitoring(this.monitors, new IFrameMonitor(client, data, collect, rules));
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

    if (rules.userAgent) {
        await client.Emulation.setUserAgentOverride({userAgent: rules.userAgent});
    }
    if (rules.stealth) {
        try {
            const stealthUA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/77.0.3865.120 Safari/537.36';
            const source = fs.readFileSync(STEALTH_JS_PATH, {encoding: 'UTF-8'});
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

    let blockedUrls = rules.blockedUrls;

    if (rules.disableServices) {
        const services = getBlockedDomains().map(domain => `*${domain}*`);
        blockedUrls = rules.blockedUrls.concat(services);
    }

    if (blockedUrls.length) {
        await client.Network.setBlockedURLs({urls: blockedUrls});
    }
}

async function startMonitoring(monitors, monitor) {
    monitors.push(monitor);
    await monitor.monitor();
}

async function getChromeWebSocketConnection(page) {
    const connection = page._client._connection._url;
    const {hostname, port} = url.parse(connection, true);
    return await CRI({host: hostname, port});
}

module.exports = Client;
