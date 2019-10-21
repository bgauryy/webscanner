const {processData} = require('../../src/dataProcessor');
//TODO - fix tests
describe.skip('dataProcessor testing', function () {

    test('should check null cases', (done) => {
        (async function () {
            expect(await processData()).toEqual(undefined);
            expect(await processData({})).toEqual({});
            done();
        })();
    });

    describe('Scripts parse testing', () => {
        const dataObj = {
            scripts: [
                {
                    scriptId: '3',
                    url: '',
                    startLine: 0,
                    startColumn: 0,
                    endLine: 0,
                    endColumn: 31,
                    executionContextId: 2,
                    hash: '274cee0b4d8b6399223c85d711358bd01af06cc4',
                    executionContextAuxData: {
                        isDefault: true,
                        type: 'default',
                        frameId: '51A5C24D998E2F1234BB63BBAC751053'
                    },
                    isLiveEdit: false,
                    sourceMapURL: '',
                    hasSourceURL: false,
                    isModule: false,
                    length: 31,
                    source: 'xxxxx'
                }]
        };

        const resObj = {
            scripts: [
                {
                    frameId: '51A5C24D998E2F1234BB63BBAC751053',
                    isModule: false,
                    length: 0,
                    scriptId: '3',
                    source: 'xxxxx',
                    url: ''
                }
            ]
        };

        test('should check script parse', (done) => {
            (async function () {
                const data = await processData(dataObj, {});
                expect(data).toEqual(resObj);
                done();
            })();
        });
    });

    describe('Resources parse testing', () => {
        const reqObj = {
            'resources': {
                'requests': [
                    {
                        'url': 'http://example.com/',
                        'requestId': 'C1A5108C5C9B0ED41270304218B5FE3C',
                        'loaderId': 'C1A5108C5C9B0ED41270304218B5FE3C',
                        'documentURL': 'http://example.com/',
                        'request': {
                            'url': 'http://example.com/',
                            'method': 'GET',
                            'headers': 'headers',
                            'mixedContentType': 'none',
                            'initialPriority': 'VeryHigh',
                            'referrerPolicy': 'no-referrer-when-downgrade'
                        },
                        'timestamp': 71346.548889,
                        'wallTime': 1570895345.767514,
                        'initiator': {
                            'type': 'other'
                        },
                        'type': 'Document',
                        'frameId': 'ABC9477254ADCE502DB1BB6E04CE1CFE',
                        'hasUserGesture': false
                    }
                ],
                'responses': {
                    'C1A5108C5C9B0ED41270304218B5FE3C': {
                        'requestId': 'C1A5108C5C9B0ED41270304218B5FE3C',
                        'loaderId': 'C1A5108C5C9B0ED41270304218B5FE3C',
                        'timestamp': 71346.876936,
                        'type': 'Document',
                        'response': {
                            'url': 'http://example.com/',
                            'status': 200,
                            'statusText': 'OK',
                            'headers': {'x': 'y'},
                            'headersText': 'headersText',
                            'mimeType': 'text/html',
                            'requestHeaders': {'x': 'y'},
                            'requestHeadersText': '',
                            'connectionReused': false,
                            'connectionId': 13,
                            'remoteIPAddress': '93.184.216.34',
                            'remotePort': 80,
                            'fromDiskCache': false,
                            'fromServiceWorker': false,
                            'fromPrefetchCache': false,
                            'encodedDataLength': 361,
                            'protocol': 'http/1.1',
                            'securityState': 'insecure'
                        },
                        'frameId': 'ABC9477254ADCE502DB1BB6E04CE1CFE'
                    }
                }
            }
        };

        const dataObj = {
            'resources': [
                {
                    'documentURL': 'http://example.com/',
                    'frameId': 'ABC9477254ADCE502DB1BB6E04CE1CFE',
                    'headers': 'headers',
                    'host': 'example.com',
                    'initialPriority': 'VeryHigh',
                    'initiator': {
                        'type': 'other'
                    },
                    'loaderId': 'C1A5108C5C9B0ED41270304218B5FE3C',
                    'method': 'GET',
                    'mixedContentType': 'none',
                    'pathname': '/',
                    'referrerPolicy': 'no-referrer-when-downgrade',
                    'requestId': 'C1A5108C5C9B0ED41270304218B5FE3C',
                    'response': {
                        'connectionReused': false,
                        'country': 'US',
                        'encodedDataLength': 361,
                        'fromDiskCache': false,
                        'fromPrefetchCache': false,
                        'fromServiceWorker': false,
                        'headers': {
                            'x': 'y'
                        },
                        'ip': '93.184.216.34',
                        'mimeType': 'text/html',
                        'protocol': 'http/1.1',
                        'remotePort': 80,
                        'securityState': 'insecure',
                        'status': 200,
                        'statusText': 'OK',
                        'timezone': 'America/New_York',
                    },
                    'timestamp': 71346.548889,
                    'type': 'Document',
                    'url': 'http://example.com/',
                    'wallTime': 1570895345.767514
                }
            ]
        };
        test('should parse basic resource data', (done) => {
            (async function () {
                expect(await processData(reqObj, {})).toEqual(dataObj);
                done();
            })();
        });

        test('should parse resource without ip', (done) => {
            (async function () {
                const data = {...reqObj};
                const _dataObj = {...dataObj};
                //delete ip
                delete data.resources.responses[Object.keys(data.resources.responses)[0]].response.remoteIPAddress;
                delete _dataObj.resources[0].response.ip;
                delete _dataObj.resources[0].response.country;
                delete _dataObj.resources[0].response.timezone;

                expect(await processData(data, {})).toEqual(dataObj);
                done();
            })();
        });
    });
});



