---
title: js基础知识系列（七）
date: 2020-05-31 22:06:17
tags: JavaScript
---

## 函数

### 定义函数的方式

火狐、谷歌、safari、opera 存在属性 name 可以访问当前函数的 name

#### 函数声明

函数声明提升，即执行代码前会先读取函数声明

```js
// 函数声明
func(); // 函数声明提升，输出结果 func
function func(...args) {
  console.log(func.name); // func
}
```

#### 函数表达式

又称匿名函数或拉姆达函数

```js
// 函数表达式
func(); //  无提升，抛出异常 TypeError: func is not a function
var func = function (...args) {
  console.log(func.name); // func
};
```

### 递归调用

`arguments.callee` 指向正在执行的函数指针

```js
function func(...args) {
  console.log(arguments.callee.name); // func
}
```

### 闭包

有权访问另一个函数作用域中变量的函数

#### 执行环境和作用域

- 执行环境：定义变量或函数有权访问的其它数据
- 变量对象：与执行环境相关联的对象，环境中定义的所有变量或函数都保存在这个对象中
- 函数环境：将活动对象作为变量对象，活动对象最开始只包含一个对象，即 arguments 对象

#### 闭包与变量

闭包中保存的是整个变量对象，闭包中引用的变量都是指向这个环境变量对象的对应属性地址，而不是具体的值，在这个环境变量中定义的任何变量若不手动销毁都会一直存在一个引用

```js
var arr = [];
function test() {
  for (var i = 0; i < 4; i++) {
    arr[i] = function () {
      console.log(i);
    };
  }
}
test();
arr[2](); // 4

// 立即执行函数强制进行值传递
var arr = [];
function test() {
  for (var i = 0; i < 4; i++) {
    arr[i] = (function (j) {
      return function () {
        console.log(j);
      };
    })(i);
  }
}
test();
arr[2](); // 2
```

#### this 对象

匿名函数执行环境具有全局性。函数在调用时会自动获取 this 和 arguments 这两个对象，内部函数在搜索这两个变量时，只会搜索到活动对象为止

```js
var name = "window";
var test = {
  name: "test",
  getName: function () {
    // 存在活动对象，搜索到这里为止
    return function () {
      // 匿名函数执行环境具有全局性
      console.log(this.name); // window
    };
  },
};

test.getName()();
```

#### 模仿块级作用域

通过立即执行函数的方法模仿块级作用域

### 私有变量

通过闭包的方式在外层创建局部变量的方式实现私有变量，在内部函数中定义的可以操作外部私有属性的方法叫做特权方法

#### 静态私有变量

通过在原型中利用闭包的方式定义一个局部变量，然后在原型上定义一些特权方法实现对该变量的操作，实现所有实例共享同一个变量的方法

```js
(function () {
  let test = name; // 静态私有变量
  return function Sup(name) {
    this.prototype.getName = function () {
      return test;
    };

    this.prototype.setName = function (temp) {
      test = temp;
    };
  };
})();
```

#### 模块模式

- 单例：只有一个实例的对象
- 模块模式：通过对单例添加私有变量和特权方法增强单例

```js
const app = (function () {
  const arr = [];
  return {
    getCount: function () {
      return arr.length;
    },
    addComp: function (comp) {
      arr.push(comp);
    },
  };
})();
```

#### 增强的模块模式

通过实例对象，注入更多的属性

```js
const app = (function () {
  const obj = new Object(); // 实例对象
  let len = 10;
  obj.getCount = function () {
    return len;
  };
  return obj;
})();
```
