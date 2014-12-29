# Simple Usage
---

````js
var Promise = require('../');
var start = + new Date();
console.log('start at: '+(start));
new Promise(function(resolve){
    setTimeout(resolve,1000);
}).then(function(){
    var now = + new Date();
    console.log('end at: '+(now));
    console.log('duration: '+(now-start));
});
````