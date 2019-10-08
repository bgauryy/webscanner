const Inspector = require('./Inspector.js');
const Logger = require('./utils/Logger.js');
const Server = require('../public/server.js');

async function scan(_opts) {
    const opts = _getOpts(_opts);
    Logger.setLogLevel(_opts.logLevel);
    const data = await Inspector.scan(opts);

    if (opts.callback) {
        opts.callback(data);
    } else {
        return data;
    }
}

function show(data, port = 3333) {
    if (!data) {
        Logger.error('Data object is missing');
        return;
    }
    Server.show(data, port);
}

async function setPage(page) {
    return await Inspector.puppeteer(page);
}

function _getOpts(opts) {
    if (!opts || !opts.url) {
        throw new Error('Configuration Error');
    }

    return {
        url: opts.url,
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/79.0.3933.0 Safari/537.36',
        callback: (typeof opts.callback === 'function') ? opts.callback : null,
        stopOnContentLoaded: (typeof opts.stopOnContentLoaded === 'boolean') ? opts.stopOnContentLoaded : true,
        scanTime: (typeof opts.scanTime === 'number') ? opts.scanTime : 5,
        chrome: {
            ...{
                port: 9222,
                chromeFlags: ['--headless', '--disable-gpu']
            }, ...((typeof opts.chrome === 'object') ? opts.chrome : {})
        }
    };
}

module.exports = {
    scan,
    show,
    setPage
};
