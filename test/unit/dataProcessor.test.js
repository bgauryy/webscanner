const {processData, processScriptCoverage} = require('../../src/dataProcessor');

describe('dataProcessor testing', function () {

    test('should check null cases', () => {
        expect(processData()).toEqual(undefined);
        expect(processData({})).toEqual(undefined);
        expect(processData({}, {})).toEqual({});
    });
});

describe('dataProcessor script coverage', function () {

    test('should parse scripts coverage', () => {
        const data = {
            scripts: {
                'a': {length: 150},
                'b': {length: 1000},
                'c': {length: 80978},
            },
            coverage: {
                JSCoverage: [
                    {
                        scriptId: 'a',
                        functions: [
                            {
                                ranges: [{
                                    startOffset: 20, endOffset: 60,
                                    count: 1
                                }],
                                functionName: 'funcA',
                            },
                            {
                                ranges: [{
                                    startOffset: 40, endOffset: 150,
                                    count: 1
                                }],
                                functionName: 'funcB',
                            },
                            {
                                ranges: [{
                                    startOffset: 90, endOffset: 100,
                                    count: 1
                                }],
                                functionName: 'funcC',
                            },
                            {
                                ranges: [{
                                    startOffset: 0, endOffset: 150,
                                    count: 1
                                }],
                                functionName: 'funcD',
                            },
                        ]
                    },
                    {
                        scriptId: 'b',
                        functions: [
                            {
                                ranges: [{
                                    startOffset: 0, endOffset: 100, count: 1
                                }],
                                functionName: 'funcA',
                            },
                            {
                                ranges: [{
                                    startOffset: 100, endOffset: 300,
                                    count: 1
                                }],
                                functionName: 'funcB'
                            },
                            {
                                ranges: [{
                                    startOffset: 75, endOffset: 270,
                                    count: 1
                                }],
                                functionName: 'funcC',
                            },
                            {
                                ranges: [{
                                    startOffset: 80, endOffset: 260,
                                    count: 1
                                }],
                                functionName: 'funcD',
                            },
                            {
                                ranges: [{
                                    startOffset: 60, endOffset: 271,
                                    count: 1
                                }],
                                functionName: 'funcE',
                            },
                            {
                                ranges: [{
                                    startOffset: 60, endOffset: 271,
                                    count: 1
                                }],
                                functionName: 'funcF',
                            },
                            {
                                ranges: [{
                                    startOffset: 200, endOffset: 301,
                                    count: 0
                                }],
                                functionName: 'funcG',
                            },
                        ]
                    },
                ]
            }
        };

        processScriptCoverage(data, {});
        expect(data.scripts['a']).toEqual({
            'coverage': {
                'usedFunctions': ['funcA', 'funcB', 'funcC', 'funcD'],
                'unusedFunctions': [],
                'usage': 1,
                'usedBytes': 150
            },
            'length': 150
        });

        expect(data.scripts['b']).toEqual({
            'coverage': {
                'usedFunctions': ['funcA', 'funcB', 'funcC', 'funcD', 'funcE', 'funcF'],
                'unusedFunctions': ['funcG'],
                'usage': 0.3,
                'usedBytes': 300
            },
            'length': 1000
        });
    });

    test('should parse complex script coverage', () => {
        const data = {
            scripts: {
                'a': {length: 150},
                'b': {length: 1000},
                'c': {length: 80978},
            },
            coverage: {
                JSCoverage: [
                    {
                        scriptId: 'c',
                        functions: [
                            {
                                'functionName': 'e',
                                'ranges': [
                                    {
                                        'startOffset': 1,
                                        'endOffset': 437,
                                        'count': 1
                                    }
                                ],
                                'isBlockCoverage': false
                            },
                            {
                                'functionName': 'r',
                                'ranges': [
                                    {
                                        'startOffset': 19,
                                        'endOffset': 355,
                                        'count': 1
                                    }
                                ],
                                'isBlockCoverage': false
                            },
                            {
                                'functionName': '',
                                'ranges': [
                                    {
                                        'startOffset': 268,
                                        'endOffset': 313,
                                        'count': 1
                                    }
                                ],
                                'isBlockCoverage': false
                            },
                            {
                                'functionName': '1../child/ChildVisitor',
                                'ranges': [
                                    {
                                        'startOffset': 442,
                                        'endOffset': 24253,
                                        'count': 1
                                    }
                                ],
                                'isBlockCoverage': false
                            },
                            {
                                'functionName': '',
                                'ranges': [
                                    {
                                        'startOffset': 459,
                                        'endOffset': 24053,
                                        'count': 0
                                    }
                                ],
                                'isBlockCoverage': false
                            },
                            {
                                'functionName': 'e',
                                'ranges': [
                                    {
                                        'startOffset': 484,
                                        'endOffset': 515,
                                        'count': 1
                                    }
                                ],
                                'isBlockCoverage': false
                            },
                            {
                                'functionName': 'h',
                                'ranges': [
                                    {
                                        'startOffset': 1046,
                                        'endOffset': 23307,
                                        'count': 1
                                    }
                                ],
                                'isBlockCoverage': false
                            },
                            {
                                'functionName': 'r',
                                'ranges': [
                                    {
                                        'startOffset': 1062,
                                        'endOffset': 1223,
                                        'count': 0
                                    }
                                ],
                                'isBlockCoverage': false
                            },
                            {
                                'functionName': '',
                                'ranges': [
                                    {
                                        'startOffset': 1091,
                                        'endOffset': 1222,
                                        'count': 1
                                    }
                                ],
                                'isBlockCoverage': false
                            },
                            {
                                'functionName': 'h',
                                'ranges': [
                                    {
                                        'startOffset': 1223,
                                        'endOffset': 1389,
                                        'count': 0
                                    }
                                ],
                                'isBlockCoverage': false
                            },
                            {
                                'functionName': 'C',
                                'ranges': [
                                    {
                                        'startOffset': 1389,
                                        'endOffset': 1675,
                                        'count': 0
                                    }
                                ],
                                'isBlockCoverage': false
                            },
                            {
                                'functionName': 'D',
                                'ranges': [
                                    {
                                        'startOffset': 1675,
                                        'endOffset': 1940,
                                        'count': 0
                                    }
                                ],
                                'isBlockCoverage': false
                            },
                            {
                                'functionName': 'I',
                                'ranges': [
                                    {
                                        'startOffset': 1940,
                                        'endOffset': 2382,
                                        'count': 0
                                    }
                                ],
                                'isBlockCoverage': false
                            },
                            {
                                'functionName': 'j',
                                'ranges': [
                                    {
                                        'startOffset': 3238,
                                        'endOffset': 3277,
                                        'count': 1
                                    }
                                ],
                                'isBlockCoverage': false
                            },
                            {
                                'functionName': 'S.cookieRead',
                                'ranges': [
                                    {
                                        'startOffset': 3318,
                                        'endOffset': 3525,
                                        'count': 1
                                    }
                                ],
                                'isBlockCoverage': false
                            },
                            {
                                'functionName': 'S.cookieWrite',
                                'ranges': [
                                    {
                                        'startOffset': 3540,
                                        'endOffset': 4012,
                                        'count': 1
                                    }
                                ],
                                'isBlockCoverage': false
                            },
                            {
                                'functionName': 'S.resetState',
                                'ranges': [
                                    {
                                        'startOffset': 4026,
                                        'endOffset': 4067,
                                        'count': 0
                                    }
                                ],
                                'isBlockCoverage': false
                            },
                            {
                                'functionName': 'S.isAllowed',
                                'ranges': [
                                    {
                                        'startOffset': 4120,
                                        'endOffset': 4282,
                                        'count': 1
                                    }
                                ],
                                'isBlockCoverage': false
                            },
                            {
                                'functionName': 'S.setMarketingCloudVisitorID',
                                'ranges': [
                                    {
                                        'startOffset': 4312,
                                        'endOffset': 4354,
                                        'count': 0
                                    }
                                ],
                                'isBlockCoverage': false
                            },
                            {
                                'functionName': 'S.getMarketingCloudVisitorID',
                                'ranges': [
                                    {
                                        'startOffset': 4422,
                                        'endOffset': 4683,
                                        'count': 1
                                    }
                                ],
                                'isBlockCoverage': false
                            },
                            {
                                'functionName': 'S.getVisitorValues',
                                'ranges': [
                                    {
                                        'startOffset': 4703,
                                        'endOffset': 5053,
                                        'count': 0
                                    }
                                ],
                                'isBlockCoverage': false
                            },
                            {
                                'functionName': 'S.setCustomerIDs',
                                'ranges': [
                                    {
                                        'startOffset': 5150,
                                        'endOffset': 5699,
                                        'count': 0
                                    }
                                ],
                                'isBlockCoverage': false
                            },
                            {
                                'functionName': 'S.getCustomerIDs',
                                'ranges': [
                                    {
                                        'startOffset': 5717,
                                        'endOffset': 5952,
                                        'count': 1
                                    }
                                ],
                                'isBlockCoverage': false
                            },
                            {
                                'functionName': 'S.setAnalyticsVisitorID',
                                'ranges': [
                                    {
                                        'startOffset': 5977,
                                        'endOffset': 6014,
                                        'count': 0
                                    }
                                ],
                                'isBlockCoverage': false
                            },
                            {
                                'functionName': 'S.getAnalyticsVisitorID',
                                'ranges': [
                                    {
                                        'startOffset': 6039,
                                        'endOffset': 6932,
                                        'count': 1
                                    }
                                ],
                                'isBlockCoverage': false
                            },
                            {
                                'functionName': '',
                                'ranges': [
                                    {
                                        'startOffset': 6192,
                                        'endOffset': 6234,
                                        'count': 0
                                    }
                                ],
                                'isBlockCoverage': false
                            },
                            {
                                'functionName': 'S.getAudienceManagerLocationHint',
                                'ranges': [
                                    {
                                        'startOffset': 6966,
                                        'endOffset': 7359,
                                        'count': 1
                                    }
                                ],
                                'isBlockCoverage': false
                            },
                            {
                                'functionName': '',
                                'ranges': [
                                    {
                                        'startOffset': 7033,
                                        'endOffset': 7084,
                                        'count': 1
                                    }
                                ],
                                'isBlockCoverage': false
                            },
                            {
                                'functionName': '',
                                'ranges': [
                                    {
                                        'startOffset': 7178,
                                        'endOffset': 7229,
                                        'count': 0
                                    }
                                ],
                                'isBlockCoverage': false
                            },
                            {
                                'functionName': 'S.getAudienceManagerBlob',
                                'ranges': [
                                    {
                                        'startOffset': 7436,
                                        'endOffset': 7864,
                                        'count': 1
                                    }
                                ],
                                'isBlockCoverage': false
                            },
                            {
                                'functionName': '',
                                'ranges': [
                                    {
                                        'startOffset': 7503,
                                        'endOffset': 7546,
                                        'count': 1
                                    }
                                ],
                                'isBlockCoverage': false
                            },
                            {
                                'functionName': '',
                                'ranges': [
                                    {
                                        'startOffset': 7640,
                                        'endOffset': 7683,
                                        'count': 0
                                    }
                                ],
                                'isBlockCoverage': false
                            },
                            {
                                'functionName': 'S.getSupplementalDataID',
                                'ranges': [
                                    {
                                        'startOffset': 8027,
                                        'endOffset': 8616,
                                        'count': 1
                                    }
                                ],
                                'isBlockCoverage': false
                            },
                            {
                                'functionName': 'S.getOptOut',
                                'ranges': [
                                    {
                                        'startOffset': 8629,
                                        'endOffset': 8777,
                                        'count': 1
                                    }
                                ],
                                'isBlockCoverage': false
                            },
                            {
                                'functionName': 'S.isOptedOut',
                                'ranges': [
                                    {
                                        'startOffset': 8791,
                                        'endOffset': 9008,
                                        'count': 1
                                    }
                                ],
                                'isBlockCoverage': false
                            },
                            {
                                'functionName': '',
                                'ranges': [
                                    {
                                        'startOffset': 8866,
                                        'endOffset': 8944,
                                        'count': 1
                                    }
                                ],
                                'isBlockCoverage': false
                            },
                            {
                                'functionName': 'S._hash',
                                'ranges': [
                                    {
                                        'startOffset': 9054,
                                        'endOffset': 9151,
                                        'count': 1
                                    }
                                ],
                                'isBlockCoverage': false
                            },
                            {
                                'functionName': 'S._generateLocalMID',
                                'ranges': [
                                    {
                                        'startOffset': 9188,
                                        'endOffset': 9272,
                                        'count': 0
                                    }
                                ],
                                'isBlockCoverage': false
                            },
                            {
                                'functionName': 'S._callCallback',
                                'ranges': [
                                    {
                                        'startOffset': 9310,
                                        'endOffset': 9392,
                                        'count': 1
                                    }
                                ],
                                'isBlockCoverage': false
                            },
                            {
                                'functionName': 'S._registerCallback',
                                'ranges': [
                                    {
                                        'startOffset': 9413,
                                        'endOffset': 9555,
                                        'count': 1
                                    }
                                ],
                                'isBlockCoverage': false
                            },
                            {
                                'functionName': 'S._callAllCallbacks',
                                'ranges': [
                                    {
                                        'startOffset': 9576,
                                        'endOffset': 9693,
                                        'count': 1
                                    }
                                ],
                                'isBlockCoverage': false
                            },
                            {
                                'functionName': 'S._addQuerystringParam',
                                'ranges': [
                                    {
                                        'startOffset': 9717,
                                        'endOffset': 9954,
                                        'count': 1
                                    }
                                ],
                                'isBlockCoverage': false
                            },
                            {
                                'functionName': 'S._extractParamFromUri',
                                'ranges': [
                                    {
                                        'startOffset': 9978,
                                        'endOffset': 10093,
                                        'count': 1
                                    }
                                ],
                                'isBlockCoverage': false
                            },
                            {
                                'functionName': 'S._attemptToPopulateSdidFromUrl',
                                'ranges': [
                                    {
                                        'startOffset': 10209,
                                        'endOffset': 10442,
                                        'count': 1
                                    }
                                ],
                                'isBlockCoverage': false
                            },
                            {
                                'functionName': 'S._attemptToPopulateIdsFromUrl',
                                'ranges': [
                                    {
                                        'startOffset': 10474,
                                        'endOffset': 10638,
                                        'count': 1
                                    }
                                ],
                                'isBlockCoverage': false
                            },
                            {
                                'functionName': 'S._mergeServerState',
                                'ranges': [
                                    {
                                        'startOffset': 10659,
                                        'endOffset': 10941,
                                        'count': 0
                                    }
                                ],
                                'isBlockCoverage': false
                            },
                            {
                                'functionName': 'S._loadData',
                                'ranges': [
                                    {
                                        'startOffset': 10970,
                                        'endOffset': 11245,
                                        'count': 1
                                    }
                                ],
                                'isBlockCoverage': false
                            },
                            {
                                'functionName': 'S._clearTimeout',
                                'ranges': [
                                    {
                                        'startOffset': 11262,
                                        'endOffset': 11353,
                                        'count': 1
                                    }
                                ],
                                'isBlockCoverage': false
                            },
                            {
                                'functionName': 'S._getSettingsDigest',
                                'ranges': [
                                    {
                                        'startOffset': 11395,
                                        'endOffset': 11627,
                                        'count': 1
                                    }
                                ],
                                'isBlockCoverage': false
                            },
                            {
                                'functionName': 'S._readVisitor',
                                'ranges': [
                                    {
                                        'startOffset': 11665,
                                        'endOffset': 12564,
                                        'count': 1
                                    }
                                ],
                                'isBlockCoverage': false
                            },
                            {
                                'functionName': 'S._appendVersionTo',
                                'ranges': [
                                    {
                                        'startOffset': 12584,
                                        'endOffset': 12753,
                                        'count': 1
                                    }
                                ],
                                'isBlockCoverage': false
                            },
                            {
                                'functionName': 'S._writeVisitor',
                                'ranges': [
                                    {
                                        'startOffset': 12770,
                                        'endOffset': 13030,
                                        'count': 1
                                    }
                                ],
                                'isBlockCoverage': false
                            },
                            {
                                'functionName': 'S._getField',
                                'ranges': [
                                    {
                                        'startOffset': 13043,
                                        'endOffset': 13141,
                                        'count': 1
                                    }
                                ],
                                'isBlockCoverage': false
                            },
                            {
                                'functionName': 'S._setField',
                                'ranges': [
                                    {
                                        'startOffset': 13154,
                                        'endOffset': 13238,
                                        'count': 1
                                    }
                                ],
                                'isBlockCoverage': false
                            },
                            {
                                'functionName': 'S._getFieldList',
                                'ranges': [
                                    {
                                        'startOffset': 13255,
                                        'endOffset': 13319,
                                        'count': 0
                                    }
                                ],
                                'isBlockCoverage': false
                            },
                            {
                                'functionName': 'S._setFieldList',
                                'ranges': [
                                    {
                                        'startOffset': 13336,
                                        'endOffset': 13386,
                                        'count': 0
                                    }
                                ],
                                'isBlockCoverage': false
                            },
                            {
                                'functionName': 'S._getFieldMap',
                                'ranges': [
                                    {
                                        'startOffset': 13402,
                                        'endOffset': 13520,
                                        'count': 0
                                    }
                                ],
                                'isBlockCoverage': false
                            },
                            {
                                'functionName': 'S._setFieldMap',
                                'ranges': [
                                    {
                                        'startOffset': 13536,
                                        'endOffset': 13641,
                                        'count': 0
                                    }
                                ],
                                'isBlockCoverage': false
                            },
                            {
                                'functionName': 'S._setFieldExpire',
                                'ranges': [
                                    {
                                        'startOffset': 13660,
                                        'endOffset': 14004,
                                        'count': 1
                                    }
                                ],
                                'isBlockCoverage': false
                            },
                            {
                                'functionName': 'S._findVisitorID',
                                'ranges': [
                                    {
                                        'startOffset': 14022,
                                        'endOffset': 14240,
                                        'count': 1
                                    }
                                ],
                                'isBlockCoverage': false
                            },
                            {
                                'functionName': 'S._setFields',
                                'ranges': [
                                    {
                                        'startOffset': 14254,
                                        'endOffset': 15987,
                                        'count': 1
                                    }
                                ],
                                'isBlockCoverage': false
                            },
                            {
                                'functionName': 'S._getRemoteField',
                                'ranges': [
                                    {
                                        'startOffset': 16022,
                                        'endOffset': 16908,
                                        'count': 1
                                    }
                                ],
                                'isBlockCoverage': false
                            },
                            {
                                'functionName': 'u',
                                'ranges': [
                                    {
                                        'startOffset': 16188,
                                        'endOffset': 16281,
                                        'count': 1
                                    }
                                ],
                                'isBlockCoverage': false
                            },
                            {
                                'functionName': '',
                                'ranges': [
                                    {
                                        'startOffset': 16453,
                                        'endOffset': 16596,
                                        'count': 0
                                    }
                                ],
                                'isBlockCoverage': false
                            },
                            {
                                'functionName': 'S._setMarketingCloudFields',
                                'ranges': [
                                    {
                                        'startOffset': 16936,
                                        'endOffset': 16983,
                                        'count': 1
                                    }
                                ],
                                'isBlockCoverage': false
                            },
                            {
                                'functionName': 'S._mapCustomerIDs',
                                'ranges': [
                                    {
                                        'startOffset': 17002,
                                        'endOffset': 17045,
                                        'count': 0
                                    }
                                ],
                                'isBlockCoverage': false
                            },
                            {
                                'functionName': 'S._setAnalyticsFields',
                                'ranges': [
                                    {
                                        'startOffset': 17068,
                                        'endOffset': 17115,
                                        'count': 0
                                    }
                                ],
                                'isBlockCoverage': false
                            },
                            {
                                'functionName': 'S._setAudienceManagerFields',
                                'ranges': [
                                    {
                                        'startOffset': 17144,
                                        'endOffset': 17191,
                                        'count': 0
                                    }
                                ],
                                'isBlockCoverage': false
                            },
                            {
                                'functionName': 'S._getAudienceManagerURLData',
                                'ranges': [
                                    {
                                        'startOffset': 17221,
                                        'endOffset': 18247,
                                        'count': 1
                                    }
                                ],
                                'isBlockCoverage': false
                            },
                            {
                                'functionName': 'S.appendVisitorIDsTo',
                                'ranges': [
                                    {
                                        'startOffset': 18269,
                                        'endOffset': 18425,
                                        'count': 0
                                    }
                                ],
                                'isBlockCoverage': false
                            },
                            {
                                'functionName': 'S.appendSupplementalDataIDTo',
                                'ranges': [
                                    {
                                        'startOffset': 18455,
                                        'endOffset': 18664,
                                        'count': 0
                                    }
                                ],
                                'isBlockCoverage': false
                            },
                            {
                                'functionName': 'parseHash',
                                'ranges': [
                                    {
                                        'startOffset': 18682,
                                        'endOffset': 18741,
                                        'count': 1
                                    }
                                ],
                                'isBlockCoverage': false
                            },
                            {
                                'functionName': 'hashlessUrl',
                                'ranges': [
                                    {
                                        'startOffset': 18754,
                                        'endOffset': 18814,
                                        'count': 1
                                    }
                                ],
                                'isBlockCoverage': false
                            },
                            {
                                'functionName': 'addQueryParamAtLocation',
                                'ranges': [
                                    {
                                        'startOffset': 18839,
                                        'endOffset': 18930,
                                        'count': 1
                                    }
                                ],
                                'isBlockCoverage': false
                            },
                            {
                                'functionName': 'isFirstPartyAnalyticsVisitorIDCall',
                                'ranges': [
                                    {
                                        'startOffset': 18966,
                                        'endOffset': 19169,
                                        'count': 1
                                    }
                                ],
                                'isBlockCoverage': false
                            },
                            {
                                'functionName': 'isObject',
                                'ranges': [
                                    {
                                        'startOffset': 19179,
                                        'endOffset': 19224,
                                        'count': 0
                                    }
                                ],
                                'isBlockCoverage': false
                            },
                            {
                                'functionName': 'removeCookie',
                                'ranges': [
                                    {
                                        'startOffset': 19238,
                                        'endOffset': 19390,
                                        'count': 1
                                    }
                                ],
                                'isBlockCoverage': false
                            },
                            {
                                'functionName': 'isTrackingServerPopulated',
                                'ranges': [
                                    {
                                        'startOffset': 19417,
                                        'endOffset': 19479,
                                        'count': 1
                                    }
                                ],
                                'isBlockCoverage': false
                            },
                            {
                                'functionName': 'getTimestampInSeconds',
                                'ranges': [
                                    {
                                        'startOffset': 19502,
                                        'endOffset': 19557,
                                        'count': 0
                                    }
                                ],
                                'isBlockCoverage': false
                            },
                            {
                                'functionName': 'parsePipeDelimetedKeyValues',
                                'ranges': [
                                    {
                                        'startOffset': 19586,
                                        'endOffset': 19713,
                                        'count': 0
                                    }
                                ],
                                'isBlockCoverage': false
                            },
                            {
                                'functionName': 'generateRandomString',
                                'ranges': [
                                    {
                                        'startOffset': 19735,
                                        'endOffset': 19863,
                                        'count': 0
                                    }
                                ],
                                'isBlockCoverage': false
                            },
                            {
                                'functionName': 'parseBoolean',
                                'ranges': [
                                    {
                                        'startOffset': 19877,
                                        'endOffset': 19925,
                                        'count': 0
                                    }
                                ],
                                'isBlockCoverage': false
                            },
                            {
                                'functionName': 'replaceMethodsWithFunction',
                                'ranges': [
                                    {
                                        'startOffset': 19953,
                                        'endOffset': 20046,
                                        'count': 0
                                    }
                                ],
                                'isBlockCoverage': false
                            },
                            {
                                'functionName': 'pluck',
                                'ranges': [
                                    {
                                        'startOffset': 20053,
                                        'endOffset': 20146,
                                        'count': 0
                                    }
                                ],
                                'isBlockCoverage': false
                            },
                            {
                                'functionName': 'setState',
                                'ranges': [
                                    {
                                        'startOffset': 20374,
                                        'endOffset': 20714,
                                        'count': 1
                                    }
                                ],
                                'isBlockCoverage': false
                            },
                            {
                                'functionName': 'S.isClientSideMarketingCloudVisitorID',
                                'ranges': [
                                    {
                                        'startOffset': 20754,
                                        'endOffset': 20810,
                                        'count': 0
                                    }
                                ],
                                'isBlockCoverage': false
                            },
                            {
                                'functionName': 'S.MCIDCallTimedOut',
                                'ranges': [
                                    {
                                        'startOffset': 20830,
                                        'endOffset': 20867,
                                        'count': 0
                                    }
                                ],
                                'isBlockCoverage': false
                            },
                            {
                                'functionName': 'S.AnalyticsIDCallTimedOut',
                                'ranges': [
                                    {
                                        'startOffset': 20894,
                                        'endOffset': 20938,
                                        'count': 0
                                    }
                                ],
                                'isBlockCoverage': false
                            },
                            {
                                'functionName': 'S.AAMIDCallTimedOut',
                                'ranges': [
                                    {
                                        'startOffset': 20959,
                                        'endOffset': 20997,
                                        'count': 0
                                    }
                                ],
                                'isBlockCoverage': false
                            },
                            {
                                'functionName': 'S.idSyncGetOnPageSyncInfo',
                                'ranges': [
                                    {
                                        'startOffset': 21024,
                                        'endOffset': 21074,
                                        'count': 0
                                    }
                                ],
                                'isBlockCoverage': false
                            },
                            {
                                'functionName': 'S.idSyncByURL',
                                'ranges': [
                                    {
                                        'startOffset': 21089,
                                        'endOffset': 21404,
                                        'count': 0
                                    }
                                ],
                                'isBlockCoverage': false
                            },
                            {
                                'functionName': 'S.idSyncByDataSource',
                                'ranges': [
                                    {
                                        'startOffset': 21426,
                                        'endOffset': 21626,
                                        'count': 0
                                    }
                                ],
                                'isBlockCoverage': false
                            },
                            {
                                'functionName': 'S._getCookieVersion',
                                'ranges': [
                                    {
                                        'startOffset': 21647,
                                        'endOffset': 21756,
                                        'count': 1
                                    }
                                ],
                                'isBlockCoverage': false
                            },
                            {
                                'functionName': 'S._resetAmcvCookie',
                                'ranges': [
                                    {
                                        'startOffset': 21776,
                                        'endOffset': 21868,
                                        'count': 0
                                    }
                                ],
                                'isBlockCoverage': false
                            },
                            {
                                'functionName': 'S.setAsCoopSafe',
                                'ranges': [
                                    {
                                        'startOffset': 21885,
                                        'endOffset': 21901,
                                        'count': 0
                                    }
                                ],
                                'isBlockCoverage': false
                            },
                            {
                                'functionName': 'S.setAsCoopUnsafe',
                                'ranges': [
                                    {
                                        'startOffset': 21920,
                                        'endOffset': 21936,
                                        'count': 0
                                    }
                                ],
                                'isBlockCoverage': false
                            },
                            {
                                'functionName': 'S.init',
                                'ranges': [
                                    {
                                        'startOffset': 21944,
                                        'endOffset': 23306,
                                        'count': 1
                                    }
                                ],
                                'isBlockCoverage': false
                            },
                            {
                                'functionName': 'i',
                                'ranges': [
                                    {
                                        'startOffset': 21955,
                                        'endOffset': 22722,
                                        'count': 0
                                    }
                                ],
                                'isBlockCoverage': false
                            },
                            {
                                'functionName': 'n',
                                'ranges': [
                                    {
                                        'startOffset': 22722,
                                        'endOffset': 23015,
                                        'count': 0
                                    }
                                ],
                                'isBlockCoverage': false
                            },
                            {
                                'functionName': 'e',
                                'ranges': [
                                    {
                                        'startOffset': 22807,
                                        'endOffset': 22868,
                                        'count': 1
                                    }
                                ],
                                'isBlockCoverage': false
                            },
                            {
                                'functionName': '',
                                'ranges': [
                                    {
                                        'startOffset': 22895,
                                        'endOffset': 22928,
                                        'count': 1
                                    }
                                ],
                                'isBlockCoverage': false
                            },
                            {
                                'functionName': '',
                                'ranges': [
                                    {
                                        'startOffset': 22951,
                                        'endOffset': 22988,
                                        'count': 1
                                    }
                                ],
                                'isBlockCoverage': false
                            },
                            {
                                'functionName': 'r',
                                'ranges': [
                                    {
                                        'startOffset': 23015,
                                        'endOffset': 23294,
                                        'count': 0
                                    }
                                ],
                                'isBlockCoverage': false
                            },
                            {
                                'functionName': 'h.getInstance',
                                'ranges': [
                                    {
                                        'startOffset': 23322,
                                        'endOffset': 24024,
                                        'count': 1
                                    }
                                ],
                                'isBlockCoverage': false
                            },
                            {
                                'functionName': 'n',
                                'ranges': [
                                    {
                                        'startOffset': 23336,
                                        'endOffset': 23468,
                                        'count': 0
                                    }
                                ],
                                'isBlockCoverage': false
                            },
                            {
                                'functionName': 'a',
                                'ranges': [
                                    {
                                        'startOffset': 23468,
                                        'endOffset': 23529,
                                        'count': 0
                                    }
                                ],
                                'isBlockCoverage': false
                            },
                            {
                                'functionName': 's',
                                'ranges': [
                                    {
                                        'startOffset': 23529,
                                        'endOffset': 23572,
                                        'count': 0
                                    }
                                ],
                                'isBlockCoverage': false
                            },
                            {
                                'functionName': '',
                                'ranges': [
                                    {
                                        'startOffset': 23868,
                                        'endOffset': 23880,
                                        'count': 0
                                    }
                                ],
                                'isBlockCoverage': false
                            },
                            {
                                'functionName': '2.../utils/callbackRegistryFactory',
                                'ranges': [
                                    {
                                        'startOffset': 24630,
                                        'endOffset': 26447,
                                        'count': 1
                                    }
                                ],
                                'isBlockCoverage': false
                            },
                            {
                                'functionName': '',
                                'ranges': [
                                    {
                                        'startOffset': 24647,
                                        'endOffset': 26247,
                                        'count': 0
                                    }
                                ],
                                'isBlockCoverage': false
                            },
                            {
                                'functionName': '3.../utils/enums',
                                'ranges': [
                                    {
                                        'startOffset': 26646,
                                        'endOffset': 27218,
                                        'count': 1
                                    }
                                ],
                                'isBlockCoverage': false
                            },
                            {
                                'functionName': 't.exports',
                                'ranges': [
                                    {
                                        'startOffset': 26746,
                                        'endOffset': 27217,
                                        'count': 0
                                    }
                                ],
                                'isBlockCoverage': false
                            },
                            {
                                'functionName': '4.../utils/enums',
                                'ranges': [
                                    {
                                        'startOffset': 27245,
                                        'endOffset': 28119,
                                        'count': 1
                                    }
                                ],
                                'isBlockCoverage': false
                            },
                            {
                                'functionName': 't.exports',
                                'ranges': [
                                    {
                                        'startOffset': 27387,
                                        'endOffset': 28118,
                                        'count': 0
                                    }
                                ],
                                'isBlockCoverage': false
                            },
                            {
                                'functionName': '5.../../utils/enums',
                                'ranges': [
                                    {
                                        'startOffset': 28166,
                                        'endOffset': 28531,
                                        'count': 1
                                    }
                                ],
                                'isBlockCoverage': false
                            },
                            {
                                'functionName': 't.exports',
                                'ranges': [
                                    {
                                        'startOffset': 28240,
                                        'endOffset': 28530,
                                        'count': 0
                                    }
                                ],
                                'isBlockCoverage': false
                            },
                            {
                                'functionName': '6.../../utils/enums',
                                'ranges': [
                                    {
                                        'startOffset': 28561,
                                        'endOffset': 28751,
                                        'count': 1
                                    }
                                ],
                                'isBlockCoverage': false
                            },
                            {
                                'functionName': 't.exports',
                                'ranges': [
                                    {
                                        'startOffset': 28634,
                                        'endOffset': 28750,
                                        'count': 0
                                    }
                                ],
                                'isBlockCoverage': false
                            },
                            {
                                'functionName': '7.../../utils/enums',
                                'ranges': [
                                    {
                                        'startOffset': 28781,
                                        'endOffset': 29300,
                                        'count': 1
                                    }
                                ],
                                'isBlockCoverage': false
                            },
                            {
                                'functionName': 't.exports',
                                'ranges': [
                                    {
                                        'startOffset': 28884,
                                        'endOffset': 29299,
                                        'count': 0
                                    }
                                ],
                                'isBlockCoverage': false
                            },
                            {
                                'functionName': '8',
                                'ranges': [
                                    {
                                        'startOffset': 29330,
                                        'endOffset': 30085,
                                        'count': 1
                                    }
                                ],
                                'isBlockCoverage': false
                            },
                            {
                                'functionName': '',
                                'ranges': [
                                    {
                                        'startOffset': 29347,
                                        'endOffset': 29885,
                                        'count': 0
                                    }
                                ],
                                'isBlockCoverage': false
                            },
                            {
                                'functionName': 'receiveMessage',
                                'ranges': [
                                    {
                                        'startOffset': 29569,
                                        'endOffset': 29883,
                                        'count': 1
                                    }
                                ],
                                'isBlockCoverage': false
                            },
                            {
                                'functionName': 'r',
                                'ranges': [
                                    {
                                        'startOffset': 29603,
                                        'endOffset': 29743,
                                        'count': 1
                                    }
                                ],
                                'isBlockCoverage': false
                            },
                            {
                                'functionName': '9',
                                'ranges': [
                                    {
                                        'startOffset': 30093,
                                        'endOffset': 31960,
                                        'count': 1
                                    }
                                ],
                                'isBlockCoverage': false
                            },
                            {
                                'functionName': '',
                                'ranges': [
                                    {
                                        'startOffset': 30110,
                                        'endOffset': 31760,
                                        'count': 0
                                    }
                                ],
                                'isBlockCoverage': false
                            },
                            {
                                'functionName': 't.exports',
                                'ranges': [
                                    {
                                        'startOffset': 30132,
                                        'endOffset': 31759,
                                        'count': 1
                                    }
                                ],
                                'isBlockCoverage': false
                            },
                            {
                                'functionName': '',
                                'ranges': [
                                    {
                                        'startOffset': 30166,
                                        'endOffset': 30535,
                                        'count': 0
                                    }
                                ],
                                'isBlockCoverage': false
                            },
                            {
                                'functionName': 'getCORSInstance',
                                'ranges': [
                                    {
                                        'startOffset': 30554,
                                        'endOffset': 30646,
                                        'count': 1
                                    }
                                ],
                                'isBlockCoverage': false
                            },
                            {
                                'functionName': 'fireCORS',
                                'ranges': [
                                    {
                                        'startOffset': 30656,
                                        'endOffset': 31586,
                                        'count': 1
                                    }
                                ],
                                'isBlockCoverage': false
                            },
                            {
                                'functionName': 'a',
                                'ranges': [
                                    {
                                        'startOffset': 30672,
                                        'endOffset': 30997,
                                        'count': 1
                                    }
                                ],
                                'isBlockCoverage': false
                            },
                            {
                                'functionName': 'corsMetadata.corsType.o.onreadystatechange',
                                'ranges': [
                                    {
                                        'startOffset': 31307,
                                        'endOffset': 31379,
                                        'count': 1
                                    }
                                ],
                                'isBlockCoverage': false
                            },
                            {
                                'functionName': 'o.onerror',
                                'ranges': [
                                    {
                                        'startOffset': 31391,
                                        'endOffset': 31436,
                                        'count': 0
                                    }
                                ],
                                'isBlockCoverage': false
                            },
                            {
                                'functionName': 'o.ontimeout',
                                'ranges': [
                                    {
                                        'startOffset': 31449,
                                        'endOffset': 31496,
                                        'count': 0
                                    }
                                ],
                                'isBlockCoverage': false
                            },
                            {
                                'functionName': 'handleCORSError',
                                'ranges': [
                                    {
                                        'startOffset': 31603,
                                        'endOffset': 31757,
                                        'count': 0
                                    }
                                ],
                                'isBlockCoverage': false
                            },
                            {
                                'functionName': '10.../utils/constants',
                                'ranges': [
                                    {
                                        'startOffset': 31969,
                                        'endOffset': 39962,
                                        'count': 1
                                    }
                                ],
                                'isBlockCoverage': false
                            },
                            {
                                'functionName': '',
                                'ranges': [
                                    {
                                        'startOffset': 31986,
                                        'endOffset': 39762,
                                        'count': 0
                                    }
                                ],
                                'isBlockCoverage': false
                            },
                            {
                                'functionName': 't.exports',
                                'ranges': [
                                    {
                                        'startOffset': 32119,
                                        'endOffset': 39761,
                                        'count': 1
                                    }
                                ],
                                'isBlockCoverage': false
                            },
                            {
                                'functionName': 'getIframeHost',
                                'ranges': [
                                    {
                                        'startOffset': 32271,
                                        'endOffset': 32348,
                                        'count': 1
                                    }
                                ],
                                'isBlockCoverage': false
                            },
                            {
                                'functionName': 'getUrl',
                                'ranges': [
                                    {
                                        'startOffset': 32380,
                                        'endOffset': 32778,
                                        'count': 1
                                    }
                                ],
                                'isBlockCoverage': false
                            },
                            {
                                'functionName': 'checkDPIframeSrc',
                                'ranges': [
                                    {
                                        'startOffset': 32796,
                                        'endOffset': 33133,
                                        'count': 1
                                    }
                                ],
                                'isBlockCoverage': false
                            },
                            {
                                'functionName': 'readyToAttachIframe',
                                'ranges': [
                                    {
                                        'startOffset': 33624,
                                        'endOffset': 33827,
                                        'count': 1
                                    }
                                ],
                                'isBlockCoverage': false
                            },
                            {
                                'functionName': 'attachIframe',
                                'ranges': [
                                    {
                                        'startOffset': 33841,
                                        'endOffset': 34602,
                                        'count': 1
                                    }
                                ],
                                'isBlockCoverage': false
                            },
                            {
                                'functionName': 'e',
                                'ranges': [
                                    {
                                        'startOffset': 33852,
                                        'endOffset': 34115,
                                        'count': 1
                                    }
                                ],
                                'isBlockCoverage': false
                            },
                            {
                                'functionName': 't',
                                'ranges': [
                                    {
                                        'startOffset': 34115,
                                        'endOffset': 34239,
                                        'count': 1
                                    }
                                ],
                                'isBlockCoverage': false
                            },
                            {
                                'functionName': '',
                                'ranges': [
                                    {
                                        'startOffset': 34154,
                                        'endOffset': 34237,
                                        'count': 1
                                    }
                                ],
                                'isBlockCoverage': false
                            },
                            {
                                'functionName': 'requestToProcess',
                                'ranges': [
                                    {
                                        'startOffset': 34620,
                                        'endOffset': 35475,
                                        'count': 1
                                    }
                                ],
                                'isBlockCoverage': false
                            },
                            {
                                'functionName': 'i',
                                'ranges': [
                                    {
                                        'startOffset': 34632,
                                        'endOffset': 34718,
                                        'count': 1
                                    }
                                ],
                                'isBlockCoverage': false
                            },
                            {
                                'functionName': '',
                                'ranges': [
                                    {
                                        'startOffset': 35339,
                                        'endOffset': 35407,
                                        'count': 0
                                    }
                                ],
                                'isBlockCoverage': false
                            },
                            {
                                'functionName': 'getRegionAndCheckIfChanged',
                                'ranges': [
                                    {
                                        'startOffset': 35503,
                                        'endOffset': 35792,
                                        'count': 1
                                    }
                                ],
                                'isBlockCoverage': false
                            },
                            {
                                'functionName': 'processSyncOnPage',
                                'ranges': [
                                    {
                                        'startOffset': 35811,
                                        'endOffset': 35965,
                                        'count': 1
                                    }
                                ],
                                'isBlockCoverage': false
                            },
                            {
                                'functionName': 'process',
                                'ranges': [
                                    {
                                        'startOffset': 35974,
                                        'endOffset': 36391,
                                        'count': 1
                                    }
                                ],
                                'isBlockCoverage': false
                            },
                            {
                                'functionName': 'checkFirstPartyCookie',
                                'ranges': [
                                    {
                                        'startOffset': 36414,
                                        'endOffset': 36711,
                                        'count': 1
                                    }
                                ],
                                'isBlockCoverage': false
                            },
                            {
                                'functionName': 'pruneSyncData',
                                'ranges': [
                                    {
                                        'startOffset': 36726,
                                        'endOffset': 36938,
                                        'count': 0
                                    }
                                ],
                                'isBlockCoverage': false
                            },
                            {
                                'functionName': 'manageSyncsSize',
                                'ranges': [
                                    {
                                        'startOffset': 36955,
                                        'endOffset': 37155,
                                        'count': 1
                                    }
                                ],
                                'isBlockCoverage': false
                            },
                            {
                                'functionName': '',
                                'ranges': [
                                    {
                                        'startOffset': 37022,
                                        'endOffset': 37101,
                                        'count': 0
                                    }
                                ],
                                'isBlockCoverage': false
                            },
                            {
                                'functionName': 'fireSync',
                                'ranges': [
                                    {
                                        'startOffset': 37165,
                                        'endOffset': 37737,
                                        'count': 1
                                    }
                                ],
                                'isBlockCoverage': false
                            },
                            {
                                'functionName': '',
                                'ranges': [
                                    {
                                        'startOffset': 37366,
                                        'endOffset': 37600,
                                        'count': 1
                                    }
                                ],
                                'isBlockCoverage': false
                            },
                            {
                                'functionName': '',
                                'ranges': [
                                    {
                                        'startOffset': 37391,
                                        'endOffset': 37599,
                                        'count': 1
                                    }
                                ],
                                'isBlockCoverage': false
                            },
                            {
                                'functionName': 'addMessage',
                                'ranges': [
                                    {
                                        'startOffset': 37749,
                                        'endOffset': 37905,
                                        'count': 0
                                    }
                                ],
                                'isBlockCoverage': false
                            },
                            {
                                'functionName': 'setSyncTrackingData',
                                'ranges': [
                                    {
                                        'startOffset': 37926,
                                        'endOffset': 38039,
                                        'count': 1
                                    }
                                ],
                                'isBlockCoverage': false
                            },
                            {
                                'functionName': 'sendMessages',
                                'ranges': [
                                    {
                                        'startOffset': 38053,
                                        'endOffset': 38486,
                                        'count': 0
                                    }
                                ],
                                'isBlockCoverage': false
                            },
                            {
                                'functionName': 'postMessage',
                                'ranges': [
                                    {
                                        'startOffset': 38499,
                                        'endOffset': 38591,
                                        'count': 0
                                    }
                                ],
                                'isBlockCoverage': false
                            },
                            {
                                'functionName': 'receiveMessage',
                                'ranges': [
                                    {
                                        'startOffset': 38607,
                                        'endOffset': 38895,
                                        'count': 1
                                    }
                                ],
                                'isBlockCoverage': false
                            },
                            {
                                'functionName': 'processIDCallData',
                                'ranges': [
                                    {
                                        'startOffset': 38914,
                                        'endOffset': 39536,
                                        'count': 1
                                    }
                                ],
                                'isBlockCoverage': false
                            },
                            {
                                'functionName': 'canMakeSyncIDCall',
                                'ranges': [
                                    {
                                        'startOffset': 39555,
                                        'endOffset': 39633,
                                        'count': 0
                                    }
                                ],
                                'isBlockCoverage': false
                            },
                            {
                                'functionName': 'attachIframeASAP',
                                'ranges': [
                                    {
                                        'startOffset': 39651,
                                        'endOffset': 39759,
                                        'count': 1
                                    }
                                ],
                                'isBlockCoverage': false
                            },
                            {
                                'functionName': 'e',
                                'ranges': [
                                    {
                                        'startOffset': 39662,
                                        'endOffset': 39744,
                                        'count': 1
                                    }
                                ],
                                'isBlockCoverage': false
                            },
                            {
                                'functionName': '11',
                                'ranges': [
                                    {
                                        'startOffset': 40032,
                                        'endOffset': 40691,
                                        'count': 1
                                    }
                                ],
                                'isBlockCoverage': false
                            },
                            {
                                'functionName': 'n',
                                'ranges': [
                                    {
                                        'startOffset': 40048,
                                        'endOffset': 40138,
                                        'count': 0
                                    }
                                ],
                                'isBlockCoverage': false
                            },
                            {
                                'functionName': 'r',
                                'ranges': [
                                    {
                                        'startOffset': 40138,
                                        'endOffset': 40226,
                                        'count': 0
                                    }
                                ],
                                'isBlockCoverage': false
                            },
                            {
                                'functionName': 'a',
                                'ranges': [
                                    {
                                        'startOffset': 40226,
                                        'endOffset': 40355,
                                        'count': 0
                                    }
                                ],
                                'isBlockCoverage': false
                            },
                            {
                                'functionName': 's',
                                'ranges': [
                                    {
                                        'startOffset': 40355,
                                        'endOffset': 40487,
                                        'count': 0
                                    }
                                ],
                                'isBlockCoverage': false
                            },
                            {
                                'functionName': 'isLessThan',
                                'ranges': [
                                    {
                                        'startOffset': 40519,
                                        'endOffset': 40549,
                                        'count': 0
                                    }
                                ],
                                'isBlockCoverage': false
                            },
                            {
                                'functionName': 'areVersionsDifferent',
                                'ranges': [
                                    {
                                        'startOffset': 40571,
                                        'endOffset': 40603,
                                        'count': 0
                                    }
                                ],
                                'isBlockCoverage': false
                            },
                            {
                                'functionName': 'isGreaterThan',
                                'ranges': [
                                    {
                                        'startOffset': 40618,
                                        'endOffset': 40648,
                                        'count': 0
                                    }
                                ],
                                'isBlockCoverage': false
                            },
                            {
                                'functionName': 'isEqual',
                                'ranges': [
                                    {
                                        'startOffset': 40657,
                                        'endOffset': 40689,
                                        'count': 0
                                    }
                                ],
                                'isBlockCoverage': false
                            },
                            {
                                'functionName': '12',
                                'ranges': [
                                    {
                                        'startOffset': 40700,
                                        'endOffset': 40964,
                                        'count': 1
                                    }
                                ],
                                'isBlockCoverage': false
                            },
                            {
                                'functionName': 't.exports',
                                'ranges': [
                                    {
                                        'startOffset': 40726,
                                        'endOffset': 40963,
                                        'count': 0
                                    }
                                ],
                                'isBlockCoverage': false
                            },
                            {
                                'functionName': '13../utils',
                                'ranges': [
                                    {
                                        'startOffset': 40973,
                                        'endOffset': 41710,
                                        'count': 1
                                    }
                                ],
                                'isBlockCoverage': false
                            },
                            {
                                'functionName': 'n',
                                'ranges': [
                                    {
                                        'startOffset': 40989,
                                        'endOffset': 41679,
                                        'count': 0
                                    }
                                ],
                                'isBlockCoverage': false
                            },
                            {
                                'functionName': '14',
                                'ranges': [
                                    {
                                        'startOffset': 41731,
                                        'endOffset': 42234,
                                        'count': 1
                                    }
                                ],
                                'isBlockCoverage': false
                            },
                            {
                                'functionName': '',
                                'ranges': [
                                    {
                                        'startOffset': 41748,
                                        'endOffset': 42034,
                                        'count': 0
                                    }
                                ],
                                'isBlockCoverage': false
                            },
                            {
                                'functionName': '15',
                                'ranges': [
                                    {
                                        'startOffset': 42243,
                                        'endOffset': 43124,
                                        'count': 1
                                    }
                                ],
                                'isBlockCoverage': false
                            },
                            {
                                'functionName': '16',
                                'ranges': [
                                    {
                                        'startOffset': 43133,
                                        'endOffset': 44324,
                                        'count': 1
                                    }
                                ],
                                'isBlockCoverage': false
                            },
                            {
                                'functionName': '',
                                'ranges': [
                                    {
                                        'startOffset': 43150,
                                        'endOffset': 44124,
                                        'count': 0
                                    }
                                ],
                                'isBlockCoverage': false
                            },
                            {
                                'functionName': 't.exports',
                                'ranges': [
                                    {
                                        'startOffset': 43172,
                                        'endOffset': 44123,
                                        'count': 1
                                    }
                                ],
                                'isBlockCoverage': false
                            },
                            {
                                'functionName': '17',
                                'ranges': [
                                    {
                                        'startOffset': 44333,
                                        'endOffset': 44521,
                                        'count': 1
                                    }
                                ],
                                'isBlockCoverage': false
                            },
                            {
                                'functionName': 'Object.assign',
                                'ranges': [
                                    {
                                        'startOffset': 44378,
                                        'endOffset': 44520,
                                        'count': 0
                                    }
                                ],
                                'isBlockCoverage': false
                            },
                            {
                                'functionName': '18',
                                'ranges': [
                                    {
                                        'startOffset': 44530,
                                        'endOffset': 45042,
                                        'count': 1
                                    }
                                ],
                                'isBlockCoverage': false
                            },
                            {
                                'functionName': 'i.isObjectEmpty',
                                'ranges': [
                                    {
                                        'startOffset': 44562,
                                        'endOffset': 44622,
                                        'count': 0
                                    }
                                ],
                                'isBlockCoverage': false
                            },
                            {
                                'functionName': 'i.isValueEmpty',
                                'ranges': [
                                    {
                                        'startOffset': 44638,
                                        'endOffset': 44683,
                                        'count': 0
                                    }
                                ],
                                'isBlockCoverage': false
                            },
                            {
                                'functionName': 'i.getIeVersion',
                                'ranges': [
                                    {
                                        'startOffset': 44699,
                                        'endOffset': 44961,
                                        'count': 1
                                    }
                                ],
                                'isBlockCoverage': false
                            },
                            {
                                'functionName': 'i.encodeAndBuildRequest',
                                'ranges': [
                                    {
                                        'startOffset': 44986,
                                        'endOffset': 45041,
                                        'count': 1
                                    }
                                ],
                                'isBlockCoverage': false
                            },
                            {
                                'functionName': '19',
                                'ranges': [
                                    {
                                        'startOffset': 45051,
                                        'endOffset': 45547,
                                        'count': 1
                                    }
                                ],
                                'isBlockCoverage': false
                            },
                            {
                                'functionName': 't.exports',
                                'ranges': [
                                    {
                                        'startOffset': 45077,
                                        'endOffset': 45546,
                                        'count': 0
                                    }
                                ],
                                'isBlockCoverage': false
                            },
                            {
                                'functionName': 'AppMeasurement_Module_ActivityMap',
                                'ranges': [
                                    {
                                        'startOffset': 46008,
                                        'endOffset': 48701,
                                        'count': 1
                                    }
                                ],
                                'isBlockCoverage': false
                            },
                            {
                                'functionName': 'g',
                                'ranges': [
                                    {
                                        'startOffset': 46054,
                                        'endOffset': 46199,
                                        'count': 0
                                    }
                                ],
                                'isBlockCoverage': false
                            },
                            {
                                'functionName': 'q',
                                'ranges': [
                                    {
                                        'startOffset': 46199,
                                        'endOffset': 46786,
                                        'count': 0
                                    }
                                ],
                                'isBlockCoverage': false
                            },
                            {
                                'functionName': 'r',
                                'ranges': [
                                    {
                                        'startOffset': 46786,
                                        'endOffset': 46869,
                                        'count': 1
                                    }
                                ],
                                'isBlockCoverage': false
                            },
                            {
                                'functionName': 's',
                                'ranges': [
                                    {
                                        'startOffset': 46869,
                                        'endOffset': 47258,
                                        'count': 0
                                    }
                                ],
                                'isBlockCoverage': false
                            },
                            {
                                'functionName': 'k',
                                'ranges': [
                                    {
                                        'startOffset': 47258,
                                        'endOffset': 47584,
                                        'count': 0
                                    }
                                ],
                                'isBlockCoverage': false
                            },
                            {
                                'functionName': 'AppMeasurement_Module_ActivityMap.e._g',
                                'ranges': [
                                    {
                                        'startOffset': 47773,
                                        'endOffset': 48107,
                                        'count': 1
                                    }
                                ],
                                'isBlockCoverage': false
                            },
                            {
                                'functionName': 'AppMeasurement_Module_ActivityMap.e.link',
                                'ranges': [
                                    {
                                        'startOffset': 48115,
                                        'endOffset': 48557,
                                        'count': 1
                                    }
                                ],
                                'isBlockCoverage': false
                            },
                            {
                                'functionName': 'AppMeasurement_Module_ActivityMap.e.region',
                                'ranges': [
                                    {
                                        'startOffset': 48567,
                                        'endOffset': 48700,
                                        'count': 0
                                    }
                                ],
                                'isBlockCoverage': false
                            },
                            {
                                'functionName': 'AppMeasurement',
                                'ranges': [
                                    {
                                        'startOffset': 48701,
                                        'endOffset': 80352,
                                        'count': 1
                                    }
                                ],
                                'isBlockCoverage': false
                            },
                            {
                                'functionName': 'AppMeasurement.a.F',
                                'ranges': [
                                    {
                                        'startOffset': 49089,
                                        'endOffset': 49131,
                                        'count': 0
                                    }
                                ],
                                'isBlockCoverage': false
                            },
                            {
                                'functionName': 'AppMeasurement.a.Oa',
                                'ranges': [
                                    {
                                        'startOffset': 49137,
                                        'endOffset': 49176,
                                        'count': 1
                                    }
                                ],
                                'isBlockCoverage': false
                            },
                            {
                                'functionName': 'AppMeasurement.a.replace',
                                'ranges': [
                                    {
                                        'startOffset': 49187,
                                        'endOffset': 49249,
                                        'count': 1
                                    }
                                ],
                                'isBlockCoverage': false
                            },
                            {
                                'functionName': 'AppMeasurement.a.escape',
                                'ranges': [
                                    {
                                        'startOffset': 49259,
                                        'endOffset': 49455,
                                        'count': 1
                                    }
                                ],
                                'isBlockCoverage': false
                            },
                            {
                                'functionName': 'AppMeasurement.a.unescape',
                                'ranges': [
                                    {
                                        'startOffset': 49467,
                                        'endOffset': 49599,
                                        'count': 1
                                    }
                                ],
                                'isBlockCoverage': false
                            },
                            {
                                'functionName': 'AppMeasurement.a.Fb',
                                'ranges': [
                                    {
                                        'startOffset': 49605,
                                        'endOffset': 49874,
                                        'count': 1
                                    }
                                ],
                                'isBlockCoverage': false
                            },
                            {
                                'functionName': 'AppMeasurement.a.c_r.a.cookieRead',
                                'ranges': [
                                    {
                                        'startOffset': 49894,
                                        'endOffset': 50073,
                                        'count': 1
                                    }
                                ],
                                'isBlockCoverage': false
                            },
                            {
                                'functionName': 'AppMeasurement.a.c_w.a.cookieWrite',
                                'ranges': [
                                    {
                                        'startOffset': 50094,
                                        'endOffset': 50530,
                                        'count': 1
                                    }
                                ],
                                'isBlockCoverage': false
                            },
                            {
                                'functionName': 'AppMeasurement.a.Cb',
                                'ranges': [
                                    {
                                        'startOffset': 50536,
                                        'endOffset': 50649,
                                        'count': 1
                                    }
                                ],
                                'isBlockCoverage': false
                            },
                            {
                                'functionName': '',
                                'ranges': [
                                    {
                                        'startOffset': 50634,
                                        'endOffset': 50646,
                                        'count': 0
                                    }
                                ],
                                'isBlockCoverage': false
                            },
                            {
                                'functionName': 'AppMeasurement.a.rb',
                                'ranges': [
                                    {
                                        'startOffset': 50655,
                                        'endOffset': 50740,
                                        'count': 0
                                    }
                                ],
                                'isBlockCoverage': false
                            },
                            {
                                'functionName': 'AppMeasurement.a.ja',
                                'ranges': [
                                    {
                                        'startOffset': 50753,
                                        'endOffset': 51270,
                                        'count': 1
                                    }
                                ],
                                'isBlockCoverage': false
                            },
                            {
                                'functionName': '',
                                'ranges': [
                                    {
                                        'startOffset': 51047,
                                        'endOffset': 51155,
                                        'count': 0
                                    }
                                ],
                                'isBlockCoverage': false
                            },
                            {
                                'functionName': 'AppMeasurement.a.delayReady',
                                'ranges': [
                                    {
                                        'startOffset': 51284,
                                        'endOffset': 51505,
                                        'count': 0
                                    }
                                ],
                                'isBlockCoverage': false
                            },
                            {
                                'functionName': 'AppMeasurement.a.setAccount.a.sa',
                                'ranges': [
                                    {
                                        'startOffset': 51524,
                                        'endOffset': 51769,
                                        'count': 1
                                    }
                                ],
                                'isBlockCoverage': false
                            },
                            {
                                'functionName': 'AppMeasurement.a.foreachVar',
                                'ranges': [
                                    {
                                        'startOffset': 51783,
                                        'endOffset': 52244,
                                        'count': 0
                                    }
                                ],
                                'isBlockCoverage': false
                            },
                            {
                                'functionName': 'AppMeasurement.a.r',
                                'ranges': [
                                    {
                                        'startOffset': 52249,
                                        'endOffset': 53115,
                                        'count': 1
                                    }
                                ],
                                'isBlockCoverage': false
                            },
                            {
                                'functionName': 'AppMeasurement.a.Ib',
                                'ranges': [
                                    {
                                        'startOffset': 53138,
                                        'endOffset': 56441,
                                        'count': 1
                                    }
                                ],
                                'isBlockCoverage': false
                            },
                            {
                                'functionName': 'AppMeasurement.a.D',
                                'ranges': [
                                    {
                                        'startOffset': 56446,
                                        'endOffset': 56730,
                                        'count': 0
                                    }
                                ],
                                'isBlockCoverage': false
                            },
                            {
                                'functionName': 'AppMeasurement.a.Ka',
                                'ranges': [
                                    {
                                        'startOffset': 56736,
                                        'endOffset': 57098,
                                        'count': 0
                                    }
                                ],
                                'isBlockCoverage': false
                            },
                            {
                                'functionName': 'AppMeasurement.a.M',
                                'ranges': [
                                    {
                                        'startOffset': 57103,
                                        'endOffset': 57526,
                                        'count': 0
                                    }
                                ],
                                'isBlockCoverage': false
                            },
                            {
                                'functionName': 'AppMeasurement.a.Yb',
                                'ranges': [
                                    {
                                        'startOffset': 57532,
                                        'endOffset': 57775,
                                        'count': 0
                                    }
                                ],
                                'isBlockCoverage': false
                            },
                            {
                                'functionName': 'AppMeasurement.a.Pb',
                                'ranges': [
                                    {
                                        'startOffset': 57781,
                                        'endOffset': 59264,
                                        'count': 1
                                    }
                                ],
                                'isBlockCoverage': false
                            },
                            {
                                'functionName': 'AppMeasurement.a.Jb',
                                'ranges': [
                                    {
                                        'startOffset': 59270,
                                        'endOffset': 60401,
                                        'count': 1
                                    }
                                ],
                                'isBlockCoverage': false
                            },
                            {
                                'functionName': 'AppMeasurement.a.Kb',
                                'ranges': [
                                    {
                                        'startOffset': 60407,
                                        'endOffset': 61328,
                                        'count': 1
                                    }
                                ],
                                'isBlockCoverage': false
                            },
                            {
                                'functionName': 'AppMeasurement.a.loadModule',
                                'ranges': [
                                    {
                                        'startOffset': 61349,
                                        'endOffset': 61741,
                                        'count': 1
                                    }
                                ],
                                'isBlockCoverage': false
                            },
                            {
                                'functionName': 'd.kb',
                                'ranges': [
                                    {
                                        'startOffset': 61474,
                                        'endOffset': 61497,
                                        'count': 0
                                    }
                                ],
                                'isBlockCoverage': false
                            },
                            {
                                'functionName': 'd.sb',
                                'ranges': [
                                    {
                                        'startOffset': 61503,
                                        'endOffset': 61576,
                                        'count': 0
                                    }
                                ],
                                'isBlockCoverage': false
                            },
                            {
                                'functionName': 'AppMeasurement.a.p',
                                'ranges': [
                                    {
                                        'startOffset': 61746,
                                        'endOffset': 61892,
                                        'count': 1
                                    }
                                ],
                                'isBlockCoverage': false
                            },
                            {
                                'functionName': 'AppMeasurement.a.Mb',
                                'ranges': [
                                    {
                                        'startOffset': 61898,
                                        'endOffset': 62187,
                                        'count': 1
                                    }
                                ],
                                'isBlockCoverage': false
                            },
                            {
                                'functionName': 'AppMeasurement.a.R',
                                'ranges': [
                                    {
                                        'startOffset': 62192,
                                        'endOffset': 62405,
                                        'count': 1
                                    }
                                ],
                                'isBlockCoverage': false
                            },
                            {
                                'functionName': 'AppMeasurement.a.Ya',
                                'ranges': [
                                    {
                                        'startOffset': 62411,
                                        'endOffset': 62530,
                                        'count': 1
                                    }
                                ],
                                'isBlockCoverage': false
                            },
                            {
                                'functionName': 'AppMeasurement.a.Eb',
                                'ranges': [
                                    {
                                        'startOffset': 62536,
                                        'endOffset': 63205,
                                        'count': 1
                                    }
                                ],
                                'isBlockCoverage': false
                            },
                            {
                                'functionName': 'AppMeasurement.a.eb',
                                'ranges': [
                                    {
                                        'startOffset': 63211,
                                        'endOffset': 63514,
                                        'count': 1
                                    }
                                ],
                                'isBlockCoverage': false
                            },
                            {
                                'functionName': '',
                                'ranges': [
                                    {
                                        'startOffset': 63406,
                                        'endOffset': 63494,
                                        'count': 0
                                    }
                                ],
                                'isBlockCoverage': false
                            },
                            {
                                'functionName': 'AppMeasurement.a.ub',
                                'ranges': [
                                    {
                                        'startOffset': 63535,
                                        'endOffset': 63559,
                                        'count': 0
                                    }
                                ],
                                'isBlockCoverage': false
                            },
                            {
                                'functionName': 'AppMeasurement.a.pb',
                                'ranges': [
                                    {
                                        'startOffset': 63580,
                                        'endOffset': 63633,
                                        'count': 1
                                    }
                                ],
                                'isBlockCoverage': false
                            },
                            {
                                'functionName': 'AppMeasurement.a.vb',
                                'ranges': [
                                    {
                                        'startOffset': 63654,
                                        'endOffset': 63699,
                                        'count': 1
                                    }
                                ],
                                'isBlockCoverage': false
                            },
                            {
                                'functionName': 'AppMeasurement.a.$a',
                                'ranges': [
                                    {
                                        'startOffset': 63720,
                                        'endOffset': 63768,
                                        'count': 1
                                    }
                                ],
                                'isBlockCoverage': false
                            },
                            {
                                'functionName': 'AppMeasurement.a.bb',
                                'ranges': [
                                    {
                                        'startOffset': 63789,
                                        'endOffset': 63846,
                                        'count': 1
                                    }
                                ],
                                'isBlockCoverage': false
                            },
                            {
                                'functionName': 'AppMeasurement.a.ab',
                                'ranges': [
                                    {
                                        'startOffset': 63867,
                                        'endOffset': 63916,
                                        'count': 1
                                    }
                                ],
                                'isBlockCoverage': false
                            },
                            {
                                'functionName': 'AppMeasurement.a.cb',
                                'ranges': [
                                    {
                                        'startOffset': 63922,
                                        'endOffset': 64030,
                                        'count': 1
                                    }
                                ],
                                'isBlockCoverage': false
                            },
                            {
                                'functionName': '',
                                'ranges': [
                                    {
                                        'startOffset': 63995,
                                        'endOffset': 64010,
                                        'count': 0
                                    }
                                ],
                                'isBlockCoverage': false
                            },
                            {
                                'functionName': 'AppMeasurement.a.za',
                                'ranges': [
                                    {
                                        'startOffset': 64051,
                                        'endOffset': 64075,
                                        'count': 0
                                    }
                                ],
                                'isBlockCoverage': false
                            },
                            {
                                'functionName': 'AppMeasurement.a.isReadyToTrack',
                                'ranges': [
                                    {
                                        'startOffset': 64093,
                                        'endOffset': 65271,
                                        'count': 1
                                    }
                                ],
                                'isBlockCoverage': false
                            },
                            {
                                'functionName': 'AppMeasurement.a.callbackWhenReadyToTrack',
                                'ranges': [
                                    {
                                        'startOffset': 65311,
                                        'endOffset': 65423,
                                        'count': 1
                                    }
                                ],
                                'isBlockCoverage': false
                            },
                            {
                                'functionName': 'AppMeasurement.a.j',
                                'ranges': [
                                    {
                                        'startOffset': 65428,
                                        'endOffset': 65539,
                                        'count': 1
                                    }
                                ],
                                'isBlockCoverage': false
                            },
                            {
                                'functionName': 'AppMeasurement.a.tb',
                                'ranges': [
                                    {
                                        'startOffset': 65545,
                                        'endOffset': 65588,
                                        'count': 1
                                    }
                                ],
                                'isBlockCoverage': false
                            },
                            {
                                'functionName': 'AppMeasurement.a.mb',
                                'ranges': [
                                    {
                                        'startOffset': 65594,
                                        'endOffset': 65779,
                                        'count': 1
                                    }
                                ],
                                'isBlockCoverage': false
                            },
                            {
                                'functionName': 'AppMeasurement.a.Gb',
                                'ranges': [
                                    {
                                        'startOffset': 65785,
                                        'endOffset': 66088,
                                        'count': 0
                                    }
                                ],
                                'isBlockCoverage': false
                            },
                            {
                                'functionName': 'AppMeasurement.a.t.a.track',
                                'ranges': [
                                    {
                                        'startOffset': 66101,
                                        'endOffset': 67418,
                                        'count': 1
                                    }
                                ],
                                'isBlockCoverage': false
                            },
                            {
                                'functionName': 'AppMeasurement.a.registerPreTrackCallback',
                                'ranges': [
                                    {
                                        'startOffset': 67454,
                                        'endOffset': 67649,
                                        'count': 0
                                    }
                                ],
                                'isBlockCoverage': false
                            },
                            {
                                'functionName': 'AppMeasurement.a.hb',
                                'ranges': [
                                    {
                                        'startOffset': 67655,
                                        'endOffset': 67680,
                                        'count': 1
                                    }
                                ],
                                'isBlockCoverage': false
                            },
                            {
                                'functionName': 'AppMeasurement.a.registerPostTrackCallback',
                                'ranges': [
                                    {
                                        'startOffset': 67717,
                                        'endOffset': 67913,
                                        'count': 0
                                    }
                                ],
                                'isBlockCoverage': false
                            },
                            {
                                'functionName': 'AppMeasurement.a.gb',
                                'ranges': [
                                    {
                                        'startOffset': 67919,
                                        'endOffset': 67944,
                                        'count': 1
                                    }
                                ],
                                'isBlockCoverage': false
                            },
                            {
                                'functionName': 'AppMeasurement.a.xa',
                                'ranges': [
                                    {
                                        'startOffset': 67950,
                                        'endOffset': 68138,
                                        'count': 1
                                    }
                                ],
                                'isBlockCoverage': false
                            },
                            {
                                'functionName': 'AppMeasurement.a.tl.a.trackLink',
                                'ranges': [
                                    {
                                        'startOffset': 68156,
                                        'endOffset': 68252,
                                        'count': 0
                                    }
                                ],
                                'isBlockCoverage': false
                            },
                            {
                                'functionName': 'AppMeasurement.a.trackLight',
                                'ranges': [
                                    {
                                        'startOffset': 68266,
                                        'endOffset': 68367,
                                        'count': 0
                                    }
                                ],
                                'isBlockCoverage': false
                            },
                            {
                                'functionName': 'AppMeasurement.a.clearVars',
                                'ranges': [
                                    {
                                        'startOffset': 68380,
                                        'endOffset': 68701,
                                        'count': 1
                                    }
                                ],
                                'isBlockCoverage': false
                            },
                            {
                                'functionName': 'AppMeasurement.a.ob',
                                'ranges': [
                                    {
                                        'startOffset': 68731,
                                        'endOffset': 68877,
                                        'count': 1
                                    }
                                ],
                                'isBlockCoverage': false
                            },
                            {
                                'functionName': 'AppMeasurement.a.ib',
                                'ranges': [
                                    {
                                        'startOffset': 68883,
                                        'endOffset': 69085,
                                        'count': 1
                                    }
                                ],
                                'isBlockCoverage': false
                            },
                            {
                                'functionName': 'AppMeasurement.a.ya',
                                'ranges': [
                                    {
                                        'startOffset': 69091,
                                        'endOffset': 69181,
                                        'count': 1
                                    }
                                ],
                                'isBlockCoverage': false
                            },
                            {
                                'functionName': 'AppMeasurement.a.jb',
                                'ranges': [
                                    {
                                        'startOffset': 69187,
                                        'endOffset': 69390,
                                        'count': 1
                                    }
                                ],
                                'isBlockCoverage': false
                            },
                            {
                                'functionName': 'AppMeasurement.a.lb',
                                'ranges': [
                                    {
                                        'startOffset': 69396,
                                        'endOffset': 69502,
                                        'count': 1
                                    }
                                ],
                                'isBlockCoverage': false
                            },
                            {
                                'functionName': 'AppMeasurement.a.Db',
                                'ranges': [
                                    {
                                        'startOffset': 69560,
                                        'endOffset': 69921,
                                        'count': 0
                                    }
                                ],
                                'isBlockCoverage': false
                            },
                            {
                                'functionName': 'AppMeasurement.a.Hb',
                                'ranges': [
                                    {
                                        'startOffset': 69927,
                                        'endOffset': 70242,
                                        'count': 0
                                    }
                                ],
                                'isBlockCoverage': false
                            },
                            {
                                'functionName': 'AppMeasurement.a.k',
                                'ranges': [
                                    {
                                        'startOffset': 70247,
                                        'endOffset': 70300,
                                        'count': 0
                                    }
                                ],
                                'isBlockCoverage': false
                            },
                            {
                                'functionName': 'AppMeasurement.a.doPostbacks',
                                'ranges': [
                                    {
                                        'startOffset': 70323,
                                        'endOffset': 70825,
                                        'count': 0
                                    }
                                ],
                                'isBlockCoverage': false
                            },
                            {
                                'functionName': 'AppMeasurement.a.fb',
                                'ranges': [
                                    {
                                        'startOffset': 70831,
                                        'endOffset': 70885,
                                        'count': 1
                                    }
                                ],
                                'isBlockCoverage': false
                            },
                            {
                                'functionName': 'AppMeasurement.a.Lb',
                                'ranges': [
                                    {
                                        'startOffset': 70891,
                                        'endOffset': 70927,
                                        'count': 1
                                    }
                                ],
                                'isBlockCoverage': false
                            },
                            {
                                'functionName': 'AppMeasurement.a.Nb',
                                'ranges': [
                                    {
                                        'startOffset': 70933,
                                        'endOffset': 71043,
                                        'count': 1
                                    }
                                ],
                                'isBlockCoverage': false
                            },
                            {
                                'functionName': 'AppMeasurement.a.ta',
                                'ranges': [
                                    {
                                        'startOffset': 71049,
                                        'endOffset': 71144,
                                        'count': 1
                                    }
                                ],
                                'isBlockCoverage': false
                            },
                            {
                                'functionName': 'AppMeasurement.a.La',
                                'ranges': [
                                    {
                                        'startOffset': 71150,
                                        'endOffset': 71207,
                                        'count': 0
                                    }
                                ],
                                'isBlockCoverage': false
                            },
                            {
                                'functionName': 'AppMeasurement.a.X',
                                'ranges': [
                                    {
                                        'startOffset': 71212,
                                        'endOffset': 71397,
                                        'count': 1
                                    }
                                ],
                                'isBlockCoverage': false
                            },
                            {
                                'functionName': 'AppMeasurement.a.va',
                                'ranges': [
                                    {
                                        'startOffset': 71403,
                                        'endOffset': 71455,
                                        'count': 0
                                    }
                                ],
                                'isBlockCoverage': false
                            },
                            {
                                'functionName': 'AppMeasurement.a.xb',
                                'ranges': [
                                    {
                                        'startOffset': 71461,
                                        'endOffset': 71605,
                                        'count': 1
                                    }
                                ],
                                'isBlockCoverage': false
                            },
                            {
                                'functionName': 'AppMeasurement.a.Ia',
                                'ranges': [
                                    {
                                        'startOffset': 71611,
                                        'endOffset': 71657,
                                        'count': 1
                                    }
                                ],
                                'isBlockCoverage': false
                            },
                            {
                                'functionName': 'AppMeasurement.a.Ob',
                                'ranges': [
                                    {
                                        'startOffset': 71663,
                                        'endOffset': 71807,
                                        'count': 1
                                    }
                                ],
                                'isBlockCoverage': false
                            },
                            {
                                'functionName': 'AppMeasurement.a.nb',
                                'ranges': [
                                    {
                                        'startOffset': 71813,
                                        'endOffset': 71879,
                                        'count': 1
                                    }
                                ],
                                'isBlockCoverage': false
                            },
                            {
                                'functionName': 'AppMeasurement.t.x.a.Y',
                                'ranges': [
                                    {
                                        'startOffset': 71963,
                                        'endOffset': 71996,
                                        'count': 0
                                    }
                                ],
                                'isBlockCoverage': false
                            },
                            {
                                'functionName': 'AppMeasurement.t.x.k.$.k.$.parseJSON.a.Y',
                                'ranges': [
                                    {
                                        'startOffset': 72022,
                                        'endOffset': 72058,
                                        'count': 0
                                    }
                                ],
                                'isBlockCoverage': false
                            },
                            {
                                'functionName': 'AppMeasurement.t.x.k.$.k.$.parseJSON.a.Y',
                                'ranges': [
                                    {
                                        'startOffset': 72071,
                                        'endOffset': 72094,
                                        'count': 0
                                    }
                                ],
                                'isBlockCoverage': false
                            },
                            {
                                'functionName': 'AppMeasurement.a.Rb',
                                'ranges': [
                                    {
                                        'startOffset': 72100,
                                        'endOffset': 73908,
                                        'count': 1
                                    }
                                ],
                                'isBlockCoverage': false
                            },
                            {
                                'functionName': 'b.abort.k.InstallTrigger.b.abort',
                                'ranges': [
                                    {
                                        'startOffset': 72788,
                                        'endOffset': 72807,
                                        'count': 0
                                    }
                                ],
                                'isBlockCoverage': false
                            },
                            {
                                'functionName': 'b.Fa',
                                'ranges': [
                                    {
                                        'startOffset': 72831,
                                        'endOffset': 72888,
                                        'count': 1
                                    }
                                ],
                                'isBlockCoverage': false
                            },
                            {
                                'functionName': 'b.onload.b.wa',
                                'ranges': [
                                    {
                                        'startOffset': 72903,
                                        'endOffset': 73052,
                                        'count': 1
                                    }
                                ],
                                'isBlockCoverage': false
                            },
                            {
                                'functionName': 'b.onabort.b.onerror.b.Ja',
                                'ranges': [
                                    {
                                        'startOffset': 73078,
                                        'endOffset': 73186,
                                        'count': 0
                                    }
                                ],
                                'isBlockCoverage': false
                            },
                            {
                                'functionName': 'b.onreadystatechange',
                                'ranges': [
                                    {
                                        'startOffset': 73208,
                                        'endOffset': 73266,
                                        'count': 0
                                    }
                                ],
                                'isBlockCoverage': false
                            },
                            {
                                'functionName': '',
                                'ranges': [
                                    {
                                        'startOffset': 73620,
                                        'endOffset': 73700,
                                        'count': 0
                                    }
                                ],
                                'isBlockCoverage': false
                            },
                            {
                                'functionName': 'AppMeasurement.a.Bb',
                                'ranges': [
                                    {
                                        'startOffset': 73914,
                                        'endOffset': 74008,
                                        'count': 1
                                    }
                                ],
                                'isBlockCoverage': false
                            },
                            {
                                'functionName': 'AppMeasurement.a.Ta',
                                'ranges': [
                                    {
                                        'startOffset': 74014,
                                        'endOffset': 74121,
                                        'count': 0
                                    }
                                ],
                                'isBlockCoverage': false
                            },
                            {
                                'functionName': 'AppMeasurement.a.Va',
                                'ranges': [
                                    {
                                        'startOffset': 74127,
                                        'endOffset': 74253,
                                        'count': 1
                                    }
                                ],
                                'isBlockCoverage': false
                            },
                            {
                                'functionName': 'AppMeasurement.a.forceOffline',
                                'ranges': [
                                    {
                                        'startOffset': 74269,
                                        'endOffset': 74288,
                                        'count': 0
                                    }
                                ],
                                'isBlockCoverage': false
                            },
                            {
                                'functionName': 'AppMeasurement.a.forceOnline',
                                'ranges': [
                                    {
                                        'startOffset': 74303,
                                        'endOffset': 74322,
                                        'count': 0
                                    }
                                ],
                                'isBlockCoverage': false
                            },
                            {
                                'functionName': 'AppMeasurement.a.qa',
                                'ranges': [
                                    {
                                        'startOffset': 74328,
                                        'endOffset': 74397,
                                        'count': 0
                                    }
                                ],
                                'isBlockCoverage': false
                            },
                            {
                                'functionName': 'AppMeasurement.a.C',
                                'ranges': [
                                    {
                                        'startOffset': 74402,
                                        'endOffset': 74440,
                                        'count': 1
                                    }
                                ],
                                'isBlockCoverage': false
                            },
                            {
                                'functionName': 'AppMeasurement.a.Na',
                                'ranges': [
                                    {
                                        'startOffset': 74446,
                                        'endOffset': 74584,
                                        'count': 0
                                    }
                                ],
                                'isBlockCoverage': false
                            },
                            {
                                'functionName': 'AppMeasurement.a.setTagContainer',
                                'ranges': [
                                    {
                                        'startOffset': 74603,
                                        'endOffset': 75141,
                                        'count': 0
                                    }
                                ],
                                'isBlockCoverage': false
                            },
                            {
                                'functionName': 'getQueryParam',
                                'ranges': [
                                    {
                                        'startOffset': 75254,
                                        'endOffset': 75668,
                                        'count': 1
                                    }
                                ],
                                'isBlockCoverage': false
                            },
                            {
                                'functionName': 'getIeVersion',
                                'ranges': [
                                    {
                                        'startOffset': 75682,
                                        'endOffset': 75930,
                                        'count': 1
                                    }
                                ],
                                'isBlockCoverage': false
                            },
                            {
                                'functionName': 'AppMeasurement.a.ha',
                                'ranges': [
                                    {
                                        'startOffset': 78338,
                                        'endOffset': 78507,
                                        'count': 1
                                    }
                                ],
                                'isBlockCoverage': false
                            },
                            {
                                'functionName': 'AppMeasurement.a.Ua',
                                'ranges': [
                                    {
                                        'startOffset': 78513,
                                        'endOffset': 80212,
                                        'count': 1
                                    }
                                ],
                                'isBlockCoverage': false
                            },
                            {
                                'functionName': 'a.b.a.v',
                                'ranges': [
                                    {
                                        'startOffset': 78546,
                                        'endOffset': 79869,
                                        'count': 0
                                    }
                                ],
                                'isBlockCoverage': false
                            },
                            {
                                'functionName': 's_gi',
                                'ranges': [
                                    {
                                        'startOffset': 80352,
                                        'endOffset': 80730,
                                        'count': 1
                                    }
                                ],
                                'isBlockCoverage': false
                            },
                            {
                                'functionName': 's_pgicq',
                                'ranges': [
                                    {
                                        'startOffset': 80803,
                                        'endOffset': 80967,
                                        'count': 1
                                    }
                                ],
                                'isBlockCoverage': false
                            }
                        ]
                    }


                ]
            }
        };

        processScriptCoverage(data, {});
        expect(data.scripts['c'].coverage.usage).toEqual(0.9819457136506211);
        expect(data.scripts['c'].coverage.usedBytes).toEqual(79516);
        expect(data.scripts['c'].coverage.unusedFunctions).toEqual([
            'AppMeasurement.a.D',
            'AppMeasurement.a.Db',
            'AppMeasurement.a.F',
            'AppMeasurement.a.Gb',
            'AppMeasurement.a.Hb',
            'AppMeasurement.a.Ka',
            'AppMeasurement.a.La',
            'AppMeasurement.a.M',
            'AppMeasurement.a.Na',
            'AppMeasurement.a.Ta',
            'AppMeasurement.a.Yb',
            'AppMeasurement.a.delayReady',
            'AppMeasurement.a.doPostbacks',
            'AppMeasurement.a.forceOffline',
            'AppMeasurement.a.forceOnline',
            'AppMeasurement.a.foreachVar',
            'AppMeasurement.a.k',
            'AppMeasurement.a.qa',
            'AppMeasurement.a.rb',
            'AppMeasurement.a.registerPostTrackCallback',
            'AppMeasurement.a.registerPreTrackCallback',
            'AppMeasurement.a.setTagContainer',
            'AppMeasurement.a.tl.a.trackLink',
            'AppMeasurement.a.trackLight',
            'AppMeasurement.a.ub',
            'AppMeasurement.a.va',
            'AppMeasurement.a.za',
            'AppMeasurement.t.x.a.Y',
            'AppMeasurement.t.x.k.$.k.$.parseJSON.a.Y',
            'AppMeasurement_Module_ActivityMap.e.region',
            'C',
            'D',
            'I',
            'Object.assign',
            'S.AAMIDCallTimedOut',
            'S.AnalyticsIDCallTimedOut',
            'S.MCIDCallTimedOut',
            'S._generateLocalMID',
            'S._getFieldList',
            'S._getFieldMap',
            'S._mapCustomerIDs',
            'S._mergeServerState',
            'S._resetAmcvCookie',
            'S._setAnalyticsFields',
            'S._setAudienceManagerFields',
            'S._setFieldList',
            'S._setFieldMap',
            'S.appendSupplementalDataIDTo',
            'S.appendVisitorIDsTo',
            'S.getVisitorValues',
            'S.idSyncByDataSource',
            'S.idSyncByURL',
            'S.idSyncGetOnPageSyncInfo',
            'S.isClientSideMarketingCloudVisitorID',
            'S.resetState',
            'S.setAnalyticsVisitorID',
            'S.setAsCoopSafe',
            'S.setAsCoopUnsafe',
            'S.setCustomerIDs',
            'S.setMarketingCloudVisitorID',
            '[[anonymous]]',
            'a',
            'a.b.a.v',
            'addMessage',
            'areVersionsDifferent',
            'b.abort.k.InstallTrigger.b.abort',
            'b.onabort.b.onerror.b.Ja',
            'b.onreadystatechange',
            'canMakeSyncIDCall',
            'd.kb',
            'd.sb',
            'g',
            'generateRandomString',
            'getTimestampInSeconds',
            'h',
            'handleCORSError',
            'i',
            'i.isObjectEmpty',
            'i.isValueEmpty',
            'isEqual',
            'isGreaterThan',
            'isLessThan',
            'isObject',
            'k',
            'n',
            'o.onerror',
            'o.ontimeout',
            'parseBoolean',
            'parsePipeDelimetedKeyValues',
            'pluck',
            'postMessage',
            'pruneSyncData',
            'q',
            'r',
            'replaceMethodsWithFunction',
            's',
            'sendMessages',
            't.exports'
        ]);
    });
});





