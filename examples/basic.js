const Scanner = require('../src/index');

Scanner.test({
    url: 'http://example.com',
    log: true,
    callback: (data) => {
        console.log('data', data);
    },
    rules: {
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/79.0.3933.0 Safari/537.36',
        stopOnContentLoaded: true,
        scanTime: 5
    },
    collect: {
        research: true,
        content: false,
        scripts: false,
        resources: false,
        styles: false,
        metrics: false,
        frames: true,
        coverage: false
    }
});
