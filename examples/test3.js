/* eslint no-console: ["error", { allow: ["warn", "error", "log"] }] */
var tat = require('../');
var sinon = require('sinon');
var match = sinon.match;

tat.stub.http.withArgs(
    match.has('headers',
        match.has('host',
            match('avito.ru')
        )
    )
).returns(
    tat.respondWith.html('<h2>AVITO</h2>')
);

tat.start().then(Tab => {
    return Tab.create('http://avito.ru');
}, err => {
    console.log(err);
});
// .then(() => tat.stop());
