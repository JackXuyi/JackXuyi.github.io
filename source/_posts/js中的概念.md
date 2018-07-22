---
title: js中的概念
date: 2018-04-12 21:06:59
tags: JavaScript
---

### 闭包
```
function test(arg) {
  return function() {
    return arg;
  }
}
```
类似于上述情况，函数虽然已经返回，但是仍然能够访问变量创建时的上下文的情况称为闭包