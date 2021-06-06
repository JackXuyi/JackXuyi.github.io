---
title: react中的jsx语法
date: 2021-06-06 14:30:07
tags: [JavaScript, react]
---

## `JSX`

`JSX` 是一种嵌入式的类似 `XML` 的语法。 它可以被转换成合法的 `JavaScript`，尽管转换的语义是依据不同的实现而定的。 `JSX` 因 `React` 框架而流行，但也存在其它的实现。

### `React` 中的 `JSX`

`JSX` 为我们提供了创建 `React` 元素方法（`React.createElement(component, props, ...children)`）的语法糖（`syntactic sugar`）

```jsx
const element = <div>Hello, world!</div>
// 编译后会被转化为
var element = React.createElement('div', null, 'Hello, world!') // 返回一个对象
```

#### `JSX` 代表 `JS` 对象

`JSX` 本身也是一个表达式，在编译后，`JSX` 表达式会变成普通的 `JavaScript` 对象。执行 `React.createElement` 之后最终会执行一下代码生成一个普通的 `JavaScript` 对象。

```js
const ReactElement = function (type, key, ref, self, source, owner, props) {
  const element = {
    // This tag allows us to uniquely identify this as a React Element
    $$typeof: REACT_ELEMENT_TYPE,

    // Built-in properties that belong on the element
    type: type,
    key: key,
    ref: ref,
    props: props,

    // Record the component responsible for creating this element.
    _owner: owner,
  }

  return element
}
```

由上可以看出，执行 `React.createElement` 时只支持表达式，同时可以在以下情况中使用

- 可以在 `if` 语句或 `for` 循环中使用 `JSX`
- 可以将它赋值给变量
- 可以将它作为参数接收
- 可以在函数中返回 `JSX`。

##### 表达式

在 `JavaScript` 中，表达式就是一个短语，`Javascript` 解释器会将其计算出一个结果，常量就是最简单的一类表达式。常用的表达式有：

- 变量名
- 函数定义表达式
- 属性访问表达式
- 函数调用表达式
- 算数表达式
- 关系表达式
- 逻辑表达式

注意: `if` 语句以及 `for` 循环不是 `JavaScript` 表达式

#### `JSX` 可自动防范注入攻击

在默认情况下，React DOM 会将所有嵌入 JSX 的值进行编码，利用 `createTextNode` 进行 `HTML` 转义

```js
export function createTextNode(text, rootContainerElement) {
  return getOwnerDocumentFromRootContainer(rootContainerElement).createTextNode(
    text
  )
}
```

若希望直接将字符串不经转义编码直接插入到 `HTML` 文档流，可以使用 `dangerouslySetInnerHTML` 属性，这是一个 `React` 版的 `innerHTML`，该属性接收一个 `key` 为 `__html` 的对象

#### 注意

- `JSX` 会自动删除一行中开头和结尾处的空白符；
- `JSX` 会自动删除空行；
- `JSX` 会删除紧邻标签的换行；
- `JSX` 会删除字符串中的换行；
- 字符串中的换行会被转换成一个空格。

#### 优点

- 允许使用熟悉的语法来定义 `HTML` 元素树
- 提供了更加语义化且易懂的标签
- 程序结构更容易被直观化
- 抽象了 `React Element` 的创建过程
- 可以随时掌控 `HTML` 标签以及生成这些标签的代码
- 原生 `Javascript`

### 参考

- [JSX](https://www.tslang.cn/docs/handbook/jsx.html)
- [JSX 语法使用详解](https://www.cnblogs.com/candlia/p/11920070.html)
