let isEnabled = false;

export function setEnabled(_isEnabled) {
    isEnabled = _isEnabled;
}

export function debug() {
    _log('debug', [...arguments]);
}

export function warn() {
    _log('warn', [...arguments]);
}

export function error() {
    _log('error', [...arguments],);
}

function _log(api, args) {
    if (!isEnabled) {
        return;
    }
    args[0] = `WebInspector ${new Date()}: ${args[0]}`;
    // eslint-disable-next-line
    console[api].apply(this, args);
}

