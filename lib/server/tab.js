/* eslint no-console: ["error", { allow: ["warn", "error"] }] */

var Tab = require('../extension/tab.js');
var callbackId = 0;

var callbacks = {};

function register(resolve, reject) {
    var cid = callbackId++;

    callbacks[cid] = data => {
        delete callbacks[cid];

        if (data.success) {
            resolve(data.result);
        } else {
            reject(data.result);
        }
    };

    return cid;
}

var tabMethodNames = Object.getOwnPropertyNames(Tab.prototype).filter(methodName => {
    // skip constructor and private methods
    return !(methodName === 'constructor' || methodName[0] === '_' || methodName === 'getId');
});

function tab(socket) {
    class TabProxy {
        constructor(tabId, pageObject) {
            this.tabId = tabId;
            for (let pageObjectName in pageObject) {
                if (pageObject.hasOwnProperty(pageObjectName)) {
                    let selector = pageObject[pageObjectName];
                    let po = {};
                    tabMethodNames.forEach(method => {
                        if (method === pageObjectName) {
                            console.error(`Page object name '${pageObjectName}' is not allowed`);
                        }
                        po[method] = this[method].bind(this, selector);
                    });
                    this[pageObjectName] = po;
                }
            }
        }
    }

    tabMethodNames.forEach(methodName => {
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
            console.warn('Missing cid: ' + data.cid);
        }
    });

    TabProxy.create = (url, pageObject) => {
        return new Promise((resolve, reject) => {
            var cid = register(tabId => {
                resolve(new TabProxy(tabId, pageObject));
            }, reject);

            socket.emit('tabCreate', { url, cid });
        });
    };

    return TabProxy;
}

module.exports = tab;
