/* eslint no-console: ["error", { allow: ["log"] }] */
'use strict';

const path = require('path');
const tat = require('../');

tat.stub.https.withArgs(
    tat.match.url('logo-avito.svg')
).returns(
    tat.respondWith.file(path.join(__dirname, 'avito/logo-avito.svg'))
);

tat.start().then(
    Tab => Tab.create('https://avito.ru/moskva', {
        input: '#search'
    }).then(
        tab => tab.input
            .waitFor()
            .then(() => tab.input.typeText('Avito layk'))
    ),
    err => {
        console.log(err);
    }
);
