/* eslint no-console: ["error", { allow: ["warn", "error", "log"] }] */
var tat = require('../');
var sinon = require('sinon');
var match = sinon.match;

tat.stub.https.withArgs(
    match.any
).returns(
    tat.respondWith.html('<h2>LOL</h2>')
);

tat.start().then(Tab => {
    return Tab.create('https://avito.ru').then((tab) => {
        return tab.waitFor('h2')
            .then(() => tab.getText('h2'))
            .then(text => console.log(text))
            .then(() => tat.stub.reset())
            .then(() => tab.reload())
            .then(() => tab.waitFor('button'))
            .then(() => tab.getText('button'))
            .then(text => console.log(text))
            .then(() => tab.close())
            .catch((err) => {
                console.log(err);
                tab.close();
            });
    });
}, err => {
    console.log(err);
})
.then(() => tat.stop());
