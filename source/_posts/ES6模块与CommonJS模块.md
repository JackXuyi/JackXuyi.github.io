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

#### 参考

- [ES6 模块与 CommonJS 模块的差异](https://es6.ruanyifeng.com/#docs/module-loader#%E6%B5%8F%E8%A7%88%E5%99%A8%E5%8A%A0%E8%BD%BD)
- [测试代码链接](https://github.com/JackXuyi/web-exercise/tree/master/verification)
