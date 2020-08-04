---
title: react16中生命周期hooks
date: 2020-08-02 22:14:27
tags: react
---

### 概述

react hooks 推出有段时间了，函数式组件越来越多，当函数式组件中需要使用声明周期钩子时就需要自己封装出一些生命周期函数

### 目的

在函数式组件中如类组件中一样使用生命周期钩子

### 实现

- [Effect Hook](https://zh-hans.reactjs.org/docs/hooks-effect.html) 在组件挂载、更新、卸载时都会执行的生命周期钩子
- [useRef](https://zh-hans.reactjs.org/docs/hooks-reference.html#useref) 返回一个在组件的整个生命周期内保持不变的 ref 对象

#### didMount

利用 `Effect Hook` 依赖不变不会再次执行的特性，依赖传入空数组即可实现挂载时执行一次的特性

```js
const useMount = (cb) => {
  useEffect(cb, [])
}
```

#### update

利用 `useRef` 对象在组件的整个生命周期内保持不变的特性，在组件初始化时初始化 ref 对象，判断 ref 对象的状态决定是否执行回调

```js
const useUpdate = (cb, deps) => {
  const ref = useRef(0)
  useEffect(() => {
    if (ref.current) {
      cb()
    }
    ref.current = ref.current + 1
  }, deps)
}
```

#### Unmout

利用 `Effect Hook` 返回值在组件卸载时执行的特性，在组件初始化时把回调作为其返回值，即可实现卸载执行的特性

```js
const useUnmout = (cb) => {
  useEffect(() => {
    return cb
  }, [])
}
```

### 参考

- [生命周期 hooks 源码参考](https://github.com/JackXuyi/web-exercise/blob/master/react/src/page/hooks.js)
- [react hooks](https://zh-hans.reactjs.org/docs/hooks-intro.html)
