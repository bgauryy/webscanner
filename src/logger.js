let isEnabled = false;

function setEnabled(_isEnabled) {
    isEnabled = _isEnabled;
}

function debug() {
    log('debug', [...arguments]);
}

function warn() {
    log('warn', [...arguments]);
}

function error() {
    log('error', [...arguments], );
}

function log(api, args) {
    if (!isEnabled) {
        return;
    }
    args[0] = `WebInspector ${new Date()}: ${args[0]}`;
    //eslint-disable-next-line
    console[api].apply(this, args);
}


module.exports = {
    debug,
    warn,
    error,
    setEnabled
};

