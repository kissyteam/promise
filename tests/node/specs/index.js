var Promise = require('../../../');
var expect = require('expect.js');
var Defer = Promise.Defer;
describe('Defer', function () {
    it('works for simple value', function (done) {
        var r;

        Promise.when(1,
            function (v) {
                r = v;
                return r + 1;
            }).then(function (v) {
                expect(r).to.be(1);
                expect(v).to.be(2);
                done();
            });
    });

    it('async works', function (done) {
        var rets = [];
        var promise1 = new Promise(function (resolve) {
            setTimeout(function () {
                resolve(1);
            }, 100);
        });


        var promise2 = new Promise(function (resolve, reject) {
            setTimeout(function () {
                reject(2);
            }, 100);
        });

        var promise3 = new Promise(function (resolve) {
            setTimeout(function () {
                resolve(3);
            }, 100);
        });

        var ret = Promise.async(function *() {
            var a = yield promise1;
            rets.push(a);
            try {
                var b = yield promise2;
            } catch (e) {
                rets.push(e);
            }
            var c = yield promise3;
            rets.push(c);
            rets.push(yield 4);
        })();
        ret.then(function (v) {
            expect(v).to.be(undefined);
            expect(rets).to.eql([1, 2, 3, 4]);
            done();
        }, function (reason) {

        });
    });
});
