/* eslint no-console: ["error", { allow: ["warn", "error", "log"] }] */
var tat = require('../');
var sinon = require('sinon');
var stub = tat.stub;

var link = '[role-marker="termsField/terms-link"]';
var terms = '[role-marker="termsDialog"]';

stub.withArgs(
    sinon.match.has('url', sinon.match('/rest/text/terms'))
).returns(
    stub.html('<h2>LOL</h2>')
);

tat.start().then(Tab => {
    return Tab.create('https://actiagent.ru').then((tab) => {
        return tab.waitFor(link)
            .then(() => tab.click(link))
            .then(() => tab.waitFor(terms))
            .then(() => tab.getText(terms))
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
