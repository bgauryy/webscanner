const Inspector = require('./Inspector/Inspector');
const Logger = require('./utils/Logger');
const Time = require('./utils/Time');
const minimist = require('minimist');
const {publishData} = require('./server.js');

const args = minimist(process.argv.slice(2));
const url = args.u || 'https://www.argos.co.uk/';
const userAgent = args.ua || 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/73.0.3683.103 Safari/537.36';
const externalPort = args.rp || 3333;
const disablePX = !!args.x;

if (!url) {
    Logger.debug('URL parameter is missing to pxWebInspector command (-u)');
    throw new Error('URL required');
}

Logger.debug(`Inspecting ${url}`);
Logger.debug(`UserAgent: ${userAgent}`);
Logger.debug(`ExternalPort: ${externalPort}`);
Logger.debug(`Disable PX scripts: ${disablePX}`);

run({url, userAgent, externalPort, disablePX});

async function run(opts) {
    const mId = Time.measure();
    const data = await Inspector.inspectURL(opts);

    if (data.err) {
        throw data.err;
    }
    publishData(JSON.stringify(data), opts.externalPort, Time.stopMeasure(mId));
    return data;
}







