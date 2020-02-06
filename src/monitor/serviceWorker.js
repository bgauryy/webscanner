async function registerServiceWorkerEvents(client, content, serviceWorkers) {
    await client.ServiceWorker.enable();

    client.ServiceWorker.workerRegistrationUpdated(async (res) => {
        res = {...res, ...res.registrations};
        const serviceWorkerObj = res.registrations && res.registrations[0];
        if (serviceWorkerObj) {
            serviceWorkers[serviceWorkerObj.registrationId] = serviceWorkerObj;
        }
    });

    client.ServiceWorker.workerVersionUpdated(async (res) => {
        res = {...res, ...res.versions};
        let serviceWorkerObj = res.versions && res.versions[0];
        if (serviceWorkerObj) {
            //TODO: change code to handle status changes
            const serviceWorkerObjOld = serviceWorkers[serviceWorkerObj.registrationId] || {};
            serviceWorkerObj = {...serviceWorkerObjOld, ...serviceWorkerObj};
            serviceWorkers[serviceWorkerObj.registrationId] = serviceWorkerObj;
        }
    });
}

exports.modules = {
    registerServiceWorkerEvents
};
