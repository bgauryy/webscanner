const path = require('path');
const argv = require('optimist').argv;
const Inspector = require('./Inspector/Inspector');
const Logger = require('./utils/Logger');
const Time = require('./utils/Time');
const Server = require('./server.js');

let url = 'https://www.example.com';
let userAgent = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/73.0.3683.103 Safari/537.36';
let port = 3333;

getArgs();

Server.init({port: port, path: path.join(__dirname, 'public')});

run({url, chrome: {chromeLauncherOpts: null, userAgent}});

async function run(opts) {
    const mId = Time.measure();
    const data = await Inspector.run(opts);
    const stopTime = Time.stopMeasure(mId);

    if (data.err) {
        throw data.err;
    }
    const url = Server.publish(JSON.stringify(data));
    Logger.log(`Time: ${stopTime}`);
    Logger.log(`${url}`);

    return data;
}

function getArgs() {
    url = argv.url || url;
    userAgent = argv.userAgent || userAgent;
    port = argv.port || port;
    Logger.log(`url: ${url}\nuserAgent: ${userAgent}\nport: ${port}`);
}



