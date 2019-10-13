const LOG = require('./utils/logger.js');
const {Scanner} = require('./scanner.js');

async function scan(opts) {
    LOG.debug('Starting scan');

    //eslint-disable-next-line
    return new Promise(async function (resolve, reject) {
        const scanner = new Scanner(opts);
        await scanner.start();

        try {
            LOG.debug(`Navigating ${opts.url}`);
            await scanner.navigate(opts.url);
            if (opts.stopOnContentLoaded) {
                await scanner.waitDOMContentLoaded();
                LOG.debug('Content loaded');
            }
            await scanner.collectAllDOMEvents();
            setTimeout(async function () {
                LOG.debug('Finished scanning');
                const data = await scanner.getData();
                await scanner.stop();
                resolve(data);
            }, opts.scanTime * 1000);
        } catch (err) {
            LOG.error('Scanning error', err);
            await scanner.stop();
            reject(err);
        }
    });
}

async function getPuppeteerSession(page, opts) {
    opts.puppeteerPage = page;
    const scanner = new Scanner(opts);

    try {
        LOG.debug('Setting puppeteer page');
        await scanner.start();
        return new Proxy(page, {
            get: function (page, prop) {
                if (prop === 'getData') {
                    return async function () {
                        LOG.debug('Returning scanning data');
                        return await scanner.getData();
                    };
                }
                return page[prop];
            }
        });
    } catch (e) {
        LOG.error('Puppeteer error', e);
    }
}

module.exports = {
    scan,
    getPuppeteerSession
};
