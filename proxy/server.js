var express = require('express');
var http = require('http');
var expressHttpProxy = require('express-http-proxy');
var httpProxy = require('http-proxy');
var app = express();

var proxy = httpProxy.createProxyServer({});

var MWs = {};

app.use(function(req, res, next) {
    if (req.hostname === 'avito.ru') {
        res.send('mock');
    } else {
        next();
    }
});

app.use(function(req) {
    if (!MWs[req.hostname]) {
        MWs[req.hostname] = expressHttpProxy(req.hostname);
    }

    MWs[req.hostname].apply(this, arguments);
});
app.listen(8888);

console.log('started');
