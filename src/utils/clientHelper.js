const geoip = require('geoip-lite');
const crypto = require('crypto');
const LOG = require('./logger');

const FILTERED_REQUESTS_HEADERS = ['Upgrade-Insecure-Requests', 'User-Agent', 'Sec-Fetch-Mode', 'Sec-Fetch-User', 'Accept-Encoding', 'Accept-Language', 'Cache-Control', 'Connection', 'Referer', 'Origin'];
const dataURIRegex = /^data:/;

function getInitiator(initiator) {
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

function enrichURLDetails(obj, urlProp) {
    if (!obj || !obj[urlProp]) {
        return;
    }

    try {
        const urlObj = new URL(obj[urlProp]);
        obj.host = urlObj.host || undefined;
        obj.pathname = urlObj.pathname || undefined;
        obj.port = urlObj.port || undefined;
        obj.path = urlObj.path || undefined;
        obj.query = urlObj.query || undefined;
    } catch (e) {
        //ignore
    }
}

function enrichIPDetails(obj, IPProp) {
    if (!obj || !obj[IPProp]) {
        return;
    }
    const ip = obj[IPProp];

    try {
        const lookup = geoip.lookup(ip);
        obj.country = lookup.country; // 2 letter ISO-3166-1 country code
        obj.region = lookup.region; // Up to 3 alphanumeric variable length characters as ISO 3166-2 code
        obj.timezone = lookup.timezone;// Timezone from IANA Time Zone Database
        obj.city = lookup.city; // This is the full city name
        obj.location = Array.isArray(lookup.ll) && lookup.ll.join(','); //latitude, longitude
        obj.ipRange = Array.isArray(lookup.range) && lookup.range.join(','); //Low IP, High IP
        obj.fromEurope = lookup.eu === '1';
    } catch (e) {
        LOG.error(e);
    }
}

function isDataURI(url) {
    return dataURIRegex.test(url);
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

function isEmptyObject(obj) {
    return !obj || Object.keys(obj).length === 0;
}

module.exports = {
    getInitiator,
    enrichURLDetails,
    enrichIPDetails,
    isDataURI,
    getHash,
    getHeaders,
    getResourcesFromFrameTree,
    isEmptyObject
};


