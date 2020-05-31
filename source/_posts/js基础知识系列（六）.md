---
title: js基础知识系列（六）
date: 2020-05-31 16:17:10
tags: JavaScript
---

## 面向对象的程序设计

### 对象定义

无序属性的集合，其属性可以包含基本值、对象或函数

### 属性类型

#### 数据属性

- [[configurable]]: 表示能否通过 delete 删除属性从而重新定义属性，能否修改属性特性，能否把属性修改为访问器属性
- [[enumerable]]: 能否通过 for-in 循环返回属性
- [[writable]]: 能否修改属性值
- [[value]]: 属性值，默认 undefined

```js
let person = {};
Object.defineProperty(person, "test", {
  configurable: false,
  enumerable: false,
  writable: false,
  value: "hello world",
});

person.test = "test"; // 修改值

// 无法修改值
console.log(person.test); // "hello world"

// 无法修改属性特性
Object.defineProperty(person, "test", {
  configurable: false,
  enumerable: false,
  writable: false,
  value: "hello world 1",
}); // TypeError: Cannot redefine property: test

// 不能通过 for-in 循环返回属性
for (prop in person) {
  console.log(prop); // 无输出
}
```

#### 访问器属性

- [[configurable]]: 表示能否通过 delete 删除属性从而重新定义属性，能否修改属性特性，能否把属性修改为访问器属性
- [[enumerable]]: 能否通过 for-in 循环返回属性
- [[get]]: 读取属性时调用
- [[set]]: 写入属性时调用

```js
let person = {
  _test: "hello world",
};
Object.defineProperty(person, "test", {
  configurable: true,
  enumerable: true,
  get: function () {
    return this._test + " get";
  },
  set: function (value) {
    this._test = value + "set";
  },
});

// 通过 for-in 循环返回属性
for (prop in person) {
  console.log(prop); // test
}

person.test = "hello "; // 写入时调用 set
// 读取时调用 get
console.log(person.test); // hello set get
```

#### tips: 定义多个属性使用 `Object.defineProperties`, 示例如下

    ```js
    Object.defineProperties(person, {
        test: {
            value: "hello world"
        }
    })
    ```

#### 读取属性特性

`Object.getOwnPropertyDescriptor` 返回属性特性

```js
let person = {
  _test: "hello world",
};
Object.defineProperties(person, {
  test: {
    configurable: true,
    enumerable: true,
    get: function () {
      return this._test + " get";
    },
    set: function (value) {
      this._test = value + "set";
    },
  },
  test1: {
    configurable: false,
    enumerable: false,
    writable: false,
    value: "hello world 1",
  },
});

Object.getOwnPropertyDescriptor(person, "test"); // {enumerable: true, configurable: true, get: ƒ, set: ƒ}
Object.getOwnPropertyDescriptor(person, "test1"); // {value: "hello world 1", writable: false, enumerable: false, configurable: false}
```

### 创建对象

#### 工厂模式

```js
function createObj(name) {
  const obj = new Object();
  obj.name = name;
  return obj;
}
const t = createObj("test"); // {name: "test"}
```

- 优点：创建多个相似对象问题
- 缺点：无法识别对象

#### 构造函数

```js
function Obj(name) {
  this.name = name;
  this.sayName = function () {
    console.log(this.name);
  };
}
const obj1 = new Obj("test"); // {name: "test", sayName: ƒ}

// 识别对象
obj1 instanceof Obj; // true
```

- 创建新对象
- 新对象的作用域赋值给构造函数（this 指向了新对象）
- 执行构造函数中的代码
- 返回新对象

##### 优点

- 可以识别对象

##### 缺点

- 必须通过 new 操作符调用
- 每个方法都需要在实例上再创建一遍

#### 原型模式

每个函数都有一个 prototype (原型) 属性，这是一个指针，指向原型对象，这个对象包含这个类型的所有实例共享的属性和方法，prototype (原型) 属性默认包含一个 constructor 属性指向当前的构造函数。查找属性或者方法时优先从实例对象上查找，再从原型链上查找

- `in` 能查找到原型链上的属性
- `prototype.isPrototypeOf` 原型对象可以检测是否是对象的实例
- `hasOwnProperty` 属性是否只存在与实例中
- `Object.getOwnPropertyNames` 获取所有实例属性，无论是否可以枚举
- `Object.keys` 获取所有可以枚举实例属性

