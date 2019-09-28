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

module.exports = {
    processData
};
