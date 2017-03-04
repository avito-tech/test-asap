const path = require('path');
const tat = require('../');
const sinon = require('sinon');
const stub = tat.stub;
const {match, respondWith} = tat;

stub.https.withArgs(
    match.url('logo-avito.svg')
).returns(
    respondWith.file(path.join(__dirname, 'avito/logo-avito.svg'))
);

tat.start().then(Tab => {
    return Tab.create('https://avito.ru').then((tab) => {

    });
}, err => {
    //console.log(err);
});
