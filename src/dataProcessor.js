const geoip = require('geoip-lite');

//eslint-disable-next-line
async function processData(data, opts) {
    const responseData = {};

    if (data.err) {
        return {error: data.err};
    }
    responseData.scripts = processScripts(data);
    responseData.resources = processNetwork(data);
    responseData.frames = processFrames(data);
    responseData.metrics = processMetrics(data);
    responseData.styleSheets = processStyle(data);
    //Remove undefined values
    return JSON.parse(JSON.stringify(responseData));
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

    return data.scripts.map(_scriptObj => {
        const scriptObj = {
            scriptId: _scriptObj.scriptId,
            url: _scriptObj.url,
            isModule: Boolean(_scriptObj.isModule),
            source: _scriptObj.source,
            frameId: _scriptObj.executionContextAuxData.frameId,
            frameURL: (_scriptObj.frameId && data.frames[_scriptObj.frameId] && data.frames[_scriptObj.frameId].url) || 'about:blank',
            coverage: coverageMap[_scriptObj.scriptId],
            length: getKBLength(_scriptObj.length),
            events: eventsMap[_scriptObj.scriptId]
        };

        if (scriptObj.url === data.frames[scriptObj.frameId].url) {
            scriptObj.host = 'inline';
        } else {
            addURLData(scriptObj);
        }

        //TODO - check
        if (_scriptObj.stackTrace) {
            scriptObj.stackTrace = _scriptObj.stackTrace;
            scriptObj.parentScript = scriptObj.stackTrace.callFrames && scriptObj.stackTrace.callFrames[0];
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

function getKBLength(length) {
    return Math.round(length / 1000) || 0;
}

module.exports = {
    processData
};
