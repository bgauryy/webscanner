const session = require('./session.js');
const Server = require('../public/server.js');
const LOG = require('./utils/logger.js');

async function scan(_opts) {
    if (!_opts || !_opts.url) {
        throw new Error('Configuration Error');
    }
    const opts = _getOpts(_opts);
    LOG.setLogLevel(_opts.logLevel);
    const data = await session.scan(opts);
    if (opts.callback) {
        opts.callback(data);
    } else {
        return data;
    }
}

function show(data, port = 3333) {
    if (!data) {
        LOG.error('Data object is missing');
        return;
    }
    Server.show(data, port);
}

async function setPuppeteerPage(page, opts = {}) {
    return await session.setPuppeteerPage(page, opts);
}

function _getOpts(opts) {
    return {
        url: opts.url,
        userAgent: opts.userAgent || 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/79.0.3933.0 Safari/537.36',
        callback: (typeof opts.callback === 'function') ? opts.callback : null,
        stopOnContentLoaded: (typeof opts.stopOnContentLoaded === 'boolean') ? opts.stopOnContentLoaded : true,
        scanTime: (typeof opts.scanTime === 'number' && opts.scanTime > 0 && opts.scanTime < 1000) ? opts.scanTime : 10,
        blockedUrls: (Array.isArray(opts.blockedUrls)) ? opts.blockedUrls : [],
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
    setPuppeteerPage
};
