const scanner = require('webscanner');

(async function () {
    const data = await scanner.run({
        url: 'http://example.com/',
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/77.0.3865.90 Safari/537.36'
    });
    console.log(data);
})();
