const tat = require('../');

function assert(condition, message) {
    return new Promise((resolve, reject) => {
        return condition ? resolve(condition) : reject(message);
    });
}

var link = '[role-marker="termsField/terms-link"]';
var terms = '[role-marker="termsDialog"]';

tat.launch().then(Tab => {
    Tab.create('https://actiagent.ru').then((tab) => {
        tab.waitFor(link)
            .then(() => tab.click(link))
            .then(() => tab.waitFor(terms))
            .then(() => tab.getText(terms))
            .then(text => console.log(text))
            .then(() => tab.close())
            .catch((err) => {
                tab.close();
            });
    });
}, error => {
    console.log(error);
});
