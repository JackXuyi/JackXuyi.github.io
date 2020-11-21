---
title: for...in和for...of的区别
date: 2020-11-21 17:09:16
tags: JavaScript
---

### Iterator（遍历器）的概念

遍历器（Iterator）一种接口，为各种不同的数据结构提供统一的访问机制。任何数据结构只要部署 Iterator 接口，就可以完成遍历操作（即依次处理该数据结构的所有成员）。

#### Iterator 的作用

- 为各种数据结构，提供一个统一的、简便的访问接口。
- 使得数据结构的成员能够按某种次序排列。
- ES6 创造了一种新的遍历命令 for...of 循环，Iterator 接口主要供 for...of 消费。

#### Iterator 的遍历

1. 创建一个指针对象，指向当前数据结构的起始位置。也就是说，遍历器对象本质上，就是一个指针对象。
2. 第一次调用指针对象的 next 方法，可以将指针指向数据结构的第一个成员。
3. 第二次调用指针对象的 next 方法，指针就指向数据结构的第二个成员。
4. 不断调用指针对象的 next 方法，直到它指向数据结构的结束位置。

#### Iterator 接口

一种数据结构只要部署了 Iterator 接口，我们就称这种数据结构是“可遍历的”（iterable）。ES6 规定，默认的 Iterator 接口部署在数据结构的 Symbol.iterator 属性，或者说，一个数据结构只要具有 Symbol.iterator 属性，就可以认为是“可遍历的”（iterable）。Symbol.iterator 属性本身是一个函数，就是当前数据结构默认的遍历器生成函数。执行这个函数，就会返回一个遍历器。

##### ES6 原生具备 Iterator 接口的数据结构

- Array
- Map
- Set
- String
- TypedArray
- 函数的 arguments 对象
- NodeList 对象

#### 调用 Iterator 接口的场合

- 解构赋值
- 扩展运算符
- yield\*
- for...of
- Array.from()
- Map(), Set(), WeakMap(), WeakSet()
- Promise.all()
- Promise.race()

#### 遍历器对象的 return()，throw()

遍历器对象除了具有 next()方法，还可以具有 return()方法和 throw()方法。

- 如果 for...of 循环提前退出（通常是因为出错，或者有 break 语句），就会调用 return()方法。
- throw()方法主要是配合 Generator 函数使用，一般的遍历器对象用不到这个方法。

### for...in 和 for...of 的区别

- 对于普通的对象，for...in 循环可以遍历键名，for...of 循环会报错。

#### for...in 遍历数组的缺点

- 数组的键名是数字，但是 for...in 循环是以字符串作为键名“0”、“1”、“2”等等。
- for...in 循环不仅遍历数字键名，还会遍历手动添加的其他键，甚至包括原型链上的键。
- 某些情况下，for...in 循环会以任意顺序遍历键名。

#### for...of 遍历数组的优点

- 有着同 for...in 一样的简洁语法，但是没有 for...in 那些缺点
- 不同于 forEach 方法，它可以与 break、continue 和 return 配合使用。
- 提供了遍历所有数据结构的统一操作接口。
