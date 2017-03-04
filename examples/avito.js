const path = require('path');
const tat = require('../');

tat.stub.https.withArgs(
    tat.match.url('logo-avito.svg')
).returns(
    tat.respondWith.file(path.join(__dirname, 'avito/logo-avito.svg'))
);

const selectors = {
    input: '#search'
};

tat.start().then(
    Tab => Tab.create('https://avito.ru/moskva').then(
        tab => tab
            .waitFor(selectors.input)
            .then(() => tab.typeText(selectors.input, 'Avito layk'))
    ),
    err => {
        console.log(err);
    }
);
