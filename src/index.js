const session = require('./session.js');
const LOG = require('./utils/logger.js');

/**
 *
 * @param opts {object}
 * @return {Promise}
 */
async function test(opts) {
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
 * @param page - puppeteer page
 * @param opts - scanning configuration
 * @return {Promise}
 */
async function setPuppeteerPage(page, opts = {}) {
    return await session.setPuppeteerPage(page, _getConfiguration(opts));
}

function _getConfiguration(opts) {
    opts.scan = opts.scan || {};
    opts.chrome = opts.chrome || {};
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
            }, ...opts.chrome
        },
        scan: {
            ...{
                research: false,
                scripts: true,
                resources: true,
                styles: true,
                metrics: true,
                frames: true,
                content: true
            }, ...opts.scan
        }
    };
}

module.exports = {
    test,
    setPuppeteerPage
};
