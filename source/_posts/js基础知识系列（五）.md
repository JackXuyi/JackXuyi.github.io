---
title: js基础知识系列（五）
date: 2020-05-24 15:30:20
tags: JavaScript
---

# 单体内置对象

## Global 对象

### 定义

不属于任何对象的属性或方法

### 方法

- `isNaN`
- `isFinite`
- `paresInt`
- `paresFloat`

#### URI 编 / 解码方法

- encodeURI 对整个 URI 进行编码，URI 本身的特殊字符不做处理
- encodeURIComponent 只对 URI 中的部分字符做编码
- decodeURI 对整个 URI 进行解码，URI 本身的特殊字符不做处理
- decodeURIComponent 只对 URI 中的部分字符做解码

```JS
const uri = "https://www.baidu.com/illegal index.html#test"

encodeURI(uri) // https://www.baidu.com/illegal%20index.html#test
encodeURIComponent(uri) // https%3A%2F%2Fwww.baidu.com%2Fillegal%20index.html%23test
decodeURI(encodeURIComponent(uri)) // https%3A%2F%2Fwww.baidu.com%2Fillegal index.html%23test
decodeURIComponent(encodeURIComponent(uri)) // https://www.baidu.com/illegal index.html#test
```

#### eval 方法

eval 方法执行的代码包含本次调用的执行环境的一部分即被执行代码与当前代码有相同的作用域，相当于把代码执行结果插入当前位置，但是创建的函数或变量不会被提升

```JS
// 被执行代码与当前代码有相同的作用域
const test = {
    t: 1,
    test(){
        eval("console.log(this)")
    },
    test1(){
        console.log(this)
    }
}

test.test1() // {t: 1, test: ƒ, test1: ƒ}
test.test2() // {t: 1, test: ƒ, test1: ƒ}

// 创建的函数或变量不会被提升
test() // test
test1() // Uncaught ReferenceError: test1 is not defined
function test() {
    console.log("test")
}
eval("function test1(){console.log('test1')}")
test1() // test1

// 严格模式下无法访问 eval 中创建的变量或函数
'use strict'
eval("function test2(){console.log('test1')}")
test2() // Uncaught ReferenceError: test2 is not defined
```

##### 严格模式下无法访问 eval 中创建的变量或函数

### 属性

| 属性           | 说明     |
| :------------- | :------- |
| undefined      | 特殊值   |
| NaN            | 特殊值   |
| Infinity       | 特殊值   |
| Object         | 构造函数 |
| Array          | 构造函数 |
| Function       | 构造函数 |
| Boolean        | 构造函数 |
| String         | 构造函数 |
| Number         | 构造函数 |
| Date           | 构造函数 |
| RegExp         | 构造函数 |
| Error          | 构造函数 |
| EvalError      | 构造函数 |
| RageError      | 构造函数 |
| ReferenceError | 构造函数 |
| SyntaxError    | 构造函数 |
| TypeError      | 构造函数 |
| URIError       | 构造函数 |

### window 对象

web 浏览器把 Global 对象作为 window 的一部分来实现

#### 通用获取 Global 对象

```js
const global = (function () {
  return this;
})(); // 函数表达式
```

## Math 对象

### 属性

| 属性         | 说明                                |
| :----------- | :---------------------------------- |
| Math.E       | 自然对数的底数，即常量 e 的值       |
| Math.LN10    | 10 的自然对数                       |
| Math.LOG2E   | 2 的自然对数                        |
| Math.LOG10E  | 以 2 为底 e 的对数                  |
| Math.PI      | 圆周率                              |
| Math.SQRT1_2 | 1/2 的平方根（即 2 的平方根的倒数） |
| Math.SQRT2   | 2 的平方根                          |

### 方法

| 方法              | 说明          |
| :---------------- | :------------ |
| Math.min          | 最小值        |
| Math.max          | 最大值        |
| Math.ceil         | 向上取整      |
| Math.floor        | 向下取整      |
| Math.round        | 四舍五入      |
| Math.random       | 0 到 1 随机数 |
| Math.abs          | 绝对值        |
| Math.exp          | Math.E 的次幂 |
| Math.log          | 自然对数      |
| Math.pow          | 次幂          |
| Math.sqrt         | 平方根        |
| Math.acos         | 反余弦        |
| Math.asin         | 反正弦        |
| Math.atan         | 反余切        |
| Math.atan2(y / x) | y/x 的反正切  |
| Math.cos          | 余弦          |
| Math.sin          | 正弦          |
| Math.tan          | 正切          |
