const LOG = require('../src/utils/logger');
const {isEmptyObject} = require('../src/utils/clientHelper');

function processData(data, context) {
    if (!data || !context) {
        return;
    }

    const collect = context.collect || {};
    const responseData = {};
    //TODO: remove URL for none-frame resources. move frames to default ?
    if (collect.frames) {
        responseData.frames = processFrames(data.frames, data.resources);
    }
    if (collect.network) {
        responseData.requests = processRequests(data.requests, responseData.frames);
    }
    if (collect.scripts) {
        responseData.scripts = processScripts(data.scripts, data.domEvents, data.scriptCoverage, responseData.frames);
    }
    if (collect.JSMetrics) {
        responseData.JSMetrics = processJSMetrics(data.JSMetrics, responseData.scripts);
    }
    if (collect.styles) {
        responseData.styleSheets = processStyle(data.styles, data.styleCoverage);
    }
    if (collect.metadata) {
        responseData.metadata = processMetadata(data.metadata);
    }
    if (collect.serviceWorker) {
        responseData.serviceWorker = processServiceWorker(data.serviceWorker);
    }
    if (!isEmptyObject(data.errors)) {
        responseData.errors = data.errors;
    }
    if (!isEmptyObject(data.console)) {
        responseData.console = data.console;
    }
    if (!isEmptyObject(data.logs)) {
        responseData.logs = data.logs;
    }
    if (!isEmptyObject(data.dataURI)) {
        responseData.dataURI = data.dataURI;
    }
    if (!isEmptyObject(data.storage)) {
        responseData.storage = data.storage;
    }
    if (!isEmptyObject(data.cookies)) {
        responseData.cookies = data.cookies;
    }
    queueMicrotask(() => {
        data = {};
    });
    return JSON.parse(JSON.stringify(responseData));
}

function processServiceWorker(serviceWorkers) {
    const _serviceWorkers = [];

    //eslint-disable-next-line
    for (const id in serviceWorkers) {
        _serviceWorkers.push(serviceWorkers[id]);
    }
    return _serviceWorkers;
}

function processStyle(styles, styleCoverage,) {
    styles = styles || {};
    styleCoverage = styleCoverage || [];

    for (let i = 0; i < styleCoverage.length; i++) {
        const {styleSheetId, endOffset, startOffset} = styleCoverage[i];
        const style = styles[styleSheetId];

        if (style) {
            style.coverage = style.coverage || {};
            style.coverage.usedBytes = style.coverage.usedBytes || 0;
            style.coverage.usedBytes += endOffset - startOffset;
        }
    }

    //eslint-disable-next-line
    for (const styleId in styles) {
        const style = styles[styleId];
        if (style.coverage) {
            style.coverage.usage = style.coverage.usedBytes / style.length;
        }
    }

    return styles;
}

function processFrames(frames, resourcesTree) {
    frames = frames || {};
    resourcesTree = resourcesTree || {};

    //eslint-disable-next-line
    for (const frameId in frames) {
        const frame = frames[frameId];
        frame.url = frame.url || 'about:blank';
    }

    //eslint-disable-next-line
    for (const frameId in resourcesTree) {
        frames[frameId] = {...frames[frameId], ...resourcesTree[frameId]};
    }
    return frames;
}

//eslint-disable-next-line
function processJSMetrics(JSMetrics, scripts) {
    if (!JSMetrics) {
        return;
    }
    scripts = scripts || {};

    const {timeDeltas, ignoredScripts} = JSMetrics;
    const nodesMap = {};
    const childrenMap = {};
    const functionExecution = {};
    const scriptsExecution = {};
    const internalExecution = {};
    const INTERNAL_SCRIPT_ID = '0';

    let {nodes} = JSMetrics;
    let nodesIndex = 0;

    nodes = nodes.map(_node => {
        const {callFrame: {functionName, scriptId, url, lineNumber, columnNumber}, hitCount, id: nodeId, children} = _node;
        const hits = nodesIndex + hitCount;
        const isIgnoredScript = !!ignoredScripts[scriptId];
        let executionTime = 0;

        for (; nodesIndex < hits; nodesIndex++) {
            executionTime += timeDeltas[nodesIndex];
        }
        executionTime = Number(((executionTime / 1000) || 0).toFixed(2));

        if (!executionTime || isIgnoredScript) {
            //eslint-disable-next-line
            return;
        }

        if (scriptId === INTERNAL_SCRIPT_ID) {
            internalExecution[functionName] = internalExecution[functionName] || 0;
            internalExecution[functionName] += executionTime;
        } else {
            scriptsExecution[scriptId] = scriptsExecution[scriptId] || 0;
            scriptsExecution[scriptId] += executionTime;
        }
        if (children) {
            childrenMap[nodeId] = children;
        }

        const functionId = `${scriptId}${functionName}${lineNumber}${columnNumber}`;
        functionExecution[functionId] = functionExecution[functionId] || {
            url,
            scriptId,
            functionName,
            lineNumber,
            columnNumber,
            hits: 0,
            executionTime: 0
        };
        functionExecution[functionId].hits++;
        functionExecution[functionId].executionTime += executionTime;

        nodesMap[nodeId] = {
            nodeId,
            scriptId,
            url,
            functionName,
            lineNumber,
            columnNumber,
            executionTime
        };
        return nodeId;
    }).filter(n => !!n);

    //eslint-disable-next-line
    for (const parentNodeId in childrenMap) {
        const parentNode = nodesMap[parentNodeId];
        const childrenNodes = childrenMap[parentNodeId].map(nodeId => {
            return {...nodesMap[nodeId], hasParent: true};
        }).filter(n => !!n);

        if (childrenNodes.length) {
            parentNode.childrenNodes = childrenNodes;
        }
    }

    //eslint-disable-next-line
    nodes = nodes.map(nodeId => {
        const node = nodesMap[nodeId];
        if (!node.hasParent) {
            delete node.nodeId;
            if (node.scriptId === INTERNAL_SCRIPT_ID) {
                node.isInternal = true;
                delete node.scriptId;
            }
            return node;
        }
    }).filter(node => !!node);

    let functions = [];
    //eslint-disable-next-line
    for (const fId in functionExecution) {
        functions.push(functionExecution[fId]);
    }
    functions = functions.sort((a, b) => a.executionTime > b.executionTime ? -1 : 1);

    //TODO: get stackTime from nodeTree
    return {
        scriptsExecution,
        internalExecution,
        nodes,
        functions
    };
}

