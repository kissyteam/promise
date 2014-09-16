# promise

promise/A+ implementation

[![promise](https://nodei.co/npm/modulex-promise.png)](https://npmjs.org/package/modulex-promise)
[![NPM downloads](http://img.shields.io/npm/dm/modulex-promise.svg)](https://npmjs.org/package/modulex-promise)
[![Build Status](https://secure.travis-ci.org/kissyteam/promise.png?branch=master)](https://travis-ci.org/kissyteam/promise)
[![Coverage Status](https://img.shields.io/coveralls/kissyteam/promise.svg)](https://coveralls.io/r/kissyteam/promise?branch=master)
[![Dependency Status](https://gemnasium.com/kissyteam/promise.png)](https://gemnasium.com/kissyteam/promise)
[![Bower version](https://badge.fury.io/bo/modulex-promise.svg)](http://badge.fury.io/bo/modulex-promise)
[![node version](https://img.shields.io/badge/node.js-%3E=_0.10-green.svg?style=flat-square)](http://nodejs.org/download/)

[![browser support](https://ci.testling.com/kissyteam/promise.png)](https://ci.testling.com/kissyteam/promise)

## example

### nodejs
```javascript
var Promise = require('modulex-promise');
var defer = Promise.Defer();
defer.promise.then(function (v) {
    alert(v);
});
defer.resolve(1);
defer.resolve(2);
```

### standalone
```html
<script src="build/promise-standalone-debug.js"></script>
<script>
    (function (Promise) {
        var defer = Promise.Defer();
        defer.promise.then(function (v) {
            alert(v);
        });
        defer.resolve(1);
        defer.resolve(2);
    })(XPromise);
</script>
```