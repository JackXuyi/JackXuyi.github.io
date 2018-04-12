---
title: js继承
date: 2018-04-11 22:13:55
tags: JavaScript
---

js中的prototype是一个指针

基础的父类
```
function Parent(name) {
  this.name = name; // 会被实例共享但不会被修改
}
Parent.prototype = function () {
  console.log('name ', this.name);
}
```

### 构造函数继承

```
function Child(name, sex) {
  Parent.call(this, name);
  this.sex = sex;
}
Child.prototype.say = function () {
  console.log('My name is ', this.name);
}
```
通过构造函数相当于重写了整个对象，但是在继承的过程中对于父类中的方法却不需要重写

### 原型链继承

```
function Child(name, sex) {
  this.sex = sex;
}
Child.prototype = new Parent();
Child.prototype.say = function () {
  console.log('My name is ', this.name);
}
```
通过原型链继承的方法共享了整个父类中的方法和属性，不同的实例会共享相同的属性和方法，但是实例对属性的修改是在子类中动态的创建了新属性，其它实例仍然能够访问原型中的属性和方法，并且原型链无法复用父类的构造函数

### 组合继承（构造函数和原型链继承混合使用）

```
function Child(name, sex) {
  Parent.call(this, name);
  this.sex = sex;
}
Child.prototype = new Parent();
Child.prototype.say = function () {
  console.log('My name is ', this.name);
}
```
通过构造函数复用父类的构造函数，通过原型链的形式继承父类的方法
