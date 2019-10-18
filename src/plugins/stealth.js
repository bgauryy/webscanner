/* eslint-disable */
(function (window) {
    const pt = window.navigator.__proto__;
    delete pt.webdriver;
    window.navigator.__proto__ = pt;

    const originalQuery = window.navigator.permissions.query;
    window.navigator.permissions.query = (parameters) => (
        parameters.name === 'notifications' ?
            Promise.resolve({state: Notification.permission}) :
            originalQuery(parameters)
    );
    Object.defineProperty(navigator, 'plugins', {
        get: () => [1, 2, 3, 4, 5],
    });
    Object.defineProperty(navigator, 'languages', {
        get: () => ['en-US', 'en'],
    });
    window.chrome = {
        app: {},
        webstore: {},
        runtime: {}
    };
})(window);
