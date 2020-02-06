async function registerLogs(client, logs, threshold) {
    await client.Log.enable();
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
        logs[level] = logs[level] || [];
        logs[level].push({text, source, timestamp, url});
    });
}

async function registerConsole(client, console) {
    client.Runtime.consoleAPICalled(({type, executionContextId, timestamp, stackTrace, args}) => {
        console[type] = console[type] || [];
        console[type].push({
            value: args[0].value,
            executionContextId,
            timestamp,
            stackTrace
        });
    });
}

async function registerErrors(client, errors) {
    client.Runtime.exceptionThrown((errorObj) => {
        errorObj = {...errorObj, ...errorObj.exceptionDetails};
        delete errorObj.exceptionDetails;
        delete errorObj.exception.preview;
        errors.push(errorObj);
    });
}

module.exports = {
    registerLogs,
    registerConsole,
    registerErrors
};
