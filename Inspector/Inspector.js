const ChromeAPI = require('./ChromeAPI.js');
const Logger = require('../utils/Logger.js');
const Helper = require('../utils/Helper.js');
const {processData} = require('./DataProcessor.js');

/**
 @param opts: <object>
 {
    url: <string>,
    userAgent: <string>,
    blockedURLs: <Array> ['*example.net*']
    chrome: {
        chromeLauncherOpts: <objext>
    }
}
 **/
async function run(opts) {
    const metadata = {...opts, timestamp: +new Date()};
    const session = new ChromeAPI.Session(opts);

    await session.init();
    try {
        await session.navigate(opts.url);
        await session.waitDOMContentLoaded();
        await session.getAllDOMEvents();
        await session.mouseMove();
        await Helper.sleep(5);
        await session.stop();
        const data = processData(session.data, opts);
        data.metadata = metadata;

        return data;
    } catch (err) {
        Logger.error(err);
        return err;
    } finally {
        session.kill();
    }
}

module.exports = {
    run
};
