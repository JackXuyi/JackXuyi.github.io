---
title: 简易的express中间件
date: 2021-08-07 14:51:11
tags: [JavaScript, node]
---

## express

基于 `Node.js` 平台，快速、开放、极简的 `Web` 开发框架

### 中间件

从请求到相应过程中执行的一系列函数被称为中间件，使其具有了极高的扩展性

#### 注册

```js
app.use(function middware1(req, res, next) {
  // 业务逻辑
})

app.use('/test', function middware2(req, res, next) {
  // 业务逻辑
})
```

#### 使用

当请求 `/test` 时，会按照 `middware1` -> `middware2` 的顺序依次执行注册的中间件

#### 简易实现

```js
function isMathch(source, match) {
  return source.startsWith(match)
}

const express = {
  middwares: [],
  use: function (path, fun) {
    // 把注册的中间件放入 middwares 数组中
    let handler = fun
    let matchPath = path
    if (typeof fun === 'undefined') {
      matchPath = '/'
      handler = path
    }
    this.middwares.push({ handler, path: matchPath })
  },
  call: function (req, res) {
    // 从 middwares 中提取匹配的中间件执行
    const { pathname = '/' } = req
    const middwares = this.middwares.filter((item) =>
      isMathch(pathname, item.path)
    )
    const len = middwares.length
    let index = -1

    // 通过 index 控制执行的中间件
    function next(err) {
      index++
      if (index < len) {
        middwares[index].handler(req, res, next)
      }
    }

    return next()
  },
}
```

- express 调度实现[链接](https://github.com/expressjs/express/blob/master/lib/router/route.js#L98)
- express use 实现[链接](https://github.com/expressjs/express/blob/master/lib/application.js#L187)

## 参考

- [expressjs](https://www.expressjs.com.cn/guide/writing-middleware.html)
