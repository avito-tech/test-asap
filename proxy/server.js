var express = require('express');
var http = require('http');
var expressHttpProxy = require('express-http-proxy');
var httpProxy = require('http-proxy');
var app = express();

var proxy = httpProxy.createProxyServer({});

app.use(function(req, res, next) {
    console.log(req.hostname);
    next();
});

app.use(function(req) {
    var mw = expressHttpProxy(req.hostname);

    mw.apply(this, arguments);
});
app.listen(8888);

console.log('started');
