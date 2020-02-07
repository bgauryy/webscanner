//////////
if (collect.JSMetrics || collect.scriptCoverage) {
    await Profiler.enable();
    await Profiler.setSamplingInterval({interval: 1000});
    await Profiler.start();
}



async function getExecutionMetrics(client, context) {
    const {profile} = await client.Profiler.stop();
    profile.ignoredScripts = context.ignoredScripts;
    return processJSMetrics(profile);
}

function processJSMetrics(profile) {
    if (!profile) {
        return;
    }
    const {timeDeltas, ignoredScripts} = profile;
    const nodesMap = {};
    const childrenMap = {};
    const functionExecution = {};
    const scriptsExecution = {};
    const internalExecution = {};
    const INTERNAL_SCRIPT_ID = '0';
    let {nodes} = profile;
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

module.exports = {
    getExecutionMetrics,
    processJSMetrics
};
