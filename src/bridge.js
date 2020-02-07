const CRI = require('chrome-remote-interface');
const url = require('url');

async function getChromeClient(page) {
    const connection = page._client._connection._url;
    const {hostname, port} = url.parse(connection, true);
    return await CRI({host: hostname, port});
}

module.exports = {
    getChromeClient
};
