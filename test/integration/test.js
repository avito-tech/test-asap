/* eslint no-console: ["error", { allow: ["warn", "error", "log"] }] */
var tat = require('../..');
var sinon = require('sinon');
var match = sinon.match;
var fs = require('fs');

var htmlText = fs.readFileSync(__dirname + '/test.html', 'utf8');

tat.stub.https.withArgs(
    match.has('url', match('index.html'))
).returns(function(ctx) {
    let res = ctx.proxyToClientResponse;

    res.setHeader('Content-Type', 'text/html');
    res.end(htmlText);
});

tat.stub.https.withArgs(
    match.has('url', match('1.json?q=some'))
).returns(function(ctx) {
    let res = ctx.proxyToClientResponse;

    res.setHeader('Content-Type', 'application/json');
    res.end('{"tag": "span", "inner": "secret"}');
});

function assert(condition, message) {
    return new Promise((resolve, reject) => {
        return condition ? resolve(condition) : reject({message});
    });
}

var exitCode = 0;

tat.start().then(Tab => {
    return Tab.create('https://avito.ru/index.html').then((tab) => {
        return tab.typeText('input', 'some')
            .then(() => tab.waitFor('button'))
            .then(() => tab.click('button'))
            .then(() => tab.waitFor('span'))
            .then(() => tab.getText('span'))
            .then(text => assert(text == 'secret', 'expected "secret" but got ' + text))
            .then(() => tab.close())
            .then(() => console.log('✅   OK!'))
            .catch((err) => {
                exitCode = 1;
                console.log('🚫   Error: ')
                console.log(err);
                tab.close();
            });
    });
}, err => {
    exitCode = 2;
    console.log(err);
})
.then(() => tat.stop())
.then(() => process.exit(exitCode));
