---
title: 记一次safari白屏问题排查
date: 2024-11-24 12:21:36
tags: [react, JavaScript]
---

## 背景

在项目中遇到 `safari` 浏览器中无法页面白屏，但是控制台无任何异常信息，部分输出日志正常的现象

## 问题猜测

- 编译配置问题，导致不支持此版本的浏览器
- 由于某些原因导致代码没有执行下去，没有执行到组件渲染

## 问题验证

### 编译问题

通过配置一个最小化的 `demo` ，发现能够正常在 `safari` 中执行，估排除编译配置问题

### 代码问题

通过注释掉代码和输出日志的方式逐步缩小问题代码范围，然后定位具体问题，但是由于

- 代码引用混乱，存在循环引用的情况
- 代码过于复杂，存在顶级的 await 导致代码执行存在异步情况

考虑通过研究 `js` 执行时序情况，结合上述手段定位代码的最后执行位置，帮助定位问题范围

## 问题确定

通过排查发现问题位于一个顶层的 `await` 代码初始化 `IndexedDB`

```TS
import { openDB } from 'idb';

// 问题代码
const db = await openDB(name, version, {
    upgrade(db, oldVersion, newVersion, transaction, event) {
        // …
    },
    blocked(currentVersion, blockedVersion, event) {
        // …
    },
    blocking(currentVersion, blockedVersion, event) {
        // …
    },
    terminated() {
        // …
    },
});
```

通过研究 `idb` 源代码发现只是简单的将 `IndexedDB` 的操作转化为 `promise` 的方式，通过 `debug` 的方式发现初始化的时候未能够正确回调，通过查阅相关资料发现 `macOS Big Sur 11.4 和 iOS 14.6 上的 Safari 存在一个严重错误，导致 IndexedDB 请求丢失且无法解决。此问题已在 Safari 14.7 中修复。`

## 问题修复

可以通过 `safari-14-idb-fix` 修复问题，通过定时检测的方式当 `IndexedDB` 初始化完毕之后再初始化 `IndexedDB` 的相关操作

```TS
/**
 * Work around Safari 14 IndexedDB open bug.
 *
 * Safari has a horrible bug where IDB requests can hang while the browser is starting up. https://bugs.webkit.org/show_bug.cgi?id=226547
 * The only solution is to keep nudging it until it's awake.
 */
export default function idbReady(): Promise<void> {
  const isSafari =
    !navigator.userAgentData &&
    /Safari\//.test(navigator.userAgent) &&
    !/Chrom(e|ium)\//.test(navigator.userAgent);

  // No point putting other browsers or older versions of Safari through this mess.
  if (!isSafari || !indexedDB.databases) return Promise.resolve();

  let intervalId: number;

  return new Promise<void>((resolve) => {
    const tryIdb = () => indexedDB.databases().finally(resolve);
    intervalId = setInterval(tryIdb, 100);
    tryIdb();
  }).finally(() => clearInterval(intervalId));
}
```

## 最终代码

```TS
import idbReady from 'safari-14-idb-fix';
await idbReady().then(async () => {
    // Safari has definitely figured out where IndexedDB is.// You can use IndexedDB as usual.
    const db = await openDB(name, version, {
        upgrade(db, oldVersion, newVersion, transaction, event) {
            // …
        },
        blocked(currentVersion, blockedVersion, event) {
            // …
        },
        blocking(currentVersion, blockedVersion, event) {
            // …
        },
        terminated() {
            // …
        },
    });
    return db;
});
```

参考

- [idb](https://github.com/jakearchibald/idb#readme)
- [safari-14-idb-fix](https://github.com/jakearchibald/safari-14-idb-fix)
