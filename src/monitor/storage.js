async function registerStorage(client, storage) {
    await client.DOMStorage.enable();
    client.DOMStorage.domStorageItemAdded(({key, newValue: value, storageId: {securityOrigin, isLocalStorage}}) => {
        const storageType = isLocalStorage ? 'localStorage' : 'sessionStorage';
        storage[securityOrigin] = storage[securityOrigin] || {};
        storage[securityOrigin][storageType] = storage[securityOrigin][storageType] || [];
        storage[securityOrigin][storageType].push({key, value});
    });
}

async function getCookies(client) {
    return await client.Page.getCookies();
}

module.exports = {
    registerStorage,
    getCookies
};
