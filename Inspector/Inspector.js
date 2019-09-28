const chromeLauncher = require('chrome-launcher');
const CRI = require('chrome-remote-interface');
const ChromeAPI = require('./ChromeAPI.js');
const Logger = require('../utils/Logger.js');
const Helper = require('../utils/Helper.js');
const {processData} = require('./DataProcessor.js');

async function run(opts) {
    const context = await getInspectionContext(opts);
    const session = ChromeAPI.getSession(context);
    await session.init();

    try {
        await session.navigate(context.url);
        await session.waitDOMContentLoaded();
        await session.getAllDOMEvents();
        await session.mouseMove();
        await Helper.sleep(5);
        await session.getMetrics();
        return processData(context.data);
    } catch (err) {
        Logger.error(err);
        context.data = err;
    } finally {
        context.kill();
    }

}

async function getInspectionContext(opts) {
    const chrome = await chromeLauncher.launch(opts.chromeLauncherOpts || {
        port: 9222,
        chromeFlags: ['--headless', '--disable-gpu']
    });

    const chromeRemoteInterface = await CRI();

    if (!chrome || !chromeRemoteInterface) {
        throw new Error('chrome instance error');
    }

    return {
        url: opts.url,
        userAgent: opts.userAgent,
        chrome,
        chromeRemoteInterface,
        kill: async function () {
            try {
                await chromeRemoteInterface.close();
                Logger.debug('closed chrome client');
            } catch (e) {
                Logger.error(e);
            }
            try {
                await chrome.kill();
                Logger.debug('closed chrome process');
            } catch (e) {
                Logger.error(e);
            }
        }
    };
}

module.exports = {
    run
};
