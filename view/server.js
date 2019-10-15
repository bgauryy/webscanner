const Scanner = require('../src/index');
const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const DATA_FILE = 'data.json';

const publicDir = path.join(__dirname, 'dist');
const dataFilepath = path.join(publicDir, DATA_FILE);

Scanner.test({
    url: 'http://perimeterx.com',
    log: true,
    callback: (data) => {
        startServer(data, 8080);
    },
    rules: {
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/79.0.3933.0 Safari/537.36',
        stopOnContentLoaded: true,
        scanTime: 5
    },
    collect: {
        research: true,
        content: true,
        scripts: true,
        resources: true,
        styles: true,
        metrics: true,
        frames: true,
        coverage: true
    }
});

function startServer(data, port) {
    console.log(`Running server on localhost:${port} publicDir: ${publicDir}`);
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
            console.log(`Server is up: http://localhost:${port}`);
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
        console.log('Server closed');
        server.close();
    } catch (e) {
        throw e;
    }
}
