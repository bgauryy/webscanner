function registerScriptExecution(client, getScriptSource, scripts) {
    client.Debugger.scriptParsed(async function (scriptObj) {
        if (scriptObj.url === '__puppeteer_evaluation_script__' || scriptObj.url === '') {
            return;
        }
        scriptObj = {...scriptObj, ...scriptObj.executionContextAuxData};
        delete scriptObj.executionContextAuxData;
        const {scriptSource} = await client.Debugger.getScriptSource({scriptId: scriptObj.scriptId});
        scriptObj.source = scriptSource;
        scripts.push(scriptObj);
    });
}

async function getScriptCoverage(client) {
    const {result} = await client.Profiler.getBestEffortCoverage();
    return result;
}

module.exports = {
    registerScriptExecution,
    getScriptCoverage
};
