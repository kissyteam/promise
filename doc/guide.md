### 使用说明

“Promises” （有时也称之为deferred）代表着在javascript程序里一种巧妙的编程范式，它代表了一种可能会长时间运行而且不一定必须完整的操作的结果。这种模式不会阻塞和等待长时间的操作完成，而是返回一个代表了承诺的（promised）结果的对象。因此它的核心就是一个promise，代表一个任务结果，这个任务有可能完成有可能没完成。Promise模式唯一需要的一个接口是调用then方法，它可以用来注册当promise完成或者失败时调用的回调函数阅读，详情请[CommonJS Promises/A proposal](http://wiki.commonjs.org/wiki/Promises/A) 。

### 代码第一形态

实现一个单体，可以传入回调参数，在某个事件发生时触发这个回调，通常我们这样做：

	var A = {
		a:1,
		b:2,
		complete:function(){
			// 某个时机触发这个回调
		},
		error:function(){
			// 运行出错时的回调
		}
	};

	A.init();

这很容易理解，但这段代码忽略了两个信息

1. complete 回调有可能不是在初始化的时候绑定，我们允许在任意位置指定他的回调
2. 如果指定多个回调时，这些回调之间的先后顺序如何控制

### 代码第二形态

这个单体暴露事件，由开发者去绑定事件，事件可以任意绑定

	// 让 A 可暴露自定义事件
	var AFactory = new Function;
	augment(AFactory,CustomEvent);
	var A = new AFactory();

	// 给 A 绑定自定义事件回调
	A.on('complete',function(){
		// 某个时机触发这个回调
	});

	A.on('error',function(){
		// 运行出错时的回调
	});

	A.run();

这也很容易理解，这是编程模式中最常见的桥接模式，用来完成核心代码和功能代码之间的耦合和桥接。核心代码和功能代码之间就可以分别来维护了。但当 A 的功能很具体而且很内聚时，可以将这种模式简化为回调：

	A.complete(function(){
		// 某个时机触发这个回调
	}).error(function(){
		// 运行出错时的回调
	});

	A.run();

这是一种最常见的简写

### 代码第三形态

异步操作过程可能耗时很久，但通过写状态可以处理外接逻辑的触发时机先后顺序。这样，回调逻辑从“当xx时触发yy回调”，变为“当xx状态改变为yy时，触发zz回调”。即回调在等待状态改变，这种很语义话的表达方式被抽象出来，即形成了Promise的雏形：

	A.run().then(function(){
		// 回调1	
	}).then(function(){
		// 回调2	
	});

独立出Promise对象：

	var A = {};/* A 的定义 */
	var p1 = new Promise(A);
	p1.when(/*条件*/).then(/*行为*/);

### KISSY Promise 的用法

    var Promise = require('promise');
	var d = new Promise.Defer();
    setTimeout(function() {d.reject("reject")}, 1000);
    var promise = d.promise;
    promise.done(function(){  //done和then不同的是：如果没有设置回调函数去处理reject则会抛出异常在控制台输出
        alert('success');
    });
