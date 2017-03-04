var sinon = require('sinon');

var stub = sinon.stub().returns((ctx, callback) => callback());

stub.html = function html(htmlText) {
    return function(ctx) {
        let res = ctx.proxyToClientResponse;

        res.setHeader('Content-Type', 'text/html');
        res.end(htmlText);
    };
};

module.exports = stub;
