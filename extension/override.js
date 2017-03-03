// var socket = io('http://localhost:3000');

// socket.on('message', function(event) {
//   alert(event.time);
// });

// move mouse to the

// TODO wait for element to appear
// TODO wait for element to be visible
// TODO isVisible
// TODO presents
// TODO wrap debuggee

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

var typeText = function(debuggee, querySelector, text) {
  return click(debuggee, querySelector) // focus
    .then(() => typeChars(debuggee, querySelector, text))
};

var typeChars = function(debuggee, querySelector, text) {
  if (!text) {
    return Promise.resolve();
  }

  return typeChar(debuggee, querySelector, text[0])
    .then(() => typeChars(debuggee, querySelector, text.substr(1)));
};

var typeChar = function(debuggee, querySelector, char) {
  var keyCode = getKeyCode(char);

  return command(debuggee, 'Input.dispatchKeyEvent', {
    nativeVirtualKeyCode: keyCode,
    text: '',
    type: 'rawKeyDown',
    unmodifiedText: '',
    windowsVirtualKeyCode: keyCode
  })
    .then(() =>
      command(debuggee, 'Input.dispatchKeyEvent', {
        nativeVirtualKeyCode: 0,
        text: char,
        type: 'char',
        unmodifiedText: char,
        windowsVirtualKeyCode: 0
      })
    )
    .then(() =>
      command(debuggee, 'Input.dispatchKeyEvent', {
        nativeVirtualKeyCode: keyCode,
        text: '',
        type: 'keyUp',
        unmodifiedText: '',
        windowsVirtualKeyCode: keyCode
      })
    );
};

var command = function(debuggee, commandName, params = {}) {
  return new Promise(function(resolve, reject) {
    chrome.debugger.sendCommand(debuggee, commandName, params, resolve);
  });
};


var attach = function(debuggee) {
  return new Promise(function(resolve) {
    chrome.debugger.attach(debuggee, '1.2', resolve);
  });
};

var click = function(debuggee, querySelector) {
  querySelector = querySelector.replace('"', '\\"');

  return command(debuggee, 'Runtime.evaluate', { expression: 'rect = document.querySelector("' + querySelector + '").getBoundingClientRect(), { top: rect.top, bottom: rect.bottom, left: rect.left, right: rect.right }', returnByValue: true })
    .then(result => {
      var rect = result.result.value;
      var centerX = (rect.left + rect.right) / 2;
      var centerY = (rect.top + rect.bottom) / 2;
      command(debuggee, 'Runtime.evaluate', { expression: 'document.querySelector("' + querySelector + '").scrollIntoViewIfNeeded()' })
        .then(() => command(debuggee, 'Input.dispatchMouseEvent', { x: centerX, y: centerY, type: 'mouseMoved', button: 'none', clickCount: 0 }))
        .then(() => command(debuggee, 'Input.dispatchMouseEvent', { x: centerX, y: centerY, type: 'mousePressed', button: 'left', clickCount: 1 }))
        .then(() => command(debuggee, 'Input.dispatchMouseEvent', { x: centerX, y: centerY, type: 'mouseReleased', button: 'left', clickCount: 1 }));
    });
};

var waitForTabToLoad = function(debuggee) {
  return new Promise(function(resolve) {
    chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
      if (tabId === debuggee.tabId && changeInfo.status && changeInfo.status == 'complete') {
        resolve(debuggee);
      }
    });
  });
}