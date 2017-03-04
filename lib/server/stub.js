var sinon = require('sinon');

var httpStub;
var httpsStub;

function reset() {
    httpStub = sinon.stub().returns((ctx, callback) => callback());
    httpsStub = sinon.stub().returns((ctx, callback) => callback());
}

reset();

module.exports = {
    get http() {
        return httpStub;
    },

    get https() {
        return httpsStub;
    },

    reset: reset
};
