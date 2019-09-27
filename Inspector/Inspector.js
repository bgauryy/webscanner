const chromeLauncher = require('chrome-launcher');
const CRI = require('chrome-remote-interface');
const ChromeInterface = require('./ChromeDelegate.js');
const Logger = require('../utils/Logger.js');

let chrome;

async function run(opts) {
    const url = opts.url;
    const userAgent = opts.chrome.userAgent;
    const chromeLauncherPts = opts.chromeLauncherOpts || {
        port: 9222,
        chromeFlags: ['--headless', '--disable-gpu']
    };

    const data = {
        scripts: [],
        network: [],
        DOMEvents: [],
        frames: {}
    };

    let chromeClient;

    try {
        chrome = await chromeLauncher.launch(chromeLauncherPts);

        if (!chrome) {
            throw new Error('chromeLauncher missing');
        }

        chromeClient = await CRI();

        if (!chromeClient) {
            throw new Error('chrome-remote-interface missing');
        }

        await ChromeInterface.setClient(chromeClient, opts.disablePX);

        await ChromeInterface.setUserAgent(userAgent);
        await ChromeInterface.setOnNetworkRequestObj(data.network);
        await ChromeInterface.registerFrameEvents(data.frames);
        await ChromeInterface.scriptParsedHandler(data.scripts);

        await ChromeInterface.navigate(url);
        await ChromeInterface.waitDOMContentLoaded();

        await ChromeInterface.getAllDOMEvents(data.DOMEvents);

        ChromeInterface.movemouse();

        await sleep(5);

        const {metrics} = await ChromeInterface.getMetrics();
        data.metrics = metrics;
    } catch (err) {
        Logger.error(err);
        data.err = err;
    } finally {
        if (chromeClient) {
            try {
                await chromeClient.close();
                Logger.debug('closed chrome client');
            } catch (e) {
                Logger.error(e);
            }
        }
        try {
            await chrome.kill();
            Logger.debug('closed chrome process');
        } catch (e) {
            Logger.error(e);
        }
    }
    return processData(data);
}

function processData(data) {
    if (data.err) {
        return {error: data.err};
    }

    const responseData = {};
    responseData.scripts = processScripts(data);
    responseData.network = processNetwork(data);
    responseData.frames = processFrames(data);
    responseData.events = processEvents(data);

    return JSON.parse(JSON.stringify(responseData));
}

function processScripts(data) {
    return data.scripts.map(script => {
        const res = {...script, frameId: script.executionContextAuxData.frameId};
        res.contextId = res.executionContextId;
        delete res.contextId;
        delete res.executionContextAuxData;
        return res;
    });
}

function processNetwork(data) {
    const responses = data.network.responses;
    return data.network.map(request => {
        try {
            request.frame = data.frames[request.frameId].url;
        } catch (e) {
            //TODO - investigate
        }
        if (responses[request.requestId] && responses[request.requestId].response) {
            request.response = responses[request.requestId].response;
            delete responses[request.requestId];
        } else {
            //TODO - investigate
        }
        request.requestId;
        return request;
    });
}

function processFrames(data) {
    return data.frames;
}

function processEvents(data) {
    return data.DOMEvents;
}

function sleep(timeout) {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve();
        }, timeout * 1000);
    });
}

module.exports = {
    run
};
