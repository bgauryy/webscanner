//TODO - fix dependencies
//import url from 'url';
const url = require('url');

import CRI from 'chrome-remote-interface';

/**
 * @param page
 * Puppeteer Page object or object with this structure: {host, port}
 * @return {Promise<unknown>}
 */
export async function getChromeClient(page) {
    if (page.hostname && page.port) {
        return await CRI({host: page.hostname, port: page.port});
    } else {
        const connection = page._client._connection._url;
        const {hostname, port} = url.parse(connection, true);

        return await CRI({host: hostname, port});
    }
}
