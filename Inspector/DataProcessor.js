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
        delete  event.scriptId;
        eventsMap[eventObj.scriptId].push();
    }

    data.scripts = data.scripts.map(scriptObj => {
        if (eventsMap[scriptObj.scriptId]) {
            scriptObj.events = eventsMap[scriptObj.scriptId];
        }
        scriptObj.frameId = scriptObj.executionContextAuxData.frameId;
        scriptObj.contextId = scriptObj.executionContextId;
        scriptObj.coverage = coverageMap[scriptObj.scriptId];
        return scriptObj;
    });

    //Handle dynamic scripts
    const scriptsChildrenMap = {};
    const mainScripts = data.scripts.filter(s => !s.stackTrace && !!s.url);
    const innerScripts = data.scripts.filter(s => !!s.stackTrace);

    for (let i = 0; i < innerScripts.length; i++) {
        const scriptObj = innerScripts[i];
        scriptObj.initiator = scriptObj.stackTrace.callFrames[0];
        scriptsChildrenMap[scriptObj.initiator.scriptId] = scriptsChildrenMap[scriptObj.initiator.scriptId] || [];
        scriptsChildrenMap[scriptObj.initiator.scriptId].push(scriptObj);
    }


    return mainScripts.map(script => {
        const scriptObj = {...script};

        //Add dynamic scripts
        const scripts = scriptsChildrenMap[scriptObj.scriptId];
        if (scripts) {
            scriptObj.scripts = scripts;
        }

        delete scriptObj.executionContextAuxData;

        return scriptObj;
    });
}

function processNetwork(data) {
    const requests = data.network.requests;
    const responses = data.network.responses;

    return requests.map(request => {
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
