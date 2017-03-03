const socket = io('http://localhost:3000');

//////////////////////

socket.on('connect', () => {
    socket.on('tabCreate', data => {
        Tab.create(data.url).then(tab => {
            socket.emit('result', {
                success: true,
                result: tab.getId(),
                cid: data.cid
            });
        });
    });

    socket.on('command', data => {
        const properTab = tabsStorage[data.tabId];

        if (!properTab) {
            socket.emit('result', {
                success: false,
                result: { message: `Tab with id ${data.tabId} not found` }
            });
        }

        properTab[data.command](...data.args)
            .then((result) => {
                socket.emit('result', {
                    success: true,
                    result: result,
                    cid: data.cid
                });
            }, (error) => {
                socket.emit('result', {
                    success: false,
                    result: error,
                    cid: data.cid
                });
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