```js
function Test1() {
  //
}

Test1.prototype.name = "hello world";
Test1.prototype.sayName = function () {
  console.log(this.name);
};

const obj1 = new Test1();

obj1.name = "obj1";
// 当前实例属性
obj1.sayName(); // obj1

// 属性是否只存在与实例中
obj1.hasOwnProperty("name"); // true

delete obj1.name;
// 原型链上属性
obj1.sayName(); // hello world
// 属性是否只存在与实例中
obj1.hasOwnProperty("name"); // false

"sayName" in obj1; // true

// 检测是否是对象的实例
Test1.prototype.isPrototypeOf(obj1); // true

// 获取所有实例属性
Object.getOwnPropertyNames(Test1.prototype); // ["constructor", "name", "sayName"]
```

##### 对象方法创建原型

通过字面量的方法创建原型对象时 constructor 被指向了字面量的 constructor 指向的对象，可通过在字面量中指定 constructor 属性的方法确定 constructor 的指向

```js
function Test1() {
  //
}

Test1.prototype = {
  name: "hello world",
};

// constructor 被指向了 Object
const obj1 = new Test1();
console.log(obj1.constructor === Test1); // false
console.log(obj1.constructor === Object); // true
```

##### 原型的动态性

实例指向最原始的原型，不是指向构造函数，重写整个原型后可能导致重写之前调用的重写之后的属性无法访问

```js
function Test1() {
  //
}

const obj1 = new Test1();

Test1.prototype = {
  name: "hello world",
};

console.log(obj1.name); // undefined
```

##### 缺点

- 属性共享导致引用类型的修改反应在所有实例对象中

```js
function Test1() {}

Test1.prototype.sayName = function () {
  console.log(this.name.join(""));
};

Test1.prototype.name = ["name"];

const obj1 = new Test1();
const obj2 = new Test1();

obj1.name.push("test1");
obj1.sayName(); // nametest1

obj2.name.push("test2");
obj2.sayName(); // nametest1test2
```

#### 组合构造函数和原型模式

```js
function Test1(name) {
  this.name = ["name", name];
}

Test1.prototype.sayName = function () {
  console.log(this.name.join(""));
};

const obj1 = new Test1("test1");
const obj2 = new Test1("test2");

obj1.sayName(); // nametest1
obj2.sayName(); // nametest1
```

#### 动态原型模式

创建对象时检查原型上是否存在对应属性，不存在就创建，存在就跳过

```JS
function Obj(name) {
  this.name = name;
  if (typeof this.sayName !== "function") {
    this.sayName = function () {
        console.log(this.name);
    };
  }
}
```

#### 寄生构造函数

封装创建对象的过程，并返回创建的对象

```js
function SArray() {
  const arr = [];
  arr.push.apply(arr, arguments);
  arr.toPipeString = function () {
    return this.join(";");
  };
  return arr;
}

const arr = new SArray(1, 2, 3);
console.log(arr.toPipeString()); // 1;2;3
```

#### 稳妥构造函数

用闭包变量代替对象属性

```js
function Obj(name) {
  const o = {};
  o.sayName = function () {
    console.log(name);
  };
  return o;
}

const obj1 = new Obj("test1");
obj1.sayName(); // test1
```

### 继承

#### 原型链继承

通过原型查找的方式实现继承

#### 借用构造函数（伪造对象或经典继承）

在构造函数中通过 call 的方法调用父类的构造函数，无法复用方法属性等可以复用的属性

#### 组合继承

在构造函数中通过 call 的方法调用父类的构造函数继承属性，通过原型链的方式继承方法属性

#### 原型式继承

必须有一个对象作为另外一个对象的基础，`Object.create` 实现的原理

```js
function object(o) {
  function F() {}
  F.prototype = o;
  return new F();
}
```

#### 寄生式继承

封装继承过程，并增强对象

```js
function creatObj(obj) {
  const clone = object(obj);
  obj.sayHi = function () {
    console.log("hello world");
  };
  return clone;
}
```

#### 寄生组合式继承

通过增强对象的方法减少对父类构造函数的调用，减少多余属性的创建

```js
function inheritPropetype+(sub,sup) {
    const prop = object(sup.prorotype)
    prop.constructor = sub
    sup.prorotype = prop
}
```
