const crypto = require('crypto');

const FILTERED_REQUESTS_HEADERS = ['Upgrade-Insecure-Requests', 'User-Agent', 'Sec-Fetch-Mode', 'Sec-Fetch-User', 'Accept-Encoding', 'Accept-Language', 'Cache-Control', 'Connection', 'Referer', 'Origin'];

function getScriptIdFromInitiator(initiator) {
    if (initiator.type === 'parser') {
        return 'parser';
    } else if (initiator.type === 'other') {
        return 'other';
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

        //TODO - fix!
        if (!frame) {
            return '';
        }
        frames.unshift(frame.callFrames);

        if (!frame.parent) {
            return frames;
        } else {
            return getInitiatorFromStack(frame.parent, frames);
        }
    }
}

function getHash(str) {
    return crypto.createHash('md5').update(str).digest('hex');
}

function getHeaders(headers) {
    let res;

    for (const header in headers) {
        if (!FILTERED_REQUESTS_HEADERS.includes(header)) {
            res = res || {};
            res[header] = headers[header];
        }
    }
    return res;
}


function isEmptyObject(obj) {
    if (Array.isArray(obj)) {
        return obj.length === 0;
    }
    return !obj || Object.keys(obj).length === 0;
}

function enrichURLDetails(obj, url) {
    if (!obj || !url) {
        return;
    }

    try {
        const urlObj = new URL(url);
        obj.host = urlObj.host || undefined;
        obj.pathname = urlObj.pathname || undefined;
        obj.port = urlObj.port || undefined;
        obj.path = urlObj.path || undefined;
        obj.query = urlObj.query || undefined;
    } catch (e) {
        //ignore
    }
}

module.exports = {
    enrichURLDetails,
    getScriptIdFromInitiator,
    isEmptyObject,
    getHash
};


