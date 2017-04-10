'use strict';

const path = require('path');
const fs = require('fs');
const mimeDetector = require('mime');
const MitmProxy = require('http-mitm-proxy');
const stream = require('stream');
const Transform = stream.Transform;
const util = require('util');

function createFileResponse(res, src) {
    try {
        const file = fs.readFileSync(src);
        const mime = mimeDetector.lookup(src);

        if (mime) {
            res.setHeader('Content-Type', mime);
        }

        res.end(file);
    } catch (e) {
        res.writeHead(404);
        res.end('Not found');
    }
}

class ProcessRequestBody extends stream.Transform {
    constructor({ modifyFn }) {
        super();

        this.modifyFn = modifyFn;
        this.data = '';
    }

    _transform(chunk, enc, cb) {
        this.data += chunk;

        cb();
    }

    _flush(cb) {
        const transformedData = JSON.parse(this.data);
        this.modifyFn(transformedData)
        this.push(Buffer.from(JSON.stringify(transformedData)));

        cb();
    }
}

module.exports = {

    html(htmlText) {
        return (ctx) => {
            const res = ctx.proxyToClientResponse;

            res.setHeader('Content-Type', 'text/html');
            res.end(htmlText);
        };
    },

    text(text) {
        return (ctx) => {
            const res = ctx.proxyToClientResponse;

            res.setHeader('Content-Type', 'text/plain');
            res.end(text);
        };
    },

    json(json) {
        return (ctx) => {
            const res = ctx.proxyToClientResponse;
            const jsonText = JSON.stringify(json);

            res.setHeader('Content-Type', 'application/json');
            res.end(jsonText);
        };
    },

    jsonTransformer(modifyResponse, modifyBody) {
        return function(ctx, callback) {
            let data = '';

            if (modifyBody) {
                delete ctx.proxyToServerRequestOptions.headers['content-length'];
                ctx.addRequestFilter(new ProcessRequestBody({ modifyFn: modifyBody }));
            }

            ctx.use(MitmProxy.gunzip);

            ctx.onResponseData((ctx, chunk) => {
                data += chunk;
            });

            ctx.onResponseEnd(() => {
                const json = JSON.parse(data);
                if (modifyResponse) {
                    modifyResponse(json);
                }
                ctx.proxyToClientResponse.end(JSON.stringify(json));
            });

            return callback();
        };
    },

    file(src) {
        return (ctx) => {
            const res = ctx.proxyToClientResponse;

            createFileResponse(res, src);
        };
    },

    serveStatic(match, replacement) {
        return (ctx) => {
            const reqUrl = ctx.clientToProxyRequest.url;
            const res = ctx.proxyToClientResponse;
            const reqUrlWithoutQuery = reqUrl.split('?')[0];
            const newPath = path.resolve(reqUrlWithoutQuery.replace(match, replacement));

            try {
                const file = fs.readFileSync(newPath);
                res.end(file);
            } catch (e) {
                res.writeHead(404);
                res.end('Not found');
            }
        };
    }

};
