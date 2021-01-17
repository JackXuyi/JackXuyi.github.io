---
title: ES6模块与CommonJS模块
date: 2020-08-26 21:09:40
tags: JavaScript
---

### ES6 模块与 CommonJS 模块的区别

- CommonJS 模块输出的是一个值的拷贝，ES6 模块输出的是值的引用。
- CommonJS 模块是运行时加载，ES6 模块是编译时输出接口。（因为 CommonJS 加载的是一个对象（即 module.exports 属性），该对象只有在脚本运行完才会生成。而 ES6 模块不是对象，它的对外接口只是一种静态定义，在代码静态解析阶段就会生成。）
- CommonJS 模块的 require()是同步加载模块，ES6 模块的 import 命令是异步加载，有一个独立模块依赖的解析阶段。

#### ES6 模块输出的是值的引用

```js
// lib.mjs
let count = 1

setTimeout(() => {
  count = count + 1
}, 1000)

export { count }

// index.mjs
import { count } from './lib.mjs'

console.log('count', count) // 1

setTimeout(() => {
  console.log('timeout count', count) // 2
}, 1100)

count = 1000 // TypeError: Assignment to constant variable.
```

#### CommonJS 模块输出的是一个值的拷贝

```js
// lib.cjs
let count = 1

setTimeout(() => {
  count = count + 1
}, 1000)

module.exports = { count }

// index.cjs
let { count } = require('./lib.cjs')

console.log('count', count) // 1

setTimeout(() => {
  console.log('timeout count', count) // 1000
}, 1100)

count = 1000
```

##### 注

- 从 Node.js v13.2 版本开始，Node.js 已经默认打开了 ES6 模块支持
- Node.js 要求 ES6 模块采用.mjs 后缀文件名
- commonjs 模块采用.cjs 后缀文件名

### 循环引用

"循环加载"（circular dependency）指的是，a 脚本的执行依赖 b 脚本，而 b 脚本的执行又依赖 a 脚本。

#### CommonJS 模块的循环加载

CommonJS 模块的脚本代码在 require 的时候，就会全部执行，一旦出现某个模块被"循环加载"，就只输出已经执行的部分，还未执行的部分不会输出。

#### ES6 模块的循环加载

ES6 模块遇到模块加载命令 import 时，不会去执行模块，而是只生成一个引用。等到真的需要用到时，再到模块里面去取值，不存在缓存值的问题，而且模块里面的变量，绑定其所在的模块。

### 参考

- [ES6 模块与 CommonJS 模块的差异](https://es6.ruanyifeng.com/#docs/module-loader#%E6%B5%8F%E8%A7%88%E5%99%A8%E5%8A%A0%E8%BD%BD)
- [CommonJS 和 ES6 模块循环加载处理的区别](https://juejin.cn/post/6844903747290660878)
- [JavaScript 模块的循环加载](http://www.ruanyifeng.com/blog/2015/11/circular-dependency.html)
- [JavaScript 模块加载与循环引用](https://zhuanlan.zhihu.com/p/322529692)
- [测试代码链接](https://github.com/JackXuyi/web-exercise/tree/master/verification)
