const tat = require('./index');

function assert(condition, message) {
    return new Promise((resolve, reject) => {
        return condition ? resolve(condition) : reject(message);
    });
}

var selector = '.ij';

tat.launch().then(Tab => {
    Tab.create('https://actiagent.ru').then((tab) => {
        console.log('here');
        tab.waitFor(selector)
            .then(() => tab.click(selector))
            // .then(() => tab.waitFor('.serp-item'))
            // .then(() => tab.getStyle('.serp-item', 'color'))
            // .then((color) => assert(color == 'rgb(51, 51, 51)', color))
            // .then(() => tab.countItems('.serp-item a'))
            // .then((count) => assert(count >= 3, 'less than 3  - ' + count))
            // .then(() => tab.getAttr('.serp-item a', 'href'))
            // // .then(href => alert(href))
            // .then(() => tab.hasClass('.serp-item a', 'organic__url'))
            // .then((has) => assert(has, 'has no class'))
            // .then(() => tab.close())
            .catch((err) => {
                console.log(err);
                // tab.close();
            });
    });
}, error => {
    console.log(error);
});
