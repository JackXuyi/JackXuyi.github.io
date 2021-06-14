---
title: Performance
date: 2021-06-14 22:48:44
tags: [JavaScript]
---

### Performance

#### 属性

##### `navigation`

只读属性 Performance.navigation 会返回一个 PerformanceNavigation 对象。

- type: 一个无符号短整型，表示是如何导航到这个页面的。
  - TYPE_NAVIGATE (0): 当前页面是通过点击链接，书签和表单提交，或者脚本操作，或者在 url 中直接输入地址;
  - TYPE_RELOAD (1): 点击刷新页面按钮或者通过 Location.reload()方法显示的页面;
  - TYPE_BACK_FORWARD (2): 页面通过历史记录和前进后退访问时;
  - TYPE_RESERVED (255): 任何其他方式。
- redirectCount: 无符号短整型，表示在到达这个页面之前重定向了多少次。

##### `timing`

只读属性返回一个 [PerformanceTiming](https://developer.mozilla.org/zh-CN/docs/Web/API/PerformanceTiming) 对象，这个对象包括了页面相关的性能信息。

##### `timeOrigin`

只读属性 timeOrigin 返回一个表示 the performance measurement 开始时间的高精度 timestamp

##### `onresourcetimingbufferfull`

在 resourcetimingbufferfull 事件触发时会被调用的事件处理器，参考[Performance.onresourcetimingbufferfull](https://developer.mozilla.org/zh-CN/docs/Web/API/Performance/onresourcetimingbufferfull)

#### 方法

##### `Performance.now()`

方法返回一个精确到毫秒的事件戳 [DOMHighResTimeStamp](https://developer.mozilla.org/zh-CN/docs/Web/API/DOMHighResTimeStamp)

```js
performance.now() // 38544.5
Date.now() // 1623685111685
```

###### tips： 测量程序性能时可以使用

##### [`performance.setResourceTimingBufferSize()`](https://developer.mozilla.org/en-US/docs/Web/API/Performance/setResourceTimingBufferSize)

设置浏览器记录资源加载情况的缓冲区大小，单位是对象个数，最小为 150

##### [`Performance.mark()`](https://developer.mozilla.org/zh-CN/docs/Web/API/Performance/mark)

在浏览器的性能缓冲区中使用给定名称添加一个 timestamp

##### [`Performance.measure()`](https://developer.mozilla.org/zh-CN/docs/Web/API/Performance/measure)

在浏览器性能记录缓存中创建了一个名为时间戳的记录来记录两个特殊标志位（通常称为开始标志和结束标志）。

```js
performance.mark('test1')
performance.mark('test2')
performance.measure('test', 'test1', 'test2') // { detail: null, duration: 0.09999999403953552, entryType: "measure", name: "test", startTime: 33062.60000000894 }
```

###### tips： 与 `Performance.mark()` 结合可以测量指定项目的时间

##### [`Performance.clearResourceTimings()`](https://developer.mozilla.org/zh-CN/docs/Web/API/Performance/clearResourceTimings)

移除所有的记录

##### [`Performance.clearMarks()`](https://developer.mozilla.org/zh-CN/docs/Web/API/Performance/clearMarks)

从浏览器的 performance entry 缓存中移除声明的标记。

##### [`Performance.clearMeasures()`](https://developer.mozilla.org/zh-CN/docs/Web/API/Performance/clearMeasures)

从浏览器的性能入口缓存区中移除声明的度量衡。
