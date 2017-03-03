'use strict';

var port = 8889;
var Proxy = require('http-mitm-proxy');
var sinon = require('sinon');
var proxy = Proxy();

var stub = sinon.stub().returns((ctx, callback) => callback());

stub.withArgs(
    sinon.match.has('url', sinon.match('/rest/text/terms') )
).returns((ctx, callback) => {
    let res = ctx.proxyToClientResponse;

    res.setHeader('Content-Type', 'text/html');
    res.end('<h2>LOL</h2>');
});

proxy.onError(function(ctx, err, errorKind) {
    // ctx may be null
    var url = (ctx && ctx.clientToProxyRequest) ? ctx.clientToProxyRequest.url : '';
    console.error(errorKind + ' on ' + url + ':', err);
});

proxy.onRequest(function(ctx, callback) {
    var mw = stub(ctx.clientToProxyRequest);
    mw.apply(this, arguments);
});

proxy.listen({ port: port });
console.log('listening on ' + port);

module.exports = stub;
