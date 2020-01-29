if (collect.logs) {
    await _setLogs(client, data.logs, this.context.rules.logsThreshold);
}
if (collect.console) {
    await _setConsole(client, data.console);
}
if (collect.errors) {
    await _setErrors(client, data.errors);
}

async function _setLogs(client, logs, threshold) {
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

async function _setErrors(client, errors) {
    /*    client.Runtime.exceptionRevoked(obj => {
            debugger;
        });*/


    client.Runtime.exceptionThrown(({timestamp, exceptionDetails: {url, executionContextId, stackTrace, exception: {description}}}) => {
        errors.push({
            url,
            description,
            executionContextId,
            timestamp,
            stackTrace
        });
    });
}

async function _setConsole(client, console) {
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
