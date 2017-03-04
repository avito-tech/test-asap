/* eslint no-console: ["error", { allow: ["warn", "error", "log"] }] */
const tat = require('../');

function assert(condition, message) {
    return new Promise((resolve, reject) => {
        return condition ? resolve(condition) : reject(message);
    });
}

tat.start().then(Tab => {
    return Tab.create('https://avito.ru/moskva').then((tab) => {
        return tab.typeText('#search', 'test text')
            .then(() => tab.click('.search.button'))
            .then(() => tab.waitFor('.item'))
            .then(() => tab.getStyle('.item', 'background-color'))
            .then((color) => assert(color == 'rgba(0, 0, 0, 0)', color))
            .then(() => tab.countItems('.item'))
            .then((count) => assert(count >= 3, 'less than 3  - ' + count))
            .then(() => tab.getAttr('.item:nth-child(3) .title a', 'href'))
            .then(() => tab.hasClass('.item:nth-child(3) .title a', 'item-description-title-link'))
            .then((has) => assert(has, 'has no class'))
            .then(() => tab.navigate('https://avito.ru'))
            .then(() => tab.waitFor('a'))
            .then(() => tab.getText('a'))
            .then(text => console.log(text))
            .then(() => tab.close())
            .catch((err) => {
                console.log(err);
                tab.close();
            })
    });
}, err => {
    console.log(err);
})
.then(() => tat.stop());
