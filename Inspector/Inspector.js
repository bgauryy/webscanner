const ChromeAPI = require('./ChromeAPI.js');
const Logger = require('../utils/Logger.js');
const Helper = require('../utils/Helper.js');

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

    await session.start();

    try {
        await session.navigate(opts.url);
        await session.waitDOMContentLoaded();
        await session.getAllDOMEvents();
        await Helper.sleep(5);
        const data = await session.getData();
        data.metadata = metadata;

        return data;
    } catch (err) {
        Logger.error(err);
        return err;
    } finally {
        session.kill();
    }
}

async function puppeteer(page) {
    const session = new ChromeAPI.Session({puppeteer: {page}});
    await session.start();
    page.getData = async function () {
        return await session.getData();
    };
}

module.exports = {
    run,
    puppeteer
};
