const {enrichURLDetails} = require('../utils/clientHelper');

function handleIframeEvent(frameObj, state, frames) {
    const oldFrame = frames[frameObj.id] || {};

    frameObj = {...frameObj, ...oldFrame};
    enrichURLDetails(frameObj, 'url');
    frameObj.state = frameObj.state || [];
    frameObj.state.push(state);
    frames[frameObj.frameId] = frameObj;
}

module.exports = {
    handleIframeEvent
};
