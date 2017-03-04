const path = require('path');
const fs = require('fs');

module.exports = {

    html(htmlText) {
        return ({ proxyToClientResponse: res }) => {
            res.setHeader('Content-Type', 'text/html');
            res.end(htmlText);
        };
    },

    text(text) {
        return ({ proxyToClientResponse: res }) => {
            res.setHeader('Content-Type', 'text/plain');
            res.end(text);
        };
    },

    json(json) {
        return ({ proxyToClientResponse: res }) => {
            res.setHeader('Content-Type', 'application/json');
            const jsonText = JSON.stringify(json);
            res.end(jsonText);
        }
    },

    serveStatic(match, replacement) {
        return ({ clientToProxyRequest: { url: reqUrl }, proxyToClientResponse: res }) => {
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
