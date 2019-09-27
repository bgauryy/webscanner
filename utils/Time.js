const NS_PER_SEC = 1e9;

const measurements = {};
let id = 0;

function measure() {
    measurements[id] = process.hrtime();
    return id++;
}

function stopMeasure(id) {
    if (!measurements[id]) {
        return;
    }
    const mValue = process.hrtime(measurements[id]);
    delete  measurements[id];
    return (mValue[0] * NS_PER_SEC + mValue[1]) / 1000000000;
}

module.exports = {
    measure,
    stopMeasure
};
