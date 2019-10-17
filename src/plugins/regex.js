(function () {
    const key = '.__regex';
    const data = {};
    const origExec = RegExp.prototype.exec;

    Object.defineProperty(window, key, {
        enumerable: false,
        get: () => getData()
    });

    function getData() {
        const customData = {};

        //eslint-disable-next-line
        for (const prop in data) {
            customData[prop] = Array.from(data[prop]);
        }
        return customData;
    }

    //eslint-disable-next-line
    RegExp.prototype.exec = function (val) {
        const reg = new RegExp('\\d+:\\d+.*$', 'g');
        reg.exec = origExec;
        const regVal = val + '';
        let caller = (getStackObj().caller || 'unknown').replace(reg, '');

        try {
            caller = new URL(caller).href;
        } catch (e) {
            //ignore
        }

        data[caller] = data[caller] || new Set();
        data[caller].add(regVal);
        return origExec.call(this, val);
    };

    function getStackObj() {
        const stack = getStackTrace();
        const caller = getCaller(stack);
        return {trace: stack, caller: caller};
    }

    function getStackTrace() {
        const stack = new Error().stack;
        const re = new RegExp('\\s{2,100}', 'g');
        re.exec = window[key].exec;

        const re2 = new RegExp('[\\r\\n\\t]+', 'g');
        re2.exec = window[key].exec;

        return stack ? stack.replace(re, ' ').replace(re2, '\n') : '';
    }

    function getCaller(str) {
        const re = new RegExp('(ftp|http|https):\\/\\/(\\w+:{0,1}\\w*@)?(\\S+)(:[0-9]+)?(\\/|\\/([\\w#!:.?+=&%@!\\-\\/]))?', 'gi');
        re.exec = window[key].exec;
        const matches = (str || '').match(re);
        return matches ? matches[matches.length - 1] : 'unknown';
    }

})();
