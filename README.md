# Test all the things!

List of tasks:
1. Launch/stop Chrome and WS server
2. Selenium-like commands in extension
3. Proxy server
4. Server-side wrappings for extension commands
5. Integrational tests to verify it works
6. Presentation
7. Register name on npm
8. Icon
9. (coverage reports - if will have much time)

```javascript
function assert(condition) {
  return new Promise((resolve, reject) => {
    condition ? resolve(condition) : reject(condition);
  });
}

Tab.load('https://www.avito.ru/moskva').then((tab) => {
  tab.typeText('#search', 'test text'))
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
});
```
