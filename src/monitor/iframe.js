const {enrichURLDetails} = require('../utils/clientHelper');

function registerFrameEvents(client, frames) {
    client.Page.frameStartedLoading((frame) => {
        handleIframeEvent(frame, 'loading', frames);
    });
    client.Page.frameNavigated(({frame}) => {
        handleIframeEvent(frame, 'navigated', frames);
    });
    client.Page.frameStoppedLoading((frame) => {
        handleIframeEvent(frame, 'stopped', frames);
    });
    client.Page.frameAttached((frame) => {
        handleIframeEvent(frame, 'attached', frames);
    });
    client.Page.frameDetached((frame) => {
        handleIframeEvent(frame, 'detached', frames);

    });
    client.Page.frameResized((frame) => {
        handleIframeEvent(frame, 'resized', frames);
    });
    try {
        client.Page.frameRequestedNavigation((frame) => {
            handleIframeEvent(frame, 'requestNavigation', frames);
        });
        client.Page.navigatedWithinDocument((frame) => {
            handleIframeEvent(frame, 'navigatedWithinDocument', frames);
        });
    } catch (e) {
        //ignore
    }
}

function handleIframeEvent(frameObj, state, frames) {
    const oldFrame = frames[frameObj.id] || {};

    frameObj = {...frameObj, ...oldFrame};
    enrichURLDetails(frameObj, 'url');
    frameObj.state = frameObj.state || [];
    frameObj.state.push(state);
    frames.push(frameObj);
}

async function getResources(client) {
    const resources = await client.Page.getResourceTree();
    return getResourcesFromFrameTree(resources.frameTree);
}

function getResourcesFromFrameTree(frameTree) {
    const resources = {};

    _getResources(frameTree);
    return resources;

    function _getResources(frameTree) {
        const frame = frameTree.frame;
        const frameObj = resources[frame.id] = {};

        frameObj.url = frame.url;
        frameObj.name = frame.name;
        frameObj.resources = frameTree.resources;
        frameObj.contentSize = {};

        if (frameObj.resources) {
            for (let i = 0; i < frameObj.resources.length; i++) {
                const resource = frameObj.resources[i];
                frameObj.contentSize[resource.type] = frameObj.contentSize[resource.type] || 0;
                frameObj.contentSize[resource.type] += resource.contentSize;
            }
        }

        if (frameTree.childFrames) {
            for (let i = 0; i < frameTree.childFrames.length; i++) {
                frameObj.children = frameObj.children || [];
                const childFrame = frameTree.childFrames[i];
                frameObj.children.push(childFrame.frame.id);
                _getResources(childFrame);
            }
        }
    }
}

module.exports = {
    registerFrameEvents,
    getResources
};
