const IMonitor = require('./IMonitor');

class ScriptMonitor extends IMonitor {
    constructor(client, data, collect, rules) {
        super(client, data, collect, rules);
        this.data.scripts = {};
    }

    monitor() {
        registerScriptExecution(this.client, this.collect.scriptSource, this.data.scripts);
    }

    async getData() {
        const scripts = this.data.scripts;
        //TODO: getScriptCoverage
        //TODO: _setContext
        return {
            name: 'scripts',
            data: {}
        };
    }
}

function registerScriptExecution(client, getScriptSource, scripts) {
    client.Debugger.scriptParsed(async function (scriptObj) {
        const url = scriptObj.url;
        const scriptId = scriptObj.scriptId;
        if (url === '__puppeteer_evaluation_script__' || url === '') {
            return;
        }

        if (getScriptSource) {
            try {
                const {scriptSource} = await client.Debugger.getScriptSource({scriptId});
                scriptObj.source = scriptSource;
            } catch (e) {
                //ignore
            }
        }
        scripts[scriptId] = scriptObj;
    });

    client.Debugger.scriptFailedToParse((scriptObj) => {
        const scriptId = scriptObj.scriptId;

        scripts[scriptId] = scriptObj;
        scripts[scriptId].parseError = true;
    });
}

/*
async function getScriptCoverage(client) {
    const {result} = await client.Profiler.getBestEffortCoverage();
    return result;
}
*/

module.exports = ScriptMonitor;

/*
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
*/


