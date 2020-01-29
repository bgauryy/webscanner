const PuppeteerSession = require('./session.js');
const LOG = require('./utils/logger.js');
const {createContext} = require('./context.js');

//TODO:Remove close
const API_EXTENSION = {
    getData: 'getData',
    close: 'close'
};

async function getSession(page, collectOpts, rules) {
    const context = createContext(page, collectOpts, rules);
    LOG.setEnabled(context.rules.log);
    const session = new PuppeteerSession(context);
    await session.start();
    return new Proxy(page, {
        get: function (_page, prop) {
            switch (prop) {
                case API_EXTENSION.getData:
                    return async function () {
                        return await session.getData();
                    };
                case API_EXTENSION.close:
                    return async function () {
                        return await session.close();
                    };
                default:
                    return _page[prop];
            }
        }
    });
}

module.exports = {
    getSession
};
