const path = require('path');
const argv = require('optimist').argv;
const Inspector = require('./Inspector/Inspector');
const Logger = require('./utils/Logger');
const Server = require('./server.js');

let url = 'https://www.example.com';
let userAgent = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/73.0.3683.103 Safari/537.36';
let uiPort = null;
let logLevel = null;

run();

async function run() {
    setArgs();
    Logger.setLogLevel(logLevel);

    if (uiPort) {
        Server.init({port: uiPort, path: path.join(__dirname, 'public')});
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

function setArgs() {
    url = argv.url || url;
    userAgent = argv.userAgent || userAgent;
    uiPort = argv.uiPort;
    logLevel = argv.logLevel;
    Logger.info(`\nurl: ${url} \nuserAgent: ${userAgent} \nuiPort: ${uiPort} \nLogLevel: ${logLevel}`);
}



