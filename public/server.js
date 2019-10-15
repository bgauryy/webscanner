const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const Logger = require('../src/utils/Logger');
const DATA_FILE = 'data.json';

const publicDir = path.join(__dirname, 'dist');
const dataFilepath = path.join(publicDir, DATA_FILE);

function show(data, port) {
    Logger.debug(`Running server on localhost:${port} publicDir: ${publicDir}`);
    if (typeof data === 'object') {
        data = JSON.stringify(data);
    }

    try {
        fs.unlinkSync(dataFilepath);
    } catch (e) {
        //ignore
    }

    fs.writeFile(dataFilepath, data, 'utf8', () => {
        app.use(express.static(publicDir));
        const server = app.listen(port, 'localhost', () => {
            Logger.debug(`Server is up: http://localhost:${port}`);
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
        Logger.debug('Server closed');
        server.close();
    } catch (e) {
        throw e;
    }
}

module.exports = {
    show
};
