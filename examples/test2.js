/* eslint no-console: ["error", { allow: ["warn", "error", "log"] }] */
var path = require('path');
var tat = require('../');
var sinon = require('sinon');
var stub = tat.stub;
var respondWith = tat.respondWith;

var link = '[role-marker="termsField/terms-link"]';
var terms = '[role-marker="termsDialog"]';

stub.https.withArgs(
    sinon.match.has('url', sinon.match('/res/7EiNlv7G_KCvanpivhp5XQ_'))
).returns(
    respondWith.serveStatic('/res', path.join(__dirname, 'musor'))
);

tat.start().then(Tab => {
    return Tab.create('https://actiagent.ru').then((tab) => {
        return tab.waitFor(link)
            .then(() => tab.click(link))
            .then(() => tab.waitFor(terms))
            .then(() => tab.getText(terms))
            //.then(text => console.log(text))
            /*.then(() => tab.close())
            .catch((err) => {
                console.log(err);
                //tab.close();
            });*/
    });
}, err => {
    //console.log(err);
})
//.then(() => tat.stop());
