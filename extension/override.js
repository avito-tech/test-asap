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

const WAITING_TIMEOUT_IN_MILLISECS = 10000;

class Tab {
    constructor(debuggee) {
        this.debuggee = debuggee;
        this._documentUpdatedHandlers = [];
    }

    click(querySelector) {
        querySelector = querySelector.replace('"', '\\"');

        return this._command('Runtime.evaluate', {
            expression: 'document.querySelector("' + querySelector + '").scrollIntoViewIfNeeded()'
        })
            .then(() =>
                this._command('Runtime.evaluate', {
                    expression: 'rect = document.querySelector("' + querySelector + '").getBoundingClientRect(), { top: rect.top, bottom: rect.bottom, left: rect.left, right: rect.right }',
                    returnByValue: true
                })
            )
            .then(result => {
                let rect = result.result.value;
                let centerX = (rect.left + rect.right) / 2;
                let centerY = (rect.top + rect.bottom) / 2;
                return this._command('Input.dispatchMouseEvent', {
                    x: centerX,
                    y: centerY,
                    type: 'mouseMoved',
                    button: 'none',
                    clickCount: 0
                })
                .then(() =>
                    this._command('Input.dispatchMouseEvent', {
                        x: centerX,
                        y: centerY,
                        type: 'mousePressed',
                        button: 'left',
                        clickCount: 1
                    })
                )
                .then(() =>
                    this._command('Input.dispatchMouseEvent', {
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

        return this._command('Input.dispatchKeyEvent', {
            nativeVirtualKeyCode: keyCode,
            text: '',
            type: 'rawKeyDown',
            unmodifiedText: '',
            windowsVirtualKeyCode: keyCode
        })
            .then(() =>
              this._command('Input.dispatchKeyEvent', {
                  nativeVirtualKeyCode: 0,
                  text: char,
                  type: 'char',
                  unmodifiedText: char,
                  windowsVirtualKeyCode: 0
              })
            )
            .then(() =>
              this._command('Input.dispatchKeyEvent', {
                  nativeVirtualKeyCode: keyCode,
                  text: '',
                  type: 'keyUp',
                  unmodifiedText: '',
                  windowsVirtualKeyCode: keyCode
              })
            );
    }

    close() {
        return new Promise(resolve => chrome.tabs.remove(this.debuggee.tabId, resolve));
    }

    countItems(selector) {
        return new Promise((resolve) => {
            this._command('Runtime.evaluate', {
                expression: 'document.querySelectorAll("' + selector + '").length',
                returnByValue: true
            })
                .then(result => {
                    resolve(result.result.value);
                });
        });
    }

    _onDocumentUpdated() {
        alert('asdfadsf');
        let args = arguments;

        this._documentUpdatedHandlers.forEach(handler => handler.apply(this, args));
    }

    _handleDocumentUpdated(fn) {
        if (this._documentUpdatedHandled) {
            return Promise.resolve();
        }
        chrome.debugger.onEvent.addListener(this._onDocumentUpdated);

        this._documentUpdatedHandlers.push(fn);
    }

    _unhandleDocumentUpdated(fn) {
        this._documentUpdatedHandlers =
            this._documentUpdatedHandlers.filter(h => h != fn);
    }

    _handleForAppearance(selector, timeout) {
        return new Promise((resolve, reject) => {
            let timeoutId;

            let handler = () => {
                this.countItems(selector)
                    .then(exists => {
                        if (exists) {
                            this._unhandleDocumentUpdated(handler);
                            clearTimeout(timeoutId);
                            resolve();
                        }
                    });
            };

            this._handleDocumentUpdated(handler);

            timeoutId = setTimeout(() => {
                this._unhandleDocumentUpdated(handler);
                reject();
            }, timeout);
        });
    }

    waitFor(selector) {
        return this._enableDOM()
            .then(() => this.countItems(selector))
            .then(present => {
                if (present > 0) {
                    return Promise.resolve();
                } else {
                    return this._handleForAppearance(selector, WAITING_TIMEOUT_IN_MILLISECS);
                }
            });
    }

    _enableDOM() {
        if (this._domEnabled) {
            return Promise.resolve();
        } else {
            return this._command('DOM.enable')
                .then(() => {
                    this._domEnabled = true;
                });
        }
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
