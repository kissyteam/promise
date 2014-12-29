/**
 * es6 promise api
 * @author yiminghe@gmail.com
 */

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

describe('es6 promise', function () {
  describe('constructor', function () {
    it('resolve sync works', function (done) {
      var obj = {};
      var promise = new Promise(function (resolve) {
        resolve(obj);
      });
      promise.then(function (ret) {
        expect(ret).to.be(obj);
        done();
      });
    });

    it('reject sync works', function (done) {
      var obj = {};
      var promise = new Promise(function (resolve, reject) {
        reject(obj);
      });
      promise.then(undefined, function (ret) {
        expect(ret).to.be(obj);
        done();
      });
    });

    it('resolve async works', function (done) {
      var obj = {};
      var promise = new Promise(function (resolve) {
        setTimeout(function () {
          resolve(obj);
        }, 100);
      });
      promise.then(function (ret) {
        expect(ret).to.be(obj);
        done();
      });
    });

    it('reject async works', function (done) {
      var obj = {};
      var promise = new Promise(function (resolve, reject) {
        setTimeout(function () {
          reject(obj);
        }, 100);
      });
      promise.then(undefined, function (ret) {
        expect(ret).to.be(obj);
        done();
      });
    });

    it('catch function parameter', function (done) {
      var obj = {};
      var promise = new Promise(function (resolve, reject) {
        if (1) {
          throw obj;
        }
        reject(2);
      });
      promise.then(undefined, function (ret) {
        expect(ret).to.be(obj);
        done();
      });
    });
  });

  describe('cast', function () {
    it('cast promise works', function () {
      var defer = new Defer();
      expect(Promise.cast(defer.promise)).to.be(defer.promise);
    });

    it('cast common obj works', function (done) {
      var obj = {};
      Promise.cast(obj).then(function (obj2) {
        expect(obj).to.be(obj2);
        done();
      });
    });
  });

  describe('resolve', function () {
    it('resolve thenable works', function (done) {
      var defer = new Defer();
      var casted = Promise.resolve(defer.promise);
      expect(casted).not.to.be(defer.promise);
      var obj = {};
      defer.resolve(obj);
      var obj2;
      casted.then(function (ret) {
        obj2 = ret;
        expect(obj2).to.be(obj);
        done();
      });
    });

    it('resolve common obj works', function (done) {
      var obj = {};
      Promise.resolve(obj).then(function (obj2) {
        expect(obj).to.be(obj2);
        done();
      });
    });
  });

  it('reject works', function (done) {
    var error = new Error({});
    Promise.reject(error).then(undefined, function (reason) {
      expect(reason).to.be(error);
      done();
    });
  });

  if (window.Promise) {
    describe('native promise', function () {
      it('can interoperate with native promise', function (done) {
        var n;
        var p = new Promise(function (resolve) {
          resolve(n = new window.Promise(function (resolve) {
            resolve(1);
          }));
        });
        p.then(function (v) {
          expect(v).to.be(1);
          done();
        });
      });
    });
  }
});