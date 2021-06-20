---
title: react从dom.render到初次组件渲染完成
date: 2021-06-19 22:12:44
tags: [JavaScript, react]
---

## 从 `dom.render` 到初次组件渲染完成

1. `render(element,container,callback) ` 调用 `legacyRenderSubtreeIntoContainer(null,element,container,false,callback)`
2. `legacyRenderSubtreeIntoContainer(parentComponent,children,container,forceHydrate,callback)` 调用`legacyCreateRootFromDOMContainer(container,false)` 创建容器并赋值给 `container._reactRootContainer`

```js
// file: packages/react-dom/src/client/ReactDOMLegacy.js
function legacyRenderSubtreeIntoContainer(
  parentComponent: ?React$Component<any, any>,
  children: ReactNodeList,
  container: Container,
  forceHydrate: boolean,
  callback: ?Function
) {
  let root = container._reactRootContainer
  let fiberRoot: FiberRoot
  if (!root) {
    root = container._reactRootContainer = legacyCreateRootFromDOMContainer(
      container,
      forceHydrate
    )
    fiberRoot = root._internalRoot
    if (typeof callback === 'function') {
      const originalCallback = callback
      callback = function () {
        const instance = getPublicRootInstance(fiberRoot)
        originalCallback.call(instance)
      }
    }
    // 初始化同步更新
    unbatchedUpdates(() => {
      updateContainer(children, fiberRoot, parentComponent, callback)
    })
  } else {
    // 更新
  }
  return getPublicRootInstance(fiberRoot)
}
```

3. 通过 `unbatchedUpdates` 同步更新容器元素并调用回调函数

### 构建容器

1. `legacyCreateRootFromDOMContainer` 调用 `createLegacyRoot(container)` 构建容器
2. 调用 `new ReactDOMLegacyRoot(container)` 构建实例

```js
// file: packages/react-dom/src/client/ReactDOMRoot.js
export function createLegacyRoot(
  container: Container,
  options?: RootOptions
): RootType {
  return new ReactDOMLegacyRoot(container, options)
}
```

3. 构造函数中调用 `createRootImpl(container, ConcurrentRoot)` 创建根容器并赋值给 `_internalRoot` 属性

```js
// file: packages/react-dom/src/client/ReactDOMRoot.js
function ReactDOMLegacyRoot(container: Container, options: void | RootOptions) {
  this._internalRoot = createRootImpl(container, LegacyRoot, options)
}

ReactDOMLegacyRoot.prototype.render = function (children: ReactNodeList): void {
  const root = this._internalRoot
  updateContainer(children, root, null, null)
}

ReactDOMLegacyRoot.prototype.unmount = function (): void {
  const root = this._internalRoot
  const container = root.containerInfo
  updateContainer(null, root, null, () => {
    unmarkContainerAsRoot(container)
  })
}

function createRootImpl(
  container: Container,
  tag: RootTag,
  options: void | RootOptions
) {
  const root = createContainer(container, tag)
  markContainerAsRoot(root.current, container)
  const rootContainerElement =
    container.nodeType === COMMENT_NODE ? container.parentNode : container
  listenToAllSupportedEvents(rootContainerElement)

  return root
}
```

4. 调用 `createContainer(container, ConcurrentRoot)` 构建根元素

