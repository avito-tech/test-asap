'use strict';

const path = require('path');
const fs = require('fs');
const mimeDetector = require('mime');

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
        }
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
        }
    }

};
