/* eslint no-console: ["error", { allow: ["warn", "error", "log"] }] */
'use strict';

const testAsap = require('../..');
const sinon = require('sinon');
const match = sinon.match;
const http = require('http');
const zlib = require('zlib');

describe('Test ASAP', function() {
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

    describe('respondWith.jsonTransformer', function() {
        beforeEach(function() {
            this.response = {
                val: 'abc',
                items: [
                    { name: 'a' },
                    { name: 'b' }
                ]
            };
            this.transform = function(response) {
                response.val = response.val + 'def';
                response.items.length = 1;

                return response;
            };
            this.expected = JSON.stringify(this.transform(clone(this.response)));

            function clone(obj) {
                return JSON.parse(JSON.stringify(obj));
            }

            this.startServer = () => {
                return new Promise(resolve => {
                    this.jsonServer = http.createServer(this.requestCallback);

                    this.jsonServer.listen(8080, resolve);
                });
            };
            this.stopServer = () => {
                return new Promise(resolve => this.jsonServer.close(resolve));
            };

            this.setInterceptor = () => {
                testAsap.stub.http.withArgs(
                    testAsap.match.url('secret.json')
                ).returns(
                    testAsap.respondWith.jsonTransformer(this.transform)
                );
            };

            testAsap.stub.http.withArgs(
                testAsap.match.url('respondWith.html')
            ).returns(
                testAsap.respondWith.file(__dirname + '/respondWith.html')
            );

            this.performTest = () =>
                this.startServer()
                    .then(this.setInterceptor)
                    .then(() => this.Tab.create('http://127.0.0.1:8080/respondWith.html'))
                    .then(tab => this.tab = tab)
                    .then(() => this.tab.waitFor('#result'))
                    .then(() => this.tab.getText('#result'))
                    .then(text => {
                        expect(text).toBe(this.expected);
                    })
                    .then(this.stopServer);
        });

        it('properly handles gzipped responses', function(done) {
            this.requestCallback = (req, res) => {
                res.setHeader('Content-Type', 'application/json');
                res.setHeader('Content-Encoding', 'gzip');
                res.writeHead(200);
                res.end(zlib.gzipSync(JSON.stringify(this.response)));
            };

            this.performTest()
                .then(done, done.fail);
        });

        it('properly handles chunked responses', function(done) {
            this.requestCallback = (req, res) => {
                res.setHeader('Content-Type', 'application/json');
                res.writeHead(200);

                let responseStr = JSON.stringify(this.response);
                res.write(responseStr.substring(0, 10));
                setTimeout(function() {
                    res.end(responseStr.substring(10));
                }, 1000);
            };

            this.performTest()
                .then(done, done.fail);
        });
    });

    it('properly determines visibility of inline elements', function(done) {
        testAsap.stub.http.withArgs(
            match.has('url', match('inline.html'))
        ).returns(
            testAsap.respondWith.file(__dirname + '/inline.html')
        );

        this.Tab.create('http://avito.ru/inline.html')
            .then(tab => {
                this.tab = tab;
            })
            .then(() => this.tab.waitFor('#invisible'))

            .then(() => this.tab.isVisible('#invisible'))
            .then(visible => expect(visible).toBe(false))

            .then(() => this.tab.isVisible('#visible'))
            .then(visible => expect(visible).toBe(true))

            .then(done, done.fail);
    });

    it('properly determines handles strange selectors', function(done) {
        testAsap.stub.http.withArgs(
            match.has('url', match('strange.html'))
        ).returns(
            testAsap.respondWith.file(__dirname + '/strange.html')
        );

        this.Tab.create('http://avito.ru/strange.html')
            .then(tab => {
                this.tab = tab;
            })
            .then(() => this.tab.waitFor('[role-marker="abc"]'))

            .then(() => this.tab.isVisible('[role-marker="abc"]'))
            .then(visible => expect(visible).toBe(true))

            .then(done, done.fail);
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
            testAsap.respondWith.json({ tag: 'span', inner: 'secret' })
        );

        this.Tab.create('https://avito.ru/index.html')
            .then(tab => {
                this.tab = tab;
            })
            .then(() => this.tab.typeText('input', 'some'))
            .then(() => this.tab.click('button'))
            .then(() => this.tab.waitFor('span'))
            .then(() => this.tab.getText('span'))
            .then(text => expect(text).toBe('secret'))
            .then(done, done.fail);
    });
});
