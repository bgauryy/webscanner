const Scanner = require('../src/index');

(async function () {
    const data = await Scanner.test({
        url: 'http://example.com',
        stopOnContentLoaded: true,
        scanTime: 5,
        scan: {
            research: true,
            content: false,
            scripts: false,
            resources: false,
            styles: false,
            metrics: false,
            frames: false,
        }
    });
    console.log(data);
})();
