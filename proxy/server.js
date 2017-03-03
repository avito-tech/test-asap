var express = require('express');
var http = require('http');
var expressHttpProxy = require('express-http-proxy');
var httpProxy = require('http-proxy');
// var app = express();

var proxy = httpProxy.createProxyServer({});

var server = http.createServer(function(request, response) {
    proxy.web(request, response, { target: 'http://www.avito.dev' });
});
server.listen(8888);

console.log('started');
