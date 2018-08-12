---
title: js学习（三）
date: 2018-08-12 19:13:51
tags: JavaScript
---

## DOM和事件对象

+ 事件冒泡：事件由目标元素逐渐向上传递到document
+ 事件捕获：事件有document逐渐向下传递逐渐追溯到目标元素

### Event事件对象的通用属性

| 名称 | 说明 | 返回值
|:-----|:-----|:----|
| type | 事件名称 | 字符串（如mouseover）
| target | 事件指向的目标元素 | HTMLElement
| currentTarget | 带有当前被触发事件监听器的元素 | HTMLElement
| eventPhase | 事件生命周期阶段 | 数值
| bubbles | 如果事件可以在文档中冒泡返回true，否则返回false | boolean
| cancelable | 如果事件有可以撤销的默认行为返回true，否则返回false | boolean
| timeStamp | 事件创建的时间，时间不可用就返回0 | 字符串
| stopPropagation() | 在当前事件监听器触发后，阻止其在元素中的流动，包括冒泡和捕获 | void
| stopImmediatePropagation() | 立即终止事件在在元素中的流动，当前元素上未被触发的事件监听器会被忽略 | void
| preventDefault() | 阻止浏览器执行与事件关联的默认操作 | void
| defaultPrevented | 如果调用了preventDefault()返回true | boolean

##### eventPhase值

| 名称 | 说明
|------|-----
| Event.CAPTURING_PHASE | 捕获阶段
| Event.AT_TARGET | 目标阶段
| Event.BUBBLING_PHASE | 冒泡阶段

### Document对象事件

| 名称 | 说明
|----|-----
| readystatechange | 在readystate属性发生变化时触发

### window事件对象

| 名称 | 说明
|------|-----
| onabort | 在文档或者资源加载过程被终止时触发
| onbeforeprint | 在用户调用window.print()方法，但尚未给用户提供打印时触发
| onafterprint | 在用户完成打印之后触发
| onerror | 在文档或者资源加载发生错误时触发
| onhashchange | 在锚部分发生变化时触发
| onload | 在文档或者资源加载完成时触发
| onpopstate | 触发后提供一个关联浏览器的状态对象
| onresize | 在窗口缩放时触发
| onunload | 在文档从或者浏览器中卸载时触发

### 鼠标事件

| 名称 | 说明
|---------|------
| click | 点击鼠标并释放鼠标键时触发
| dblclick | 在两次点击并释放鼠标键时触发
| mousedown | 在鼠标左键按下时触发
| mouseenter | 在光标移入元素或者其后代元素区域时触发
| mouseleave | 在光标移出元素及所有后代元素区域时触发
| mousemove | 在光标在元素上移动时触发
| mouseout | 指针移出元素，或者移到它的子元素上
| mouserover | 指针移到有事件监听的元素或者它的子元素内
| mouseup | 释放鼠标时触发

##### 事件特有属性

| 名称 | 说明 | 返回值
|:-----|:-----|:----
| button | 点击的键，0左（主）键，1中键，2右（次）键 | 数值
| altkey | 是否按下alt/option键 | boolean
| clientX | 相对于目标元素的x轴坐标 | number
| clientY | 相对于目标元素的y轴坐标 | number
| screenX | 相对于窗口的x轴坐标 | number
| screenY | 相对于窗口的y轴坐标 | number
| shiftkey | 是否按下shift键 | boolean
| ctrlkey | 是否按下ctrl键 | boolean

### 键盘焦点事件

| 名称 | 说明
|------ |------
| blur | 失去焦点
| focus | 获得焦点
| focusin | 即将获得焦点
| focusout | 即将失去焦点

### 键盘事件

| 名称 | 说明
|------|--------
| keydown | 按键被按下时
| keypress | 按键被按下并被释放时
| keyup | 按键被释放时


##### 事件特有属性

| 名称 | 说明 | 返回值
|:-----|:-----|:----
| char | 按键代表的字符 | 字符串
| key | 所按的键 | 字符串
| altkey | 是否按下alt/option键 | boolean
| shiftkey | 是否按下shift键 | boolean
| ctrlkey | 是否按下ctrl键 | boolean
| repeat | 该建是否一直处于被按下的状态 | boolean

[事件参考](https://developer.mozilla.org/zh-CN/docs/Web/Events)