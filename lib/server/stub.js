var sinon = require('sinon');

var httpStub;
var httpsStub;

function reset() {
    httpStub = sinon.stub().returns((ctx, callback) => callback());
    httpsStub = sinon.stub().returns((ctx, callback) => callback());
}

reset();

module.exports = {
    http: httpStub,
    https: httpsStub,
    reset
};
