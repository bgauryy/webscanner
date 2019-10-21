function getContext(page, opts = {}) {
    if (!page) {
        throw new Error('page is missing');
    }

    opts.callback = (typeof opts.callback === 'function') ? opts.callback : null;

    const defaultCollect = {
        frames: false, //Collect iframes data

        scripts: false, //Collect scripts data
        scriptSource: false, //get script source
        scriptDOMEvents: false, //get script registered DOM Events
        scriptCoverage: false, //get script coverage

        styles: false, //Collect style data
        styleSource: true, //gets style source
        styleCoverage: false, //get style coverage

        serviceWorker: false,

        requests: false, //Collect requests data
        responses: false, //get response data per request
        bodyResponse: [], // gets response body by url regex
        dataURI: false, //enable data URI requests (default - false)

        metrics: false,//collect browser metrics
        cookies: false,//get all browser cookies
        logs: false,//Collect browser logs
        console: false,//Collect console AP usage
        errors: false,//collect JS errors
        storage: false,//collect storage events (localStorage, sessionStorage)
    };

    const defaultRules = {
        disableServices: false, //Disable common third party services
        blockedUrls: [], //Set chrome blocked urls
        adBlocking: false, //Enable ad blocking feature
        disableCSP: false, //Disable browser CSP blocking
    };

    return {
        page, ...{
            stealth: Boolean(opts.stealth),
            callback: opts.callback,
            log: opts.log || false,
            rules: {...defaultRules, ...opts.rules || {}},
            collect: {...defaultCollect, ...opts.collect || {}}
        }
    };
}

module.exports = {
    getContext
};
