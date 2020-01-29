const geoIP = require('geoIP-lite');
const LOG = require('../utils/logger');
const IMonitor = require('./IMonitor');
const {getScriptIdFromInitiator, getHash, enrichURLDetails} = require('../utils/clientHelper');
const DARA_URI_REGEX = /^data:/;

class NetworkMonitor extends IMonitor {
    constructor(client, data, collect, rules) {
        super(data, collect, rules);
        this.client = client;
        this.data.requests = {};
        this.sequenceIndex = 0;
    }

    monitor() {
        monitorRequests(this.client, this.collect, this.data);
        monitorResponses(this.client, this.collect, this.data);

        //TODO:impl
/*        if (this.collect.websocket) {
            await _registerWebsocket(client, data.websockets);
        }*/
    }

    getData() {
        const requests = this.data.requests;
        const frames = this.data.frames;
        const res = [];

        //eslint-disable-next-line
        for (const requestId in requests) {
            const request = requests[requestId];
            const frame = (frames && frames[request.frameId]) || {};

            request.requestId = requestId;
            request.frameURL = frame.url;
            res.push(request);
        }
        //TODO: parse response
        return {
            name: 'network',
            data: res.sort((a, b) => a.sequence > b.sequence ? 1 : -1)
        };
    }
}

function monitorRequests(client, collect, data) {
    const requests = data.requests;

    client.Network.requestWillBeSent(async (requestObj) => {
        const request = requestObj.request;
        const getContent = collect.network.content;

        delete requestObj.request;
        requestObj = {...requestObj, ...request};
        requestObj.sequence = this.sequenceIndex++;
        const {url, requestId} = requestObj;

        enrichURLDetails(requestObj, requestObj.url);
        requestObj.initiator.scriptId = getScriptIdFromInitiator(requestObj.initiator);
        if (isDataURI(url)) {
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

function monitorResponses(client, collect, data) {
    const requests = data.requests;

    client.Network.dataReceived(getResponseEventCallback(requests, 'dataReceived'));
    client.Network.loadingFinished(getResponseEventCallback(requests, 'loadingFinished'));
    client.Network.loadingFailed(getResponseEventCallback(requests, 'loadingFailed'));
    client.Network.signedExchangeReceived(getResponseEventCallback(requests, 'signedExchangeReceived'));
    client.Network.resourceChangedPriority(getResponseEventCallback(requests, 'resourceChangedPriority'));
    client.Network.responseReceivedExtraInfo(getResponseEventCallback(requests, 'responseReceivedExtraInfo'));
    client.Network.requestServedFromCache(getResponseEventCallback(requests, 'requestServedFromCache'));

    client.Network.responseReceived(async (response) => {
        if (isDataURI(response.url)) {
            return;
        }
        const requestId = response.requestId;
        const responseObj = response.response;

        delete response.requestId;
        delete response.response;
        response = {...response, ...responseObj};
        enrichIPDetails(response, response.remoteIPAddress);
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
function enrichIPDetails(obj, ip) {
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

function isDataURI(url) {
    return DARA_URI_REGEX.test(url);
}

function getResponseEventCallback(requests, propName) {
    return function (networkObj) {
        const requestId = networkObj.requestId;
        delete networkObj.requestId;

        requests[requestId] = requests[requestId] || {};
        requests[requestId].response = requests[requestId].response || {};
        requests[requestId].response[propName] = networkObj;
    };
}

module.exports = NetworkMonitor;
