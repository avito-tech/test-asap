const spawn = require('child_process').spawn;
const chromeDefaultLocation = require('chrome-location');
//const rimraf = require('rimraf'); // Deep folder remove

function launchChrome({ url = 'about:blank', chromeLocation = chromeDefaultLocation, args = [], userDir = './tmp' }) {
    const spawnProcess = spawn(chromeLocation, args);
    let closed = false;

    function onClose() {
        if (closed) {
            // chrome sometimes doesn't exit cleanly https://code.google.com/p/chromium/issues/detail?id=338000
            // so, if we get a second call, assume this has happend and kill the whole
            // process. We'll wait a reasonable interval just to be sure everything is
            // actually done.
            return void setTimeout(() => {
                process.exit(0);
            }, 1000);
        } else {
            closed = true;
        }

        spawnProcess.kill();
        process.removeListener('exit', onClose);
        process.removeListener('close', onClose);
    }

    process.on('exit', onClose);
    process.on('close', onClose);
    spawnProcess.on('close', onClose);
    spawnProcess.on('exit', onClose);

    return spawnProcess;
}

module.exports = launchChrome;
