const session = require('./session.js');
const Server = require('../public/server.js');
const LOG = require('./utils/logger.js');

/**
 *
 * @param opts {object}
 * @return {Promise}
 */
async function scan(opts) {
    if (!opts || !opts.url) {
        throw new Error('Configuration Error');
    }
    const conf = _getConfiguration(opts);
    LOG.setLogLevel(opts.logLevel);
    const data = await session.scan(conf);
    if (conf.callback) {
        conf.callback(data);
    } else {
        return data;
    }
}

/**
 *
 * @param data - scanning data object
 * @param port
 */
function show(data, port = 3333) {
    if (!data) {
        LOG.error('Data object is missing');
        return;
    }
    Server.show(data, port);
}

/**
 *
 * @param page - puppeteer page
 * @param opts - scanning configuration
 * @return {Promise}
 */
async function setPuppeteerPage(page, opts = {}) {
    return await session.setPuppeteerPage(page, _getConfiguration(opts));
}

/**
 *
 * @param data {Uint8Array} compressed scanning object
 * @return {Promise}
 */
/*function uncompress(data) {
    return new Promise((resolve, reject) => {
        snappy.uncompress(data, {asBuffer: false}, function (err, original) {
            if (err) {
                reject(err);
            } else {
                resolve(original);
            }
        });
    });
}*/

function _getConfiguration(opts) {
    return {
        url: opts.url,
        userAgent: opts.userAgent || 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/79.0.3933.0 Safari/537.36',
        callback: (typeof opts.callback === 'function') ? opts.callback : null,
        stopOnContentLoaded: (typeof opts.stopOnContentLoaded === 'boolean') ? opts.stopOnContentLoaded : true,
        scanTime: (typeof opts.scanTime === 'number' && opts.scanTime > 0 && opts.scanTime < 1000) ? opts.scanTime : 10,
        blockedUrls: (Array.isArray(opts.blockedUrls)) ? opts.blockedUrls : [],
        compress: Boolean(opts.compress),
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
