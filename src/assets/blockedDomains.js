//TODO:https://easylist.to/easylist/easylist.txt
//https://raw.githubusercontent.com/brave/tracking-protection/60b028ac90ab31d3fd9200fed58df3574ad99a56/data/disconnect.json
const {categories} = require('./disable.json');

const customDomains = ['sitelabweb.com'];

function getBlockedDomains() {
    let badDomains = [].concat(customDomains);
    for (const prop in categories) {
        //eslint-disable-next-line
        if (!categories.hasOwnProperty(prop)) {
            continue;
        }
        const category = categories[prop];
        for (let i = 0; i < category.length; i++) {
            const obj = category[i];

            const domain = obj[Object.keys(obj)[0]];
            const badOrigins = domain[Object.keys(domain)[0]];
            badDomains = badDomains.concat(badOrigins);
        }
    }

    return badDomains;
}

module.exports = {
    getBlockedDomains
};
