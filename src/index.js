const session = require('./session.js');
const LOG = require('./utils/logger.js');

/**
 *
 * @param opts {object}
 * @return {Promise}
 */
async function test(opts) {
    if (!opts || !opts.url) {
        LOG.error('url is missing');
        return;
    }
    const conf = _getConfiguration(opts);
    LOG.setEnabled(opts.log);
    const data = await session.scan(conf);
    if (conf.callback) {
        conf.callback(data);
    } else {
        return data;
    }
}

/**
 * @deprecated use getPuppeteerSession instead
 */
async function setPuppeteerPage(page, opts = {}) {
    return getPuppeteerSession(page, opts);
}

/**
 *
 * @param page - puppeteer page
 * @param opts - scanning configuration
 * @return {Promise}
 */
async function getPuppeteerSession(page, opts = {}) {
    LOG.setEnabled(opts.log);
    return await session.getPuppeteerSession(page, _getConfiguration(opts));
}


function _getConfiguration(opts = {}) {
    opts.callback = (typeof opts.callback === 'function') ? opts.callback : null;

    const defaultCollect = {
        research: false,
        scripts: true,
        resources: true,
        styles: true,
        metrics: true,
        frames: true,
        content: true,
        coverage: true,
        serviceWorker: true
    };

    const defaultChromeObj = {
        port: 9222,
        chromeFlags: ['--headless', '--disable-gpu', '--enable-precise-memory-info']
    };

    const defaultRules = {
        scanTime: 5,
        stopOnContentLoaded: true,
        blockedUrls: []
    };

    return {
        url: opts.url,
        chrome: {...defaultChromeObj, ...opts.chrome || {}},
        callback: opts.callback,
        log: opts.log || false,
        rules: {...defaultRules, ...opts.rules || {}},
        collect: {...defaultCollect, ...opts.collect || {}},
    };
}

module.exports = {
    test,
    setPuppeteerPage,
    getPuppeteerSession
};
