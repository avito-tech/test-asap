var Tab = require('../extension/tab.js');
var resultCallbacks = {};
var callbackId = 0;

var tabs = {};
var callbacks = {};

function register(resolve, reject) {
    cid = callbackId++;

    callbacks[cid] = data => {
        delete callbacks[cid];

        if (data.success) {
            resolve(data.result)
        } else {
            reject(data.result);
        }
    };

    return cid;
}

function tab(socket) {
    class TabProxy {
        constructor(tabId) {
            this.tabId = tabId;
        }
    }

    Object.getOwnPropertyNames(Tab.prototype).forEach(methodName => {
        // skip constructor and private methods
        if (methodName === 'constructor' || methodName[0] === '_' || methodName === 'getId') {
            return;
        }

        TabProxy.prototype[methodName] = function(...args) {
            return new Promise((resolve, reject) => {
                var cid = register(resolve, reject);

                socket.emit('command', {
                    tabId: this.tabId,
                    command: methodName,
                    args: args,
                    cid: cid
                });
            });
        };
    });

    socket.on('result', data => {
        if (callbacks[data.cid]) {
            callbacks[data.cid](data);
        } else {
            console.log('Missing cid: ' + data.cid);
        }
    });

    TabProxy.create = (url) => {
        return new Promise((resolve, reject) => {
            var cid = register(tabId => {
                resolve(new TabProxy(tabId))
            }, reject);

            socket.emit('tabCreate', { url, cid });
        });
    };

    return TabProxy;
}

module.exports = tab;
