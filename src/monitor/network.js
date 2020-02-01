const {isDataURI, enrichURLDetails, reduceDeepObject, getInitiator, enrichIPDetails} = require('../utils/clientHelper');
const atob = require('atob');

function handleRequests(client, rules, collect, requests) {
    client.Network.requestWillBeSent(async (requestObj) => {
        requestObj = {...requestObj, ...requestObj.request};
        delete requestObj.request;

        if (isDataURI(requestObj.url)) {
            //TODO: implement if needed
            return;
        }
        if (requestObj.method.toLowerCase() === 'post') {
            try {
                requestObj.postData = await client.Network.getRequestPostData({requestId: requestObj.requestId});
            } catch (e) {
                //ignore
            }
        }
        enrichURLDetails(requestObj, 'url');
        reduceDeepObject(requestObj, 'headers', 'header');
        //TODO:handle initiator
        requestObj.initiator.scriptId = getInitiator(requestObj.initiator);
        requests.push(requestObj);
    });
}

function handleResponse(client, rules, collect, responses) {
    client.Network.responseReceived(handleResponse);
    client.Network.eventSourceMessageReceived(handleResponse);

    async function handleResponse(responseObj) {
        const response = {...responseObj, ...responseObj.response};
        delete response.response;
        delete response.requestHeaders;

        if (isDataURI(response.url)) {
            return;
        }
        reduceDeepObject(response, 'headers', 'header');
        enrichIPDetails(response, 'remoteIPAddress');
        try {
            const content = await client.Network.getResponseBody({requestId: response.requestId});
            if (content.base64Encoded) {
                content.body = atob(content.body);
            }
            response.content_body = content.body;
            response.content_bse64Encoded = content.base64Encoded;
        } catch (e) {
            //ignore
        }
        if (response.securityDetails) {
            reduceDeepObject(response, 'securityDetails', 'certificate');
            let date = new Date(0);
            date.setUTCSeconds(response.certificate_validFrom);
            delete response.certificate_validFrom;
            const validFrom = date;
            date = new Date(0);
            date.setUTCSeconds(response.certificate_validTo);
            delete response.certificate_validTo;
            const validTo = date;
            response.certificate_age_days = Math.round((new Date() - validFrom) / 86400000);
            response.certificate_expiration_days = Math.round((validTo - new Date()) / 86400000);
        }
        if (response.timing) {
            response.timing_start = response.timing.requestTime;
            response.timing_receiveHeadersEnd = response.timing.receiveHeadersEnd;
            response.timing_proxy = Math.round(response.timing.proxyEnd - response.timing.proxyStart);
            response.timing_dns = Math.round(response.timing.dnsEnd - response.timing.dnsStart);
            response.timing_connection = Math.round(response.timing.connectEnd - response.timing.connectStart);
            response.timing_ssl = Math.round(response.timing.sslEnd - response.timing.sslStart);
            response.timing_send = Math.round(response.timing.sendEnd - response.timing.sendStart);
            response.timing_send = Math.round(response.timing.pushEnd - response.timing.pushStart);
            delete response.timing;
        }
        responses.push(response);
    }
}

module.exports = {
    handleRequests,
    handleResponse
};
