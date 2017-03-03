var express = require('express');
var path = require('path');
var http = require('http');
var https = require('https');
var fs = require('fs');
var expressHttpProxy = require('express-http-proxy');
var httpProxy = require('http-proxy');
var app = express();

var proxy = httpProxy.createProxyServer({});

var MWs = {};

app.use(function(req, res, next) {
    console.log(req);
    res.send('adsfad');
});

app.use(function(req) {
    if (!MWs[req.hostname]) {
        MWs[req.hostname] = expressHttpProxy(req.hostname);
    }

    MWs[req.hostname].apply(this, arguments);
});

app.listen(8889);

//https://docs.nodejitsu.com/articles/HTTP/servers/how-to-create-a-HTTPS-server/
//http://blog.mgechev.com/2014/02/19/create-https-tls-ssl-application-with-express-nodejs/

var baseCertPath = path.join(__dirname, './cert/');

var options = {
    key: fs.readFileSync(baseCertPath + 'key.pem'),
    cert: fs.readFileSync(baseCertPath + 'cert.pem')
};

// https.createServer(options, function(req, res) {
//     console.log(req.url);
//     res.end('hello https');
// }).listen(8889);

console.log('started');
