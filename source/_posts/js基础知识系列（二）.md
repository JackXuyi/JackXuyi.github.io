---
title: js基础知识系列（二）
date: 2019-07-28 17:44:02
tags: JavaScript
---

## 变量、作用域和内存问题

- 参数传递按值传递

  参数是引用数据类型时，传入数据是引用数据类型的地址

  ```javascript
  function setName(obj) {
    obj.name = "test1";
    obj = {};
    obj.name = "test2";
  }
  var test = {};
  setName(test);
  console.log(test.name); // test1
  ```

- 垃圾收集

  - 标记清除：进入环境标记，离开环境清除标记
  - 引用计数：跟踪每个值引用的次数，引用次数为 0 时，回收所占用内存，当相互引用时，由于引用计数永远无法为 0 而导致内存永远无法释放造成内存泄漏

  ```javascript
  function test() {
    var tesObj1 = {}; // tesObj1 引用加1 = 1
    var tesObj2 = {}; // tesObj2 引用加1 = 1
    tesObj1.test = tesObj2; // tesObj2 引用加1 = 2
    tesObj2.test = tesObj1; // tesObj1 引用加1 = 2
  } // tesObj1 引用减1 = 1， tesObj2 引用减1 = 1，tesObj1和tesObj2引用都不为0内存不释放
  ```

  - IE 中的`BOM`和`DOM`是`C++`中`COM`模型的实现，使用引用计数，在相互引用时请使用手动断开相互应用的方式释放内存

  ```javascript
  function test() {
    var ele = document.getElementById("root"); // tesObj1 引用加1 = 1
    var tesObj2 = {}; // tesObj2 引用加1 = 1
    ele.test = tesObj2; // tesObj2 引用加1 = 2
    tesObj2.test = ele; // ele 引用加1 = 2

    // 其它操作
    ele.test = null; // tesObj2 引用减1 = 1
    tesObj2.test = null; // ele 引用减1 = 1
  } // ele 引用减1 = 0， tesObj2 引用减1 = 0，ele和tesObj2引用都为0内存回收
  ```

- 管理内存
  - 局部变量会在离开执行环境时自动解除引用
  - 全局变量需要手动解除引用以释放占用内存
  ```javascript
  function createObj() {
    var temp = new Object();
    return temp;
  }
  var test = createObjt(); // 全局变量
  // 其它操作
  test = null； // 解除引用，释放内存
  ```

## 引用类型

- `Oject`类型
- `Array`类型
  - 数组初始化，默认值为`undefined`
  ```javascript
  var arr1 = [2, 3]; // 不推荐，IE8之前三个元素：1、2、undefined，其它为两个元素
  var arr2 = [, , ,]; // 不推荐，IE8之前4个元素都为undefined，其它为3个元素都为undefined
  ```
  - 数组长度，最大元素加 1，`length`可读写
  - 检测数组
    - 一个执行环境可以使用`instancof`，多个框架中传递数组且各自框架中的构造函数不同时无法检测
    - `ES5`使用`Array.isArray()`判断是否为数组，`IE9+`及其它
  - 转化方法，默认使用元素加`,`的方式拼接为字符串，可以使用`join`的方式拼接元素
  - 栈方法：`push`，`pop`
  - 队列方法：`push`，`shift`，通过`unshift`和`pop`模拟反向队列
  - 排序：`sort`和`reverse`（反转数组）
  - 操作方法
    - `concat`：连接两个数组产生新数组
    - `slice`：基于当前数组创建新数组
    - `splice`：向数组中插入项
  - 位置方法：`indexOf`和`lastIndexOf`
  - 迭代方法：`every`和`filter`和`forEach`和`some`和`map`
  - 归并方法：`reduce`和`reduceRight`，参数`function(prev, curr, index, array){return valur;}`
