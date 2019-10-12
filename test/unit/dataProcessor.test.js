const {processData} = require('../../src/dataProcessor');

describe('dataProcessor testing', function () {
    test('should check script parse', (done) => {
        (async function () {
            const data = await processData({
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
            });
            expect(data).toEqual({
                frames: [],
                metrics: {},
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
            });
            done();
        })();

    });
});



