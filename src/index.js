const argv = require('optimist').argv;
const Inspector = require('./Inspector');
const Logger = require('./utils/Logger');
const Server = require('../public/server.js');

async function run(opts) {
    opts = _getConfiguration(opts);

    Logger.setLogLevel(opts.logLevel);

    if (opts.uiPort) {
        Logger.info(`Running server on localhost:${opts.uiPort}`);
        Server.init(opts.uiPort);
    }

    const data = await Inspector.run(opts);

    if (data instanceof Error) {
        throw data;
    }

    if (opts.uiPort) {
        Server.publish(JSON.stringify(data));
        Logger.info(`Results: http://localhost:${opts.uiPort}`);
    }

    return data;
}

async function setPage(page) {
    return await Inspector.puppeteer(page);
}

function _getConfiguration(opts = {}) {
    return {
        url: opts.url || argv.url || 'https://www.example.com',
        userAgent: opts.userAgent || argv.userAgent || 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/73.0.3683.103 Safari/537.36',
        uiPort: opts.uiPort || argv.uiPort || 3333,
        logLevel: opts.logLevel || argv.logLevel || Logger.LOG.ALL
    };
}

module.exports = {
    run,
    setPage
};
