function tab(io) {

    function load(url) {
        return new Promise((resolve, reject) => {
            io.on('tabLoaded', id => {
                resolve(id);
            });
            io.emit('loadTab', { url });
        });
    }

    return {
        load
    };

}

module.exports = tab;
