const express = require('express');
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server);

const chrome = require('./chrome');
const tab = require('./tab');

const port = 3000;

server.listen(port);

const extensionDir = './extension';
const userDataDir = './tmp';

function launch(config = {}) {
    return new Promise((resolve, reject) => {
        io.on('connection', client => {
            resolve(tab(client));
        });

        chrome.launch({
            chromeLocation: config.chromeLocation,
            args: [
                '--load-extension=' + extensionDir,
                '--user-data-dir=' + userDataDir,
                '--no-first-run',
                '--system-developer-mode',
                '--allow-file-access',
                '--silent-debugger-extension-api',
                '--disable-translate'
            ]
        });
    });
}

function stop() {
    chrome.close();
    //io.close();
}

module.exports = {
    launch,
    stop
};
