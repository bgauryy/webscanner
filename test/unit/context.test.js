const context = require('../../src/context.js');

describe('context testing', function () {
    test('should return valid context object', () => {
        expect(() => {
            context.getContext();
        }).toThrowError('page is missing');

        expect(context.getContext({}, {})).toEqual({
            callback: null,
            chrome: {
                chromeFlags: [
                    '--headless',
                    '--disable-gpu',
                    '--enable-precise-memory-info'
                ],
                port: 9222
            },
            collect: {
                content: false,
                cookies: false,
                coverage: false,
                frames: false,
                metrics: false,
                requests: false,
                research: false,
                resources: false,
                responses: false,
                scripts: false,
                serviceWorker: false,
                styles: false,
                domEvents: false,
            },
            log: false,
            rules: {
                blockedUrls: [],
                scanTime: 5000,
                stopOnContentLoaded: true,
                disableCSP: false,
                adBlocking: false,
            },
            stealth: false,
            page: {}
        });
    });
});
