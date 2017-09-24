---
title: js学习（一）
date: 2017-09-22 21:59:32
tags: JavaScript
---

## `setState`参数

```
void setState(
      function|object nextState,
      [function callback]
    )
```

1. 第一个参数可以是一个函数也可以是一个对象，但是返回值都是下一个`state`的状态。
2. 第二个参数为`setState`这个函数异步调用结束以后的回调函数，可以用在组件设置完`state`以后进行的操作。

## `js`对网页滚动条的操作

+ `js`可以通过改变目标元素的`scrollTop`改变元素滚动条的位置
+ `onWheel`事件可以监听滚动条滚动事件，可以通过`deltaX`和`deltaY`属性获取滚动条滚动的位置和方向
+ `onScroll`事件可以监听滚动条事件，但是无法获取方向和滚动距离及位置
+ `CSS`中没有可以操作`scrollTop`值的属性

## `setInterval`

`setInterval`定时执行函数，当先后创建多个定时器时可能不会按照你预想的顺序来执行，因为`js`是单线程的，只有当前一个任务执行完毕以后才能够继续执行下一任务，所以调用定时器的时间可能大于你预设的时间，由此造成调用定时器的混乱。

## js实现动画

- 通过js中的定时器不断的改变元素的位置和高度模拟动画效果
- 通过一个定时器管理函数管理定时器的先后调用顺序或者通过`dom2`级时间`removeEventLisenner`函数让元素在js调用定时器期间失去时间响应解决定时器无法顺序调用的各种问题
