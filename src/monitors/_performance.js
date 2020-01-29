if (collect.JSMetrics || collect.scriptCoverage) {
    const Profiler = client.Profiler;
    await Profiler.enable();
    await Profiler.setSamplingInterval({interval: 1000});
    await Profiler.start();
}

async function getExecutionMetrics(client) {
    const {profile: {nodes, samples, timeDeltas, startTime, endTime}} = await client.Profiler.stop();
    return {
        nodes, samples, timeDeltas, startTime, endTime, ignoredScripts
    };
}
