var Promise = require('../../../');
var Defer = Promise.Defer;
var expect = require('expect.js');
var async = require('async');

function waits(timeout) {
  return function (next) {
    setTimeout(next, timeout);
  }
}

function runs(fn) {
  return function (next) {
    if (fn.length) {
      fn(next);
    } else {
      fn();
      next();
    }
  }
}

describe('Defer', function () {
  it('progress works', function (done) {
    var defer = new Defer();
    var ret = [];
    defer.promise.progress(function (v) {
      ret.push(v);
    });
    defer.notify(1);
    defer.resolve(2);
    // invalid after resolve
    defer.notify(2);
    setTimeout(function () {
      expect(ret).to.eql([1]);
      done();
    }, 500);
  });

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

  it('works simply when fulfilled', function (done) {
    var d = Defer(),
      p = d.promise,
      r;

    expect(Promise.isPromise(d)).to.be(false);
    expect(Promise.isPromise(p)).to.be(true);
    expect(Promise.isResolved(p)).to.be(false);
    expect(Promise.isRejected(p)).to.be(false);


    p.then(function (v) {
      r = v;
    });

    async.series([
      waits(100),
      runs(function () {
        d.resolve(1);
      }),
      waits(100),
      runs(function () {
        expect(r).to.be(1);
        expect(Promise.isResolved(p)).to.be(true);
      })], done);
  });

  it('can access value after resolved', function (done) {
    var d = Defer(),
      r,
      p = d.promise;
    d.resolve(1);
    async.series([
      waits(100),
      runs(function () {
        expect(Promise.isResolved(p)).to.be(true);
        p.then(function (v) {
          r = v;
        });
      }),
      waits(100),
      runs(function () {
        expect(r).to.be(1);
        expect(Promise.isResolved(p)).to.be(true);
      })], done);
  });

  it('can access error after resolved', function (done) {
    var d = Defer(),
      r,
      p = d.promise;
    d.reject(1);
    async.series([
      waits(100),
      runs(function () {
        expect(Promise.isResolved(p)).to.be(false);
        expect(Promise.isRejected(p)).to.be(true);
        p.fail(function (v) {
          r = v;
        });
      }),
      waits(100),
      runs(function () {
        expect(r).to.be(1);
        expect(Promise.isResolved(p)).to.be(false);
        expect(Promise.isRejected(p)).to.be(true);
      })], done);
  });

  it('can transform returned value by chained promise', function (done) {
    var d = Defer(),
      p = d.promise,
      r;

    p.then(
      function (v) {
        return v + 1;
      }).then(function (v) {
        r = v;
      });
    async.series([
      waits(100),
      runs(function () {
        d.resolve(1);
      }),
      waits(100),
      runs(function () {
        expect(r).to.be(2);
      })], done);
  });

  it('should support promise chained promise', function (done) {
    var defer = Defer(),
      p = defer.promise,
      p2,
      v1, v2;
    p2 = p.then(
      function (v) {
        v1 = v;
        var d2 = Defer();
        setTimeout(function () {
          d2.resolve(1);
        }, 50);
        return d2.promise;
      }).then(
      function (v) {
        v2 = v;
      });
    async.series([
      waits(100),
      runs(function () {
        defer.resolve(2);
      }),
      waits(20),
      runs(function () {
        expect(Promise.isResolved(p)).to.be(true);
        // p2 is waiting for d2
        expect(Promise.isResolved(p2)).to.be(false);
      }),
      waits(100),
      runs(function () {
        expect(v1).to.be(2);
        expect(v2).to.be(1);
        expect(Promise.isResolved(p)).to.be(true);
        expect(Promise.isResolved(p2)).to.be(true);
      })], done);
  });

  it('should propagate error reason', function (done) {
    var d = Defer(),
      order = [],
      p = d.promise;

    var p2 = p.then(
      function (v) {
        order.push('e1 :' + v);
        throw 'e1';
      },
      function (r) {
        order.push('e2 :' + r);
        return 'e2';
      });

    var p3 = p2.then(
      function (v) {
        order.push('e3 :' + v);
        throw 'e3';
      },
      function (r) {
        order.push('e4 :' + r);
        throw 'e4';
      });

    p3.then(function (v) {
      order.push('e5 :' + v);
      throw 'e5';
    }, function (r) {
      order.push('e6 :' + r);
      throw 'e6';
    });

    async.series([
      waits(100),
      runs(function () {
        d.resolve(1);
      }),
      waits(50),
      runs(function () {
        expect(Promise.isRejected(p)).to.be(false);
        expect(Promise.isResolved(p)).to.be(true);

        expect(Promise.isRejected(p2)).to.be(true);
        expect(Promise.isResolved(p2)).to.be(false);

        // p2 rethrow
        expect(Promise.isRejected(p3)).to.be(true);
        expect(Promise.isResolved(p3)).to.be(false);
      }),
      waits(100),
      runs(function () {
        expect(order).to.eql(['e1 :1', 'e4 :e1', 'e6 :e4']);
      })], done);
  });

  it('should support error recovery', function (done) {
    var d = Defer(),
      order = [],
      p = d.promise;

    var p2 = p.then(
      function (v) {
        order.push('e1 :' + v);
        throw 'e1';
      },
      function (r) {
        order.push('e2 :' + r);
        return 'e2';
      });

    var p3 = p2.then(
      function (v) {
        order.push('e3 :' + v);
        throw 'e3';
      },
      function (r) {
        order.push('e4 :' + r);
        return 'e4';
      });

    p3.then(function (v) {
      order.push('e5 :' + v);
      throw 'e5';
    }, function (r) {
      order.push('e6 :' + r);
      throw 'e6';
    });
    async.series([
      waits(100),
      runs(function () {
        d.resolve(1);
      }),
      waits(50),
      runs(function () {
        expect(Promise.isRejected(p)).to.be(false);
        expect(Promise.isResolved(p)).to.be(true);

        expect(Promise.isRejected(p2)).to.be(true);
        expect(Promise.isResolved(p2)).to.be(false);

        // p2.error recovery
        expect(Promise.isRejected(p3)).to.be(false);
        expect(Promise.isResolved(p3)).to.be(true);
      }),
      waits(100),
      runs(function () {
        expect(order).to.eql(['e1 :1', 'e4 :e1', 'e5 :e4']);
      })], done);
  });

  it('should propagate error reason by default', function (done) {

    var d = Defer(),
      order = [],
      p = d.promise;

    var p2 = p.then(
      function (v) {
        order.push('e1 :' + v);
        throw 'e1';
      });

    var p3 = p2.then(
      function (v) {
        order.push('e3 :' + v);
        throw 'e3';
      });

    p3.then(function (v) {
      order.push('e5 :' + v);
      throw 'e5';
    }, function (r) {
      order.push('e6 :' + r);
      throw 'e6';
    });
    async.series([
      waits(100),
      runs(function () {
        d.resolve(1);
      }),
      waits(100),
      runs(function () {
        expect(order).to.eql(['e1 :1', 'e6 :e1']);
      })], done);
  });

  it('all works', function (done) {
    var defer1 = Defer();
    var defer2 = Defer();
    var r = [];
    var p = Promise.all([defer1.promise, defer2.promise]);
    p.then(function (v) {
      r = v;
    });
    async.series([
      waits(50),
      runs(function () {
        defer1.resolve(1);
      }),
      waits(50),
      runs(function () {
        expect(Promise.isResolved(defer1.promise)).to.be(true);
        expect(Promise.isResolved(defer2.promise)).to.be(false);
        expect(r).to.eql([]);
        expect(Promise.isResolved(p)).to.be(false);
      }),
      waits(50),
      runs(function () {
        defer2.resolve(2);
      }),
      waits(50),
      runs(function () {
        expect(Promise.isResolved(defer1.promise)).to.be(true);
        expect(Promise.isResolved(defer2.promise)).to.be(true);
        expect(r).to.eql([1, 2]);
        expect(Promise.isResolved(p)).to.be(true);
      })
    ], done);
  });
});