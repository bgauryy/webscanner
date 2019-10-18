function getContext(page, opts = {}) {
    if (!page) {
        throw new Error('page is missing');
    }

    opts.callback = (typeof opts.callback === 'function') ? opts.callback : null;

    const defaultCollect = {
        research: false,
        scripts: false,
        resources: false,
        requests: false,
        responses: false,
        styles: false,
        metrics: false,
        frames: false,
        content: false,
        coverage: false,
        serviceWorker: false,
        cookies: false,
        domEvents: false,
    };

    const defaultChromeObj = {
        port: 9222,
        chromeFlags: ['--headless', '--disable-gpu', '--enable-precise-memory-info']
    };

    const defaultRules = {
        scanTime: 5000,
        stopOnContentLoaded: true,
        blockedUrls: []
    };

    return {
        page, ...{
            stealth: Boolean(opts.stealth),
            chrome: {...defaultChromeObj, ...opts.chrome || {}},
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
