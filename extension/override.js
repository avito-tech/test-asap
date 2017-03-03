var attach = function(debuggee) {
    return new Promise(function(resolve) {
        chrome.debugger.attach(debuggee, '1.2', resolve);
    });
};

function waitForTabToLoad(debuggee) {
    return new Promise(function(resolve) {
        chrome.tabs.onUpdated.addListener(function(tabId, changeInfo) {
            if (tabId === debuggee.tabId && changeInfo.status && changeInfo.status == 'complete') {
                resolve(debuggee);
            }
        });
    });
}

function command(debuggee, commandName, params) {
    params = params || {};

    return new Promise(function(resolve) {
        // TODO reject and runtem.lastError
        chrome.debugger.sendCommand(debuggee, commandName, params, resolve);
    });
}

function getKeyCode(char) {
    var A_CHAR_CODE = 'a'.charCodeAt(0);
    var A_KEY_CODE = 41;
    var ZERO_CHAR_CODE = '0'.charCodeAt(0);
    var ZERO_KEY_CODE = 30;

    switch (char) {
        case ' ':
            return 20;
        case '-':
            return 189;
        case ',':
            return 188;
        case '.':
            return 190;

        default:
            if (char.match(/[0-9]/i)) {
                return char.toLowerCase().charCodeAt(0) - ZERO_CHAR_CODE + ZERO_KEY_CODE;
            }

            if (char.match(/[a-z]/i)) {
                return char.toLowerCase().charCodeAt(0) - A_CHAR_CODE + A_KEY_CODE;
            }

            return 20;
    }
}

class Tab {
    constructor(debuggee) {
        this.debuggee = debuggee;
    }

    click(querySelector) {
        querySelector = querySelector.replace('"', '\\"');

        return this.command('Runtime.evaluate', { expression: 'document.querySelector("' + querySelector + '").scrollIntoViewIfNeeded()' })
      .then(() =>
        this.command('Runtime.evaluate', {
            expression: 'rect = document.querySelector("' + querySelector + '").getBoundingClientRect(), { top: rect.top, bottom: rect.bottom, left: rect.left, right: rect.right }',
            returnByValue: true
        })
      )
      .then(result => {
          let rect = result.result.value;
          let centerX = (rect.left + rect.right) / 2;
          let centerY = (rect.top + rect.bottom) / 2;

          return this.command('Input.dispatchMouseEvent', {
              x: centerX,
              y: centerY,
              type: 'mouseMoved',
              button: 'none',
              clickCount: 0
          })
          .then(() =>
            this.command('Input.dispatchMouseEvent', {
                x: centerX,
                y: centerY,
                type: 'mousePressed',
                button: 'left',
                clickCount: 1
            })
          )
          .then(() =>
            this.command('Input.dispatchMouseEvent', {
                x: centerX,
                y: centerY,
                type: 'mouseReleased',
                button: 'left',
                clickCount: 1
            })
          );
      });
    }

    typeText(selector, text) {
        return this.click(selector) // focus
        .then(() => this._typeChars(selector, text));
    }

    // waitFor(selector)

    _command(commandName, args) {
        return command(this.debuggee, commandName, args);
    }

    _typeChars(selector, text) {
        if (!text) {
            return Promise.resolve();
        }

        return this._typeChar(selector, text[0])
      .then(() => this._typeChars(selector, text.substr(1)));
    }

    _typeChar(querySelector, char) {
        let keyCode = getKeyCode(char);

        return this.command('Input.dispatchKeyEvent', {
            nativeVirtualKeyCode: keyCode,
            text: '',
            type: 'rawKeyDown',
            unmodifiedText: '',
            windowsVirtualKeyCode: keyCode
        })
      .then(() =>
        this.command('Input.dispatchKeyEvent', {
            nativeVirtualKeyCode: 0,
            text: char,
            type: 'char',
            unmodifiedText: char,
            windowsVirtualKeyCode: 0
        })
      )
      .then(() =>
        this.command('Input.dispatchKeyEvent', {
            nativeVirtualKeyCode: keyCode,
            text: '',
            type: 'keyUp',
            unmodifiedText: '',
            windowsVirtualKeyCode: keyCode
        })
      );
    }
}

Tab.create = (location) => {
    return new Promise(function(resolve, reject) {
        chrome.tabs.create({ url: location, active: true, index: 0 }, (tab) => {
            let debuggee = { tabId: tab.id };
            let tabObj = new Tab(debuggee);

            waitForTabToLoad(debuggee)
                .then(() => attach(debuggee))
                .then(() => {
                    resolve(tabObj);
                })
                .catch(reject);
        });
    });
};

// function assert(condition) {
//     return new Promise((resolve, reject) => {
//         return condition ? resolve(condition) : reject(condition);
//     });
// }
