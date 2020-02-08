async function start({client}) {
    await client.Performance.enable();
}

async function stop({client}) {
    return {
        layoutMetrics: await client.Page.getLayoutMetrics(),
        heapSize: await client.Runtime.getHeapUsage(),
        metrics: await getMetrics(client),
        manifest: await getManifest(client),
    };
}

async function getMetrics(client) {
    try {
        const {metrics} = await client.Performance.getMetrics();
        const res = {};

        if (metrics) {
            for (let i = 0; i < metrics.length; i++) {
                const metric = metrics[i];
                res[metric.name] = metric.value;
            }
        }
        return res;
    } catch (e) {
        //ignore
    }
}

async function getManifest(client) {
    try {
        const manifest = await client.Page.getAppManifest();
        if (manifest && manifest.url) {
            return manifest;
        }
    } catch (e) {
        //ignore
    }
}

module.exports = {
    start,
    stop
};
