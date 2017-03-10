# Test all the things!

# Idea
Idea of this package is to get all-in-one package ready to easily setup functional and integration testing.

This package consists of two main parts:
* browser launcher (Google Chrome)
* proxy programmable via Sinon.JS stubs

# Install
```
npm install <path-to-cloned-repo>
```
Note: you should have Google Chrome and Node.js with support of ES6 (at least v4.0)

# Getting started
Here is the sample script you can use to test browser commands:
```javascript
const tatt = require('test-all-the-things');

tatt.start().then(Tab => {
    return Tab.create('https://avito.ru/moskva').then((tab) => {
        return tab.typeText('#search', 'lala')
            .then(() => tab.click('.search.button'))
            .then(() => tab.waitFor('.item'))
            .then(() => tab.getAttr('.item a', 'href'))
            .then(href => console.log(href))
            .then(() => tab.close())
            .catch((err) => {
                console.log(err);
                tab.close();
            });
    });
}, err => {
    console.log(err);
})
.then(() => tatt.stop());
```
Note: for now this package uses ports 3000 and 8889 for communication. In order to work properly they should be free before running. Later this package will have ability to configure occupied ports

# Docs

## tatt.start()
`tatt.start` starts stubs proxy server and browser. It returns promise which will be resolved with `Tab` class used for monitoring.

Note: for now system designed in the way that permits running only one instance of `tatt`. So you should not try to run `tatt.start()` several times.

## tatt.stop()
`tatt.start` stops stubs proxy server and browser. It returns promise which will be resolved when everything was stopped.

## tatt.stubs
`tatt.stubs` contains Sinon.JS stubs used for programming proxy server behavior. It contains `http` and `https` stubs used in this way:
```javascript
stub.https.withArgs(
    sinon.match.has('url', sinon.match('/rest/text/terms/'))
).returns(
    ({ proxyToClientResponse: res }) => {
        res.setHeader('Content-Type', 'text/html');
        res.end(htmlText);
    }
);
```

Stub argument used for getting result function - is an incoming `ClientRequest` (see Node.js documentation). The result function will with [http-mitm-proxy Context object](https://github.com/joeferner/node-http-mitm-proxy/blob/master/README.md#context)

There is also `stubs.reset()` synchronous method which resets stubs to their default behavior (i.e. just proxying).

Note: you should not store `stubs.https` and `stubs.http` to variables because otherwise everything will be broken after `stubs.reset()`

## tatt.match
`tatt.match` contains helpers for simpler matching against often used rules.
### tatt.match.url(url)
Matches if request contains `url` as a substring
```javascript
tat.stub.https.withArgs(
    tat.match.url('logo-avito.svg')
).returns(
    tat.respondWith.file(path.join(__dirname, 'avito/logo-avito.svg'))
);
```

## tatt.respondWith
`tatt.respondWith` contains helpers for simpler responding with popular type of responses.
### tatt.respondWith.text(text)
`tatt.respondWith.text(text)` responds with `text` as plain text
```javascript
tat.stub.https.withArgs(
    sinon.match.any
).returns(
    tat.respondWith.text('Hello world!')
);
```
### tatt.respondWith.html(html)
`tatt.respondWith.html(html)` responds with `html` as html document
```javascript
tat.stub.https.withArgs(
    tat.match.url('index.html')
).returns(
    tat.respondWith.html('<h1>Hello world!</h1>')
);
```
### tatt.respondWith.json(jsObject)
`tatt.respondWith.json(jsObject)` stringifies `jsObject` and sends it as json
```javascript
tat.stub.https.withArgs(
    tat.match.url('/1.json')
).returns(
    tat.respondWith.json({ hello: 'world' })
);
```

### tatt.respondWith.file(absolutePathToFile)
`tatt.respondWith.file(absolutePathToFile)` responds with content of `absolutePathToFile`
```javascript
stub.https.withArgs(
    tatt.match.url('/res/7EiNlv7G_KCvanpivhp5XQ.jpg')
).returns(
    respondWith.file(path.join(__dirname, 'actiagent/meow.jpg'))
);
```

### tatt.respondWith.serveStatic(pathToCut, absolutePathToDir)
`tatt.respondWith.serveStatic(pathToCut, absolutePathToDir)` replaces drops `pathToCut` and prepends `absolutePathToDir` to the rest
```javascript
// Here /public/pics/1.jpeg will be answered with content of ../../pictures/1.jpeg
tat.stub.https.withArgs(
    tat.match.url('/public/pics')
).returns(
    tat.respondWith.json('/public/pics', path.join(__dirname, '../../pictures'))
);
```

## Tab methods

### Tab.load(url[, pageObject])
`Tab.load` - is an asynchronous `Factory Method`. It returns instance of `Tab` class.

It requires `url` for opening tab. But if the second param was specified it will also extend newly created tab with page object properties. For example the code below does the same thing as the code from "Getting started" section

```javascript
const tatt = require('test-all-the-things');

tatt.start().then(Tab => {
    return Tab.create('https://avito.ru/moskva', {
        button: '.search.button',
        item: '.item'
    }).then((tab) => {
        return tab.typeText('#search', 'lala')
            .then(() => tab.button.click())
            .then(() => tab.item.waitFor())
            .then(() => tab.getAttr('.item a', 'href'))
            .then(href => console.log(href))
            .then(() => tab.close())
            .catch((err) => {
                console.log(err);
                tab.close();
            });
    });
}, err => {
    console.log(err);
})
.then(() => tatt.stop());
```

### tab.waitFor(selector)
`tab.waitFor(selector)` returns promise to be resolved when element appeares on page.

Note: element may be hidden via `display: none;`, but in this case the promise will be resolved anyway. If you want to handle such cases use `tab.waitForVisible(selector)` instead

### tab.waitForVisible(selector)
`tab.waitFor(selector)` returns promise to be resolved when element becomes visible on page.
### tab.typeText(selector, text)
`tab.typeText(selector, text)` types `text` into node with `selector` selector. In the end it resolves the promise.
### tab.click(selector)
`tab.click(selector)` clicks on node with `selector`selector. In the end it resolves the promise.
### tab.countItems(selector)
`tab.countItems(selector)` returns promise to be resolved with number of element with `selector` selector presented on page.
### tab.isVisible(selector, className)
`tab.isVisible(selector, className)`  returns promise to be resolved with `true` if element is visible on page and `false` otherwise
### tab.getStyle(selector, propName)
`tab.getStyle(selector, propName)` returns promise to be resolved with computed `propName` style of element with `selector`.
### tab.getAttr(selector, attrName)
`tab.getAttr(selector, attrName)` returns promise to be resolved with `attrName` attribute of element with `selector` selector.
### tab.getText(selector)
`tab.getText(selector)` returns promise to be resolved with text content of element with `selector` selector
### tab.hasClass(selector, className)
`tab.hasClass(selector, className)` returns promise to be resolved with `true` if element has `className` class and `false` otherwise
### tab.reload()
`tab.reload()` reloads tab.
### tab.navigate(url)
`tab.navigate(url)` changes tab url.
### tab.close()
`tab.close()` closes tab.

## License

MIT
