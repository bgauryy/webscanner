import React from "react";
import {render} from "react-dom";
import {ScriptsTable} from './ScriptsTable'
import {ResourcesTable} from './ResourcesTable'

run();

//domain
async function run() {
    window.data = await (await fetch('./data.json')).json();

    const scripts = data.scripts.map(s => {
        let {scriptId, url, frameId, source, length, events} = s;
        const host = (() => {
            try {
                return new URL(url).host
            } catch (e) {
                return '';
            }

        })();

        const frame = data.frames[frameId].url;
        if (url === frame) {
            url = 'inline';
        }


        return {scriptId, url, frame: frame, source, length, host, events};
    });


    const resources = data.network.map(resource => {
        const request = resource.request;
        const response = resource.response || resource.redirectResponse || {};
        const security = response && response.securityDetails || {};
        const initiatorStack = resource.initiator;
        const initiator = getInitiator(resource.initiator);
        return {
            url: resource.url,
            host: (() => {
                try {
                    return new URL(resource.url).host
                } catch (e) {
                    return '';
                }

            })(),
            frame: resource.frame,
            timestamp: resource.timestamp,
            type: resource.type,
            method: request.method,
            response_length: response.encodedDataLength,
            mimeType: response.mimeType,
            ip: response.remoteIPAddress,
            status: response.status,
            cipher: security.cipher,
            issuer: security.issuer,
            sanList: security.sanList,
            initiator,
            initiatorStack
        }
    });

    render(<ScriptsTable resizable={true} data={scripts}/>, document.getElementById("scripts"));
    render(<ResourcesTable resizable={true} data={resources}/>, document.getElementById("resources"));
}

function getInitiator(initiator) {
    if (initiator.type === 'parser') {
        return 'parser'
    } else if (initiator.type === 'other') {
        return 'other'
    }

    const frames = getInitiatorFromStack(initiator.stack);

    for (let i = 0; i < frames.length; i++) {
        const callFrames = frames[i];
        for (let j = 0; j < callFrames.length; j++) {
            if (callFrames[j].scriptId) {
                return callFrames[j].scriptId;
            }
        }
    }

    function getInitiatorFromStack(frame, frames) {
        frames = frames || [];
        frames.unshift(frame.callFrames);

        if (!frame.parent) {
            return frames;
        } else {
            return getInitiatorFromStack(frame.parent, frames)
        }
    }
}
