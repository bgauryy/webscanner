class IMonitor {
    /**
     *
     * @param client {object} an object with interface to  a real browsing endpoint
     * @param data {object} collected data store
     * @param collect {object} collect rules
     * @param rules {object} scanning rules
     */
    constructor(data, collect, rules) {
        this.data = data;
        this.collect = collect;
        this.rules = rules;
    }

    monitor() {
        //Impl
    }

    getData() {
        //Impl
    }
}

module.exports = IMonitor;
