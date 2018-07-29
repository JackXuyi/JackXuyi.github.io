---
title: js和react学习（一）
date: 2018-07-29 15:34:45
tags: JavaScript
---

## import和link的区别

+ link属于XHTML标签，而@import完全是CSS提供的一种方式。link标签除了可以加载CSS外，还可以做很多其它的事情，比如定义RSS，定义rel连接属性等，@import就只能加载CSS了。此处注意浏览器的link的src为空时候时会导致页面加载次数增多。
+ 当一个页面被加载的时候（就是被浏览者浏览的时候），link引用的CSS会同时被加载，而@import引用的CSS 会等到页面全部被下载完再被加载。
+ 由于@import是CSS2.1提出的所以老的浏览器不支持，@import只有在IE5以上的才能识别，而link标签无此问题。
+ 当使用javascript控制dom去改变样式的时候，只能使用link标签，因为@import不是dom可以控制的。


## 内存泄漏

再用到的内存，没有及时释放，就叫做内存泄漏（memory leak）。

+ 意外的全局变量，使用一个未定义的变量隐式把其设置为了全局变量
+ 被遗忘的计时器或回调函数，在定时器或者回调函数中使用条件语句由于条件变化导致的语句不可达，进而造成数据使用的内存无法释放
+ 脱离 DOM 的引用，对dom树节点的变量引用导致移出dom节点后仍然有变量引用节点造成无法回收占用的内存
+ 闭包，匿名函数可以访问父级作用域的变量导致父级作用域的变量无法释放造成内存泄漏

## 函数柯里化

只传递给函数一部分参数来调用它，让它返回一个函数去处理剩下的参数。
```
const addpp = (...argsa) => {
	let sum = 0;
	argsa.forEach(item => sum += item);
	const temp = (...args) => {
		args.forEach(item => sum += item);
		return temp;
    }
	temp.toString = temp.valueOf = () => {
        return sum; 
    }
	return temp;
}
```

## webpack核心

+ 入口(entry)：指示 webpack应该使用哪个模块，来作为构建其内部依赖图的开始。进入入口起点后，webpack 会找出有哪些模块和库是入口起点（直接和间接）依赖的。
+ 输出(output)：告诉 webpack 在哪里输出它所创建的bundles，以及如何命名这些文件，默认值为 ./dist。
+ loader：让 webpack 能够去处理那些非 JavaScript 文件（webpack 自身只理解 JavaScript）。loader 可以将所有类型的文件转换为 webpack能够处理的有效模块，然后你就可以利用 webpack 的打包能力，对它们进行处理。
+ 插件(plugins)：打包优化和压缩，一直到重新定义环境中的变量。

## MVC模式

+ M：核心的"数据层"（Model），也就是程序需要操作的数据或信息。
+ V：直接面向最终用户的"视图层"（View）。它是提供给用户的操作界面，是程序的外壳。
+ C："控制层"（Controller），它负责根据用户从"视图层"输入的指令，选取"数据层"中的数据，然后对其进行相应的操作，产生最终结果。

## Flux

##### Flux将一个应用分成四个部分

+ View： 视图层
+ Action（动作）：视图层发出的消息（比如mouseClick）
+ Dispatcher（派发器）：用来接收Actions、执行回调函数
+ Store（数据层）：用来存放应用的状态，一旦发生变动，就提醒Views要更新页面

##### Flux数据的"单向流动"

+ 用户访问 View
+ View 发出用户的 Action
+ Dispatcher 收到 Action，要求 Store 进行相应的更新
+ Store 更新后，发出一个"change"事件
+ View 收到"change"事件后，更新页面

## 堆栈的区别

+ 栈：后进先出，元素大小固定，保存js中的基本数据类型，Undefined、Null、Boolean、Number、String
+ 堆：内存中的一块区域，随机分配，保存大小不固定的数据类型，array、Object，但是在栈中保存存储地址

## new操作符做的事情

+ 创建空对象
+ 设置原型链
+ 让function的this指向obj，并执行fn的函数体
+ 判断fn的返回值类型，如果是值类型，返回obj。如果是引用类型，就返回这个引用类型的对象。
