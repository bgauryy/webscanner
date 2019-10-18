const scanner = require('./scanner.js');
const LOG = require('./utils/logger.js');
const {getContext} = require('./context.js');

/**
 *
 * @param page - puppeteer page
 * @param opts - scanning configuration
 * @return {Promise}
 */
async function getSession(page, opts = {}) {
    const context = getContext(page, opts);
    LOG.setEnabled(context.log);
    return await scanner.getPuppeteerSession(context);
}

module.exports = {
    getSession
};
