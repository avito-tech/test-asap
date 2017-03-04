const socket = io('http://localhost:3000');

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

        properTab[data.command].apply(properTab, data.args)
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
    });
});
