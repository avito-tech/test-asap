const tat = require('./index');

tat.launch().then(
    tab => {
        tab.load('http://google.com').then(() => {
            console.log(22);
            /*setTimeout(() => {
                tat.stop();
            }, 4000);*/

        });
    },
    error => {
        console.log(error);
    }
);