```js
// file: packages/react-reconciler/src/ReactFiberRoot.old.js
export function createContainer(
  containerInfo: Container,
  tag: RootTag,
  hydrate: boolean,
  hydrationCallbacks: null | SuspenseHydrationCallbacks,
  isStrictMode: boolean,
  concurrentUpdatesByDefaultOverride: null | boolean
): OpaqueRoot {
  return createFiberRoot(
    containerInfo,
    tag,
    hydrate,
    hydrationCallbacks,
    isStrictMode,
    concurrentUpdatesByDefaultOverride
  )
}

// 1.  调用 `new FiberRootNode(container, ConcurrentRoot)` 构建根元素
// 2.  调用 `createHostRootFiber` 构建 `Fiber`
// 3.  初始化更新队列
// file: packages/react-reconciler/src/ReactFiberRoot.old.js
function createFiberRoot(
  containerInfo: any,
  tag: RootTag,
  hydrate: boolean,
  hydrationCallbacks: null | SuspenseHydrationCallbacks,
  isStrictMode: boolean,
  concurrentUpdatesByDefaultOverride: null | boolean
): FiberRoot {
  const root: FiberRoot = new FiberRootNode(containerInfo, tag, hydrate)
  const uninitializedFiber = createHostRootFiber(
    tag,
    isStrictMode,
    concurrentUpdatesByDefaultOverride
  )
  root.current = uninitializedFiber
  uninitializedFiber.stateNode = root
  const initialState = { element: null }
  uninitializedFiber.memoizedState = initialState
  initializeUpdateQueue(uninitializedFiber)

  return root
}

function FiberRootNode(containerInfo, tag, hydrate) {
  this.tag = tag
  this.containerInfo = containerInfo
  this.pendingChildren = null
  this.current = null
  this.pingCache = null
  this.finishedWork = null
  this.timeoutHandle = noTimeout
  this.context = null
  this.pendingContext = null
  this.hydrate = hydrate
  this.callbackNode = null
  this.callbackPriority = NoLane
  this.eventTimes = createLaneMap(NoLanes)
  this.expirationTimes = createLaneMap(NoTimestamp)

  this.pendingLanes = NoLanes
  this.suspendedLanes = NoLanes
  this.pingedLanes = NoLanes
  this.expiredLanes = NoLanes
  this.mutableReadLanes = NoLanes
  this.finishedLanes = NoLanes

  this.entangledLanes = NoLanes
  this.entanglements = createLaneMap(NoLanes)
}

// file: packages/react-reconciler/src/ReactFiber.old.js
function createHostRootFiber(
  tag: RootTag,
  isStrictMode: boolean,
  concurrentUpdatesByDefaultOverride: null | boolean
): Fiber {
  let mode
  if (tag === ConcurrentRoot) {
    mode = ConcurrentMode
    if (isStrictMode === true) {
      mode |= StrictLegacyMode

      if (enableStrictEffects) {
        mode |= StrictEffectsMode
      }
    } else if (enableStrictEffects && createRootStrictEffectsByDefault) {
      mode |= StrictLegacyMode | StrictEffectsMode
    }
    if (
      !enableSyncDefaultUpdates ||
      (allowConcurrentByDefault && concurrentUpdatesByDefaultOverride)
    ) {
      mode |= ConcurrentUpdatesByDefaultMode
    }
  } else {
    mode = NoMode
  }

  if (enableProfilerTimer && isDevToolsPresent) {
    mode |= ProfileMode
  }

  return createFiber(HostRoot, null, null, mode)
}

function FiberNode(
  tag: WorkTag,
  pendingProps: mixed,
  key: null | string,
  mode: TypeOfMode
) {
  // Instance
  this.tag = tag
  this.key = key
  this.elementType = null
  this.type = null
  this.stateNode = null

  // Fiber
  this.return = null
  this.child = null
  this.sibling = null
  this.index = 0

  this.ref = null

  this.pendingProps = pendingProps
  this.memoizedProps = null
  this.updateQueue = null
  this.memoizedState = null
  this.dependencies = null

  this.mode = mode

  // Effects
  this.flags = NoFlags
  this.subtreeFlags = NoFlags
  this.deletions = null

  this.lanes = NoLanes
  this.childLanes = NoLanes

  this.alternate = null
}

function createFiber(
  tag: WorkTag,
  pendingProps: mixed,
  key: null | string,
  mode: TypeOfMode
): Fiber {
  return new FiberNode(tag, pendingProps, key, mode)
}
```

5. 调用`markContainerAsRoot(root.current, container)`标记根元素

```js
// file: packages/react-dom/src/client/ReactDOMComponentTree.js
const randomKey = Math.random().toString(36).slice(2)
const internalContainerInstanceKey = '__reactContainer$' + randomKey
export function markContainerAsRoot(hostRoot: Fiber, node: Container) {
  node[internalContainerInstanceKey] = hostRoot
}
```

6. 调用`listenToAllSupportedEvents(rootContainerElement)` 向根元素上注册所有原生监听事件，但 `selectionchange` 事件注册在 `document` 上

