const Scanner = require('webscanner');

Scanner.test({
    url: 'https://perimeterx.com',
    callback: getSiteHosts,
    stopOnContentLoaded: true,
    scanTime: 6,
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/77.0.3865.90 Safari/537.36',
});

function getSiteHosts(data) {
    const hosts = new Set();
    const countries = new Set();
    const ips = new Set();

    const resources = data.resources;
    const scripts = data.scripts;
    const styleSheets = data.styleSheets;
    const frames = data.frames;
    const allResources = scripts.concat(styleSheets).concat(resources).concat(frames);

    for (let i = 0; i < allResources.length; i++) {
        const resource = allResources[i];
        if (resource.host) {
            hosts.add(resource.host);
        }

        if (resource.response && resource.response) {
            const response = resource.response;
            if (response.timezone) {
                countries.add(response.timezone);
            }

            if (response.ip) {
                ips.add(response.ip);
            }
        }
    }

    console.log(`Hosts: ${Array.from(hosts)}`);
    console.log(`Countries: ${Array.from(countries)}`);
    console.log(`IP: ${Array.from(ips)}`);
}

