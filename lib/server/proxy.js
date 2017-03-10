/* eslint no-console: ["error", { allow: ["warn", "error", "log"] }] */
'use strict';

const port = 8889;
const Proxy = require('http-mitm-proxy');
const stub = require('./stub');

let proxy;
let stopped = false;

module.exports = {
    start() {
        proxy = Proxy();

        proxy.onError(function(ctx, err, errorKind) {
            if (stopped) {
                return;
            }
            // ctx may be null
            const url = (ctx && ctx.clientToProxyRequest) ? ctx.clientToProxyRequest.url : '';
            console.error(errorKind + ' on ' + url + ':', err);
        });

        proxy.onRequest(function(ctx) {
            const stubForCurrentScheme = ctx.isSSL ? stub.https : stub.http;
            const mw = stubForCurrentScheme(ctx.clientToProxyRequest);

            mw.apply(this, arguments);
        });

        return new Promise((resolve, reject) => {
            proxy.listen({ port: port, silent: true }, (err) => {
                if (err) {
                    reject(err);
                } else {
                    resolve();
                }
            });
        });
    },

    stop() {
        stopped = true;
        proxy.close();
    }
};
