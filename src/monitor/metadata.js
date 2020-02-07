async function getMetadata(client) {
    const data = {};

    data.layoutMetrics = await client.Page.getLayoutMetrics();
    data.heapSize = await client.Runtime.getHeapUsage();
    data.metrics = await _getMetrics(client);
    data.manifest = await _getManifest(client);
    data.systemInfo = await _getSystemInfo(client);

    return data;
}

async function _getMetrics({client}) {
    try {
        await client.Performance.enable();
        const metricsObj = await client.Performance.getMetrics();
        return metricsObj && metricsObj.metrics;
    } catch (e) {
        //ignore
    }
}

async function _getManifest(client) {
    const manifest = await client.Page.getAppManifest();
    if (manifest && manifest.url) {
        return manifest;
    }
}

async function _getSystemInfo(client) {
    try {
        const info = await client.SystemInfo.getInfo();
        const process = await client.SystemInfo.getProcessInfo();
        return {
            info,
            process
        };
    } catch (e) {
        //ignore
    }
}

function processMetadata(metadata) {
    metadata = metadata || {};

    if (metadata.metrics) {
        const metrics = metadata.metrics;
        delete metadata.metrics;
        metadata.metrics = {};

        for (let i = 0; i < metrics.length; i++) {
            const metric = metrics[i];
            metadata.metrics[metric.name] = metric.value;
        }
    }
    return metadata;
}

module.exports = {
    getMetadata,
};
