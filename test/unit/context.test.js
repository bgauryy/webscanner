const context = require('../../src/context.js');

describe('context testing', function () {
    test('should return valid context object', () => {
        expect(() => {
            context.createContext();
        }).toThrowError('Page object is missing');

        expect(context.createContext({})).toEqual({
            collect: {
                css: {
                    content: false,
                    coverage: false
                },
                dom: {
                    events: false,
                    snapshots: false
                },
                frames: {
                    resources: false
                },
                monitor: {
                    console: false,
                    errors: false,
                    logs: false,
                    logsThreshold: 50
                },
                network: {
                    content: false,
                    cookies: false,
                    requests: true,
                    websocket: false
                },
                performance: {
                    metrics: false
                },
                script: {
                    content: false,
                    coverage: false
                },
                storage: {
                    indexedDB: false,
                    webStorage: false
                },
                workers: {
                    content: false,
                    serviceWorkers: false,
                    workers: false,
                    worklets: false
                }
            },
            page: {},
            rules: {
                adBlocking: false,
                blockedUrls: [],
                disableCSP: false,
                disableServices: false,
                log: false,
                stealth: true
            }
        });
    });
});
