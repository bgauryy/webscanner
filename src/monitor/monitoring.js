let started = false;

async function start({configuration, client, data}) {
    if (!configuration.monitoring) {
        return;
    }
    started = true;
    await client.Log.enable();
    //TODO:handle threshold
    await registerLogs(client, data.monitoring, 100);
    await registerErrors(client, data.monitoring);
    await registerConsole(client, data.monitoring);
}

async function stop(context) {
    if (!started) {
        return;
    }
    return {
        logs: context.data.monitoring.logs,
        errors: context.data.monitoring.errors,
        console: context.data.monitoring.console,
    };
}

async function registerLogs(client, monitoring, threshold) {
    monitoring.logs = {};
    await client.Log.startViolationsReport({
        config: [
            {name: 'longTask', threshold},
            {name: 'longLayout', threshold},
            {name: 'blockedEvent', threshold},
            {name: 'blockedParser', threshold},
            {name: 'discouragedAPIUse', threshold},
            {name: 'handler', threshold},
            {name: 'recurringHandler', threshold},
        ]
    });
    client.Log.entryAdded(({entry: {source, level, text, timestamp, url}}) => {
        monitoring.logs[level] = monitoring.logs[level] || [];
        monitoring.logs[level].push({text, source, timestamp, url});
    });
}

async function registerErrors(client, monitoring) {
    monitoring.errors = [];

    client.Runtime.exceptionThrown((errorObj) => {
        errorObj = {...errorObj, ...errorObj.exceptionDetails};
        delete errorObj.exceptionDetails;
        delete errorObj.exception.preview;
        monitoring.errors.push(errorObj);
    });
}

async function registerConsole(client, monitoring) {
    monitoring.console = {};

    client.Runtime.consoleAPICalled(({type, executionContextId, timestamp, stackTrace, args}) => {
        monitoring.console[type] = monitoring.console[type] || [];
        monitoring.console[type].push({
            value: args[0].value,
            executionContextId,
            timestamp,
            stackTrace
        });
    });
}

module.exports = {
    start,
    stop
};
