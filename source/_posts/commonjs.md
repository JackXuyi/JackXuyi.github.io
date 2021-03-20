---
title: commonjs
date: 2021-03-02 23:44:49
tags: node
---

### commonjs 规范

- 模块引用：通过 `require` 方法把模块引入上下文
- 模块定义：模块中通过 `exports` 属性导出模块的方法和变量，`module` 代表模块自身
- 模块标识：传递给 `require` 方法的参数

### node 实现

##### 引入模块的流程

1. 路径分析
2. 文件定位
3. 编译执行

##### 模块分类

1. 核心模块：`Node` 源代码的编译过程中，编译进了二进制执行文件。`Node` 启动时已经被加载入内存中
2. 文件模块：运行时动态加载

#### 模块缓存

1. 引入过的模块都会进行缓存
2. 缓存优先

#### 路径分析和文件定位

##### 模块路径

`Node` 中在定位文件模块的具体文件时制定的查找策略，根据查找规则生成查找路径数组，查找规则如下

1. 查找当前目录下的 `node_modules` 目录
2. 父目录下的 `node_modules` 目录
3. 沿着路径向上逐级递归直到找到根目录的 `node_modules` 目录

##### 模块标志符分析

- 核心模块
- 相对路径模块和绝对路径模块：转化为真实路径作为索引来查找和缓存模块
- 非路径形式的文件模块

##### 文件定位

- 文件扩展名分析：`Node` 会按照 `.js`、`.json`、`.node`的次序依次尝试扩展名，尝试过程中会阻塞式的判断文件是否存在
- 目录分析与包：分析标识符得到一个文件夹时，`Node` 会按照 `package.json`、`index.js`、`index.json`、`index.node`来查找文件，若查找到 `package.json` 会提取 `main` 指定的文件来进行定位

#### 模块编译

定位到具体的文件之后，`Node` 会构建一个模块对象，然后根据路径载入并编译

```js
function Module(id, parent) {
  this.id = id
  this.parent = parent
  this.exports = {}
  this.filename = null
  this.loaded = false
  this.children = []

  if (parent && parent.children) {
    parent.children.push(this)
  }
}
```

##### 不同扩展名的载入方式

- `.js` 文件：通过 `fs` 模块同步读取文件后编译执行
- `.node` 文件：`c/c++` 写的扩展文件，通过 `dlopen()` 方法加载编译生成的文件
- `.json` 文件：通过 `fs` 模块同步读取文件后返回 `JSON.parse` 的结果
- 其它类型的文件：当作 `.js` 文件来处理

###### 注： 可以通过 `require.extensions[".ext"]` 的方式来扩展方式，但是已不推荐

##### `JavaScript` 模块的编译

`Node` 对获取的 `JavaScript` 文件内容做了包装，在头部添加了 `(function(exports, require, module, __filename, __dirname){\n`，在尾部添加了 `\n})`，包装之后的代码会通过 `vm` 原生的 `runInThisContext()` 方法执行，返回一个 `function` 对象，然后将当前模块对象的 `exports` 属性、`require` 方法、 `module`（模块对象自身）、模块定位中的完整文件路径和目录作为参数传递给这个函数执行，执行之后模块的 `exports` 属性被返回给了调用方

###### 注： `exports` 属性是作为形参传入的，直接赋值会改变形参的引用，通过 `module.exports` 赋值采用迂回的方案不改变形参的引用

##### `c/c++` 模块的编译

`Node` 调用 `process.dlopen` 方法进行加载和执行，模块的 `exports` 对象和 `.node` 模块产生联系并返回给调用者

- 优点： 执行效率高
- 缺点：门槛高

##### `JSON` 文件的编译

`Node` 利用 `fs` 模块同步读取 `JSON` 文件内容之后，调用 `JSON.parse` 方法得到对象，然后赋值给对象的 `exports` 属性供外部调用
