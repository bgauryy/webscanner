const {enrichURLDetails} = require('../../utils/clientHelper');
const LOG = require('../../utils/logger.js');

async function registerStyleEvents(client, context) {
    const styles = context.data.styles;
    const getContent = context.collect.content;

    client.CSS.styleSheetAdded(async function ({header: {styleSheetId, frameId, sourceURL, origin, ownerNode, isInline, length}}) {
        const style = {
            frameId,
            url: sourceURL,
            origin,
            ownerNode,
            isInline,
            length
        };
        enrichURLDetails(style, 'url');

        if (getContent) {
            try {
                const {scriptSource} = await client.CSS.getStyleSheetText({styleSheetId});
                style.source = scriptSource;
            } catch (e) {
                LOG.error(e);
                style.source = '';
            }
        }

        styles[styleSheetId] = style;
    });
}

module.exports = {
    registerStyleEvents
};
