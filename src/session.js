const url = require('url');
const CRI = require('chrome-remote-interface');
const LOG = require('./utils/logger.js');
const {processData} = require('./dataProcessor.js');
const ChromeClient = require('./clients/chromeClient.js');

class PuppeteerSession {
    constructor(context) {
        this.context = {
            ...context,
            data: {},
            client: null
        };
    }

    async start() {
        this.context.client = await getChromeWebSocketConnection(this.context.page);
        this.client = new ChromeClient(this.context);
        await this.client.start();
    }

    async getData() {

        const data = await this.client.getData(this.context);
        return data;

        /*        LOG.debug('Preparing data');
                const collect = this.context.collect;

                if (collect.scriptDOMEvents) {
                    this.data.domEvents = await chromeClient.getAllDOMEvents(this.client);
                }
                if (collect.cookies) {
                    this.data.cookies = await chromeClient.getCookies(this.client);
                }
                if (collect.resources) {
                    this.data.resources = await chromeClient.getResources(this.client);
                }
                if (collect.styleCoverage) {
                    this.data.styleCoverage = await chromeClient.getStyleCoverage(this.client);
                }
                if (collect.scriptCoverage) {
                    this.data.scriptCoverage = await chromeClient.getScriptCoverage(this.client);
                }
                if (collect.metadata) {
                    this.data.metadata = await chromeClient.getMetadata(this.client);
                }
                if (collect.JSMetrics) {
                    this.data.JSMetrics = await chromeClient.getExecutionMetrics(this.client);
                }
                //TODO:return clone of data object, and clean memory (dump this.data)
                return processData(this.data, this.context);*/
    }
}

async function getChromeWebSocketConnection(page) {
    const connection = page._client._connection._url;
    const {hostname, port} = url.parse(connection, true);
    return await CRI({host: hostname, port});
}

module.exports = PuppeteerSession;
