const ChromeAPI = require('./ChromeAPI.js');
const Logger = require('../utils/Logger.js');
const Helper = require('../utils/Helper.js');
const {processData} = require('./DataProcessor.js');

/**
 @param opts: <object>
 {
    url: <string>,
    userAgent: <string>,
    chrome: {
        chromeLauncherOpts: <objext>
    }
}
 **/
async function run(opts) {
    const session = new ChromeAPI.Session(opts);
    await session.init();

    try {
        await session.navigate(opts.url);
        await session.waitDOMContentLoaded();
        await session.getAllDOMEvents();
        await session.mouseMove();
        await Helper.sleep(5);
        await session.getMetrics();
        return processData(session.data);
    } catch (err) {
        Logger.error(err);
        session.data = err;
    } finally {
        session.kill();
    }
}

module.exports = {
    run
};
