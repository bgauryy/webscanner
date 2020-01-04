const geoIP = require('geoIP-lite');
const LOG = require('../../utils/logger');
const Monitor = require('../monitor');
const {getScriptIdFromInitiator, getHash} = require('../../utils/clientHelper');
const DARA_URI_REGEX = /^data:/;

class NetworkMonitor extends Monitor {
    constructor(client, data, collect, rules) {
        super(client, data, collect, rules);
        this.data.requests = {};
        this.sequenceIndex = 0;
    }

    monitor() {
        monitorRequests.call(this);
        monitorResponses.call(this);
    }

    getData() {
        const data = processData(this.data);
        //TODO: parse response
        return {
            name: 'network',
            data
        };
    }
}

function processData(data) {
    const requests = data.requests;
    const frames = data.frames;
    const res = [];

    //eslint-disable-next-line
    for (const requestId in requests) {
        const request = requests[requestId];
        const frame = (frames && frames[request.frameId]) || {};

        request.requestId = requestId;
        request.frameURL = frame.url;
        res.push(request);
    }
    return res.sort((a, b) => a.sequence > b.sequence ? 1 : -1);
}

function monitorRequests() {
    const {client, collect, data} = this;
    const requests = data.requests;

    client.Network.requestWillBeSent(async (requestObj) => {
        const request = requestObj.request;
        const getContent = collect.network.content;

        delete requestObj.request;
        requestObj = {...requestObj, ...request};
        requestObj.sequence = this.sequenceIndex++;
        const {url, requestId} = requestObj;

        _enrichURLDetails(requestObj, requestObj.url);
        requestObj.initiator.scriptId = getScriptIdFromInitiator(requestObj.initiator);
        if (_isDataURI(url)) {
            requestObj.type = 'dataURI';
            const split = url.split(';');
            const protocol = split[0];
            const url = split[1];

            requestObj.protocol = protocol;
            if (getContent) {
                requestObj.url = url;
            }
            requestObj.hash = getHash(url);
        } else {
            if (getContent) {
                try {
                    requestObj.postData = await client.Network.getRequestPostData({requestId});
                } catch (e) {
                    //ignore
                }
            }
        }
        requests[requestId] = requestObj;
    });
}

function monitorResponses() {
    const {client, collect, data} = this;
    const requests = data.requests;

    client.Network.dataReceived(_getResponseEventCallback(requests, 'dataReceived'));
    client.Network.loadingFinished(_getResponseEventCallback(requests, 'loadingFinished'));
    client.Network.loadingFailed(_getResponseEventCallback(requests, 'loadingFailed'));
    client.Network.signedExchangeReceived(_getResponseEventCallback(requests, 'signedExchangeReceived'));
    client.Network.resourceChangedPriority(_getResponseEventCallback(requests, 'resourceChangedPriority'));
    client.Network.responseReceivedExtraInfo(_getResponseEventCallback(requests, 'responseReceivedExtraInfo'));
    client.Network.requestServedFromCache(_getResponseEventCallback(requests, 'requestServedFromCache'));

    client.Network.responseReceived(async (response) => {
        if (_isDataURI(response.url)) {
            return;
        }
        const requestId = response.requestId;
        const responseObj = response.response;

        delete response.requestId;
        delete response.response;
        response = {...response, ...responseObj};
        _enrichIPDetails(response, response.remoteIPAddress);
        if (collect.network.content) {
            try {
                const obj = await client.Network.getResponseBody({requestId});
                response.content.body = obj.body;
                response.content.base64Encoded = obj.base64Encoded;
            } catch (e) {
                //ignore
            }
        }
        requests[requestId] = data.requests[requestId] || {};
        requests[requestId].response = requests[requestId].response || {};
        requests[requestId].response = {...requests[requestId].response, ...response};
    });
    //TODO:Implement
    /*
     client.Network.requestIntercepted(response => {
         debugger;
     });
     client.Network.eventSourceMessageReceived(({requestId, timestamp, eventName, eventId, data}) => {
        if (!requests[requestId]) {
            requests[requestId] = {};
        }
        const request = requests[requestId];
        //TODO:Change request type
        request.type = 'eventSource';
        request.timestamp = timestamp;
        request.eventName = eventName;
        request.eventId = eventId;
        request.data = data;
    });
 */
}

/**
 * Enrich obj with IP details from geoIP
 * @param obj {obj}
 * @param ip {string}
 */
function _enrichIPDetails(obj, ip) {
    if (!obj || !ip) {
        return;
    }
    try {
        const lookup = geoIP.lookup(ip);
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

function _isDataURI(url) {
    return DARA_URI_REGEX.test(url);
}

function _enrichURLDetails(obj, url) {
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

function _getResponseEventCallback(requests, propName) {
    return function (networkObj) {
        const requestId = networkObj.requestId;
        delete networkObj.requestId;

        requests[requestId] = requests[requestId] || {};
        requests[requestId].response = requests[requestId].response || {};
        requests[requestId].response[propName] = networkObj;
    };
}

module.exports = NetworkMonitor;