#### 构建的容器

```js
const container =document.getElementById("root")
const root = container._reactRootContainer = {
  _internalRoot: {
    tag: RootTag,
    containerInfo: container,
    pendingChildren: null,
    current: null,
    pingCache: null,
    finishedWork: null,
    timeoutHandle: noTimeout
    context: null,
    pendingContext: null,
    hydrate: hydrate,
    callbackNode: null,
    callbackPriority: NoLane,
    eventTimes: [NoLanes],
    expirationTimes: [NoTimestamp],
    pendingLanes: NoLanes,
    suspendedLanes: NoLanes,
    pingedLanes: NoLanes,
    expiredLanes: NoLanes,
    mutableReadLanes: NoLanes,
    finishedLanes: NoLanes,
    entangledLanes: NoLanes,
    entanglements: [NoLanes],
  },
  current: {
    tag: tag,
    key: key,
    elementType: null,
    type: null,
    stateNode: root,

    // Fiber
    return: null,
    child: null,
    sibling: null,
    index: 0,

    ref: null,

    pendingProps: pendingProps,
    memoizedProps: null,
    updateQueue: null,
    memoizedState: { element: null },
    dependencies: null,

    mode: NoMode,

    // Effects
    flags: NoFlags,
    subtreeFlags: NoFlags,
    deletions: null,

    lanes: NoLanes,
    childLanes: NoLanes,

    alternate: null
  }
}
const fiberRoot = root._internalRoot
container['__reactContainer$' + randomKey] = root.current
```

### 更新容器

```js
// file: packages/react-reconciler/src/ReactFiberReconciler.old.js
export function updateContainer(
  element: ReactNodeList,
  container: OpaqueRoot,
  parentComponent: ?React$Component<any, any>,
  callback: ?Function
): Lane {
  const current = container.current
  const eventTime = requestEventTime() // 获取更新时间
  const lane = requestUpdateLane(current) // 获取更新任务的优先级

  const context = getContextForSubtree(parentComponent) // 获取 context
  if (container.context === null) {
    container.context = context
  } else {
    container.pendingContext = context
  }

  const update = createUpdate(eventTime, lane) // 构建一次更新
  update.payload = { element }

  callback = callback === undefined ? null : callback
  if (callback !== null) {
    update.callback = callback
  }

  enqueueUpdate(current, update, lane)
  const root = scheduleUpdateOnFiber(current, lane, eventTime)
  if (root !== null) {
    entangleTransitions(root, current, lane)
  }

  return lane
}
```

1. 获取更新优先级，位数越底，优先级越高
2. 获取 `context`
3. 通过 `createUpdate` 创建更新

```js
// file: packages/react-reconciler/src/ReactUpdateQueue.old.js
export function createUpdate(eventTime: number, lane: Lane) {
  const update = {
    eventTime,
    lane,
    tag: UpdateState,
    payload: null,
    callback: null,
    next: null,
  }
  return update
}
```

4. 通过 `enqueueUpdate` 把更新放入更新队列

```js
// file: packages/react-reconciler/src/ReactUpdateQueue.old.js
export function enqueueUpdate<State>(
  fiber: Fiber,
  update: Update<State>,
  lane: Lane
) {
  const updateQueue = fiber.updateQueue
  if (updateQueue === null) {
    // 卸载时执行
    return
  }
  const sharedQueue = updateQueue.shared
  // 正在更新
  if (isInterleavedUpdate(fiber, lane)) {
    const interleaved = sharedQueue.interleaved
    if (interleaved === null) {
      // 构建更新环，并放入更新队列
      update.next = update
      pushInterleavedQueue(sharedQueue)
    } else {
      update.next = interleaved.next
      interleaved.next = update
    }
    sharedQueue.interleaved = update
  } else {
    const pending = sharedQueue.pending
    if (pending === null) {
      // 构建更新环，并放入更新队列
      update.next = update
    } else {
      update.next = pending.next
      pending.next = update
    }
    sharedQueue.pending = update
  }
}
```

5. 通过 `scheduleUpdateOnFiber` 调度更新
