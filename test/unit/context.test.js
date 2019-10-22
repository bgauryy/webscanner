const context = require('../../src/context.js');

describe('context testing', function () {
    test('should return valid context object', () => {
        expect(() => {
            context.getContext();
        }).toThrowError('page is missing');

        expect(context.getContext({}, {})).toEqual({
            callback: null,
            collect: {
                bodyResponse: [],
                console: false,
                cookies: false,
                dataURI: false,
                errors: false,
                frames: false,
                logs: false,
                metrics: false,
                requests: false,
                responses: false,
                scriptCoverage: false,
                scriptDOMEvents: false,
                scriptSource: false,
                scripts: false,
                serviceWorker: false,
                storage: false,
                styleCoverage: false,
                styleSource: true,
                styles: false,
                websocket: false,
            },
            log: false,
            page: {},
            rules: {
                adBlocking: false,
                blockedUrls: [],
                disableCSP: false,
                disableServices: false,
            },
            stealth: false,
        });
    });
});