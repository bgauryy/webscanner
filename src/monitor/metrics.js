async function getExecutionMetrics(client) {
    const {profile: {nodes, samples, timeDeltas, startTime, endTime}} = await client.Profiler.stop();
    return {
        nodes, samples, timeDeltas, startTime, endTime, ignoredScripts
    };
}

module.exports = {
    getExecutionMetrics
};
