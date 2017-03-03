const launchChrome = require('./launch-chrome');

const extensionDir = './extension';
const userDataDir = './tmp';

/*const express = require('express');
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server);

io.on('connection', client => {
    setInterval(() => {
        client.emit('message', { time: Date.now() });
    }, 3000);
});

server.listen(3000);*/

const chrome = launchChrome({
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
