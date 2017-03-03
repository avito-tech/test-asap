const io = require('socket.io')();

const chrome = require('./chrome');
const tab = require('./tab');

const port = 3000;

io.listen(port);

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
                '--silent-debugger-extension-api',
                '--disable-translate',
                '--test-type',
                '--ignore-certificate-errors'
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
