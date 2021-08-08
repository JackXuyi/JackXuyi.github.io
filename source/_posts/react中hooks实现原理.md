---
title: react中hooks实现原理
date: 2021-06-27 22:34:04
tags: [JavaScript, react]
---

### 以客户端 `useState` 为例

1. 声明 `useState`，通过 `ReactCurrentDispatcher.current` 来实现
2. `ReactCurrentDispatcher.current` 的赋值是在 `packages/react-reconciler/src/ReactFiberHooks` 文件中区分挂载、更新和重新渲染分别实现的

#### 挂载

```js
// packages/react-reconciler/src/ReactFiberHooks.new.js
function mountState(initialState) {
  const hook = mountWorkInProgressHook()
  if (typeof initialState === 'function') {
    initialState = initialState()
  }
  hook.memoizedState = hook.baseState = initialState
  const queue = (hook.queue = {
    pending: null,
    interleaved: null,
    lanes: NoLanes,
    dispatch: null,
    lastRenderedReducer: basicStateReducer,
    lastRenderedState: initialState,
  })
  const dispatch = (queue.dispatch = dispatchAction.bind(
    null,
    currentlyRenderingFiber,
    queue
  ))
  return [hook.memoizedState, dispatch]
}

function mountWorkInProgressHook() {
  const hook = {
    memoizedState: null,
    baseState: null,
    baseQueue: null,
    queue: null,
    next: null,
  }

  if (workInProgressHook === null) {
    // This is the first hook in the list
    currentlyRenderingFiber.memoizedState = workInProgressHook = hook
  } else {
    // Append to the end of the list
    workInProgressHook = workInProgressHook.next = hook
  }
  return workInProgressHook
}
```

#### 更新

```js
// file: packages/react-reconciler/src/ReactFiberHooks.new.js
function updateState(initialState) {
  return updateReducer(basicStateReducer, initialState)
}

function updateReducer(reducer, initialArg, init) {
  const hook = updateWorkInProgressHook()
  const queue = hook.queue

  queue.lastRenderedReducer = reducer

  const current = currentHook

  // The last rebase update that is NOT part of the base state.
  let baseQueue = current.baseQueue

  // The last pending update that hasn't been processed yet.
  const pendingQueue = queue.pending
  if (pendingQueue !== null) {
    // We have new updates that haven't been processed yet.
    // We'll add them to the base queue.
    if (baseQueue !== null) {
      // Merge the pending queue and the base queue.
      const baseFirst = baseQueue.next
      const pendingFirst = pendingQueue.next
      baseQueue.next = pendingFirst
      pendingQueue.next = baseFirst
    }
    current.baseQueue = baseQueue = pendingQueue
    queue.pending = null
  }

  if (baseQueue !== null) {
    // We have a queue to process.
    const first = baseQueue.next
    let newState = current.baseState

    let newBaseState = null
    let newBaseQueueFirst = null
    let newBaseQueueLast = null
    let update = first
    do {
      const updateLane = update.lane
      if (!isSubsetOfLanes(renderLanes, updateLane)) {
        // Priority is insufficient. Skip this update. If this is the first
        // skipped update, the previous update/state is the new base
        // update/state.
        const clone = {
          lane: updateLane,
          action: update.action,
          eagerReducer: update.eagerReducer,
          eagerState: update.eagerState,
          next: null,
        }
        if (newBaseQueueLast === null) {
          newBaseQueueFirst = newBaseQueueLast = clone
          newBaseState = newState
        } else {
          newBaseQueueLast = newBaseQueueLast.next = clone
        }
        // Update the remaining priority in the queue.
        // TODO: Don't need to accumulate this. Instead, we can remove
        // renderLanes from the original lanes.
        currentlyRenderingFiber.lanes = mergeLanes(
          currentlyRenderingFiber.lanes,
          updateLane
        )
        markSkippedUpdateLanes(updateLane)
      } else {
        // This update does have sufficient priority.

        if (newBaseQueueLast !== null) {
          const clone = {
            // This update is going to be committed so we never want uncommit
            // it. Using NoLane works because 0 is a subset of all bitmasks, so
            // this will never be skipped by the check above.
            lane: NoLane,
            action: update.action,
            eagerReducer: update.eagerReducer,
            eagerState: update.eagerState,
            next: null,
          }
          newBaseQueueLast = newBaseQueueLast.next = clone
        }

        // Process this update.
        if (update.eagerReducer === reducer) {
          // If this update was processed eagerly, and its reducer matches the
          // current reducer, we can use the eagerly computed state.
          newState = update.eagerState
        } else {
          const action = update.action
          newState = reducer(newState, action)
        }
      }
      update = update.next
    } while (update !== null && update !== first)

    if (newBaseQueueLast === null) {
      newBaseState = newState
    } else {
      newBaseQueueLast.next = newBaseQueueFirst
    }

    // Mark that the fiber performed work, but only if the new state is
    // different from the current state.
    if (!is(newState, hook.memoizedState)) {
      markWorkInProgressReceivedUpdate()
    }

    hook.memoizedState = newState
    hook.baseState = newBaseState
    hook.baseQueue = newBaseQueueLast

    queue.lastRenderedState = newState
  }

  // Interleaved updates are stored on a separate queue. We aren't going to
  // process them during this render, but we do need to track which lanes
  // are remaining.
  const lastInterleaved = queue.interleaved
  if (lastInterleaved !== null) {
    let interleaved = lastInterleaved
    do {
      const interleavedLane = interleaved.lane
      currentlyRenderingFiber.lanes = mergeLanes(
        currentlyRenderingFiber.lanes,
        interleavedLane
      )
      markSkippedUpdateLanes(interleavedLane)
      interleaved = interleaved.next
    } while (interleaved !== lastInterleaved)
  } else if (baseQueue === null) {
    // `queue.lanes` is used for entangling transitions. We can set it back to
    // zero once the queue is empty.
    queue.lanes = NoLanes
  }

  const dispatch = (queue.dispatch: any)
  return [hook.memoizedState, dispatch]
}
```

#### 重渲染

#### `dispatchAction`

```js
function dispatchAction(fiber, queue, action) {
  const eventTime = requestEventTime()
  const lane = requestUpdateLane(fiber)

  const update = {
    lane,
    action,
    eagerReducer: null,
    eagerState: null,
    next: null,
  }

  const alternate = fiber.alternate
  if (
    fiber === currentlyRenderingFiber ||
    (alternate !== null && alternate === currentlyRenderingFiber)
  ) {
    didScheduleRenderPhaseUpdateDuringThisPass =
      didScheduleRenderPhaseUpdate = true
    const pending = queue.pending
    if (pending === null) {
      // This is the first update. Create a circular list.
      update.next = update
    } else {
      update.next = pending.next
      pending.next = update
    }
    queue.pending = update
  } else {
    // 其它情况更新
  }
}
```

#### `basicStateReducer`

```js
function basicStateReducer(state, action) {
  return typeof action === 'function' ? action(state) : action
}
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

### 参考

- [React Hooks 原理](https://www.jianshu.com/p/b9ac8fa849f1)
- [React Hook 的底层实现原理](https://www.cnblogs.com/cczlovexw/p/13565085.html)
- [阅读源码后，来讲讲 React Hooks 是怎么实现的](https://zhuanlan.zhihu.com/p/48584310)
- [React Hook 的实现原理和最佳实践](https://zhuanlan.zhihu.com/p/75146261)
