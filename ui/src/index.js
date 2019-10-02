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
        const res = {scriptId, source, events, frameId};

        res.size = Math.round(length / 1000);


        res.frameURL = data.frames[frameId].url || 'about:blank';
        if (url === data.frames[frameId].url) {
            res.host = 'inline';
        } else {
            try {
                const urlObj = new URL(url);
                res.host = urlObj.host;
                res.pathname = urlObj.pathname;
            } catch (e) {
                //ignore
            }
        }

        return res;
    });


    const resources = data.network.map(resource => {
        const request = resource.request;
        const response = resource.response || resource.redirectResponse || {};
        const security = response && response.securityDetails || {};
        const initiatorStack = resource.initiator;
        const initiator = getInitiator(resource.initiator);

        const obj = {};

        try {
            const urlObj = new URL(resource.url);
            obj.host = urlObj.host;
            obj.pathname = urlObj.pathname;
            obj.queryParams = Array.from(urlObj.searchParams);
            obj.hashParams = Array.from(urlObj.hash);
        } catch (e) {
            //ignore
        }

        obj.frameId = resource.frameId;
        obj.frameURL = resource.frame;
        obj.timestamp = resource.timestamp;
        obj.initiator = initiator;
        obj.initiatorStack = initiatorStack;
        obj.req_url_length = request.url.length;
        obj.req_method = request.method;
        obj.req_type = resource.type;
        obj.req_headers = request.headers;
        obj.req_post_data = request.postData || '-';
        obj.req_post_data_length = request.postData && request.postData.length || -1;
        obj.res_status = response.status;
        obj.res_length = response.encodedDataLength;
        obj.res_mimeType = response.mimeType;
        obj.res_ip = response.remoteIPAddress;
        obj.res_port = response.remotePort;
        obj.res_headers = response.headers;
        obj.cert_cipher = security.cipher;
        obj.cert_issuer = security.issuer;
        obj.cert_sanList = security.sanList;

        return obj;
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