function processScripts(scripts, domEvents, scriptCoverage, frames) {
    scripts = scripts || {};
    frames = frames || {};

    if (scriptCoverage) {
        processScriptCoverage(scripts, scriptCoverage);
    }

    if (domEvents) {
        for (let i = 0; i < domEvents.length; i++) {
            const eventObj = domEvents[i];
            const script = scripts[eventObj.scriptId];

            if (script) {
                delete eventObj.scriptId;
                script.events = script.events || [];
                script.events.push(eventObj);
            }
        }
    }

    //eslint-disable-next-line
    for (const scriptId in scripts) {
        const script = scripts[scriptId];

        if (script) {
            const frame = frames[script.frameId] || {};

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

    return scripts;
}

function processRequests(requests, frames) {
    requests = requests || {};
    frames = frames || {};
    const _requests = [];

    //eslint-disable-next-line
    for (const requestId in requests) {
        const request = requests[requestId];
        const frame = frames[request.frameId] || {};

        request.requestId = requestId;
        request.frameURL = frame.url;
        _requests.push(request);
    }
    return _requests;
}

function processMetadata(metadata) {
    metadata = metadata || {};

    if (metadata.metrics) {
        const metrics = metadata.metrics;
        delete metadata.metrics;
        metadata.metrics = {};

        for (let i = 0; i < metrics.length; i++) {
            const metric = metrics[i];
            metadata.metrics[metric.name] = metric.value;
        }
    }
    return metadata;
}

function processScriptCoverage(scripts, scriptCoverage) {
    const coverage = scriptCoverage.sort((a, b) => {
        return +a.scriptId >= +b.scriptId ? 1 : -1;
    });

    for (let i = 0; i < coverage.length; i++) {
        const {scriptId, functions, url} = coverage[i];

        if (url === '__puppeteer_evaluation_script__') {
            continue;
        }
        const script = scripts[scriptId];
        const usedFunctions = new Set();
        const unusedFunctionsNames = new Set();
        const ranges = [];

        if (!script) {
            LOG.debug(`Script ${scriptId} is missing`);
            continue;
        }

        for (let i = 0; i < functions.length; i++) {
            const funcObj = functions[i];
            const coverageCandidate = funcObj.ranges[0];
            const functionName = funcObj.functionName || '[[anonymous]]';

            if (!coverageCandidate.count) {
                unusedFunctionsNames.add(functionName);
                continue;
            }
            usedFunctions.add(functionName);

            if (ranges.length === 0) {
                ranges.push(coverageCandidate);
                continue;
            }

            let merged = false;
            for (let j = 0; j < ranges.length; j++) {
                const coverage = ranges[j];

                if (isRangeContains(coverageCandidate, coverage)) {
                    ranges[j] = {
                        startOffset: Math.min(coverage.startOffset, coverageCandidate.startOffset),
                        endOffset: Math.max(coverage.endOffset, coverageCandidate.endOffset)
                    };
                    merged = true;
                    break;
                }
            }

            if (!merged) {
                ranges.push(coverageCandidate);
            }
        }

        let usedBytes = 0;

        for (let i = 0; i < ranges.length; i++) {
            const {startOffset, endOffset} = ranges[i];
            usedBytes += endOffset - startOffset;
        }

        script.functionCoverage = {
            usedBytes,
            usage: usedBytes / script.length,
            usedFunctions: Array.from(usedFunctions).sort(),
            unusedFunctions: Array.from(unusedFunctionsNames).sort(),
        };
    }
}

function isRangeContains(p1, p2) {
    const isStartUnion = p1.startOffset <= p2.startOffset && p1.endOffset <= p2.endOffset && p1.endOffset >= p2.startOffset;
    const isEndUnion = p1.endOffset >= p2.endOffset && p1.startOffset >= p2.startOffset && p1.startOffset <= p2.endOffset;
    const isUnion = (p1.startOffset > p2.startOffset && p1.endOffset < p2.endOffset) || (p1.startOffset < p2.startOffset && p1.endOffset > p2.endOffset);
    return isStartUnion || isEndUnion || isUnion;
}

module.exports = {
    processData,
    processScriptCoverage
};
