const {enrichURLDetails} = require('../utils');

async function start(context) {
    await context.client.Page.enable();
    registerFrameEvents(context.client, context.data.frames);
}

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
    const id = frameObj.frameId || frameObj.id;
    let frame = frames[id];

    if (!frame) {
        frame = frameObj;
        enrichURLDetails(frameObj, 'url');
        frame.states = [state];
        frames[id] = frame;
    } else {
        delete frameObj.frameId;
        frames[id] = {...frameObj, ...frame};
        frames[id].states.push(state);
    }
}

function stop(context, resourcesTree) {
    const frames = Object.keys(context.data.frames).map(id => context.data.frames[id]);

    resourcesTree = resourcesTree || {};
    for (let i = 0; i < frames.length; i++) {
        const frame = frames[i];
        frame.url = frame.url || 'about:blank';
        const resourcesObj = resourcesTree[frame.frameId];
        if (resourcesObj) {
            frame.resources = resourcesObj.resources;
            frame.contentSize = resourcesObj.contentSize;
        }
    }
    return frames;
}

module.exports = {
    start,
    stop
};
