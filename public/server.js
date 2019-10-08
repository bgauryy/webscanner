const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const Logger = require('../src/utils/Logger');
const DATA_FILE = 'data.json';

let port;
let publicDir;

function init(_port) {
    port = _port;
    publicDir = path.join(__dirname, 'dist');

    try {
        fs.unlinkSync(path.join(publicDir, DATA_FILE));
    } catch (e) {
        //ignore
    }
}

function publish(data) {
    fs.writeFile(path.join(publicDir, DATA_FILE), data, 'utf8', () => {
        app.use(express.static(publicDir));
        const server = app.listen(port, () => {
            process.on('exit', terminate.bind(this, server));
            process.on('SIGINT', terminate.bind(this, server));
            process.on('SIGUSR1', terminate.bind(this, server));
            process.on('SIGUSR2', terminate.bind(this, server));
            process.on('uncaughtException', terminate.bind(this, server));
        });
    });
}

function terminate(server) {
    try {
        Logger.debug('terminating Server');
        server.close();
    } catch (e) {
        throw e;
    }
}

module.exports = {
    init,
    publish
};
