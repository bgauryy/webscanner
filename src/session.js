const {Scanner} = require('./scanner.js');

async function scan(opts) {
    //eslint-disable-next-line
    return new Promise(async function (resolve, reject) {
        const scanner = new Scanner(opts);
        await scanner.start();

        try {
            await scanner.navigate(opts.url);
            if (opts.stopOnContentLoaded) {
                await scanner.waitDOMContentLoaded();
            }
            await scanner.collectAllDOMEvents();
            setTimeout(async function () {
                const data = await scanner.getData();
                await scanner.stop();
                resolve(data);
            }, opts.scanTime * 1000);
        } catch (err) {
            await scanner.stop();
            reject(err);
        }
    });
}

async function setPuppeteerPage(page, opts) {
    opts.puppeteerPage = page;
    const scanner = new Scanner(opts);
    await scanner.start();
    page.getData = async function () {
        return await scanner.getData();
    };
}

module.exports = {
    scan,
    setPuppeteerPage
};
