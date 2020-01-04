class Monitor {
    /**
     *
     * @param client {object} an object with interface to  a real browsing endpoint
     * @param data {object} collected data store
     * @param collect {object} collect rules
     * @param rules {object} scanning rules
     */
    constructor(client, data, collect, rules) {
        this.client = client;
        this.data = data;
        this.collect = collect;
        this.rules = rules;
    }

    monitor() {
        //Implementation
    }

    getData() {
        //Implementation
    }
}

module.exports = Monitor;
