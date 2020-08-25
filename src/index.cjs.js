'use strict';

const Scanner = require('./scanner.js');

const LOG = require('./logger.js');

const {
  getConfiguration
} = require('./configuration.js');
/**
 *
 * @param page - puppeteer page
 * @param opts - scanning configuration
 * @return {Promise}
 */


async function getSession(page, opts = {}) {
  const configuration = getConfiguration(page, opts);
  LOG.setEnabled(configuration.log);
  return await Scanner.getSession(configuration);
}

module.exports = {
  getSession
};
