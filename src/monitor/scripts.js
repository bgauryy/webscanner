const { isRangeContains } = require('../utils');
const { getAllDOMEvents } = require('./dom');
let started = false;

async function start(context) {
  started = true;
  registerScriptExecution(context);
}

async function stop(context) {
  if (!started) {
    return;
  }
  return await processScripts(context);
}

function registerScriptExecution(context) {
  context.client.Debugger.scriptParsed(async function (scriptObj) {
    if (
      scriptObj.url === '__puppeteer_evaluation_script__' ||
      scriptObj.url === ''
    ) {
      return;
    }
    scriptObj = { ...scriptObj, ...scriptObj.executionContextAuxData };
    delete scriptObj.executionContextAuxData;

    if (context.configuration.content) {
      try {
        const { scriptSource } = await context.client.Debugger.getScriptSource({
          scriptId: scriptObj.scriptId,
        });
        scriptObj.source = scriptSource;
      } catch (e) {
        //ignore
      }
    }
    context.data.scripts.push(scriptObj);
  });
}

async function getScriptCoverage({ client }) {
  const { result } = await client.Profiler.getBestEffortCoverage();
  return result;
}

async function processScripts(context) {
  const { scripts, frames } = context.data;

  if (context.configuration.coverage) {
    const coverage = await getScriptCoverage(context);
    processScriptCoverage(scripts, coverage);
  }
  if (context.configuration.domEvents) {
    const domEvents = await getAllDOMEvents(context.client);
    processScriptEvents(scripts, domEvents);
  }
  for (let i = 0; i < scripts.length; i++) {
    const script = scripts[i];
    const frame = frames[script.frameId] || {};

    script.frameURL = frame.url;
    if (script.frameURL === script.url) {
      script.url = 'inline';
    }
    //TODO - implement get script from stackTrace util function
    if (script.stackTrace) {
      script.parentScript =
        script.stackTrace.callFrames && script.stackTrace.callFrames[0];
    }
  }
  return scripts;
}

function processScriptCoverage(scripts, scriptCoverage) {
  const coverage = scriptCoverage.sort((a, b) => {
    return +a.scriptId >= +b.scriptId ? 1 : -1;
  });

  for (let i = 0; i < coverage.length; i++) {
    const { scriptId, functions, url } = coverage[i];
    if (url === '__puppeteer_evaluation_script__') {
      continue;
    }
    const script = scripts[scriptId];
    if (!script) {
      continue;
    }
    const usedFunctions = new Set();
    const unusedFunctionsNames = new Set();
    const ranges = [];

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
            startOffset: Math.min(
              coverage.startOffset,
              coverageCandidate.startOffset
            ),
            endOffset: Math.max(
              coverage.endOffset,
              coverageCandidate.endOffset
            ),
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
      const { startOffset, endOffset } = ranges[i];
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

function processScriptEvents(scripts, domEvents) {
  for (let i = 0; i < domEvents.length; i++) {
    const eventObj = domEvents[i];
    const script = scripts.filter((s) => s.scriptId === eventObj.scriptId)[0];
    if (script) {
      script.DOMEvents = script.DOMEvents || [];
      script.DOMEvents.push(eventObj);
    }
  }
}

module.exports = {
  start,
  stop,
};
