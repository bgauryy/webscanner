const {processData, processScriptCoverage} = require('../../src/dataProcessor');

describe('dataProcessor testing', function () {

    test('should check null cases', () => {
        expect(processData()).toEqual(undefined);
        expect(processData({})).toEqual(undefined);
        expect(processData({}, {})).toEqual({});
    });

    test('should parse resource without ip', () => {
        const data = {
            scripts: {
                'a': {length: 150},
                'b': {length: 1000}
            },
            coverage: {
                JSCoverage: [
                    {
                        scriptId: 'a',
                        functions: [
                            {
                                ranges: [{startOffset: 20, endOffset: 60}],
                                functionName: 'funcA'
                            },
                            {
                                ranges: [{startOffset: 40, endOffset: 150}],
                                functionName: 'funcB'
                            },
                            {
                                ranges: [{startOffset: 90, endOffset: 100}],
                                functionName: 'funcC'
                            },
                            {
                                ranges: [{startOffset: 0, endOffset: 150}],
                                functionName: 'funcD'
                            },
                        ]
                    },
                    {
                        scriptId: 'b',
                        functions: [
                            {
                                ranges: [{startOffset: 0, endOffset: 100}],
                                functionName: 'funcA'
                            },
                            {
                                ranges: [{startOffset: 100, endOffset: 300}],
                                functionName: 'funcB'
                            },
                            {
                                ranges: [{startOffset: 75, endOffset: 270}],
                                functionName: 'funcC'
                            },
                            {
                                ranges: [{startOffset: 80, endOffset: 260}],
                                functionName: 'funcD'
                            },
                            {
                                ranges: [{startOffset: 60, endOffset: 271}],
                                functionName: 'funcE'
                            },
                            {
                                ranges: [{startOffset: 60, endOffset: 271}],
                                functionName: 'funcF'
                            },
                        ]
                    }
                ]
            }
        };

        processScriptCoverage(data, {});
        expect(data.scripts['a']).toEqual({
            'coverage': {
                'functionsNames': ['funcA', 'funcB', 'funcC', 'funcD'],
                'usage': 1,
                'usedBytes': 150
            },
            'length': 150
        });

        expect(data.scripts['b']).toEqual({
            'coverage': {
                'functionsNames': ['funcA', 'funcB', 'funcC', 'funcD', 'funcE', 'funcF'],
                'usage': 0.3,
                'usedBytes': 300
            },
            'length': 1000
        });
    });
});



