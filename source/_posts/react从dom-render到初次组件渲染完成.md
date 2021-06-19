---
title: react从dom.render到初次组件渲染完成
date: 2021-06-19 22:12:44
tags: [JavaScript, react]
---

## 从 `dom.render` 到初次组件渲染完成

1. `render(element,container,callback) ` 调用 `legacyRenderSubtreeIntoContainer(null,element,container,false,callback)`
2. `legacyRenderSubtreeIntoContainer(parentComponent,children,container,forceHydrate,callback)` 调用`legacyCreateRootFromDOMContainer(container,false)` 创建容器并赋值给 `container._reactRootContainer`
3. 通过 `unbatchedUpdates` 同步更新容器元素并调用回调函数

### 构建容器

1. `legacyCreateRootFromDOMContainer` 调用 `createLegacyRoot(container)` 构建容器
2. 调用 `new ReactDOMLegacyRoot(container)` 构建实例
3. 构造函数中调用 `createRootImpl(container, ConcurrentRoot)` 创建根容器并赋值给 `_internalRoot` 属性
4. 调用 `createContainer(container, ConcurrentRoot)` 构建根元素
   1. 调用 `new FiberRootNode(container, ConcurrentRoot)` 构建根元素
   2. 调用 `createHostRootFiber` 构建 `Fiber`
   3. 初始化更新队列

```js
// file: packages/react-reconciler/src/ReactFiberRoot.old.js
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

  if (enableCache) {
    this.pooledCache = null
    this.pooledCacheLanes = NoLanes
  }

  if (supportsHydration) {
    this.mutableSourceEagerHydrationData = null
  }

  if (enableSuspenseCallback) {
    this.hydrationCallbacks = null
  }

  if (enableProfilerTimer && enableProfilerCommitHooks) {
    this.effectDuration = 0
    this.passiveEffectDuration = 0
  }

  if (enableUpdaterTracking) {
    this.memoizedUpdaters = new Set()
    const pendingUpdatersLaneMap = (this.pendingUpdatersLaneMap = [])
    for (let i = 0; i < TotalLanes; i++) {
      pendingUpdatersLaneMap.push(new Set())
    }
  }
}
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

##### 构建容器流程相关代码

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

### 更新容器

1. 获取更新优先级，位数越底，优先级越高
2. 获取 `context`
3. 通过 `createUpdate` 创建更新
4. 通过 `enqueueUpdate` 把更新放入更新队列
5. 通过 `scheduleUpdateOnFiber` 调度更新

#### 更新容器代码

```js
// file: packages/react-reconciler/src/ReactFiberReconciler.old.js
export function updateContainer(
  element: ReactNodeList,
  container: OpaqueRoot,
  parentComponent: ?React$Component<any, any>,
  callback: ?Function
): Lane {
  const current = container.current
  const eventTime = requestEventTime()
  const lane = requestUpdateLane(current)

  const context = getContextForSubtree(parentComponent)
  if (container.context === null) {
    container.context = context
  } else {
    container.pendingContext = context
  }

  const update = createUpdate(eventTime, lane)
  // Caution: React DevTools currently depends on this property
  // being called "element".
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
