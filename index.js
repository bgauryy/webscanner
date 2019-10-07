const path = require('path');
const argv = require('optimist').argv;
const Inspector = require('./Inspector/Inspector');
const Logger = require('./utils/Logger');
const Server = require('./server.js');

async function run(_url, _userAgent, _uiPort, _LogLevel) {
    const args = getParameters(_url, _userAgent, _uiPort, _LogLevel);
    const {url, userAgent, uiPort, logLevel} = args;

    Logger.setLogLevel(logLevel);

    if (uiPort) {
        Server.init({port: uiPort, path: path.join(__dirname, 'ui', 'dist')});
    }

    const data = await Inspector.run({url, userAgent, chrome: {chromeLauncherOpts: null}});

    if (data instanceof Error) {
        throw data;
    }

    if (uiPort) {
        const url = Server.publish(JSON.stringify(data));
        Logger.info(`Results: ${url}`);
    }

    Logger.debug('Done');

    return data;
}

function getParameters(opts = {}) {
    const url = opts.url || argv.url || 'https://www.example.com';
    const userAgent = opts.userAgent || argv.userAgent || 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/73.0.3683.103 Safari/537.36';
    const uiPort = opts.uiPort || argv.uiPort || 1987;
    const logLevel = opts.logLevel || argv.logLevel || Logger.LOG.ALL;
    const res = {url, userAgent, uiPort, logLevel};
    Logger.info(JSON.stringify(res));

    return res;
}

async function setPage(page) {
    return await Inspector.puppeteer(page);
}

module.exports = {
    run,
    setPage
};
