const LOG = require('./utils/logger');
const ChromeClient = require('./client.js');

class PuppeteerSession {
    constructor(context) {
        this.context = {
            ...context,
            data: {},
            client: null
        };
    }

    async start() {
        this.client = new ChromeClient(this.context);
        await this.client.start();
    }

    async getData() {
        LOG.debug('Preparing data');
        return await this.client.getData(this.context);
    }
}

module.exports = PuppeteerSession;
