async function processData(data, {collect}) {
    if (!data) {
        return;
    }
    const responseData = {};

    processFrames(data.frames);
    processScripts(data, collect);
    processNetwork(data);

    if (collect.frames) {
        responseData.frames = data.frames;
    }
    if (collect.scripts) {
        responseData.scripts = data.scripts;
    }
    if (collect.requests) {
        responseData.requests = data.requests;
    }
    if (collect.styles) {
        processStyle(data, collect);
        responseData.styleSheets = data.styles;
    }
    if (collect.storage) {
        responseData.storage = data.storage;
    }
    if (collect.serviceWorker) {
        responseData.serviceWorker = data.serviceWorker;
    }
    if (collect.metrics) {
        responseData.metrics = processMetrics(data.metrics);
    }
    if (collect.cookies) {
        responseData.cookies = data.cookies;
    }
    if (collect.logs) {
        responseData.logs = data.logs;
    }
    if (collect.console) {
        responseData.console = data.console;
    }
    if (collect.errors) {
        responseData.errors = data.errors;
    }
    if (collect.storage) {
        responseData.storage = data.storage;
    }

    //Remove undefined values
    return JSON.parse(JSON.stringify(responseData));
}

function processScripts(data, collect) {
    if (!Object.keys(data.scripts).length) {
        return;
    }

    const coverage = collect.scriptCoverage && data.coverage && data.coverage.JSCoverage;
    if (coverage) {
        for (let i = 0; i < coverage.length; i++) {
            const {scriptId, functions} = coverage[i];
            const script = data.scripts[scriptId];

            if (!script) {
                continue;
            }
            const functionsNames = new Set();
            let usedBytes = 0;

            for (let i = 0; i < functions.length; i++) {
                const func = functions[i];
                if (func.functionName) {
                    functionsNames.add(func.functionName);
                }

                for (let j = 0; j < func.ranges.length; j++) {
                    const range = func.ranges[j];
                    usedBytes += range.endOffset - range.startOffset;
                    if (range.count > 1) {
                        //TODO - check
                    }
                }
            }
            script.coverage = {
                usedBytes,
                usage: usedBytes / script.length,
                functionsNames: Array.from(functionsNames).sort()
            };
        }
    }

    //Set events
    if (data.domEvents) {
        for (let i = 0; i < data.domEvents.length; i++) {
            const eventObj = data.domEvents[i];
            const script = data.scripts[eventObj.scriptId];

            if (script) {
                delete eventObj.scriptId;
                script.events = script.events || [];
                script.events.push(eventObj);
            }
        }
    }

    //eslint-disable-next-line
    for (const scriptId in data.scripts) {
        const script = data.scripts[scriptId];
        const frame = data.frames[script.frameId];
        script.frameURL = frame.url;

        if (script.frameURL === script.url) {
            script.url = 'inline';
        }

        //TODO - extract from function
        if (script.stackTrace) {
            script.parentScript = script.stackTrace.callFrames && script.stackTrace.callFrames[0];
        }
    }
}

function processStyle(data, collect) {
    const coverage = collect.styleCoverage && data.coverage && data.coverage.CSSCoverage;
    if (coverage) {
        for (let i = 0; i < coverage.length; i++) {
            const {styleSheetId, endOffset, startOffset} = coverage[i];
            const style = data.styles[styleSheetId];

            if (style) {
                style.coverage = style.coverage || {};
                style.coverage.usedBytes = style.coverage.usedBytes || 0;
                style.coverage.usedBytes += endOffset - startOffset;
            }

        }
    }
    //eslint-disable-next-line
    for (const styleId in data.styles) {
        const style = data.styles[styleId];
        if (style.coverage) {
            style.coverage.usage = style.coverage.usedBytes / style.length;
        }
    }
}

function processNetwork(data) {
    if (!Object.keys(data.requests).length) {
        return;
    }

    //eslint-disable-next-line
    for (const requestId in data.requests) {
        const request = data.requests[requestId];
        const frame = data.frames[request.frameId] || {};
        request.frameURL = frame.url;
    }
    return data.requests;
}

function processFrames(frames) {
    //eslint-disable-next-line
    for (const frameId in frames) {
        const frame = frames[frameId];
        frame.url = frame.url || 'about:blank';
    }
}

function processMetrics(collectedMetrics) {
    const metrics = {};

    for (let i = 0; i < collectedMetrics.length; i++) {
        const metric = collectedMetrics[i];
        metrics[metric.name] = metric.value;
    }
    return metrics;
}

module.exports = {
    processData
};
