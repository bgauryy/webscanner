const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();

function publishData(data, serverPort, time) {
    fs.writeFile(path.join(__dirname, 'public', 'data.json'), data, 'utf8', () => {
        app.use(express.static('public'));
        const server = app.listen(serverPort, () => {
            process.on('exit', closeServer.bind(this, server));
            process.on('SIGINT', closeServer.bind(this, server));
            process.on('SIGUSR1', closeServer.bind(this, server));
            process.on('SIGUSR2', closeServer.bind(this, server));
            process.on('uncaughtException', closeServer.bind(this, server));
            console.log(`Inspection time: ${time} seconds`);
            console.log(`See results at http://localhost:${serverPort}`);
        });
    })
}

function closeServer(server) {
    try {
        console.log('Closing Server');
        server.close();
    } catch (e) {
        throw e;
    }
}

module.exports = {
    publishData
};
