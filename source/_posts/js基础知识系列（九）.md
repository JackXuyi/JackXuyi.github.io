---
title: js基础知识系列（九）
date: 2020-06-28 20:15:05
tags: JavaScript
---

## 事件

### 事件流

页面接收事件的顺序

#### 事件冒泡

事件开始时由具体的元素接收，然后逐级上传到较为不具体的节点

#### 事件捕获

不太具体的节点较先捕获到事件，具体的节点最后捕获到事件

#### DOM 事件流

- 事件捕获阶段
- 目标阶段
- 事件冒泡阶段

### 事件处理程序

响应某个事件的程序

#### DOM0 级事件处理程序

将事件赋值给一个事件处理程序属性

#### DOM2 级事件处理程序

- `addEventListener` 添加事件处理程序
- `removeEventListener` 删除事件处理程序

#### IE 事件处理程序(IE8 之前版本)

- `attachEvent` 添加事件处理程序
- `detachEvent` 删除事件处理程序

### 事件对象

#### DOM 中的事件对象

| 属性 / 方法              | 类型        | 读 / 写 | 说明                                                                                       |
| :----------------------- | :---------- | :------ | :----------------------------------------------------------------------------------------- |
| bubbles                  | Boolean     | 只读    | 表明事件是否冒泡                                                                           |
| cancelable               | Boolean     | 只读    | 表明是否可以取消默认事件                                                                   |
| currentTarget            | Element     | 只读    | 表明是否可以取消事件的默认行为                                                             |
| defaultPrevented         | Boolean     | 只读    | 为 true 表明已经调用了 preventDefault                                                      |
| detail                   | Integer     | 只读    | 与事件相关的细节信息                                                                       |
| eventPhase               | Integer     | 只读    | 调用事件处理程序的阶段：1 表示捕获阶段，2 表示处于目标阶段，3 表示冒泡阶段                 |
| preventDefault           | Function    | 只读    | 取消事件的默认行为，如果 cancelable 为 true 可以调用这个方法                               |
| stopImmediatePropagation | Function    | 只读    | 取消事件的进一步捕获或冒泡，同时组织任何事件处理程序调用（DOM3 级事件中新增）              |
| stopPropagation          | Function    | 只读    | 取消事件的进一步捕获或冒泡，，如果 bubbles 为 true 可以调用这个方法                        |
| target                   | Element     | 只读    | 事件目标                                                                                   |
| trusted                  | Boolean     | 只读    | 为 true 表示事件是浏览器生成的，为 false 表示事件是由开发人员通过 js 创建的（DOM1 中新增） |
| type                     | String      | 只读    | 被触发的事件类型                                                                           |
| view                     | AbstratView | 只读    | 与事件关联的抽象视图，等同于发生事件的 window 对象                                         |

#### IE 中的事件对象

通过 `window.event` 对象访问事件对象，包含如下属性

| 属性 / 方法 | 类型    | 读 / 写 | 说明                                                                                      |
| :---------- | :------ | :------ | :---------------------------------------------------------------------------------------- |
| cancelable  | Boolean | 读 / 写 | 默认为 false ，但将其设置为 true 就可以取消事件冒泡（与 stopPropagation 方法作用相同）    |
| returnValue | Boolean | 读 / 写 | 默认为 true ，但将其设置为 false 就可以取消事件默认行为（与 preventDefault 方法作用相同） |
| target      | Element | 只读    | 事件目标（与 target 作用相同）                                                            |
| type        | String  | 只读    | 被触发的事件类型                                                                          |

### 事件类型

- UI 事件，当用户与页面上元素交互时触发
- 焦点事件，当元素失去或获得焦点时触发
- 鼠标事件，当用户通过鼠标在页面上执行操作时触发
- 滚轮事件，当使用鼠标滚轮时触发
- 文本事件，当在文档中输入文本时触发
- 键盘事件，当用户通过键盘在页面上执行操作时触发
- 合成事件，当为 IME（Input Method Editor，输入法编辑器） 输入字符时触发
- 变动事件，当底层 DOM 结构发生变化时触发

#### HTML5 事件

- contextmenu 事件，上下文菜单
- beforeunload 事件
- DOMContentLoaded 事件
- readstatechange 事件
- pageshow 和 pagehide 事件
- hashchange 事件

#### 设备事件

- orientationchange 事件，通过 window.orientation 访问旋转角度
- deviceorientation 事件，设备静止状态下的设备变化信息
- devicemotion 事件，设备移动信息

#### 触摸与手势事件

- 触摸事件
- 手势事件

### 内存和性能

#### 事件委托

解决事件处理程序过多的问题

#### 移除事件处理程序

每个事件处理程序都会建立一个浏览器代码与页面交互的 JavaScript 代码链接

### 模拟事件

#### DOM 中的模拟事件

可以通过 document 对象上的 createEvent 方法创建 event 对象

- 模拟鼠标事件
- 模拟键盘事件
- 自定义 DOM 事件
