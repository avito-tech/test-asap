'use strict';

const path = require('path');
const io = require('socket.io')();
const tmp = require('tmp');
const chrome = require('./lib/server/chrome');
const tab = require('./lib/server/tab');
const proxy = require('./lib/server/proxy');
const stub = require('./lib/server/stub');
const match = require('./lib/server/match');
const respondWith = require('./lib/server/respondWith');
const port = 3000;
const extensionDir = path.join(__dirname, 'lib/extension');
const tmpDir = tmp.dirSync();

function startChrome(config) {
    config = config || {};

    io.listen(port);

    return new Promise(resolve => {
        io.on('connection', client => {
            resolve(tab(client));
        });

        chrome.start({
            chromeLocation: config.chromeLocation,
            args: [
                '--load-extension=' + extensionDir,
                '--user-data-dir=' + tmpDir.name,
                '--no-first-run',
                '--system-developer-mode',
                '--silent-debugger-extension-api',
                '--disable-translate',
                '--test-type',
                '--ignore-certificate-errors'
            ]
        });
    });
}

module.exports = {
    start() {
        return proxy.start()
            .then(() => startChrome());
    },

    stop() {
        return Promise.all([
            chrome.stop(),
            proxy.stop()
        ]);
    },

    match,
    respondWith,
    stub
};
