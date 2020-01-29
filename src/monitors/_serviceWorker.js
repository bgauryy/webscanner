/*

     if (collect.serviceWorker) {
                await _setSWListener(client, collect.content, data.serviceWorker);
            }



async function registerServiceWorkerEvents(client, getContent, registrationHandler, versionHandler, errorHandler) {
    await client.ServiceWorker.enable();

    client.ServiceWorker.workerRegistrationUpdated(({registrations}) => {
        const sw = registrations && registrations[0];
        if (sw) {
            registrationHandler(sw);
        }
    });
    client.ServiceWorker.workerErrorReported(obj => {
        errorHandler(obj);
    });
    client.ServiceWorker.workerVersionUpdated(({versions}) => {
        const sw = versions && versions[0]; //registrationId, scriptURL, runningStatus, status, scriptLastModified, scriptResponseTime,controlledClients
        if (sw) {
            versionHandler(sw);
        }
    });
    //ServiceWorker.inspectWorker

}

//TODO - move to client.js
async function _setSWListener(client, content, serviceWorkers) {
    await chromeClient.registerServiceWorkerEvents(client, content,
        ({registrationId, scopeURL}) => {
            serviceWorkers[registrationId] = {
                scopeURL
            };
        },
        (_sw) => {
            const sw = serviceWorkers[_sw.registrationId];
            sw.version = sw.version || [];
            sw.runningStatus = sw.runningStatus || [];
            sw.status = sw.status || [];
            sw.clients = sw.clients || [];

            if (_sw.version) {
                sw.version.push(_sw.version);
            }
            if (_sw.runningStatus) {
                sw.runningStatus.push(_sw.runningStatus);
            }
            if (_sw.status) {
                sw.status.push(_sw.status);
            }
            if (_sw.controlledClients && _sw.controlledClients.length) {
                sw.clients.push(_sw.controlledClients);
            }

            sw.scriptResponseTime = sw.scriptResponseTime || _sw.scriptResponseTime;
            sw.scriptLastModified = sw.scriptLastModified || _sw.scriptLastModified;
            sw.url = sw.url || _sw.scriptURL;
            sw.targetId = sw.targetId || _sw.targetId;
        },
        ({registrationId, errorMessage, versionId, lineNumber, columnNumber}) => {
            const sw = serviceWorkers[registrationId];
            if (sw) {
                sw.errors = sw.errors || [];
                sw.errors.push({
                    errorMessage,
                    lineNumber,
                    columnNumber,
                    versionId
                });
            }
        });
}
*/
