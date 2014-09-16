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
});
