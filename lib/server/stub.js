var sinon = require('sinon');

var httpStub = sinon.stub().returns((ctx, callback) => callback());
var httpsStub = sinon.stub().returns((ctx, callback) => callback());

module.exports = {
    http: httpStub,
    https: httpsStub
};
