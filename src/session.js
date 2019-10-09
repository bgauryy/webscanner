const {Scanner} = require('./scanner.js');
const LOG = require('./utils/logger.js');

async function scan(opts) {
    const metadata = {opts: opts, timestamp: +new Date()};
    const scanner = new Scanner(opts);
    await scanner.start();

    try {
        await scanner.navigate(opts.url);

        if (opts.stopOnContentLoaded) {
            await scanner.waitDOMContentLoaded();
        }
        await scanner.collectAllDOMEvents();
        await sleep(opts.scanTime);
        const data = await scanner.getData();

        return {...data, metadata};
    } catch (err) {
        LOG.error(err);
        return err;
    } finally {
        scanner.stop();
    }
}

async function setPuppeteerPage(page, opts) {
    opts.puppeteerPage = page;
    const scanner = new Scanner(opts);
    await scanner.start();
    page.getData = async function () {
        return await scanner.getData();
    };
}

function sleep(timeout) {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve();
        }, timeout * 1000);
    });
}

module.exports = {
    scan,
    setPuppeteerPage
};
