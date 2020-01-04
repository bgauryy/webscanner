const scanner = require('./session.js');
const LOG = require('./utils/logger.js');
const {createContext} = require('./context.js');

/**
 *
 * @param page {object} puppeteer page object
 * @param collectConf {object} WebScanner collect configuration
 * @param rulesConf {object} WebScanner scanning rules
 * @return {Promise}
 */
async function getSession(page, collectConf, rulesConf) {
    const context = createContext(page, collectConf, rulesConf);
    LOG.setEnabled(context.log);
    //TODO(Guy):support more than one interface
    return await scanner.getPuppeteerSession(context);
}

module.exports = {
    getSession
};
