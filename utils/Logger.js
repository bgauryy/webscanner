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
        console.log(str);
    }
}

function warn(str) {
    if (logLevel <= LOG.WARN) {
        console.warn(str);
    }
}

function error(str) {
    if (logLevel <= LOG.ERROR) {
        console.error(str);
    }
}

function debug(str) {
    if (logLevel <= LOG.DEBUG) {
        console.debug(str);
    }
}

module.exports = {
    log,
    warn,
    error,
    debug,
    setLogLevel,
    LOG
};

