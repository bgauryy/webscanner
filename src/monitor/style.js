const {enrichURLDetails} = require('../utils/clientHelper');

function registerStyleEvents(client, styles) {
    client.CSS.styleSheetAdded(async function (styleObj) {
        styleObj = {...styleObj.header};
        enrichURLDetails(styleObj, 'url');
        if (styleObj.ownerNode) {
            //TODO: get content from inline scripts/nodes
            //const {node} = await client.DOM.describeNode({backendNodeId: styleObj.ownerNode});
        }
        const {scriptSource} = await client.CSS.getStyleSheetText({styleSheetId: styleObj.styleSheetId});
        styleObj.source = scriptSource;
        styles[styleObj.styleSheetId] = styleObj;
    });
}

async function getStyleCoverage(client) {
    const {coverage} = await client.CSS.takeCoverageDelta();
    return coverage;
}

async function startCSSCoverageTracking(client) {
    await client.CSS.startRuleUsageTracking();
}

module.exports = {
    registerStyleEvents,
    getStyleCoverage,
    startCSSCoverageTracking
};
