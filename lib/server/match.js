'use strict';

const sinon = require('sinon');

function url(url) {
    return sinon.match.has('url', sinon.match(url));
}

module.exports = {
    url
};
