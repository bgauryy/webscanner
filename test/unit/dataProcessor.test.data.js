const response = {
    "scripts": [
        {
            "scriptId": "3",
            "url": "",
            "startLine": 0,
            "startColumn": 0,
            "endLine": 0,
            "endColumn": 31,
            "executionContextId": 2,
            "hash": "274cee0b4d8b6399223c85d711358bd01af06cc4",
            "executionContextAuxData": {
                "isDefault": true,
                "type": "default",
                "frameId": "51A5C24D998E2F1234BB63BBAC751053"
            },
            "isLiveEdit": false,
            "sourceMapURL": "",
            "hasSourceURL": false,
            "isModule": false,
            "length": 31,
            "source": "document.querySelectorAll(\"*\");"
        },
        {
            "scriptId": "4",
            "url": "",
            "startLine": 0,
            "startColumn": 0,
            "endLine": 0,
            "endColumn": 8,
            "executionContextId": 2,
            "hash": "1b69111c74d0f0d4094e4e4004dae60081abe278",
            "executionContextAuxData": {
                "isDefault": true,
                "type": "default",
                "frameId": "51A5C24D998E2F1234BB63BBAC751053"
            },
            "isLiveEdit": false,
            "sourceMapURL": "",
            "hasSourceURL": false,
            "isModule": false,
            "length": 8,
            "source": "document"
        },
        {
            "scriptId": "5",
            "url": "",
            "startLine": 0,
            "startColumn": 0,
            "endLine": 0,
            "endColumn": 6,
            "executionContextId": 2,
            "hash": "2ed539a12494860c268a85bacd924d3481abe278",
            "executionContextAuxData": {
                "isDefault": true,
                "type": "default",
                "frameId": "51A5C24D998E2F1234BB63BBAC751053"
            },
            "isLiveEdit": false,
            "sourceMapURL": "",
            "hasSourceURL": false,
            "isModule": false,
            "length": 6,
            "source": "window"
        }
    ],
    "resources": {
        "requests": [
            {
                "url": "http://example.com/",
                "requestId": "E4ABF76F2DC0598449465BAF89C73EF1",
                "loaderId": "E4ABF76F2DC0598449465BAF89C73EF1",
                "documentURL": "http://example.com/",
                "request": {
                    "url": "http://example.com/",
                    "method": "GET",
                    "headers": {
                        "Upgrade-Insecure-Requests": "1",
                        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/77.0.3865.90 Safari/537.36"
                    },
                    "mixedContentType": "none",
                    "initialPriority": "VeryHigh",
                    "referrerPolicy": "no-referrer-when-downgrade"
                },
                "timestamp": 68786.07585,
                "wallTime": 1570892785.379372,
                "initiator": {
                    "type": "other"
                },
                "type": "Document",
                "frameId": "51A5C24D998E2F1234BB63BBAC751053",
                "hasUserGesture": false
            }
        ],
        "responses": {
            "E4ABF76F2DC0598449465BAF89C73EF1": {
                "requestId": "E4ABF76F2DC0598449465BAF89C73EF1",
                "loaderId": "E4ABF76F2DC0598449465BAF89C73EF1",
                "timestamp": 68786.391813,
                "type": "Document",
                "response": {
                    "url": "http://example.com/",
                    "status": 200,
                    "statusText": "OK",
                    "headers": {
                        "Content-Encoding": "gzip",
                        "Cache-Control": "max-age=604800",
                        "Content-Type": "text/html; charset=UTF-8",
                        "Date": "Sat, 12 Oct 2019 15:06:25 GMT",
                        "Etag": "\"1541025663+gzip\"",
                        "Expires": "Sat, 19 Oct 2019 15:06:25 GMT",
                        "Last-Modified": "Fri, 09 Aug 2013 23:54:35 GMT",
                        "Server": "ECS (dcb/7EEA)",
                        "Vary": "Accept-Encoding",
                        "X-Cache": "HIT",
                        "Content-Length": "606"
                    },
                    "headersText": "HTTP/1.1 200 OK\r\nContent-Encoding: gzip\r\nCache-Control: max-age=604800\r\nContent-Type: text/html; charset=UTF-8\r\nDate: Sat, 12 Oct 2019 15:06:25 GMT\r\nEtag: \"1541025663+gzip\"\r\nExpires: Sat, 19 Oct 2019 15:06:25 GMT\r\nLast-Modified: Fri, 09 Aug 2013 23:54:35 GMT\r\nServer: ECS (dcb/7EEA)\r\nVary: Accept-Encoding\r\nX-Cache: HIT\r\nContent-Length: 606\r\n\r\n",
                    "mimeType": "text/html",
                    "requestHeaders": {
                        "Host": "example.com",
                        "Connection": "keep-alive",
                        "Upgrade-Insecure-Requests": "1",
                        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/77.0.3865.90 Safari/537.36",
                        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
                        "Accept-Encoding": "gzip, deflate"
                    },
                    "requestHeadersText": "GET / HTTP/1.1\r\nHost: example.com\r\nConnection: keep-alive\r\nUpgrade-Insecure-Requests: 1\r\nUser-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/77.0.3865.90 Safari/537.36\r\nAccept: text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9\r\nAccept-Encoding: gzip, deflate\r\n",
                    "connectionReused": false,
                    "connectionId": 13,
                    "remoteIPAddress": "93.184.216.34",
                    "remotePort": 80,
                    "fromDiskCache": false,
                    "fromServiceWorker": false,
                    "fromPrefetchCache": false,
                    "encodedDataLength": 344,
                    "timing": {
                        "requestTime": 68786.076553,
                        "proxyStart": -1,
                        "proxyEnd": -1,
                        "dnsStart": 0.989,
                        "dnsEnd": 12.498,
                        "connectStart": 12.498,
                        "connectEnd": 163.422,
                        "sslStart": -1,
                        "sslEnd": -1,
                        "workerStart": -1,
                        "workerReady": -1,
                        "sendStart": 163.696,
                        "sendEnd": 164.009,
                        "pushStart": 0,
                        "pushEnd": 0,
                        "receiveHeadersEnd": 314.446
                    },
                    "protocol": "http/1.1",
                    "securityState": "insecure"
                },
                "frameId": "51A5C24D998E2F1234BB63BBAC751053"
            }
        }
    },
    "events": [],
    "frames": {
        "51A5C24D998E2F1234BB63BBAC751053": {
            "frameId": "51A5C24D998E2F1234BB63BBAC751053",
            "state": [
                "loading",
                "navigated",
                "stopped"
            ],
            "id": "51A5C24D998E2F1234BB63BBAC751053",
            "loaderId": "E4ABF76F2DC0598449465BAF89C73EF1",
            "url": "http://example.com/",
            "securityOrigin": "http://example.com",
            "mimeType": "text/html"
        }
    },
    "style": {
        "1683.0": {
            "styleSheetId": "1683.0",
            "frameId": "51A5C24D998E2F1234BB63BBAC751053",
            "sourceURL": "http://example.com/",
            "origin": "regular",
            "title": "",
            "ownerNode": 3,
            "disabled": false,
            "isInline": true,
            "startLine": 8,
            "startColumn": 27,
            "length": 651,
            "endLine": 38,
            "endColumn": 4,
            "source": {
                "text": "\n    body {\n        background-color: #f0f0f2;\n        margin: 0;\n        padding: 0;\n        font-family: \"Open Sans\", \"Helvetica Neue\", Helvetica, Arial, sans-serif;\n        \n    }\n    div {\n        width: 600px;\n        margin: 5em auto;\n        padding: 50px;\n        background-color: #fff;\n        border-radius: 1em;\n    }\n    a:link, a:visited {\n        color: #38488f;\n        text-decoration: none;\n    }\n    @media (max-width: 700px) {\n        body {\n            background-color: #fff;\n        }\n        div {\n            width: auto;\n            margin: 0 auto;\n            border-radius: 0;\n            padding: 1em;\n        }\n    }\n    "
            }
        }
    },
    "metrics": [
        {
            "name": "Timestamp",
            "value": 68792.569164
        },
        {
            "name": "AudioHandlers",
            "value": 0
        },
        {
            "name": "Documents",
            "value": 3
        },
        {
            "name": "Frames",
            "value": 1
        },
        {
            "name": "JSEventListeners",
            "value": 0
        },
        {
            "name": "LayoutObjects",
            "value": 11
        },
        {
            "name": "MediaKeySessions",
            "value": 0
        },
        {
            "name": "MediaKeys",
            "value": 0
        },
        {
            "name": "Nodes",
            "value": 43
        },
        {
            "name": "Resources",
            "value": 1
        },
        {
            "name": "ContextLifecycleStateObservers",
            "value": 0
        },
        {
            "name": "V8PerContextDatas",
            "value": 1
        },
        {
            "name": "WorkerGlobalScopes",
            "value": 0
        },
        {
            "name": "UACSSResources",
            "value": 0
        },
        {
            "name": "RTCPeerConnections",
            "value": 0
        },
        {
            "name": "ResourceFetchers",
            "value": 3
        },
        {
            "name": "AdSubframes",
            "value": 0
        },
        {
            "name": "DetachedScriptStates",
            "value": 1
        },
        {
            "name": "LayoutCount",
            "value": 1
        },
        {
            "name": "RecalcStyleCount",
            "value": 1
        },
        {
            "name": "LayoutDuration",
            "value": 0.070938
        },
        {
            "name": "RecalcStyleDuration",
            "value": 0.000337
        },
        {
            "name": "ScriptDuration",
            "value": 0
        },
        {
            "name": "V8CompileDuration",
            "value": 0
        },
        {
            "name": "TaskDuration",
            "value": 0.089124
        },
        {
            "name": "TaskOtherDuration",
            "value": 0.017849
        },
        {
            "name": "ThreadTime",
            "value": 0.069893
        },
        {
            "name": "JSHeapUsedSize",
            "value": 1591256
        },
        {
            "name": "JSHeapTotalSize",
            "value": 3092480
        },
        {
            "name": "FirstMeaningfulPaint",
            "value": 68786.499378
        },
        {
            "name": "DomContentLoaded",
            "value": 68786.398229
        },
        {
            "name": "NavigationStart",
            "value": 68786.075608
        }
    ],
    "coverage": [
        {
            "scriptId": "3",
            "url": "",
            "functions": [
                {
                    "functionName": "",
                    "ranges": [
                        {
                            "startOffset": 0,
                            "endOffset": 31,
                            "count": 1
                        }
                    ],
                    "isBlockCoverage": false
                }
            ]
        },
        {
            "scriptId": "4",
            "url": "",
            "functions": [
                {
                    "functionName": "",
                    "ranges": [
                        {
                            "startOffset": 0,
                            "endOffset": 8,
                            "count": 1
                        }
                    ],
                    "isBlockCoverage": false
                }
            ]
        },
        {
            "scriptId": "5",
            "url": "",
            "functions": [
                {
                    "functionName": "",
                    "ranges": [
                        {
                            "startOffset": 0,
                            "endOffset": 6,
                            "count": 1
                        }
                    ],
                    "isBlockCoverage": false
                }
            ]
        }
    ]
};
const data = {
    frames: [
        {
            frameId: '51A5C24D998E2F1234BB63BBAC751053',
            url: 'http://example.com/',
            host: 'example.com',
            pathname: '/',
            loaderId: 'E4ABF76F2DC0598449465BAF89C73EF1',
            state: [
                Array
            ]
        }
    ],
    scripts: [
        {
            scriptId: '3',
            url: '',
            isModule: false,
            source: 'document.querySelectorAll("*");',
            length: 0,
            frameId: '51A5C24D998E2F1234BB63BBAC751053'
        },
        {
            scriptId: '4',
            url: '',
            isModule: false,
            source: 'document',
            length: 0,
            frameId: '51A5C24D998E2F1234BB63BBAC751053'
        },
        {
            scriptId: '5',
            url: '',
            isModule: false,
            source: 'window',
            length: 0,
            frameId: '51A5C24D998E2F1234BB63BBAC751053'
        }
    ],
    resources: [
        {
            url: 'http://example.com/',
            requestId: 'E4ABF76F2DC0598449465BAF89C73EF1',
            documentURL: 'http://example.com/',
            timestamp: 68786.07585,
            wallTime: 1570892785.379372,
            initiator: [
                Object
            ],
            type: 'Document',
            frameId: '51A5C24D998E2F1234BB63BBAC751053',
            loaderId: 'E4ABF76F2DC0598449465BAF89C73EF1',
            method: 'GET',
            headers: [
                Object
            ],
            mixedContentType: 'none',
            initialPriority: 'VeryHigh',
            referrerPolicy: 'no-referrer-when-downgrade',
            frameURL: 'http://example.com/',
            host: 'example.com',
            pathname: '/',
            frame: 'http://example.com/',
            response: [
                Object
            ]
        }
    ],
    metrics: {
        Timestamp: 68792.569164,
        AudioHandlers: 0,
        Documents: 3,
        Frames: 1,
        JSEventListeners: 0,
        LayoutObjects: 11,
        MediaKeySessions: 0,
        MediaKeys: 0,
        Nodes: 43,
        Resources: 1,
        ContextLifecycleStateObservers: 0,
        V8PerContextDatas: 1,
        WorkerGlobalScopes: 0,
        UACSSResources: 0,
        RTCPeerConnections: 0,
        ResourceFetchers: 3,
        AdSubframes: 0,
        DetachedScriptStates: 1,
        LayoutCount: 1,
        RecalcStyleCount: 1,
        LayoutDuration: 0.070938,
        RecalcStyleDuration: 0.000337,
        ScriptDuration: 0,
        V8CompileDuration: 0,
        TaskDuration: 0.089124,
        TaskOtherDuration: 0.017849,
        ThreadTime: 0.069893,
        JSHeapUsedSize: 1591256,
        JSHeapTotalSize: 3092480,
        FirstMeaningfulPaint: 68786.499378,
        DomContentLoaded: 68786.398229,
        NavigationStart: 68786.075608
    },
    styleSheets: [
        {
            styleSheetId: '1683.0',
            frameId: '51A5C24D998E2F1234BB63BBAC751053',
            sourceURL: 'http://example.com/',
            origin: 'regular',
            title: '',
            ownerNode: 3,
            disabled: false,
            isInline: true,
            startLine: 8,
            startColumn: 27,
            length: 651,
            endLine: 38,
            endColumn: 4,
            source: '\n    body {\n        background-color: #f0f0f2;\n        margin: 0;\n        padding: 0;\n        font-family: "Open Sans", "Helvetica Neue", Helvetica, Arial, sans-serif;\n        \n    }\n    div {\n        width: 600px;\n        margin: 5em auto;\n        padding: 50px;\n        background-color: #fff;\n        border-radius: 1em;\n    }\n    a:link, a:visited {\n        color: #38488f;\n        text-decoration: none;\n    }\n    @media (max-width: 700px) {\n        body {\n            background-color: #fff;\n        }\n        div {\n            width: auto;\n            margin: 0 auto;\n            border-radius: 0;\n            padding: 1em;\n        }\n    }\n    ',
            url: 'http://example.com/',
            host: 'example.com',
            pathname: '/'
        }
    ]
};

module.exports = {
    response,
    data
};









