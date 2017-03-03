const spawn = require('child_process').spawn;
const chromeDefaultLocation = require('chrome-location');
//const rimraf = require('rimraf'); // Deep folder remove

let closed = false;
let spawnProcess;

function launch({ chromeLocation = chromeDefaultLocation, args = [], userDir = './tmp' }) {
    spawnProcess = spawn(chromeLocation, args);

    process.on('exit', close);
    process.on('close', close);
    spawnProcess.on('close', close);
    spawnProcess.on('exit', close);

    return spawnProcess;
}

function close() {
    if (closed) {
        // chrome sometimes doesn't exit cleanly https://code.google.com/p/chromium/issues/detail?id=338000
        // so, if we get a second call, assume this has happend and kill the whole
        // process. We'll wait a reasonable interval just to be sure everything is
        // actually done.
        return void setTimeout(() => {
            process.exit(0);
        }, 1000);
    }

    spawnProcess.kill();
    process.removeListener('exit', close);
    process.removeListener('close', close);

    closed = true;
}

module.exports = {
    launch,
    close
};
