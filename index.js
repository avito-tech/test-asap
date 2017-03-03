const express = require('express');
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server);

const chrome = require('./chrome');

const port = 3000;
const extensionDir = './extension';
const userDataDir = './tmp';

function tat(config) {
    return new Promise((resolve, reject) => {
        server.listen(port);

        io.on('connection', client => {
            resolve();
        });

        chrome.launch({
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

tat().then(browser => {
    //console.log(browser);

    setTimeout(() => {
        chrome.close();
    }, 5000);
});
