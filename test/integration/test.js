/* eslint no-console: ["error", { allow: ["warn", "error", "log"] }] */
'use strict';

const testAsap = require('../..');
const sinon = require('sinon');
const match = sinon.match;
const fs = require('fs');
const http = require('http');

const htmlText = fs.readFileSync(__dirname + '/test.html', 'utf8');

describe('Test ASAP', function(){
    beforeAll(function(done) {
        testAsap.start().then(Tab => {
            this.Tab = Tab;
            done();
        });
    });

    afterAll(function(done) {
        testAsap.stop().then(done);
    });

    beforeEach(function() {
        testAsap.stub.reset();
    });

    afterEach(function(done) {
        if (this.tab) {
            this.tab.close().then(done, done.fail);
        } else {
            done();
        }
    });

    it('respondWith.jsonInterceptor', function(done) {
        let jsonServer;
        const response = {
            val: 'abc',
            items: [
                { name: 'a' },
                { name: 'b' }
            ]
        };
        const expected = JSON.stringify(modify(clone(response)));

        function clone(obj) {
            return JSON.parse(JSON.stringify(obj));
        }

        function modify(response) {
            response.val = response.val + 'def';
            response.items.length = 1;

            return response;
        }

        function startServer() {
            return new Promise(resolve => {
                jsonServer = http.createServer((req, res) => {
                    res.setHeader('Content-Type', 'application/json');
                    res.writeHead(200);

                    let responseStr = JSON.stringify(response);
                    res.write(responseStr.substring(0, 10));
                    setTimeout(function(){
                        res.end(responseStr.substring(10));
                    }, 1000);
                });

                jsonServer.listen(8080, resolve);
            })
        }
        function stopServer() {
            return new Promise(resolve => jsonServer.close(resolve));
        }

        function setInterceptor() {
            testAsap.stub.http.withArgs(
                testAsap.match.url('secret.json')
            ).returns(
                testAsap.respondWith.jsonInterceptor(modify)
            )
        }

        testAsap.stub.http.withArgs(
            testAsap.match.url('respondWith.html')
        ).returns(
            testAsap.respondWith.file(__dirname + '/respondWith.html')
        );

        startServer()
            .then(setInterceptor)
            .then(() => this.Tab.create('http://127.0.0.1:8080/respondWith.html'))
            .then(tab => this.tab = tab)
            .then(() => this.tab.waitFor('#result'))
            .then(() => this.tab.getText('#result'))
            .then(text => {
                expect(text).toBe(expected);
            })
            .then(stopServer)
            .then(done, done.fail)
    });

    it('just works', function(done) {
        testAsap.stub.https.withArgs(
            match.has('url', match('index.html'))
        ).returns(
            testAsap.respondWith.file(__dirname + '/test.html')
        );

        testAsap.stub.https.withArgs(
            match.has('url', match('1.json?q=some'))
        ).returns(
            testAsap.respondWith.json({tag: 'span', inner: 'secret'})
        );

        this.Tab.create('https://avito.ru/index.html')
            .then(tab => { this.tab = tab; })
            .then(() => this.tab.typeText('input', 'some'))
            .then(() => this.tab.waitForVisible('button'))
            .then(() => this.tab.click('button'))
            .then(() => this.tab.waitFor('span'))
            .then(() => this.tab.getText('span'))
            .then(text => expect(text).toBe('secret'))
            .then(done, done.fail);
    });
});
