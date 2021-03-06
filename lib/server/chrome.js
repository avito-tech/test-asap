'use strict';

const spawn = require('child_process').spawn;
const chromeDefaultLocation = require('chrome-location');

let closed = false;
let spawnProcess;

function start(params) {
    spawnProcess = spawn(
        params.chromeLocation || chromeDefaultLocation,
        params.args || []
    );

    process.on('exit', stop);
    process.on('close', stop);
    spawnProcess.on('close', stop);
    spawnProcess.on('exit', stop);

    return spawnProcess;
}

function stop() {
    if (closed) {
        // chrome sometimes doesn't exit cleanly https://code.google.com/p/chromium/issues/detail?id=338000
        // so, if we get a second call, assume this has happend and kill the whole
        // process. We'll wait a reasonable interval just to be sure everything is
        // actually done.
        return setTimeout(() => {
            process.exit(0);
        }, 1000);
    }

    spawnProcess.kill();
    process.removeListener('exit', stop);
    process.removeListener('close', stop);

    closed = true;
}

module.exports = {
    start,
    stop
};
