const {enrichURLDetails} = require('../utils');
const LOG = require('../logger');

let started = false;

async function start(context) {
    started = true;

    const client = context.client;
    const styles = context.data.styles;

    await client.DOM.enable();
    await client.CSS.enable();

    await client.CSS.startRuleUsageTracking();
    await client.CSS.takeCoverageDelta();
    registerStyleEvents(client, styles);
}

async function stop(context) {
    if (!started) {
        return;
    }
    const client = context.client;
    const styles = context.data.styles;
    const {coverage} = await client.CSS.takeCoverageDelta();

    await client.CSS.stopRuleUsageTracking();
    return processStyle(styles, coverage);
}

function registerStyleEvents(client, styles) {
    client.CSS.styleSheetAdded(async function (styleObj) {
        styleObj = {...styleObj.header};
        enrichURLDetails(styleObj, 'url');
        if (styleObj.ownerNode) {
            //TODO: get content from inline scripts/nodes
            //const {node} = await client.DOM.describeNode({backendNodeId: styleObj.ownerNode});
        }
        try {
            const {scriptSource} = await client.CSS.getStyleSheetText({styleSheetId: styleObj.styleSheetId});

            styleObj.source = scriptSource;
        } catch (e) {
            LOG.error(e);
        }
        styles[styleObj.styleSheetId] = styleObj;
    });
}

function processStyle(styles, styleCoverage,) {
    styles = styles || {};
    styleCoverage = styleCoverage || [];

    for (let i = 0; i < styleCoverage.length; i++) {
        const {styleSheetId, endOffset, startOffset} = styleCoverage[i];
        const style = styles[styleSheetId];

        if (style) {
            style.coverage = style.coverage || {};
            style.coverage.usedBytes = style.coverage.usedBytes || 0;
            style.coverage.usedBytes += endOffset - startOffset;
        }
    }

    //eslint-disable-next-line
    for (const styleId in styles) {
        const style = styles[styleId];

        if (style.coverage) {
            style.coverage.usage = style.coverage.usedBytes / style.length;
        }
    }

    return styles;
}

module.exports = {
    start,
    stop
};
