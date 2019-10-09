const Scanner = require('webscanner');

Scanner.scan({
    url: 'http://example.com',
    callback: (data) => {
        Scanner.show(data);
    },
    stopOnContentLoaded: true,
    scanTime: 6,
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/77.0.3865.90 Safari/537.36',
    chrome: {},
    logLevel: 'all'
});

