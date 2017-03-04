/* eslint no-console: ["error", { allow: ["warn", "error", "log"] }] */
const tat = require('../');

function assert(condition, message) {
    return new Promise((resolve, reject) => {
        return condition ? resolve(condition) : reject(message);
    });
}

tat.start().then(Tab => {
    Tab.create('https://avito.ru').then((tab) =>

        tab.typeText('#search', 'test text')
            .then(() => tab.click('.search.button'))
            .then(() => tab.waitFor('.item'))
            .then(() => tab.getStyle('.item', 'background-color'))
            .then((color) => assert(color == 'rgb(255, 255, 255)'))
            .then(() => tab.countItems('.item'))
            .then((count) => assert(count > 3))
            .then(() => tab.getAttr('.item:nth-child(3) a', 'href'))
            .then(() => tab.hasClass('.item:nth-child(3) a', 'item-description-title-link'))
            .then((has) => assert(has))
            .then(() => tab.close())
            .catch((err) => {
                console.log(err);
                tab.close();
            })
    );
}, err => {
    console.log(err);
})
.then(() => tat.stop());
