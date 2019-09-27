const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const Logger = require('./utils/Logger');

const DATA_FILE = 'data.json';

let port;
let publicDir;

function init(opts) {
    port = opts.port;
    publicDir = opts.path;
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
    return `http://localhost:${port}`;
}

function terminate(server) {
    try {
        Logger.log('terminating Server');
        server.close();
    } catch (e) {
        throw e;
    }
}

module.exports = {
    init,
    publish
};
