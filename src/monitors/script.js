const LOG = require('../utils/logger');
const IMonitor = require('./IMonitor');

class ScriptMonitor extends IMonitor {
    constructor(client, data, collect, rules) {
        super(client, data, collect, rules);
        this.data.scripts = {};
    }

    monitor() {
        registerScriptExecution(this.client, this.collect, this.data.scripts);
    }

    async getData() {
        const scripts = this.data.scripts;
        const {result: coverage} = await this.client.Profiler.getBestEffortCoverage();
        return {
            name: 'scripts',
            data: processScripts(scripts, null, coverage, this.data.frames)
        };
    }
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

function registerScriptExecution(client, collect, scripts) {
    client.Debugger.scriptParsed(async function (scriptObj) {
        const url = scriptObj.url;
        const scriptId = scriptObj.scriptId;
        if (url === '__puppeteer_evaluation_script__' || url === '') {
            return;
        }
        try {
            const {scriptSource} = await client.Debugger.getScriptSource({scriptId});
            scriptObj.source = scriptSource;
        } catch (e) {
            //ignore
        }
        scripts[scriptId] = scriptObj;
    });

    client.Debugger.scriptFailedToParse((scriptObj) => {
        const scriptId = scriptObj.scriptId;
        scripts[scriptId] = scriptObj;
        scripts[scriptId].parseError = true;
    });
}

//TODO:Impl
function _setContext(client, contexts) {
    client.Runtime.executionContextCreated(({context: {id, origin, name, auxData}}) => {
        if (name !== '__puppeteer_utility_world__') {
            contexts[id] = {origin, name, auxData};
        }
    });

    client.Runtime.executionContextDestroyed(({executionContextId}) => {
        const context = contexts[executionContextId];
        if (context) {
            context.destroyed = true;
        }
    });
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

module.exports = ScriptMonitor;


