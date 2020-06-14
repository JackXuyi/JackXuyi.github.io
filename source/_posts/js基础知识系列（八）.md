---
title: js基础知识系列（八）
date: 2020-06-07 22:04:11
tags: JavaScript
---

## BOM（浏览器对象模型）

### window 对象

浏览器的一个实例。javaScript 对象访问浏览器的接口，ECMAScript 中的 Global 对象

#### 全局作用域

#### 窗口关系

- top ： 始终指向最外层的框架
- parent：当前框架的直接上层框架
- self：当前框架的 window 对象

##### 注意：不同框架的 Object 对象不同，不能用 instanceof 检测跨框架的对象

#### 窗口位置

- screenLeft 和 screenTop 表示窗口距离屏幕左上角的距离信息（IE、Safari、Chrome）
- screenX 和 screenY 表示窗口距离屏幕左上角的距离信息（火狐）
- moveTo(x,y) 窗口移动到屏幕的（x，y）坐标位置
- moveBy(x,y) 窗口在水平和垂直方向分别移动 x 和 y 的距离

```js
const x = window.screenLeft || window.screenX;
const y = window.screenTop || window.screenY;
```

#### 窗口大小

- innerHeight 和 innerWidth 页面视图区大小（IE9+、火狐、opera、chrome、safari）
- document.documentElement.clientWidth 和 document.documentElement.clientHeight 在 CSS1Compat 模式下表示视图大小
- document.body.clientWidth 和 document.body.clientHeight 在非 CSS1Compat 模式下表示视图大小
- resizeTo(width, height) 页面重置到 width 和 height 大小
- resizeBy(width, height) 页面分别缩小 width 和 height

#### 弹出窗口

window.open(url, 窗口名称, 参数) 返回打开窗口的句柄，可以对打开的窗口进行关闭操作，返回的句柄中 opener 默认指向当前的页面对象

#### 间歇调用或超时调用

- setTimeout 和 clearTimeout 调用一次
- setInterval 和 clearInterval 多次调用

##### 第 3 个参数及后面的参数都是第一个函数参数调用时的参数

#### 系统对话框

- alert 提示框
- confirm 确认框
- prompt 输入框

##### 同步代码，在代码未执行就无法继续执行后面的代码

### location 对象

获取当前窗口加载的文档信息

| 属性名称 | 说明                                                           |
| :------- | :------------------------------------------------------------- |
| hash     | url 中的 hash 值，即 url 中 # 后的字符串，若不存在就为空子符串 |
| host     | 域名加端口的字符串                                             |
| hsotname | 域名                                                           |
| href     | 完整的 url                                                     |
| pathname | url 中的路径，即包含在以 / 开始 ? 结尾，之间的内容             |
| port     | 端口                                                           |
| protcol  | 协议                                                           |
| search   | 查询字符串，即 ? 后 # 前的内容                                 |

- location.assign 打开新的 url ，并生成一个历史记录
- location.replace 当前页面打开 url，并替换当前页面的历史纪录
- location.reload 重新加载页面，值为 true 时，强制从服务器刷新页面

### navigator 对象

#### 检测插件

navigator.plugins 可以在非 IE 浏览器中获取安装的插件数组，数组的每个元素包含如下属性

- name：插件名称
- description：插件描述
- filename：插件的文件名称
- length：插件处理的 MIME 类型数量

#### 注册处理程序

- navigator.registerProtocolHandler

### screen 对象

浏览器窗口外部显示器信息

### history 对象

- history.go 跳转到指定的页面
- history.back 返回页面
- history.forward 前进
- history.length 历史记录的数量
