import {enrichURLDetails} from '../utils';
import {getResources} from './resources.js';

let started = false;

export async function start(context) {
    started = true;
    await context.client.Page.enable();
    registerFrameEvents(context.client, context.data.frames);
}

export async function stop(context) {
    if (!started) {
        return;
    }
    const frames = Object.keys(context.data.frames).map(id => context.data.frames[id]);
    const resourcesTree = await getResources(context) || {};

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
