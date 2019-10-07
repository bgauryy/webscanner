const path = require('path');
const argv = require('optimist').argv;
const Inspector = require('./Inspector/Inspector');
const Logger = require('./utils/Logger');
const Server = require('./server.js');

let url, userAgent, uiPort, logLevel;

async function run(_url, _userAgent, _uiPort, _LogLevel) {
    setArgs(_url, _userAgent, _uiPort, _LogLevel);

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

function setArgs(opts = {}) {
    url = opts.url || argv.url || 'https://www.example.com';
    userAgent = opts.userAgent || argv.userAgent || 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/73.0.3683.103 Safari/537.36';
    uiPort = opts.uiPort || argv.uiPort || 1987;
    logLevel = opts.logLevel || argv.logLevel || Logger.LOG.ALL;
    Logger.info(`\nurl: ${url} \nuserAgent: ${userAgent} \nuiPort: ${uiPort} \nLogLevel: ${logLevel}`);
}

module.exports = {
    run
};



