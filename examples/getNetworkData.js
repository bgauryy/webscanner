const Scanner = require('webscanner');

Scanner.scan({
    url: 'https://example.com',
    callback: getSiteHosts,
    stopOnContentLoaded: true,
    scanTime: 6,
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/77.0.3865.90 Safari/537.36',
});

function getSiteHosts(data) {
    const hosts = new Set();
    const timezone = new Set();
    const ip = new Set();

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
            if (resource.response.timezone) {
                timezone.add(resource.response.timezone);
            }

            if (resource.response.remoteIPAddress) {
                ip.add(resource.response.remoteIPAddress);
            }
        }
    }

    console.log(`Hosts: ${Array.from(hosts)}`);
    console.log(`Timezones: ${Array.from(timezone)}`);
    console.log(`IP's: ${Array.from(ip)}`);
}

