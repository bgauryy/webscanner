import React from "react";
import {render} from "react-dom";
import {ScriptsTable} from './ScriptsTable'
import {ResourcesTable} from './ResourcesTable'

run();

//domain
async function run() {
    window.data = await (await fetch('./data.json')).json();

    const resources = getResourcesData(data);
    render(<ResourcesTable resizable={true} data={resources}/>, document.getElementById("resources"));

    const scripts = data.scripts;
    render(<ScriptsTable resizable={true} data={scripts}/>, document.getElementById("scripts"));
}

function getResourcesData(data) {
    return data.network.map(_resource => {
        const resource = {};
        const request = _resource.request;
        const response = _resource.response || _resource.redirectResponse || {};
        const security = response && response.securityDetails || {};
        const initiatorStack = _resource.initiator;
        const initiator = getInitiator(_resource.initiator);

        try {
            const urlObj = new URL(_resource.url);
            resource.host = urlObj.host;
            resource.pathname = urlObj.pathname;
            resource.queryParams = urlObj.searchParams;
            resource.hashParams = Array.from(urlObj.hash);
        } catch (e) {
            //ignore
        }

        resource.frameId = _resource.frameId;
        resource.frameURL = _resource.frame;
        resource.timestamp = _resource.timestamp;
        resource.initiator = initiator;
        resource.initiatorStack = initiatorStack;
        resource.req_url_length = request.url.length;
        resource.req_method = request.method;
        resource.req_type = _resource.type;
        resource.req_headers = request.headers;
        resource.req_post_data = request.postData || '-';
        resource.req_post_data_length = request.postData && request.postData.length || '-';
        resource.res_status = response.status;
        resource.res_length = response.encodedDataLength;
        resource.res_mimeType = response.mimeType;
        resource.res_ip = response.remoteIPAddress;
        resource.res_ip_country = response.ipCountry;
        resource.res_ip_timezone = response.timezone;
        resource.res_port = response.remotePort;
        resource.res_headers = response.headers;
        resource.cert_cipher = security.cipher;
        resource.cert_issuer = security.issuer;
        resource.cert_sanList = security.sanList;

        return resource;
    });
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
