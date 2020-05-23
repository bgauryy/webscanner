const Scanner = require('./scanner.js');
const LOG = require('./logger.js');
const {getContext} = require('./context.js');

/**
 *
 * @param pageObject - puppeteer pageObject
 * @param opts - scanning configuration
 * @return {Promise}
 */
async function getSession(pageObject, opts = {}) {
    const context = await getContext(pageObject, opts);

    LOG.setEnabled(context.configuration.log);
    return await Scanner.getSession(context);
}

module.exports = {
    getSession
};
