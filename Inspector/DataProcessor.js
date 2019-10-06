const geoip = require('geoip-lite');

function processData(data) {
    if (data.err) {
        return {error: data.err};
    }

    const responseData = {};
    responseData.scripts = processScripts(data);
    responseData.network = processNetwork(data);
    responseData.frames = processFrames(data);
    responseData.metrics = processMetrics(data);
    responseData.style = processStyle(data);

    return JSON.parse(JSON.stringify(responseData));
}

function processStyle(data) {
    const styles = [];
    const styleKeysMap = Object.keys(data.style);

    for (let i = 0; i < styleKeysMap.length; i++) {
        const style = data.style[styleKeysMap[i]];
        style.source = style.source.text;
        styles.push(style);
    }
    return styles;
}

function processScripts(data) {
    //Set coverage
    const coverage = data.coverage.result;
    const coverageMap = {};
    for (let i = 0; i < coverage.length; i++) {
        const coverageObj = coverage[i];
        coverageMap[coverageObj.scriptId] = coverageObj.functions;
    }

    //Set events
    const eventsMap = {};
    for (let i = 0; i < data.events.length; i++) {
        const eventObj = data.events[i];
        eventsMap[eventObj.scriptId] = eventsMap[eventObj.scriptId] || [];
        eventsMap[eventObj.scriptId].push(eventObj);
    }

    const scripts = data.scripts.map(scriptObj => {
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
            try {
                const urlObj = new URL(scriptObj.url);
                scriptObj.host = urlObj.host;
                scriptObj.pathname = urlObj.pathname;
            } catch (e) {
                //ignore
            }
        }

        if (scriptObj.stackTrace) {
            const initiator = scriptObj.stackTrace.callFrames[0];
            scriptObj.parentScriptId = (initiator && initiator.scriptId) || '';
        }
        return scriptObj;
    });
    return scripts;
}

function processNetwork(data) {
    const requests = data.network.requests;
    const responses = data.network.responses;

    return requests.map(request => {
        request.frame = data.frames[request.frameId].url;

        if (request.postData) {
            request.postData.length = Math.round(request.postData.length / 1000) || 0;
        }


        //Add response
        if (responses[request.requestId] && responses[request.requestId].response) {
            const response = responses[request.requestId].response;
            const ip = response.remoteIPAddress;

            if (ip) {
                response.ipCountry = geoip.lookup(ip).country;
            }

            request.response = response;
        }

        return request;
    });
}

function processFrames(data) {
    return data.frames;
}

function processMetrics(data) {
    const metrics = {};
    const arr = data.metrics.metrics;
    for (let i = 0; i < arr.length; i++) {
        const metric = arr[i];
        metrics[metric.name] = metrics[metric.value];
    }
    return metrics;
}

module.exports = {
    processData
};
