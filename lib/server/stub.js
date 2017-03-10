'use strict';

const sinon = require('sinon');

let httpStub;
let httpsStub;

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
