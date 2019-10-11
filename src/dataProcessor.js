const geoip = require('geoip-lite');

//eslint-disable-next-line
async function processData(data, opts) {
    const responseData = {};

    if (data.err) {
        return {error: data.err};
    }

    responseData.frames = processFrames(data);
    responseData.scripts = processScripts(data);
    responseData.resources = processResources(data);
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
            coverage: coverageMap[_scriptObj.scriptId],
            length: getKBLength(_scriptObj.length),
            events: eventsMap[_scriptObj.scriptId]
        };


        scriptObj.frameId = _scriptObj.executionContextAuxData.frameId;

        const frame = data.frames[_scriptObj.frameId];
        if (frame) {
            scriptObj.frameURL = frame.url;
        }


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

function processResources(data) {
    const requests = data.resources.requests;
    const responses = data.resources.responses;

    return requests.map(_request => {
        const request = {
            url: _request.url,
            requestId: _request.requestId,
            documentURL: _request.documentURL,
            timestamp: _request.timestamp, //TODO - get relative time
            wallTime: _request.wallTime, //TODO - get relative time
            initiator: _request.initiator,
            type: _request.type,
            frameId: _request.frameId,
            loaderId: _request.loaderId,
        };

        if (_request.request) {
            const req = _request.request;
            request.method = req.method;
            request.headers = req.headers;
            request.mixedContentType = req.mixedContentType;
            request.initialPriority = req.initialPriority;
            request.referrerPolicy = req.referrerPolicy;
        }

        const frame = data.frames[request.frameId];
        if (frame) {
            request.frameURL = frame.url;
        }

        addURLData(request);
        request.frame = data.frames[request.frameId].url;


        if (request.postData) {
            request.postData.length = Math.round(request.postData.length / 1000) || 0;
        }

        const _response = responses[request.requestId] && responses[request.requestId].response;
        if (_response) {
            const response = {};
            const ip = _response.remoteIPAddress;

            if (ip) {
                const lookup = geoip.lookup(ip);
                response.ip = ip;
                response.country = lookup.country;
                response.timezone = lookup.timezone;
            }

            response.status = _response.status;
            response.statusText = _response.statusText || undefined;
            response.headers = _response.headers;
            response.mimeType = _response.mimeType;
            response.connectionReused = _response.connectionReused;
            response.remotePort = _response.remotePort;
            response.fromDiskCache = _response.fromDiskCache;
            response.fromServiceWorker = _response.fromServiceWorker;
            response.fromPrefetchCache = _response.fromPrefetchCache;
            response.encodedDataLength = _response.encodedDataLength;
            response.timing = _response.timing; //TODO - process timing
            response.protocol = _response.protocol;
            response.securityState = _response.securityState;
            response.security = _response.securityDetails;

            request.response = response;
        }

        return request;
    });
}

function processFrames(data) {
    const frames = [];

    //eslint-disable-next-line
    for (const frameId in data.frames) {
        const frame = data.frames[frameId];
        if (frame) {
            if (frame.url) {
                addURLData(frame);
            } else {
                frame.url = 'about:blank';
            }
        }

        frames.push({
            frameId: frame.frameId,
            parentFrameId: frame.parentFrameId,
            url: frame.url,
            host: frame.host,
            pathname: frame.pathname,
            port: frame.port,
            path: frame.path,
            query: frame.query,
            stack: frame.stack,
            loaderId: frame.loaderId,
            name: frame.name,
            state: frame.state
        });
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
