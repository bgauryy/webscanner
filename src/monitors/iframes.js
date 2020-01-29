const IMonitor = require('./IMonitor');
const {enrichURLDetails} = require('../utils/clientHelper');

class IFrameMonitor extends IMonitor {
    constructor(client, data, collect, rules) {
        super(client, data, collect, rules);
        this.data.frames = {};
    }

    monitor() {
        registerFrameEvents(this.client, this.data);
    }

    async getData() {
        const frames = this.data.frames;
        const resourcesTree = await getResources.call(this);

        //eslint-disable-next-line
        for (const frameId in frames) {
            const frame = frames[frameId];
            frame.url = frame.url || 'about:blank';
        }
        //eslint-disable-next-line
        for (const frameId in resourcesTree) {
            frames[frameId] = {...frames[frameId], ...resourcesTree[frameId]};
        }
        return {
            name: 'iframes',
            data: frames
        };
    }
}

function registerFrameEvents(client, data) {
    const frames = data.frames;

    client.Page.frameStartedLoading((frame) => {
        _onFrameEvent(frames, frame, 'loading');
    });

    client.Page.frameNavigated(({frame}) => {
        _onFrameEvent(frames, frame, 'navigated');
    });

    client.Page.frameStoppedLoading((frame) => {
        _onFrameEvent(frames, frame, 'stopped');
    });

    client.Page.frameAttached((frame) => {
        _onFrameEvent(frames, frame, 'attached');
    });

    client.Page.frameDetached((frame) => {
        _onFrameEvent(frames, frame, 'detached');
    });

    client.Page.frameResized((frame) => {
        _onFrameEvent(frames, frame, 'resized');
    });
    client.Page.frameRequestedNavigation((frame) => {
        _onFrameEvent(frames, frame, 'requestNavigation');
    });
    //eslint-disable-next-line
    client.Page.navigatedWithinDocument((frame) => {
        _onFrameEvent(frames, frame, 'navigatedWithinDocument');
    });
}

function _onFrameEvent(frames, frame, state) {
    const {frameId, id, parentFrameId, loaderId, url, securityOrigin, mimeType, stack, name} = frame;
    const _id = frameId || id;

    frames[_id] = frames[_id] || {};
    frames[_id].url = frames[_id].url || url;
    frames[_id].parentFrameId = frames[_id].parentFrameId || parentFrameId;
    frames[_id].loaderId = frames[_id].loaderId || loaderId;
    frames[_id].securityOrigin = frames[_id].securityOrigin || securityOrigin;
    frames[_id].mimeType = frames[_id].mimeType || mimeType;
    frames[_id].stack = frames[_id].stack || stack; //TODO: get script!
    frames[_id].name = frames[_id].name || name;
    frames[_id].state = frames[_id].state || [];
    enrichURLDetails(frames[_id], 'url');
    frames[_id].state.push(state);
}

async function getResources() {
    const client = this.client;
    const resources = await client.Page.getResourceTree();

    return _getResourcesTree(resources.frameTree);
}

function _getResourcesTree(frameTree) {
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

module.exports = IFrameMonitor;
