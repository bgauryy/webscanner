const colors = require('colors');

const LOG = {
    all: 0,
    debug: 1,
    info: 2,
    warn: 3,
    error: 4,
    none: 5
};

let logLevel = LOG.all;

function setLogLevel(_logLevel) {
    if (typeof LOG[_logLevel] === 'number') {
        logLevel = LOG[_logLevel];
    }
}

function debug(str) {
    if (logLevel <= LOG.debug) {
        console.log(colors.blue(getMessage(str)));
    }
}

function info(str) {
    if (logLevel <= LOG.info) {
        console.log(colors.yellow(getMessage(str)));
    }
}

function warn(str) {
    if (logLevel <= LOG.warn) {
        console.log(colors.yellow(getMessage(str)));
    }
}

function error(str) {
    if (logLevel <= LOG.error) {
        console.log(colors.red(getMessage(str)));
    }
}


function getMessage(msg) {
    return `webInspector: ${msg}`;
}

module.exports = {
    debug,
    info,
    warn,
    error,
    setLogLevel,
    LOG
};

