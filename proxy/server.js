var express = require('express');
var http = require('http');
var expressHttpProxy = require('express-http-proxy');
var httpProxy = require('http-proxy');
var app = express();

var proxy = httpProxy.createProxyServer({});

// var server = http.createServer(function(request, response) {
//     proxy.web(request, response, { target: 'http://www.avito.dev' });
// });
// server.listen(8888);

app.use('/', expressHttpProxy('www.avito.dev', {
    // decorateRequest: function(proxyReq, originalReq) {
    //     if (originalReq.hostname === 'gmail.com') {
    //         //
    //     } else {
    //         //
    //     }
    //     return proxyReq;
    // }
    // intercept: function(rsp, data, req, res, callback) {
    //     callback(null, JSON.stringify('f'));
    // }
    filter: function(req, res) {
        return req.hostname !== 'actiagent.ru';
    }
}));
app.listen(8888);

app.all('/', function(req, resp) {
    resp.redirect('https://avito.ru');
});

console.log('started');
