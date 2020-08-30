---
title: babel编译过程
date: 2020-08-30 15:23:25
tags: JavaScript
---

### 编译步骤

Babel 编译文件的主要处理步骤依次是：解析（parse）、转换（transform）、生成（generate）。

- 解析：解析步骤主要是接受源代码并输出抽象语法树（AST）。此步骤主要由@babel/parser（原 Babylon）负责解析和理解 js 代码，输出对应的 AST。
- 转换：转换步骤主要是接受 AST，并对其进行遍历，在此过程中会进行分析和修改 AST，这也是 Babel 插件主要工作的地方。此步骤主要用到@babel/traverse 和@babel/types 两个包。
- 生成：生成步骤主要是将（经过一系列转换之后的）AST 再转换为正常的字符串代码。此步骤主要由@babel/generator 深度优先遍历整个 AST，然后构建可以表示转换后代码的字符串。

##### 注：AST 其实是一个每个节点包含特定属性的对象树

### 实现 babel 的编译过程

- 使用 `@babel/parser` 把代码格式化为 `AST` 树
- 使用 `@babel/traverse` 和 `@babel/types` 实现 `AST` 树的遍历及对树的特定节点的操作
- 使用 `@babel/generator` 生成目标代码

```js
const parser = require('@babel/parser')
const traverse = require('@babel/traverse').default
const type = require('@babel/types')
const generate = require('@babel/generator').default

const code = `
function test(n){
    return n + 1
}
`
const ast = parser.parse(code, { sourceType: 'module' }) // 把代码格式化为 AST 树

traverse(ast, {
  // 遍历 AST 树并进行操作
  enter(path) {
    // 从根节点到叶子节点遍历过程中
    console.log('enter', path.node.name)
    if (type.isIdentifier(path.node, { name: 'n' })) {
      // 把参数 n 转化成 x
      path.replaceWith(type.identifier('x'))
    }
  },
  exit(path) {
    // 从叶子节点到根节点遍历过程中
    console.log('exit', path.node.name)
  },
})

const target = generate(ast) // 生成代码

console.log(target.code)
/*
function test(x) {
  return x + 1;
}
*/
```

### 参考

- [Babel 插件手册](https://github.com/jamiebuilds/babel-handbook/blob/master/translations/zh-Hans/plugin-handbook.md#toc-writing-your-first-babel-plugin)
- [Babel 7 插件开发指南](https://github.com/Liaoct/blog/issues/14)
- [示例代码](https://github.com/JackXuyi/web-exercise/blob/master/babel/test.js)
