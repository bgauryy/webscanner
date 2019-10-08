const colors = require('colors');

const LOG = {
    ALL: 0,
    DEBUG: 1,
    INFO: 2,
    WARN: 3,
    ERROR: 4,
    NONE: 5
};

let logLevel = LOG.DEBUG;

function setLogLevel(_logLevel) {
    if (typeof LOG[_logLevel] === 'number') {
        logLevel = LOG[_logLevel];
    }
}

function debug(str) {
    if (logLevel <= LOG.DEBUG) {
        console.log(colors.blue(getMessage(str)));
    }
}

function info(str) {
    if (logLevel <= LOG.INFO) {
        console.log(colors.yellow(getMessage(str)));
    }
}

function warn(str) {
    if (logLevel <= LOG.WARN) {
        console.log(colors.yellow(getMessage(str)));
    }
}

function error(str) {
    if (logLevel <= LOG.ERROR) {
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

