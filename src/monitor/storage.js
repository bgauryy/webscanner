let started = false;

async function start({configuration, client, data}) {
    if (!configuration.storage) {
        return;
    }
    started = true;
    await client.DOMStorage.enable();
    await registerStorage(client, data.storage);
    //TODO:add indexedDB
}

function stop(context) {
    if (!started) {
        return;
    }
    return context.data.storage;
}

async function registerStorage(client, storage) {
    client.DOMStorage.domStorageItemAdded(({key, newValue: value, storageId: {securityOrigin, isLocalStorage}}) => {
        const storageType = isLocalStorage ? 'localStorage' : 'sessionStorage';

        storage[securityOrigin] = storage[securityOrigin] || {};
        storage[securityOrigin][storageType] = storage[securityOrigin][storageType] || [];
        storage[securityOrigin][storageType].push({key, value});
    });
}

module.exports = {
    start,
    stop
};
