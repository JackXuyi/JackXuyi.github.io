---
title: js沙箱
date: 2021-07-25 21:06:01
tags: [JavaScript]
---

沙箱，即 `sandbox`，顾名思义，就是让你的程序跑在一个隔离的环境下，不对外界的其他程序造成影响，通过创建类似沙盒的独立作业环境，在其内部运行的程序并不能对硬盘产生永久性的影响。

### 使用场景

- 解析或执行不可信的 `JS`
- 隔离被执行代码的执行环境
- 对执行代码中可访问对象进行限制

### 实现方式

#### `with` + `new Function`

在 `with` 的块级作用域下，变量访问会优先查找你传入的参数对象，之后再往上找，所以相当于你变相监控到了代码中的“变量访问”，结合 `proxy` 代理可以监听所有数据的修改和访问

```js
function proxyFanctory(obj) {
  const target = new Proxy(obj, {
    get(target, p) {
      if (p === Symbol.unscopables) {
        return undefined
      }
      if (target[p] === undefined) {
        return undefined
      }
      return target[p]
    },
    set(target, p, value) {
      target[p] = value
    },
  })

  return target
}

function runWithSanbox(code) {
  const context = proxyFanctory({ a: 'test', b: {} })
  const codeSrc = `with(sandbox){${code}}`
  return new Function('sandbox', codeSrc).call(context, context)
}

runWithSanbox(
  'this.b.__proto__.toString=function(){console.log("__proto__.toString")};console.log(a, this)'
) // test Proxy {a: "test"}
const t = {}
t.toString() // __proto__.toString
```

##### 需要解决的问题

- `proxy` 无法监听深层次数据的访问，可以通过访问原型链的方式，实现沙箱逃逸（代码分析）
- `window` 等固有对象调用（`iframe` 创建隔离的上下文）

#### 借助 `iframe` 实现

`sandbox` 是 `h5` 的提出的一个新属性， 启用方式就是在 `iframe` 标签中使用 `sandbox` 属性

```html
<iframe sandbox src="url"></iframe>
```

##### 限制

- `script` 脚本不能执行， `allow-scripts` 属性
- 不能发送 `ajax` 请求，`allow-same-origin` 允许同域请求

具体参考 [iframe](https://developer.mozilla.org/zh-CN/docs/Web/HTML/Element/iframe#attr-sandbox)

#### `Web Worker`

`Web Worker` 子线程的形式也是一种天然的沙箱隔离

##### 限制

- 出于线程安全设计考虑，`Web Worker` 不支持 `DOM` 操作，必须通过 `postMessage` 通知 `UI` 主线程来实现。
- `Web Worker` 无法访问 `window`、`document` 之类的浏览器全局对象。

通过代理将具体的渲染实现再转发给原 `WorkerDomNodeImpl.js` 逻辑来实现 `DOM` 的实际更新。

### 参考

- [说说 JS 中的沙箱](https://juejin.cn/post/6844903954074058760)
- [如何“取巧”实现一个微前端沙箱？](https://developer.aliyun.com/article/761449)
- [字节跳动的微前端沙盒实践](https://www.infoq.cn/article/u9dkjjleg2hp6uqhsoii)
- [浅探 Web Worker 与 JavaScript 沙箱](https://segmentfault.com/a/1190000039795656)
