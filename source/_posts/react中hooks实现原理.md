---
title: react中hooks实现原理
date: 2021-06-27 22:34:04
tags: [JavaScript, react]
---

### 以客户端 `useState` 为例

1. 声明 `useState`，通过 `ReactCurrentDispatcher.current` 来实现

```ts
// packages/react/src/ReactHooks.js
function resolveDispatcher() {
  const dispatcher = ReactCurrentDispatcher.current
  // Will result in a null access error if accessed outside render phase. We
  // intentionally don't throw our own error because this is in a hot path.
  // Also helps ensure this is inlined.
  return dispatcher: Dispatcher
}

export function useState<S>(
  initialState: (() => S) | S
): [S, Dispatch<BasicStateAction<S>>] {
  const dispatcher = resolveDispatcher()
  return dispatcher.useState(initialState)
}
```

2. 定义 `ReactCurrentDispatcher`

```ts
// packages/react/src/ReactCurrentDispatcher.js
/**
 * Keeps track of the current dispatcher.
 */
const ReactCurrentDispatcher = {
  /**
   * @internal
   * @type {ReactComponent}
   */
  current: null | Dispatcher,
}

export default ReactCurrentDispatcher
```

所有的 `hooks` 都是挂载在 `ReactCurrentDispatcher` 对象上的

```jsx
function Test() {
  const [a, setA] = useState()
  return <div>{a}</div>
}

ReactDOM.render(
  <Test />,
  document.getElementById('root') || document.getElementsByTagName('body')[0]
)

// 编译之后
function Test() {
  var _useState = (0, _react.useState)(0), // 等价于 _useState = _react.useState(0)
    _useState2 = _slicedToArray(_useState, 2),
    a = _useState2[0],
    setA = _useState2[1]

  return _react2.default.createElement('div', null, a)
}

_reactDom2.default.render(
  _react2.default.createElement(Test, null),
  document.getElementById('root') || document.getElementsByTagName('body')[0]
)
```

编译后实际是把函数组件当作参数传递下去了

### 挂载到上下文中

#### 从函数式组件到 `createElement` 实现

### 其它 `hooks` 参考

```js
export function getCacheForType<T>(resourceType: () => T): T {
  const dispatcher = resolveDispatcher()
  // $FlowFixMe This is unstable, thus optional
  return dispatcher.getCacheForType(resourceType)
}

export function useContext<T>(Context: ReactContext<T>): T {
  const dispatcher = resolveDispatcher()
  return dispatcher.useContext(Context)
}

export function useState<S>(
  initialState: (() => S) | S
): [S, Dispatch<BasicStateAction<S>>] {
  const dispatcher = resolveDispatcher()
  return dispatcher.useState(initialState)
}

export function useReducer<S, I, A>(
  reducer: (S, A) => S,
  initialArg: I,
  init?: (I) => S
): [S, Dispatch<A>] {
  const dispatcher = resolveDispatcher()
  return dispatcher.useReducer(reducer, initialArg, init)
}

export function useRef<T>(initialValue: T): {| current: T |} {
  const dispatcher = resolveDispatcher()
  return dispatcher.useRef(initialValue)
}

export function useEffect(
  create: () => (() => void) | void,
  deps: Array<mixed> | void | null
): void {
  const dispatcher = resolveDispatcher()
  return dispatcher.useEffect(create, deps)
}

export function useLayoutEffect(
  create: () => (() => void) | void,
  deps: Array<mixed> | void | null
): void {
  const dispatcher = resolveDispatcher()
  return dispatcher.useLayoutEffect(create, deps)
}

export function useCallback<T>(
  callback: T,
  deps: Array<mixed> | void | null
): T {
  const dispatcher = resolveDispatcher()
  return dispatcher.useCallback(callback, deps)
}

export function useMemo<T>(
  create: () => T,
  deps: Array<mixed> | void | null
): T {
  const dispatcher = resolveDispatcher()
  return dispatcher.useMemo(create, deps)
}

export function useImperativeHandle<T>(
  ref: {| current: T | null |} | ((inst: T | null) => mixed) | null | void,
  create: () => T,
  deps: Array<mixed> | void | null
): void {
  const dispatcher = resolveDispatcher()
  return dispatcher.useImperativeHandle(ref, create, deps)
}

export function useDebugValue<T>(
  value: T,
  formatterFn: ?(value: T) => mixed
): void {}

export const emptyObject = {}

export function useTransition(): [boolean, (() => void) => void] {
  const dispatcher = resolveDispatcher()
  return dispatcher.useTransition()
}

export function useDeferredValue<T>(value: T): T {
  const dispatcher = resolveDispatcher()
  return dispatcher.useDeferredValue(value)
}

export function useOpaqueIdentifier(): OpaqueIDType | void {
  const dispatcher = resolveDispatcher()
  return dispatcher.useOpaqueIdentifier()
}

export function useMutableSource<Source, Snapshot>(
  source: MutableSource<Source>,
  getSnapshot: MutableSourceGetSnapshotFn<Source, Snapshot>,
  subscribe: MutableSourceSubscribeFn<Source, Snapshot>
): Snapshot {
  const dispatcher = resolveDispatcher()
  return dispatcher.useMutableSource(source, getSnapshot, subscribe)
}

export function useCacheRefresh(): <T>(?() => T, ?T) => void {
  const dispatcher = resolveDispatcher()
  // $FlowFixMe This is unstable, thus optional
  return dispatcher.useCacheRefresh()
}
```

### 参考

- [React Hooks 原理](https://www.jianshu.com/p/b9ac8fa849f1)
- [React Hook 的底层实现原理](https://www.cnblogs.com/cczlovexw/p/13565085.html)
- [阅读源码后，来讲讲 React Hooks 是怎么实现的](https://zhuanlan.zhihu.com/p/48584310)
- [React Hook 的实现原理和最佳实践](https://zhuanlan.zhihu.com/p/75146261)
