const Scanner = require('webscanner');

(async function () {
    const data = await Scanner.test({
        url: 'http://example.com',
        stopOnContentLoaded: true,
        scanTime: 10,
        scan: {
            content: false,
            scripts: false,
            resources: true,
            styles: false,
            metrics: true,
            frames: false,
        }
    });
    console.log(data);
})();
