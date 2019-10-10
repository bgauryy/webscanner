const geoip = require('geoip-lite');
const snappy = require('snappy');

function processData(data, opts) {
    return new Promise((resolve => {
        let responseData = {};

        if (data.err) {
            return {error: data.err};
        }
        responseData.scripts = processScripts(data);
        responseData.resources = processNetwork(data);
        responseData.frames = processFrames(data);
        responseData.metrics = processMetrics(data);
        responseData.styleSheets = processStyle(data);

        //Remove undefined values
        responseData = JSON.parse(JSON.stringify(responseData));

        if (opts.compress) {
            snappy.compress(JSON.stringify(responseData), function (err, compressed) {
                resolve(compressed);
            });
        } else {
            resolve(responseData);
        }
    }));
}

function processStyle(data) {
    const styles = [];
    const styleKeysMap = Object.keys(data.style);

    for (let i = 0; i < styleKeysMap.length; i++) {
        const style = data.style[styleKeysMap[i]];
        style.source = style.source.text;
        style.url = style.sourceURL;
        addURLData(style);
        styles.push(style);
    }
    return styles;
}

function processScripts(data) {
    const coverage = data.coverage && data.coverage.result || [];
    const coverageMap = {};
    const eventsMap = {};

    //Set coverage
    for (let i = 0; i < coverage.length; i++) {
        const coverageObj = coverage[i];
        coverageMap[coverageObj.scriptId] = coverageObj.functions;
    }

    //Set events
    for (let i = 0; i < data.events.length; i++) {
        const eventObj = data.events[i];
        eventsMap[eventObj.scriptId] = eventsMap[eventObj.scriptId] || [];
        eventsMap[eventObj.scriptId].push(eventObj);
    }

    return data.scripts.map(scriptObj => {
        if (eventsMap[scriptObj.scriptId]) {
            scriptObj.events = eventsMap[scriptObj.scriptId];
        }

        scriptObj.frameId = scriptObj.executionContextAuxData.frameId;
        scriptObj.contextId = scriptObj.executionContextId;
        scriptObj.coverage = coverageMap[scriptObj.scriptId];
        scriptObj.frameURL = data.frames[scriptObj.frameId].url || 'about:blank';
        scriptObj.isModule = Boolean(scriptObj.isModule);
        scriptObj.length = Math.round(scriptObj.length / 1000) || 0;

        if (scriptObj.url === data.frames[scriptObj.frameId].url) {
            scriptObj.host = 'inline';
        } else {
            addURLData(scriptObj);
        }

        if (scriptObj.stackTrace) {
            const initiator = scriptObj.stackTrace.callFrames[0];
            scriptObj.parentScriptId = (initiator && initiator.scriptId) || '';
        }
        return scriptObj;
    });
}

function processNetwork(data) {
    const requests = data.resources.requests;
    const responses = data.resources.responses;

    return requests.map(_request => {
        const request = {..._request};

        addURLData(request);

        request.frame = data.frames[request.frameId].url;

        if (request.postData) {
            request.postData.length = Math.round(request.postData.length / 1000) || 0;
        }

        //Add response
        if (responses[request.requestId] && responses[request.requestId].response) {
            const response = responses[request.requestId].response;
            const ip = response.remoteIPAddress;

            if (ip) {
                const lookup = geoip.lookup(ip);
                response.ipCountry = lookup.country;
                response.timezone = lookup.timezone;
            }
            request.response = response;
        }

        return request;
    });
}

function processFrames(data) {
    const frames = [];

    //eslint-disable-next-line
    for (const frameId in data.frames) {
        addURLData(data.frames[frameId]);
        frames.push(data.frames[frameId]);
    }
    return frames;
}

function processMetrics(data) {
    const metrics = {};
    const metricsArr = data.metrics || [];

    for (let i = 0; i < metricsArr.length; i++) {
        const metric = metricsArr[i];
        metrics[metric.name] = metric.value;
    }
    return metrics;
}

function addURLData(obj) {
    if (!obj || !obj.url || typeof obj.url !== 'string') {
        return;
    }

    try {
        const urlObj = new URL(obj.url);
        obj.host = urlObj.host;
        obj.pathname = urlObj.pathname;
        obj.port = urlObj.port || undefined;
        obj.path = urlObj.path || undefined;
        obj.query = urlObj.query || undefined;
    } catch (e) {
        //ignore
    }
}

module.exports = {
    processData
};
