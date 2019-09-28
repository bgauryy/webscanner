const colors = require('colors');

const LOG = {
    DEBUG: 0,
    ERROR: 1,
    WARN: 2,
    LOG: 3,
    NONE: 4
};

let logLevel = LOG.DEBUG;

function setLogLevel(_logLevel) {
    logLevel = LOG[_logLevel];
}

function log(str) {
    if (logLevel <= LOG.LOG) {
        console.log(colors.green(getMessage(str)));
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

function debug(str) {
    if (logLevel <= LOG.DEBUG) {
        console.log(colors.cyan(getMessage(str)));
    }
}

function getMessage(msg) {
    return `webInspector: ${msg}`;
}

module.exports = {
    log,
    warn,
    error,
    debug,
    setLogLevel,
    LOG
};

