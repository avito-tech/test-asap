/* eslint no-console: ["error", { allow: ["warn", "error", "log"] }] */
'use strict';

const path = require('path');
const tat = require('../');
const sinon = require('sinon');
const stub = tat.stub;
const respondWith = tat.respondWith;

const link = '[role-marker="termsField/terms-link"]';
const terms = '[role-marker="termsDialog"]';

stub.https.withArgs(
    sinon.match.has('url', sinon.match('.jpg'))
).returns(
    respondWith.file(path.join(__dirname, 'actiagent/meow.jpg'))
);

stub.https.withArgs(
    sinon.match.has('url', sinon.match('/rest/text/terms/'))
).returns(
    respondWith.html('<h2>Meow!</h2>')
);

tat.start().then(
    Tab => {
        return Tab.create('https://actiagent.ru').then((tab) => {
            return tab.waitFor(link)
                .then(() => tab.click(link))
                .then(() => tab.waitFor(terms))
                .then(() => tab.getText(terms));
        });
    },
    err => {
        console.log(err);
    });
