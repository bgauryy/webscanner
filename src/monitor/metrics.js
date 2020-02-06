async function getExecutionMetrics(client, context) {
    const {profile: {nodes, samples, timeDeltas, startTime, endTime}} = await client.Profiler.stop();
    return {
        nodes, samples, timeDeltas, startTime, endTime, ignoredScripts: context.ignoredScripts
    };
}

module.exports = {
    getExecutionMetrics
};
