async function getMetadata(client) {
    const data = {};

    data.layoutMetrics = await client.Page.getLayoutMetrics();
    data.heapSize = await client.Runtime.getHeapUsage();
    data.metrics = await _getMetrics(client);
    data.manifest = await _getManifest(client);
    return data;
}

async function _getMetrics(client) {
    try {
        await client.Performance.enable();
        const metricsObj = await client.Performance.getMetrics();
        return metricsObj && metricsObj.metrics;
    } catch (e) {
        LOG.error(e);
    }
}

async function _getManifest(client) {
    const manifest = await client.Page.getAppManifest();
    if (manifest && manifest.url) {
        return manifest;
    }
}
