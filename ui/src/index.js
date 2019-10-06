import React from "react";
import {render} from "react-dom";
import {ScriptsTable} from './ScriptsTable'
import {ResourcesTable} from './ResourcesTable'

run();

//domain
async function run() {
    window.data = await (await fetch('./data.json')).json();

    const scripts = data.scripts.map(script => {
        let {scriptId, parentScriptId, host, pathname, length, isModule, frameId, frameURL, events, stackTrace, source} = script;
        return {
            scriptId,
            parentScriptId,
            host,
            pathname,
            length,
            isModule,
            frameId,
            frameURL,
            events,
            stackTrace,
            source
        };
    });


    const resources = data.network.map(resource => {
        const obj = {};
        const request = resource.request;
        const response = resource.response || resource.redirectResponse || {};
        const security = response && response.securityDetails || {};
        const initiatorStack = resource.initiator;
        const initiator = getInitiator(resource.initiator);

        try {
            const urlObj = new URL(resource.url);
            obj.host = urlObj.host;
            obj.pathname = urlObj.pathname;
            obj.queryParams = urlObj.searchParams;
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
        obj.req_post_data_length = request.postData && request.postData.length || '-';
        obj.res_status = response.status;
        obj.res_length = response.encodedDataLength;
        obj.res_mimeType = response.mimeType;
        obj.res_ip = response.remoteIPAddress;
        obj.res_ip_country = response.ipCountry;
        obj.res_port = response.remotePort;
        obj.res_headers = response.headers;
        obj.cert_cipher = security.cipher;
        obj.cert_issuer = security.issuer;
        obj.cert_sanList = security.sanList;

        return obj;
    });

    render(<ResourcesTable resizable={true} data={resources}/>, document.getElementById("resources"));
    render(<ScriptsTable resizable={true} data={scripts}/>, document.getElementById("scripts"));
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
