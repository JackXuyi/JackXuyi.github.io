---
title: react的同步更新
date: 2021-06-13 18:10:34
tags: [JavaScript, react]
---

### react 同步更新

#### class 组件

每个 `class` 组件初始化时都会注入 `updater` 的属性

##### 更新过程

1. 构建更新节点
2. 把节点放入更新队列
3. 调度更新节点

```js
// packages/react-reconciler/src/ReactUpdateQueue.old.js
const classComponentUpdater = {
  isMounted,
  enqueueSetState(inst, payload, callback) {
    const fiber = getInstance(inst)
    const eventTime = requestEventTime()
    const lane = requestUpdateLane(fiber) // 获取更新方式，包括同步更新

    const update = createUpdate(eventTime, lane) // 构建更新
    update.payload = payload
    if (callback !== undefined && callback !== null) {
      update.callback = callback
    }

    enqueueUpdate(fiber, update, lane) // 更新放入队列
    const root = scheduleUpdateOnFiber(fiber, lane, eventTime) // 调度更新节点
    if (root !== null) {
      entangleTransitions(root, fiber, lane)
    }

    if (enableSchedulingProfiler) {
      markStateUpdateScheduled(fiber, lane)
    }
  },
  enqueueReplaceState(inst, payload, callback) {
    // 类似与 enqueueSetState
  },
  enqueueForceUpdate(inst, callback) {
    // 类似与 enqueueSetState
  },
}
```

###### 把节点放入更新队列

```ts
// packages/react-reconciler/src/ReactUpdateQueue.old.js
export function enqueueUpdate<State>(
  fiber: Fiber,
  update: Update<State>,
  lane: Lane
) {
  const updateQueue = fiber.updateQueue
  if (updateQueue === null) {
    // 组件卸载
    return
  }

  const sharedQueue = updateQueue.shared

  if (isInterleavedUpdate(fiber, lane)) {
    const interleaved = sharedQueue.interleaved
    if (interleaved === null) {
      // 挂载时构成一个循环链表
      update.next = update
      // At the end of the current render, this queue's interleaved updates will
      // be transfered to the pending queue.
      pushInterleavedQueue(sharedQueue)
    } else {
      update.next = interleaved.next
      interleaved.next = update
    }
    sharedQueue.interleaved = update
  } else {
    const pending = sharedQueue.pending
    if (pending === null) {
      // 挂载时构成一个循环链表
      update.next = update
    } else {
      update.next = pending.next
      pending.next = update
    }
    sharedQueue.pending = update
  }
}
```

##### 调度更新节点

```js
// packages/react-reconciler/src/ReactFiberWorkLoop.old.js
export function scheduleUpdateOnFiber(
  fiber: Fiber,
  lane: Lane,
  eventTime: number
): FiberRoot | null {
  checkForNestedUpdates()

  const root = markUpdateLaneFromFiberToRoot(fiber, lane) // 更新从当前 fiber 标记到根节点并返回根节点
  if (root === null) {
    return null
  }

  // 标记当前节点进入更新队列
  markRootUpdated(root, lane, eventTime)

  if (enableProfilerTimer && enableProfilerNestedUpdateScheduledHook) {
    if (
      (executionContext & CommitContext) !== NoContext &&
      root === rootCommittingMutationOrLayoutEffects
    ) {
      if (fiber.mode & ProfileMode) {
        let current = fiber
        while (current !== null) {
          if (current.tag === Profiler) {
            const { id, onNestedUpdateScheduled } = current.memoizedProps
            if (typeof onNestedUpdateScheduled === 'function') {
              onNestedUpdateScheduled(id)
            }
          }
          current = current.return
        }
      }
    }
  }

  // TODO: Consolidate with `isInterleavedUpdate` check
  if (root === workInProgressRoot) {
    // Received an update to a tree that's in the middle of rendering. Mark
    // that there was an interleaved update work on this root. Unless the
    // `deferRenderPhaseUpdateToNextBatch` flag is off and this is a render
    // phase update. In that case, we don't treat render phase updates as if
    // they were interleaved, for backwards compat reasons.
    if (
      deferRenderPhaseUpdateToNextBatch ||
      (executionContext & RenderContext) === NoContext
    ) {
      workInProgressRootUpdatedLanes = mergeLanes(
        workInProgressRootUpdatedLanes,
        lane
      )
    }
    if (workInProgressRootExitStatus === RootSuspendedWithDelay) {
      // The root already suspended with a delay, which means this render
      // definitely won't finish. Since we have a new update, let's mark it as
      // suspended now, right before marking the incoming update. This has the
      // effect of interrupting the current render and switching to the update.
      // TODO: Make sure this doesn't override pings that happen while we've
      // already started rendering.
      markRootSuspended(root, workInProgressRootRenderLanes)
    }
  }

  if (lane === SyncLane) {
    if (
      // Check if we're inside unbatchedUpdates
      (executionContext & LegacyUnbatchedContext) !== NoContext &&
      // Check if we're not already rendering
      (executionContext & (RenderContext | CommitContext)) === NoContext
    ) {
      performSyncWorkOnRoot(root) // 开始同步更新
    } else {
      ensureRootIsScheduled(root, eventTime)
      if (
        executionContext === NoContext &&
        (fiber.mode & ConcurrentMode) === NoMode
      ) {
        // Flush the synchronous work now, unless we're already working or inside
        // a batch. This is intentionally inside scheduleUpdateOnFiber instead of
        // scheduleCallbackForFiber to preserve the ability to schedule a callback
        // without immediately flushing it. We only do this for user-initiated
        // updates, to preserve historical behavior of legacy mode.
        resetRenderTimer()
        flushSyncCallbacksOnlyInLegacyMode()
      }
    }
  } else {
    // Schedule other updates after in case the callback is sync.
    ensureRootIsScheduled(root, eventTime)
  }

  return root
}
```

##### `performSyncWorkOnRoot`

```js
// packages/react-reconciler/src/ReactFiberWorkLoop.old.js
// This is the entry point for synchronous tasks that don't go
// through Scheduler
function performSyncWorkOnRoot(root) {
  if (enableProfilerTimer && enableProfilerNestedUpdatePhase) {
    syncNestedUpdateFlag()
  }

  flushPassiveEffects()

  let lanes = getNextLanes(root, NoLanes)
  if (!includesSomeLane(lanes, SyncLane)) {
    // 同步任务执行完毕
    ensureRootIsScheduled(root, now())
    return null
  }

  let exitStatus = renderRootSync(root, lanes)
  // 错误补偿逻辑

  // We now have a consistent tree. Because this is a sync render, we
  // will commit it even if something suspended.
  const finishedWork = root.current.alternate
  root.finishedWork = finishedWork
  root.finishedLanes = lanes
  commitRoot(root)

  // Before exiting, make sure there's a callback scheduled for the next
  // pending level.
  ensureRootIsScheduled(root, now())

  return null
}
```

##### `renderRootSync`

```js
// workInProgressRoot 全局变量
// file: packages/react-reconciler/src/ReactFiberWorkLoop.old.js
function renderRootSync(root: FiberRoot, lanes: Lanes) {
  const prevExecutionContext = executionContext
  executionContext |= RenderContext
  const prevDispatcher = pushDispatcher()

  // If the root or lanes have changed, throw out the existing stack
  // and prepare a fresh one. Otherwise we'll continue where we left off.
  if (workInProgressRoot !== root || workInProgressRootRenderLanes !== lanes) {
    prepareFreshStack(root, lanes) // 更新 context
  }

  if (enableSchedulingProfiler) {
    markRenderStarted(lanes)
  }

  do {
    try {
      workLoopSync()
      break
    } catch (thrownValue) {
      handleError(root, thrownValue)
    }
  } while (true)
  resetContextDependencies()
  executionContext = prevExecutionContext
  popDispatcher(prevDispatcher)

  if (enableSchedulingProfiler) {
    markRenderStopped()
  }

  // Set this to null to indicate there's no in-progress render.
  workInProgressRoot = null
  workInProgressRootRenderLanes = NoLanes

  return workInProgressRootExitStatus
}
```

##### `workLoopSync`

```js
// file: packages/react-reconciler/src/ReactFiberWorkLoop.old.js
// workInProgress 全局变量
function workLoopSync() {
  // Already timed out, so perform work without checking if we need to yield.
  while (workInProgress !== null) {
    performUnitOfWork(workInProgress)
  }
}
```

##### `performUnitOfWork`

```js
// file: packages/react-reconciler/src/ReactFiberWorkLoop.old.js
function performUnitOfWork(unitOfWork: Fiber): void {
  // 执行更新任务
  const current = unitOfWork.alternate
  let next = beginWork(current, unitOfWork, subtreeRenderLanes) // child
  unitOfWork.memoizedProps = unitOfWork.pendingProps
  if (next === null) {
    // 没有下一个任务时表示任务已经做完
    completeUnitOfWork(unitOfWork)
  } else {
    workInProgress = next
  }

  ReactCurrentOwner.current = null
}
```

##### `beginWork`

```ts
// file: packages/react-reconciler/src/ReactFiberBeginWork.old.js
function beginWork(
  current: Fiber | null,
  workInProgress: Fiber,
  renderLanes: Lanes
): Fiber | null {
  let updateLanes = workInProgress.lanes

  if (current !== null) {
    const oldProps = current.memoizedProps
    const newProps = workInProgress.pendingProps
    if (oldProps !== newProps || hasLegacyContextChanged()) {
      // props 更新或 context 更新
      didReceiveUpdate = true
    } else if (!includesSomeLane(renderLanes, updateLanes)) {
      didReceiveUpdate = false
      // 此次渲染的更新和等待的更新没有任何交集，新增等待的更新等待下次执行
    } else {
      // 其它更新逻辑
    }
  } else {
    didReceiveUpdate = false
  }

  // 清空
  workInProgress.lanes = NoLanes
  switch (workInProgress.tag) {
    case ClassComponent: {
      const Component = workInProgress.type
      const unresolvedProps = workInProgress.pendingProps
      const resolvedProps =
        workInProgress.elementType === Component
          ? unresolvedProps
          : resolveDefaultProps(Component, unresolvedProps)
      return updateClassComponent(
        current,
        workInProgress,
        Component,
        resolvedProps,
        renderLanes
      )
    }
    // 其它类型组件更新逻辑
  }
}
```

##### updateClassComponent

```js
// file: packages/react-reconciler/src/ReactFiberBeginWork.old.js
function updateClassComponent(
  current: Fiber | null,
  workInProgress: Fiber,
  Component: any,
  nextProps: any,
  renderLanes: Lanes
) {
  // 提取 context
  let hasContext
  if (isLegacyContextProvider(Component)) {
    hasContext = true
    pushLegacyContextProvider(workInProgress)
  } else {
    hasContext = false
  }
  prepareToReadContext(workInProgress, renderLanes)

  const instance = workInProgress.stateNode
  let shouldUpdate
  if (instance === null) {
    // 挂载
    if (current !== null) {
      // A class component without an instance only mounts if it suspended
      // inside a non-concurrent tree, in an inconsistent state. We want to
      // treat it like a new mount, even though an empty version of it already
      // committed. Disconnect the alternate pointers.
      current.alternate = null
      workInProgress.alternate = null
      // Since this is conceptually a new fiber, schedule a Placement effect
      workInProgress.flags |= Placement
    }
    // In the initial pass we might need to construct the instance.
    constructClassInstance(workInProgress, Component, nextProps)
    mountClassInstance(workInProgress, Component, nextProps, renderLanes)
    shouldUpdate = true
  } else if (current === null) {
    // In a resume, we'll already have an instance we can reuse.
    shouldUpdate = resumeMountClassInstance(
      workInProgress,
      Component,
      nextProps,
      renderLanes
    )
  } else {
    //   更新
    shouldUpdate = updateClassInstance(
      current,
      workInProgress,
      Component,
      nextProps,
      renderLanes
    )
  }
  const nextUnitOfWork = finishClassComponent(
    current,
    workInProgress,
    Component,
    shouldUpdate,
    hasContext,
    renderLanes
  ) // child
  return nextUnitOfWork
}
```

##### `constructClassInstance`

```ts
// file: packages/react-reconciler/src/ReactFiberClassComponent.old.js
function constructClassInstance(
  workInProgress: Fiber,
  ctor: any,
  props: any
): any {
  let isLegacyContextConsumer = false
  let unmaskedContext = emptyContextObject
  let context = emptyContextObject
  const contextType = ctor.contextType

  // 提取 context
  if (typeof contextType === 'object' && contextType !== null) {
    context = readContext(contextType)
  } else if (!disableLegacyContext) {
    unmaskedContext = getUnmaskedContext(workInProgress, ctor, true)
    const contextTypes = ctor.contextTypes
    isLegacyContextConsumer =
      contextTypes !== null && contextTypes !== undefined
    context = isLegacyContextConsumer
      ? getMaskedContext(workInProgress, unmaskedContext)
      : emptyContextObject
  }

  // 构建组件实例
  const instance = new ctor(props, context)
  const state = (workInProgress.memoizedState =
    instance.state !== null && instance.state !== undefined
      ? instance.state
      : null)
  // fiber 注入更新队列和实例信息，存储实例和 fiber 映射
  adoptClassInstance(workInProgress, instance)

  // 缓存 context
  if (isLegacyContextConsumer) {
    cacheContext(workInProgress, unmaskedContext, context)
  }

  return instance
}
```

##### `adoptClassInstance`

```ts
// file: packages/react-reconciler/src/ReactFiberClassComponent.old.js
function adoptClassInstance(workInProgress: Fiber, instance: any): void {
  instance.updater = classComponentUpdater // 更新队列
  workInProgress.stateNode = instance // 存储组件实例
  //构建 fiber 和组件实例的映射
  setInstance(instance, workInProgress)
}
```

##### `mountClassInstance`

```ts
// file: packages/react-reconciler/src/ReactFiberClassComponent.old.js
function mountClassInstance(
  workInProgress: Fiber,
  ctor: any,
  newProps: any,
  renderLanes: Lanes
): void {
  const instance = workInProgress.stateNode
  instance.props = newProps
  instance.state = workInProgress.memoizedState
  instance.refs = emptyRefsObject

  // 初始化队列
  initializeUpdateQueue(workInProgress)

  // 获取 context
  const contextType = ctor.contextType
  if (typeof contextType === 'object' && contextType !== null) {
    instance.context = readContext(contextType)
  } else if (disableLegacyContext) {
    instance.context = emptyContextObject
  } else {
    const unmaskedContext = getUnmaskedContext(workInProgress, ctor, true)
    instance.context = getMaskedContext(workInProgress, unmaskedContext)
  }

  // 更新 state
  instance.state = workInProgress.memoizedState

  // 执行 getDerivedStateFromProps 更新 state
  const getDerivedStateFromProps = ctor.getDerivedStateFromProps
  if (typeof getDerivedStateFromProps === 'function') {
    applyDerivedStateFromProps(
      workInProgress,
      ctor,
      getDerivedStateFromProps,
      newProps
    )
    instance.state = workInProgress.memoizedState
  }

  // 执行 componentWillMount 生命周期
  if (
    typeof ctor.getDerivedStateFromProps !== 'function' &&
    typeof instance.getSnapshotBeforeUpdate !== 'function' &&
    (typeof instance.UNSAFE_componentWillMount === 'function' ||
      typeof instance.componentWillMount === 'function')
  ) {
    callComponentWillMount(workInProgress, instance)
    // componentWillMount 执行 setState 时立即更新 state
    processUpdateQueue(workInProgress, newProps, instance, renderLanes)
    instance.state = workInProgress.memoizedState
  }

  if (typeof instance.componentDidMount === 'function') {
    let fiberFlags: Flags = Update
    if (enableSuspenseLayoutEffectSemantics) {
      fiberFlags |= LayoutStatic
    }
    workInProgress.flags |= fiberFlags
  }
}
```

##### `finishClassComponent`

```ts
// file: packages/react-reconciler/src/ReactFiberClassComponent.old.js
function finishClassComponent(
  current: Fiber | null,
  workInProgress: Fiber,
  Component: any,
  shouldUpdate: boolean,
  hasContext: boolean,
  renderLanes: Lanes
) {
  // Refs should update even if shouldComponentUpdate returns false
  markRef(current, workInProgress)

  const didCaptureError = (workInProgress.flags & DidCapture) !== NoFlags

  if (!shouldUpdate && !didCaptureError) {
    return bailoutOnAlreadyFinishedWork(current, workInProgress, renderLanes)
  }

  const instance = workInProgress.stateNode

  // Rerender
  ReactCurrentOwner.current = workInProgress
  let nextChildren
  if (
    didCaptureError &&
    typeof Component.getDerivedStateFromError !== 'function'
  ) {
    // 错误处理
  } else {
    nextChildren = instance.render()
  }

  reconcileChildren(current, workInProgress, nextChildren, renderLanes)

  // 记录 state
  workInProgress.memoizedState = instance.state

  return workInProgress.child
}
```

##### `reconcileChildren`

```ts
// file: packages/react-reconciler/src/ReactFiberClassComponent.old.js
function reconcileChildren(
  current: Fiber | null,
  workInProgress: Fiber,
  nextChildren: any,
  renderLanes: Lanes
) {
  if (current === null) {
    // 挂载
    workInProgress.child = mountChildFibers(
      workInProgress,
      null,
      nextChildren,
      renderLanes
    )
  } else {
    // 更新
  }
}
```

##### `ChildReconciler`

```ts
// file: packages/react-reconciler/src/ReactChildFiber.old.js
const mountChildFibers = ChildReconciler(false)

function ChildReconciler(shouldTrackSideEffects) {
  function deleteChild(returnFiber: Fiber, childToDelete: Fiber): void {
    if (!shouldTrackSideEffects) {
      return
    }
    // 更新逻辑
  }

  function deleteRemainingChildren(
    returnFiber: Fiber,
    currentFirstChild: Fiber | null
  ): null {
    if (!shouldTrackSideEffects) {
      return null
    }
    // 更新逻辑
  }

  function useFiber(fiber: Fiber, pendingProps: mixed): Fiber {
    const clone = createWorkInProgress(fiber, pendingProps) // 构建一个新的 fiber 节点
    clone.index = 0
    clone.sibling = null
    return clone
  }

  function placeChild(
    newFiber: Fiber,
    lastPlacedIndex: number,
    newIndex: number
  ): number {
    newFiber.index = newIndex
    if (!shouldTrackSideEffects) {
      return lastPlacedIndex
    }
    // 更新逻辑
  }

  // 返回 fiber
  function placeSingleChild(newFiber: Fiber): Fiber {
    return newFiber
  }

  function reconcileSingleTextNode(
    returnFiber: Fiber,
    currentFirstChild: Fiber | null,
    textContent: string,
    lanes: Lanes
  ): Fiber {
    // There's no need to check for keys on text nodes since we don't have a
    // way to define them.
    if (currentFirstChild !== null && currentFirstChild.tag === HostText) {
      // We already have an existing node so let's just update it and delete
      // the rest.
      deleteRemainingChildren(returnFiber, currentFirstChild.sibling)
      const existing = useFiber(currentFirstChild, textContent)
      existing.return = returnFiber
      return existing
    }
    // The existing first child is not a text node so we need to create one
    // and delete the existing ones.
    deleteRemainingChildren(returnFiber, currentFirstChild)
    const created = createFiberFromText(textContent, returnFiber.mode, lanes)
    created.return = returnFiber
    return created
  }

  // 构建 fiber
  function reconcileSingleElement(
    returnFiber: Fiber,
    currentFirstChild: Fiber | null,
    element: ReactElement,
    lanes: Lanes
  ): Fiber {
    const key = element.key
    let child = currentFirstChild
    while (child !== null) {
      // TODO: If key === null and child.key === null, then this only applies to
      // the first item in the list.
      if (child.key === key) {
        const elementType = element.type
        if (elementType === REACT_FRAGMENT_TYPE) {
          if (child.tag === Fragment) {
            deleteRemainingChildren(returnFiber, child.sibling)
            const existing = useFiber(child, element.props.children)
            existing.return = returnFiber
            return existing
          }
        } else {
          if (
            child.elementType === elementType ||
            (enableLazyElements &&
              typeof elementType === 'object' &&
              elementType !== null &&
              elementType.$$typeof === REACT_LAZY_TYPE &&
              resolveLazy(elementType) === child.type)
          ) {
            deleteRemainingChildren(returnFiber, child.sibling)
            const existing = useFiber(child, element.props)
            existing.ref = coerceRef(returnFiber, child, element)
            existing.return = returnFiber
            return existing
          }
        }
        // Didn't match.
        deleteRemainingChildren(returnFiber, child)
        break
      } else {
        deleteChild(returnFiber, child)
      }
      child = child.sibling
    }

    if (element.type === REACT_FRAGMENT_TYPE) {
      const created = createFiberFromFragment(
        element.props.children,
        returnFiber.mode,
        lanes,
        element.key
      )
      created.return = returnFiber
      return created
    } else {
      const created = createFiberFromElement(element, returnFiber.mode, lanes)
      created.ref = coerceRef(returnFiber, currentFirstChild, element)
      created.return = returnFiber
      return created
    }
  }

  // 构建 children fiber
  function reconcileChildFibers(
    returnFiber: Fiber,
    currentFirstChild: Fiber | null,
    newChild: any,
    lanes: Lanes
  ): Fiber | null {
    // 处理 <>{[...]}</> 和 <>...</> 组件，从其中提取 children
    const isUnkeyedTopLevelFragment =
      typeof newChild === 'object' &&
      newChild !== null &&
      newChild.type === REACT_FRAGMENT_TYPE &&
      newChild.key === null
    if (isUnkeyedTopLevelFragment) {
      newChild = newChild.props.children
    }

    // 对象类型，为 react 组件
    if (typeof newChild === 'object' && newChild !== null) {
      switch (newChild.$$typeof) {
        case REACT_ELEMENT_TYPE:
          return placeSingleChild(
            reconcileSingleElement(
              returnFiber,
              currentFirstChild,
              newChild,
              lanes
            )
          )
        // 其它 react 组件类型
      }

      // 数组、迭代器，支持 promise 或者 generate
    }

    if (typeof newChild === 'string' || typeof newChild === 'number') {
      // 处理字符串或数字类型
      return placeSingleChild(
        reconcileSingleTextNode(
          returnFiber,
          currentFirstChild,
          '' + newChild,
          lanes
        )
      )
    }

    // Remaining cases are all treated as empty.
    return deleteRemainingChildren(returnFiber, currentFirstChild)
  }

  return reconcileChildFibers
}
```

##### `completeUnitOfWork`

```ts
// file: packages/react-reconciler/src/ReactFiberWorkLoop.old.js
function completeUnitOfWork(unitOfWork: Fiber): void {
  let completedWork = unitOfWork
  do {
    const current = completedWork.alternate // 更新后的 fiber
    const returnFiber = completedWork.return // 父节点 fiber

    if ((completedWork.flags & Incomplete) === NoFlags) {
      // 任务未完成
      let next = completeWork(current, completedWork, subtreeRenderLanes)
      if (next !== null) {
        // Completing this fiber spawned new work. Work on that next.
        workInProgress = next
        return
      }
    } else {
      // This fiber did not complete because something threw. Pop values off
      // the stack without entering the complete phase. If this is a boundary,
      // capture values if possible.
      const next = unwindWork(completedWork, subtreeRenderLanes)

      // Because this fiber did not complete, don't reset its expiration time.

      if (next !== null) {
        // If completing this work spawned new work, do that next. We'll come
        // back here again.
        // Since we're restarting, remove anything that is not a host effect
        // from the effect tag.
        next.flags &= HostEffectMask
        workInProgress = next
        return
      }

      if (returnFiber !== null) {
        // Mark the parent fiber as incomplete and clear its subtree flags.
        returnFiber.flags |= Incomplete
        returnFiber.subtreeFlags = NoFlags
        returnFiber.deletions = null
      }
    }

    const siblingFiber = completedWork.sibling
    if (siblingFiber !== null) {
      // If there is more work to do in this returnFiber, do that next.
      workInProgress = siblingFiber
      return
    }
    // Otherwise, return to the parent
    completedWork = returnFiber
    // Update the next thing we're working on in case something throws.
    workInProgress = completedWork
  } while (completedWork !== null)

  // We've reached the root.
  if (workInProgressRootExitStatus === RootIncomplete) {
    workInProgressRootExitStatus = RootCompleted
  }
}
```

##### `commitRoot`

调用 `commitRootImpl` 提交更新

```ts
function commitRootImpl(root, renderPriorityLevel) {
  do {
    // `flushPassiveEffects` will call `flushSyncUpdateQueue` at the end, which
    // means `flushPassiveEffects` will sometimes result in additional
    // passive effects. So we need to keep flushing in a loop until there are
    // no more pending effects.
    // TODO: Might be better if `flushPassiveEffects` did not automatically
    // flush synchronous work at the end, to avoid factoring hazards like this.
    flushPassiveEffects();
  } while (rootWithPendingPassiveEffects !== null);

  const finishedWork = root.finishedWork;
  const lanes = root.finishedLanes;

  if (finishedWork === null) {
    return null;
  }
  root.finishedWork = null;
  root.finishedLanes = NoLanes;

  // commitRoot never returns a continuation; it always finishes synchronously.
  // So we can clear these now to allow a new callback to be scheduled.
  root.callbackNode = null;
  root.callbackPriority = NoLane;

  // Update the first and last pending times on this root. The new first
  // pending time is whatever is left on the root fiber.
  let remainingLanes = mergeLanes(finishedWork.lanes, finishedWork.childLanes);
  markRootFinished(root, remainingLanes);

  if (root === workInProgressRoot) {
    // We can reset these now that they are finished.
    workInProgressRoot = null;
    workInProgress = null;
    workInProgressRootRenderLanes = NoLanes;
  }

  // If there are pending passive effects, schedule a callback to process them.
  // Do this as early as possible, so it is queued before anything else that
  // might get scheduled in the commit phase. (See #16714.)
  // TODO: Delete all other places that schedule the passive effect callback
  // They're redundant.
  if (
    (finishedWork.subtreeFlags & PassiveMask) !== NoFlags ||
    (finishedWork.flags & PassiveMask) !== NoFlags
  ) {
    if (!rootDoesHavePassiveEffects) {
      rootDoesHavePassiveEffects = true;
      scheduleCallback(NormalSchedulerPriority, () => {
        flushPassiveEffects();
        return null;
      });
    }
  }

  // Check if there are any effects in the whole tree.
  // TODO: This is left over from the effect list implementation, where we had
  // to check for the existence of `firstEffect` to satsify Flow. I think the
  // only other reason this optimization exists is because it affects profiling.
  // Reconsider whether this is necessary.
  const subtreeHasEffects =
    (finishedWork.subtreeFlags &
      (BeforeMutationMask | MutationMask | LayoutMask | PassiveMask)) !==
    NoFlags;
  const rootHasEffect =
    (finishedWork.flags &
      (BeforeMutationMask | MutationMask | LayoutMask | PassiveMask)) !==
    NoFlags;

  if (subtreeHasEffects || rootHasEffect) {
    const prevTransition = ReactCurrentBatchConfig.transition;
    ReactCurrentBatchConfig.transition = 0;
    const previousPriority = getCurrentUpdatePriority();
    setCurrentUpdatePriority(DiscreteEventPriority);

    const prevExecutionContext = executionContext;
    executionContext |= CommitContext;

    // Reset this to null before calling lifecycles
    ReactCurrentOwner.current = null;

    // The commit phase is broken into several sub-phases. We do a separate pass
    // of the effect list for each phase: all mutation effects come before all
    // layout effects, and so on.

    // The first phase a "before mutation" phase. We use this phase to read the
    // state of the host tree right before we mutate it. This is where
    // getSnapshotBeforeUpdate is called.
    const shouldFireAfterActiveInstanceBlur = commitBeforeMutationEffects(
      root,
      finishedWork,
    );

    if (enableProfilerTimer) {
      // Mark the current commit time to be shared by all Profilers in this
      // batch. This enables them to be grouped later.
      recordCommitTime();
    }

    if (enableProfilerTimer && enableProfilerNestedUpdateScheduledHook) {
      // Track the root here, rather than in commitLayoutEffects(), because of ref setters.
      // Updates scheduled during ref detachment should also be flagged.
      rootCommittingMutationOrLayoutEffects = root;
    }

    // The next phase is the mutation phase, where we mutate the host tree.
    commitMutationEffects(root, finishedWork, lanes);

    if (shouldFireAfterActiveInstanceBlur) {
      afterActiveInstanceBlur();
    }
    resetAfterCommit(root.containerInfo);

    // The work-in-progress tree is now the current tree. This must come after
    // the mutation phase, so that the previous tree is still current during
    // componentWillUnmount, but before the layout phase, so that the finished
    // work is current during componentDidMount/Update.
    root.current = finishedWork;
    commitLayoutEffects(finishedWork, root, lanes);

    if (enableProfilerTimer && enableProfilerNestedUpdateScheduledHook) {
      rootCommittingMutationOrLayoutEffects = null;
    }

    // Tell Scheduler to yield at the end of the frame, so the browser has an
    // opportunity to paint.
    requestPaint();

    executionContext = prevExecutionContext;

    // Reset the priority to the previous non-sync value.
    setCurrentUpdatePriority(previousPriority);
    ReactCurrentBatchConfig.transition = prevTransition;
  } else {
    // No effects.
    root.current = finishedWork;
    // Measure these anyway so the flamegraph explicitly shows that there were
    // no effects.
    // TODO: Maybe there's a better way to report this.
    if (enableProfilerTimer) {
      recordCommitTime();
    }
  }

  const rootDidHavePassiveEffects = rootDoesHavePassiveEffects;

  if (rootDoesHavePassiveEffects) {
    // This commit has passive effects. Stash a reference to them. But don't
    // schedule a callback until after flushing layout work.
    rootDoesHavePassiveEffects = false;
    rootWithPendingPassiveEffects = root;
    pendingPassiveEffectsLanes = lanes;
  }

  // Read this again, since an effect might have updated it
  remainingLanes = root.pendingLanes;

  // Check if there's remaining work on this root
  if (remainingLanes === NoLanes) {
    // If there's no remaining work, we can clear the set of already failed
    // error boundaries.
    legacyErrorBoundariesThatAlreadyFailed = null;
  }


  if (includesSomeLane(remainingLanes, (SyncLane: Lane))) {
    if (enableProfilerTimer && enableProfilerNestedUpdatePhase) {
      markNestedUpdateScheduled();
    }

    // Count the number of times the root synchronously re-renders without
    // finishing. If there are too many, it indicates an infinite update loop.
    if (root === rootWithNestedUpdates) {
      nestedUpdateCount++;
    } else {
      nestedUpdateCount = 0;
      rootWithNestedUpdates = root;
    }
  } else {
    nestedUpdateCount = 0;
  }

  // Always call this before exiting `commitRoot`, to ensure that any
  // additional work on this root is scheduled.
  ensureRootIsScheduled(root, now());

  if (hasUncaughtError) {
    hasUncaughtError = false;
    const error = firstUncaughtError;
    firstUncaughtError = null;
    throw error;
  }

  if ((executionContext & LegacyUnbatchedContext) !== NoContext) {
    if (enableSchedulingProfiler) {
      markCommitStopped();
    }

    // This is a legacy edge case. We just committed the initial mount of
    // a ReactDOM.render-ed root inside of batchedUpdates. The commit fired
    // synchronously, but layout updates should be deferred until the end
    // of the batch.
    return null;
  }

  // If the passive effects are the result of a discrete render, flush them
  // synchronously at the end of the current task so that the result is
  // immediately observable. Otherwise, we assume that they are not
  // order-dependent and do not need to be observed by external systems, so we
  // can wait until after paint.
  // TODO: We can optimize this by not scheduling the callback earlier. Since we
  // currently schedule the callback in multiple places, will wait until those
  // are consolidated.
  if (
    includesSomeLane(pendingPassiveEffectsLanes, SyncLane) &&
    root.tag !== LegacyRoot
  ) {
    flushPassiveEffects();
  }

  // If layout work was scheduled, flush it now.
  flushSyncCallbacks();

  if (enableSchedulingProfiler) {
    markCommitStopped();
  }

  return null;
}

```

##### `flushPassiveEffects`

调用 `flushPassiveEffectsImpl`

```ts
function flushPassiveEffectsImpl() {
  if (rootWithPendingPassiveEffects === null) {
    return false;
  }

  const root = rootWithPendingPassiveEffects;
  const lanes = pendingPassiveEffectsLanes;
  rootWithPendingPassiveEffects = null;
  // TODO: This is sometimes out of sync with rootWithPendingPassiveEffects.
  // Figure out why and fix it. It's not causing any known issues (probably
  // because it's only used for profiling), but it's a refactor hazard.
  pendingPassiveEffectsLanes = NoLanes;

  const prevExecutionContext = executionContext;
  executionContext |= CommitContext;

  commitPassiveUnmountEffects(root.current);
  commitPassiveMountEffects(root, root.current);

  // TODO: Move to commitPassiveMountEffects
  if (enableProfilerTimer && enableProfilerCommitHooks) {
    const profilerEffects = pendingPassiveProfilerEffects;
    pendingPassiveProfilerEffects = [];
    for (let i = 0; i < profilerEffects.length; i++) {
      const fiber = ((profilerEffects[i]: any): Fiber);
      commitPassiveEffectDurations(root, fiber);
    }
  }

  executionContext = prevExecutionContext;
  flushSyncCallbacks();

  // If additional passive effects were scheduled, increment a counter. If this
  // exceeds the limit, we'll fire a warning.
  nestedPassiveUpdateCount =
    rootWithPendingPassiveEffects === null ? 0 : nestedPassiveUpdateCount + 1;

  if (enableProfilerTimer && enableProfilerCommitHooks) {
    const stateNode = root.current.stateNode;
    stateNode.effectDuration = 0;
    stateNode.passiveEffectDuration = 0;
  }

  return true;
}
```

##### `commitPassiveUnmountEffects`

执行生命周期钩子，当进入节点时立即执行生命周期函数
遍历顺序为： 根节点---> 父节点 ---> 叶子节点 ---> 兄弟叶子节点 ---> 父节点 ---> 根节点

调用 `commitPassiveUnmountEffects_begin` 开启操作，`commitPassiveUnmountEffects_complete` 完成操作

```ts
// file: packages/react-reconciler/src/ReactFiberCommitWork.old.js
// nextEffect 全局变量
function commitPassiveUnmountEffects_begin() {
  // curr -> child -> child
  while (nextEffect !== null) {
    const fiber = nextEffect
    const child = fiber.child

    if ((nextEffect.flags & ChildDeletion) !== NoFlags) {
      const deletions = fiber.deletions
      if (deletions !== null) {
        for (let i = 0; i < deletions.length; i++) {
          const fiberToDelete = deletions[i]
          nextEffect = fiberToDelete
          commitPassiveUnmountEffectsInsideOfDeletedTree_begin(
            fiberToDelete,
            fiber
          )
        }

        if (deletedTreeCleanUpLevel >= 1) {
          // A fiber was deleted from this parent fiber, but it's still part of
          // the previous (alternate) parent fiber's list of children. Because
          // children are a linked list, an earlier sibling that's still alive
          // will be connected to the deleted fiber via its `alternate`:
          //
          //   live fiber
          //   --alternate--> previous live fiber
          //   --sibling--> deleted fiber
          //
          // We can't disconnect `alternate` on nodes that haven't been deleted
          // yet, but we can disconnect the `sibling` and `child` pointers.
          const previousFiber = fiber.alternate
          if (previousFiber !== null) {
            let detachedChild = previousFiber.child
            if (detachedChild !== null) {
              previousFiber.child = null
              do {
                const detachedSibling = detachedChild.sibling
                detachedChild.sibling = null
                detachedChild = detachedSibling
              } while (detachedChild !== null)
            }
          }
        }

        nextEffect = fiber
      }
    }

    if ((fiber.subtreeFlags & PassiveMask) !== NoFlags && child !== null) {
      ensureCorrectReturnPointer(child, fiber) // 确保父节点指向 fiber
      nextEffect = child
    } else {
      commitPassiveUnmountEffects_complete()
    }
  }
}

function commitPassiveUnmountEffects_complete() {
  // 若存在兄弟节点则遍历下一个兄弟节点，否则返回父节点
  while (nextEffect !== null) {
    const fiber = nextEffect
    if ((fiber.flags & Passive) !== NoFlags) {
      commitPassiveUnmountOnFiber(fiber)
    }

    const sibling = fiber.sibling
    if (sibling !== null) {
      ensureCorrectReturnPointer(sibling, fiber.return)
      nextEffect = sibling
      return
    }
    nextEffect = fiber.return
  }
}

function commitPassiveUnmountOnFiber(finishedWork: Fiber): void {
  switch (finishedWork.tag) {
    case FunctionComponent:
    case ForwardRef:
    case SimpleMemoComponent: {
        commitHookEffectListUnmount(
          HookPassive | HookHasEffect,
          finishedWork,
          finishedWork.return,
        );
      break;
    }
  }
}

function commitPassiveUnmountEffectsInsideOfDeletedTree_begin(
  deletedSubtreeRoot: Fiber,
  nearestMountedAncestor: Fiber | null
) {
  // p-> child -> child
  while (nextEffect !== null) {
    const fiber = nextEffect
    // Deletion effects fire in parent -> child order
    // TODO: Check if fiber has a PassiveStatic flag
    commitPassiveUnmountInsideDeletedTreeOnFiber(fiber, nearestMountedAncestor)

    const child = fiber.child
    // TODO: Only traverse subtree if it has a PassiveStatic flag. (But, if we
    // do this, still need to handle `deletedTreeCleanUpLevel` correctly.)
    if (child !== null) {
      ensureCorrectReturnPointer(child, fiber)
      nextEffect = child
    } else {
      commitPassiveUnmountEffectsInsideOfDeletedTree_complete(
        deletedSubtreeRoot
      )
    }
  }
}

function commitPassiveUnmountInsideDeletedTreeOnFiber(
  current: Fiber,
  nearestMountedAncestor: Fiber | null
): void {
  switch (current.tag) {
    case FunctionComponent:
    case ForwardRef:
    case SimpleMemoComponent: {
      commitHookEffectListUnmount(HookPassive, current, nearestMountedAncestor)
      break
    }
  }
}

// 销毁组件，要销毁的组件存在 updateQueue 中
function commitHookEffectListUnmount(
  flags: HookFlags,
  finishedWork: Fiber,
  nearestMountedAncestor: Fiber | null,
) {
  const updateQueue: FunctionComponentUpdateQueue | null = (finishedWork.updateQueue: any);
  const lastEffect = updateQueue !== null ? updateQueue.lastEffect : null;
  if (lastEffect !== null) {
    const firstEffect = lastEffect.next;
    let effect = firstEffect;
    do {
      if ((effect.tag & flags) === flags) {
        // Unmount
        const destroy = effect.destroy;
        effect.destroy = undefined;
        if (destroy !== undefined) {
          safelyCallDestroy(finishedWork, nearestMountedAncestor, destroy); // 调用 destroy 销毁组件
        }
      }
      effect = effect.next;
    } while (effect !== firstEffect);
  }
}

function commitPassiveUnmountEffectsInsideOfDeletedTree_complete(
  deletedSubtreeRoot: Fiber
) {
  while (nextEffect !== null) {
    const fiber = nextEffect
    const sibling = fiber.sibling
    const returnFiber = fiber.return

    if (deletedTreeCleanUpLevel >= 2) {
      // Recursively traverse the entire deleted tree and clean up fiber fields.
      // This is more aggressive than ideal, and the long term goal is to only
      // have to detach the deleted tree at the root.
      detachFiberAfterEffects(fiber)
      if (fiber === deletedSubtreeRoot) {
        nextEffect = null
        return
      }
    } else {
      // This is the default branch (level 0). We do not recursively clear all
      // the fiber fields. Only the root of the deleted subtree.
      if (fiber === deletedSubtreeRoot) {
        detachFiberAfterEffects(fiber)
        nextEffect = null
        return
      }
    }

    if (sibling !== null) {
      ensureCorrectReturnPointer(sibling, returnFiber)
      nextEffect = sibling
      return
    }

    nextEffect = returnFiber
  }
}

function detachFiberAfterEffects(fiber: Fiber) {
  const alternate = fiber.alternate
  if (alternate !== null) {
    fiber.alternate = null
    detachFiberAfterEffects(alternate)
  }

  // Note: Defensively using negation instead of < in case
  // `deletedTreeCleanUpLevel` is undefined.
  if (!(deletedTreeCleanUpLevel >= 2)) {
    // This is the default branch (level 0).
    fiber.child = null
    fiber.deletions = null
    fiber.dependencies = null
    fiber.memoizedProps = null
    fiber.memoizedState = null
    fiber.pendingProps = null
    fiber.sibling = null
    fiber.stateNode = null
    fiber.updateQueue = null
  } else {
    // Clear cyclical Fiber fields. This level alone is designed to roughly
    // approximate the planned Fiber refactor. In that world, `setState` will be
    // bound to a special "instance" object instead of a Fiber. The Instance
    // object will not have any of these fields. It will only be connected to
    // the fiber tree via a single link at the root. So if this level alone is
    // sufficient to fix memory issues, that bodes well for our plans.
    fiber.child = null
    fiber.deletions = null
    fiber.sibling = null

    // The `stateNode` is cyclical because on host nodes it points to the host
    // tree, which has its own pointers to children, parents, and siblings.
    // The other host nodes also point back to fibers, so we should detach that
    // one, too.
    if (fiber.tag === HostComponent) {
      const hostInstance: Instance = fiber.stateNode
      if (hostInstance !== null) {
        detachDeletedInstance(hostInstance) // 删除 react 相关属性，包括事件、容器等
      }
    }
    fiber.stateNode = null

    if (deletedTreeCleanUpLevel >= 3) {
      // Theoretically, nothing in here should be necessary, because we already
      // disconnected the fiber from the tree. So even if something leaks this
      // particular fiber, it won't leak anything else
      //
      // The purpose of this branch is to be super aggressive so we can measure
      // if there's any difference in memory impact. If there is, that could
      // indicate a React leak we don't know about.
      fiber.return = null
      fiber.dependencies = null
      fiber.memoizedProps = null
      fiber.memoizedState = null
      fiber.pendingProps = null
      fiber.stateNode = null
      // TODO: Move to `commitPassiveUnmountInsideDeletedTreeOnFiber` instead.
      fiber.updateQueue = null
    }
  }
}
```

##### `commitBeforeMutationEffects`

执行生命周期钩子，当进入节点时立即执行生命周期函数
遍历顺序为： 根节点---> 父节点 ---> 叶子节点 ---> 兄弟叶子节点 ---> 父节点 ---> 根节点

```ts
// file: packages/react-reconciler/src/ReactFiberCommitWork.old.js
// nextEffect, focusedInstanceHandle 全局变量
export function commitBeforeMutationEffects(
  root: FiberRoot,
  firstChild: Fiber
) {
  focusedInstanceHandle = prepareForCommit(root.containerInfo) // 查找活跃的的节点

  nextEffect = firstChild
  commitBeforeMutationEffects_begin()

  // We no longer need to track the active instance fiber
  const shouldFire = shouldFireAfterActiveInstanceBlur
  shouldFireAfterActiveInstanceBlur = false
  focusedInstanceHandle = null

  return shouldFire
}

function commitBeforeMutationEffects_begin() {
  while (nextEffect !== null) {
    const fiber = nextEffect

    // TODO: Should wrap this in flags check, too, as optimization
    const deletions = fiber.deletions
    if (deletions !== null) {
      for (let i = 0; i < deletions.length; i++) {
        const deletion = deletions[i]
        commitBeforeMutationEffectsDeletion(deletion)
      }
    }

    const child = fiber.child
    if (
      (fiber.subtreeFlags & BeforeMutationMask) !== NoFlags &&
      child !== null
    ) {
      ensureCorrectReturnPointer(child, fiber)
      nextEffect = child
    } else {
      commitBeforeMutationEffects_complete()
    }
  }
}

function commitBeforeMutationEffects_complete() {
  // 先兄弟节点再父节点
  while (nextEffect !== null) {
    const fiber = nextEffect
    commitBeforeMutationEffectsOnFiber(fiber)
    const sibling = fiber.sibling
    if (sibling !== null) {
      ensureCorrectReturnPointer(sibling, fiber.return)
      nextEffect = sibling
      return
    }

    nextEffect = fiber.return
  }
}

function commitBeforeMutationEffectsOnFiber(finishedWork: Fiber) {
  const current = finishedWork.alternate
  const flags = finishedWork.flags

  if (!shouldFireAfterActiveInstanceBlur && focusedInstanceHandle !== null) {
    // Check to see if the focused element was inside of a hidden (Suspense) subtree.
    // TODO: Move this out of the hot path using a dedicated effect tag.
    if (
      finishedWork.tag === SuspenseComponent &&
      isSuspenseBoundaryBeingHidden(current, finishedWork) &&
      doesFiberContain(finishedWork, focusedInstanceHandle)
    ) {
      shouldFireAfterActiveInstanceBlur = true
      beforeActiveInstanceBlur(finishedWork)
    }
  }

  if ((flags & Snapshot) !== NoFlags) {
    switch (finishedWork.tag) {
      case FunctionComponent:
      case ForwardRef:
      case SimpleMemoComponent: {
        break
      }
      case ClassComponent: {
        if (current !== null) {
          const prevProps = current.memoizedProps
          const prevState = current.memoizedState
          const instance = finishedWork.stateNode
          const snapshot = instance.getSnapshotBeforeUpdate(
            finishedWork.elementType === finishedWork.type
              ? prevProps
              : resolveDefaultProps(finishedWork.type, prevProps),
            prevState
          )
          instance.__reactInternalSnapshotBeforeUpdate = snapshot
        }
        break
      }
      case HostRoot: {
        if (supportsMutation) {
          const root = finishedWork.stateNode
          clearContainer(root.containerInfo)
        }
        break
      }
      case HostComponent:
      case HostText:
      case HostPortal:
      case IncompleteClassComponent:
        // Nothing to do for these component types
        break
      default: {
      }
    }
  }
}

function commitBeforeMutationEffectsDeletion(deletion: Fiber) {
  // TODO (effects) It would be nice to avoid calling doesFiberContain()
  // Maybe we can repurpose one of the subtreeFlags positions for this instead?
  // Use it to store which part of the tree the focused instance is in?
  // This assumes we can safely determine that instance during the "render" phase.
  if (doesFiberContain(deletion, focusedInstanceHandle)) {
    shouldFireAfterActiveInstanceBlur = true
    beforeActiveInstanceBlur(deletion)
  }
}
```

##### `commitMutationEffects`

构建 dom 节点，在离开节点时开始 dom 构建
遍历顺序为： 根节点---> 父节点 ---> 叶子节点 ---> 兄弟叶子节点 ---> 父节点 ---> 根节点

```ts
// file: packages/react-reconciler/src/ReactFiberCommitWork.old.js
// nextEffect, focusedInstanceHandle,inProgressLanes,inProgressRoot 全局变量
function commitMutationEffects(
  root: FiberRoot,
  firstChild: Fiber,
  committedLanes: Lanes
) {
  inProgressLanes = committedLanes
  inProgressRoot = root
  nextEffect = firstChild

  commitMutationEffects_begin(root)

  inProgressLanes = null
  inProgressRoot = null
}

function commitMutationEffects_begin(root: FiberRoot) {
  while (nextEffect !== null) {
    const fiber = nextEffect

    // TODO: Should wrap this in flags check, too, as optimization
    const deletions = fiber.deletions
    if (deletions !== null) {
      for (let i = 0; i < deletions.length; i++) {
        const childToDelete = deletions[i]
        commitDeletion(root, childToDelete, fiber)
      }
    }

    const child = fiber.child
    if ((fiber.subtreeFlags & MutationMask) !== NoFlags && child !== null) {
      ensureCorrectReturnPointer(child, fiber)
      nextEffect = child
    } else {
      commitMutationEffects_complete(root)
    }
  }
}

function commitMutationEffects_complete(root: FiberRoot) {
  while (nextEffect !== null) {
    const fiber = nextEffect
    commitMutationEffectsOnFiber(fiber, root)

    const sibling = fiber.sibling
    if (sibling !== null) {
      ensureCorrectReturnPointer(sibling, fiber.return)
      nextEffect = sibling
      return
    }

    nextEffect = fiber.return
  }
}

function commitMutationEffectsOnFiber(finishedWork: Fiber, root: FiberRoot) {
  const flags = finishedWork.flags

  if (flags & ContentReset) {
    commitResetTextContent(finishedWork)
  }

  if (flags & Ref) {
    const current = finishedWork.alternate
    if (current !== null) {
      commitDetachRef(current)
    }
    if (enableScopeAPI) {
      // TODO: This is a temporary solution that allowed us to transition away
      // from React Flare on www.
      if (finishedWork.tag === ScopeComponent) {
        commitAttachRef(finishedWork)
      }
    }
  }

  // The following switch statement is only concerned about placement,
  // updates, and deletions. To avoid needing to add a case for every possible
  // bitmap value, we remove the secondary effects from the effect tag and
  // switch on that value.
  const primaryFlags = flags & (Placement | Update | Hydrating)
  switch (primaryFlags) {
    case Placement: {
      commitPlacement(finishedWork)
      // Clear the "placement" from effect tag so that we know that this is
      // inserted, before any life-cycles like componentDidMount gets called.
      // TODO: findDOMNode doesn't rely on this any more but isMounted does
      // and isMounted is deprecated anyway so we should be able to kill this.
      finishedWork.flags &= ~Placement
      break
    }
    case PlacementAndUpdate: {
      // Placement
      commitPlacement(finishedWork)
      // Clear the "placement" from effect tag so that we know that this is
      // inserted, before any life-cycles like componentDidMount gets called.
      finishedWork.flags &= ~Placement

      // Update
      const current = finishedWork.alternate
      commitWork(current, finishedWork)
      break
    }
    case Hydrating: {
      finishedWork.flags &= ~Hydrating
      break
    }
    case HydratingAndUpdate: {
      finishedWork.flags &= ~Hydrating

      // Update
      const current = finishedWork.alternate
      commitWork(current, finishedWork)
      break
    }
    case Update: {
      const current = finishedWork.alternate
      commitWork(current, finishedWork)
      break
    }
  }
}

function commitWork(current: Fiber | null, finishedWork: Fiber): void {
  if (!supportsMutation) {
    switch (finishedWork.tag) {
      case FunctionComponent:
      case ForwardRef:
      case MemoComponent:
      case SimpleMemoComponent: {
        // Layout effects are destroyed during the mutation phase so that all
        // destroy functions for all fibers are called before any create functions.
        // This prevents sibling component effects from interfering with each other,
        // e.g. a destroy function in one component should never override a ref set
        // by a create function in another component during the same commit.

          commitHookEffectListUnmount(
            HookLayout | HookHasEffect,
            finishedWork,
            finishedWork.return,
          );

        return;
      }
      case Profiler: {
        return;
      }
      case SuspenseComponent: {
        commitSuspenseComponent(finishedWork);
        attachSuspenseRetryListeners(finishedWork);
        return;
      }
      case SuspenseListComponent: {
        attachSuspenseRetryListeners(finishedWork);
        return;
      }
      case HostRoot: {
        if (supportsHydration) {
          const root: FiberRoot = finishedWork.stateNode;
          if (root.hydrate) {
            // We've just hydrated. No need to hydrate again.
            root.hydrate = false;
            commitHydratedContainer(root.containerInfo);
          }
        }
        break;
      }
      case OffscreenComponent:
      case LegacyHiddenComponent: {
        return;
      }
    }

    commitContainer(finishedWork);
    return;
  }

  switch (finishedWork.tag) {
    case FunctionComponent:
    case ForwardRef:
    case MemoComponent:
    case SimpleMemoComponent: {
      // Layout effects are destroyed during the mutation phase so that all
      // destroy functions for all fibers are called before any create functions.
      // This prevents sibling component effects from interfering with each other,
      // e.g. a destroy function in one component should never override a ref set
      // by a create function in another component during the same commit.

        commitHookEffectListUnmount(
          HookLayout | HookHasEffect,
          finishedWork,
          finishedWork.return,
        );
      }
      return;

    case ClassComponent: {
      return;
    }
    case HostComponent: {
      const instance: Instance = finishedWork.stateNode;
      if (instance != null) {
        // Commit the work prepared earlier.
        const newProps = finishedWork.memoizedProps;
        // For hydration we reuse the update path but we treat the oldProps
        // as the newProps. The updatePayload will contain the real change in
        // this case.
        const oldProps = current !== null ? current.memoizedProps : newProps;
        const type = finishedWork.type;
        // TODO: Type the updateQueue to be specific to host components.
        const updatePayload: null | UpdatePayload = (finishedWork.updateQueue: any);
        finishedWork.updateQueue = null;
        if (updatePayload !== null) {
          commitUpdate(
            instance,
            updatePayload,
            type,
            oldProps,
            newProps,
            finishedWork,
          );
        }
      }
      return;
    }
    case HostText: {
      const textInstance: TextInstance = finishedWork.stateNode;
      const newText: string = finishedWork.memoizedProps;
      // For hydration we reuse the update path but we treat the oldProps
      // as the newProps. The updatePayload will contain the real change in
      // this case.
      const oldText: string =
        current !== null ? current.memoizedProps : newText;
      commitTextUpdate(textInstance, oldText, newText);
      return;
    }
    case HostRoot: {
      if (supportsHydration) {
        const root: FiberRoot = finishedWork.stateNode;
        if (root.hydrate) {
          // We've just hydrated. No need to hydrate again.
          root.hydrate = false;
          commitHydratedContainer(root.containerInfo);
        }
      }
      return;
    }
    case Profiler: {
      return;
    }
    case SuspenseComponent: {
      commitSuspenseComponent(finishedWork);
      attachSuspenseRetryListeners(finishedWork);
      return;
    }
    case SuspenseListComponent: {
      attachSuspenseRetryListeners(finishedWork);
      return;
    }
    case IncompleteClassComponent: {
      return;
    }
    case ScopeComponent: {
      if (enableScopeAPI) {
        const scopeInstance = finishedWork.stateNode;
        prepareScopeUpdate(scopeInstance, finishedWork);
        return;
      }
      break;
    }
    case OffscreenComponent:
    case LegacyHiddenComponent: {
      const newState: OffscreenState | null = finishedWork.memoizedState;
      const isHidden = newState !== null;
      hideOrUnhideAllChildren(finishedWork, isHidden);
      return;
    }
  }
}

function commitPlacement(finishedWork: Fiber): void {
  if (!supportsMutation) {
    return;
  }

  // Recursively insert all host nodes into the parent.
  const parentFiber = getHostParentFiber(finishedWork);

  // Note: these two variables *must* always be updated together.
  let parent;
  let isContainer;
  const parentStateNode = parentFiber.stateNode;
  switch (parentFiber.tag) {
    case HostComponent:
      parent = parentStateNode;
      isContainer = false;
      break;
    case HostRoot:
      parent = parentStateNode.containerInfo;
      isContainer = true;
      break;
    case HostPortal:
      parent = parentStateNode.containerInfo;
      isContainer = true;
      break;
    // eslint-disable-next-line-no-fallthrough
    default:
  }
  if (parentFiber.flags & ContentReset) {
    // Reset the text content of the parent before doing any insertions
    resetTextContent(parent);
    // Clear ContentReset from the effect tag
    parentFiber.flags &= ~ContentReset;
  }

  const before = getHostSibling(finishedWork);
  // 插入 dom 元素
  if (isContainer) {
    insertOrAppendPlacementNodeIntoContainer(finishedWork, before, parent);
  } else {
    insertOrAppendPlacementNode(finishedWork, before, parent);
  }
}

function isHostParent(fiber: Fiber): boolean {
  return (
    fiber.tag === HostComponent ||
    fiber.tag === HostRoot ||
    fiber.tag === HostPortal
  );
}

function getHostSibling(fiber: Fiber): ?Instance {
  // We're going to search forward into the tree until we find a sibling host
  // node. Unfortunately, if multiple insertions are done in a row we have to
  // search past them. This leads to exponential search for the next sibling.
  // TODO: Find a more efficient way to do this.
  let node: Fiber = fiber;
  siblings: while (true) {
    // If we didn't find anything, let's try the next sibling.
    while (node.sibling === null) {
      if (node.return === null || isHostParent(node.return)) {
        // If we pop out of the root or hit the parent the fiber we are the
        // last sibling.
        return null;
      }
      node = node.return;
    }
    node.sibling.return = node.return;
    node = node.sibling;
    while (
      node.tag !== HostComponent &&
      node.tag !== HostText &&
      node.tag !== DehydratedFragment
    ) {
      // If it is not host node and, we might have a host node inside it.
      // Try to search down until we find one.
      if (node.flags & Placement) {
        // If we don't have a child, try the siblings instead.
        continue siblings;
      }
      // If we don't have a child, try the siblings instead.
      // We also skip portals because they are not part of this host tree.
      if (node.child === null || node.tag === HostPortal) {
        continue siblings;
      } else {
        node.child.return = node;
        node = node.child;
      }
    }
    // Check if this host node is stable or about to be placed.
    if (!(node.flags & Placement)) {
      // Found it!
      return node.stateNode;
    }
  }
}

function insertOrAppendPlacementNodeIntoContainer(
  node: Fiber,
  before: ?Instance,
  parent: Container,
): void {
  const {tag} = node;
  const isHost = tag === HostComponent || tag === HostText;
  if (isHost) {
    const stateNode = node.stateNode;
    if (before) {
      insertInContainerBefore(parent, stateNode, before);
    } else {
      appendChildToContainer(parent, stateNode);
    }
  } else if (tag === HostPortal) {
    // If the insertion itself is a portal, then we don't want to traverse
    // down its children. Instead, we'll get insertions from each child in
    // the portal directly.
  } else {
    const child = node.child;
    if (child !== null) {
      insertOrAppendPlacementNodeIntoContainer(child, before, parent);
      let sibling = child.sibling;
      while (sibling !== null) {
        insertOrAppendPlacementNodeIntoContainer(sibling, before, parent);
        sibling = sibling.sibling;
      }
    }
  }
}

function insertOrAppendPlacementNode(
  node: Fiber,
  before: ?Instance,
  parent: Instance,
): void {
  const {tag} = node;
  const isHost = tag === HostComponent || tag === HostText;
  if (isHost) {
    const stateNode = node.stateNode;
    if (before) {
      insertBefore(parent, stateNode, before);
    } else {
      appendChild(parent, stateNode);
    }
  } else if (tag === HostPortal) {
    // If the insertion itself is a portal, then we don't want to traverse
    // down its children. Instead, we'll get insertions from each child in
    // the portal directly.
  } else {
    const child = node.child;
    if (child !== null) {
      insertOrAppendPlacementNode(child, before, parent);
      let sibling = child.sibling;
      while (sibling !== null) {
        insertOrAppendPlacementNode(sibling, before, parent);
        sibling = sibling.sibling;
      }
    }
  }
}

```

##### `commitLayoutEffects`

执行生命周期钩子，在离开当前节点时调用钩子函数
遍历顺序为： 根节点---> 父节点 ---> 叶子节点 ---> 兄弟叶子节点 ---> 父节点 ---> 根节点

```ts
// file: packages/react-reconciler/src/ReactFiberCommitWork.old.js
// nextEffect, focusedInstanceHandle,inProgressLanes,inProgressRoot 全局变量
function commitLayoutEffects(
  finishedWork: Fiber,
  root: FiberRoot,
  committedLanes: Lanes
): void {
  inProgressLanes = committedLanes
  inProgressRoot = root
  nextEffect = finishedWork

  commitLayoutEffects_begin(finishedWork, root, committedLanes)

  inProgressLanes = null
  inProgressRoot = null
}

function commitLayoutEffects_begin(
  subtreeRoot: Fiber,
  root: FiberRoot,
  committedLanes: Lanes
) {
  // Suspense layout effects semantics don't change for legacy roots.
  const isModernRoot = (subtreeRoot.mode & ConcurrentMode) !== NoMode

  while (nextEffect !== null) {
    const fiber = nextEffect
    const firstChild = fiber.child

    if (enableSuspenseLayoutEffectSemantics && isModernRoot) {
      // Keep track of the current Offscreen stack's state.
      if (fiber.tag === OffscreenComponent) {
        const current = fiber.alternate
        const wasHidden = current !== null && current.memoizedState !== null
        const isHidden = fiber.memoizedState !== null

        const newOffscreenSubtreeIsHidden = isHidden || offscreenSubtreeIsHidden
        const newOffscreenSubtreeWasHidden =
          wasHidden || offscreenSubtreeWasHidden

        if (
          newOffscreenSubtreeIsHidden !== offscreenSubtreeIsHidden ||
          newOffscreenSubtreeWasHidden !== offscreenSubtreeWasHidden
        ) {
          const prevOffscreenSubtreeIsHidden = offscreenSubtreeIsHidden
          const prevOffscreenSubtreeWasHidden = offscreenSubtreeWasHidden

          // Traverse the Offscreen subtree with the current Offscreen as the root.
          offscreenSubtreeIsHidden = newOffscreenSubtreeIsHidden
          offscreenSubtreeWasHidden = newOffscreenSubtreeWasHidden
          commitLayoutEffects_begin(
            fiber, // New root; bubble back up to here and stop.
            root,
            committedLanes
          )

          // Restore Offscreen state and resume in our-progress traversal.
          nextEffect = fiber
          offscreenSubtreeIsHidden = prevOffscreenSubtreeIsHidden
          offscreenSubtreeWasHidden = prevOffscreenSubtreeWasHidden
          commitLayoutMountEffects_complete(subtreeRoot, root, committedLanes)

          continue
        }
      }
    }

    if ((fiber.subtreeFlags & LayoutMask) !== NoFlags && firstChild !== null) {
      ensureCorrectReturnPointer(firstChild, fiber)
      nextEffect = firstChild
    } else {
      if (enableSuspenseLayoutEffectSemantics && isModernRoot) {
        const visibilityChanged =
          !offscreenSubtreeIsHidden && offscreenSubtreeWasHidden

        // TODO (Offscreen) Also check: subtreeFlags & LayoutStatic
        if (visibilityChanged && firstChild !== null) {
          // We've just shown or hidden a Offscreen tree that contains layout effects.
          // We only enter this code path for subtrees that are updated,
          // because newly mounted ones would pass the LayoutMask check above.
          ensureCorrectReturnPointer(firstChild, fiber)
          nextEffect = firstChild
          continue
        }
      }

      commitLayoutMountEffects_complete(subtreeRoot, root, committedLanes)
    }
  }
}

function commitLayoutMountEffects_complete(
  subtreeRoot: Fiber,
  root: FiberRoot,
  committedLanes: Lanes
) {
  // Suspense layout effects semantics don't change for legacy roots.
  const isModernRoot = (subtreeRoot.mode & ConcurrentMode) !== NoMode

  while (nextEffect !== null) {
    const fiber = nextEffect

    if (
      enableSuspenseLayoutEffectSemantics &&
      isModernRoot &&
      offscreenSubtreeWasHidden &&
      !offscreenSubtreeIsHidden
    ) {
      // Inside of an Offscreen subtree that changed visibility during this commit.
      // If this subtree was hidden, layout effects will have already been destroyed (during mutation phase)
      // but if it was just shown, we need to (re)create the effects now.
      // TODO (Offscreen) Check: flags & LayoutStatic
      switch (fiber.tag) {
        case FunctionComponent:
        case ForwardRef:
        case SimpleMemoComponent: {
          safelyCallCommitHookLayoutEffectListMount(fiber, fiber.return)
          break
        }
        case ClassComponent: {
          const instance = fiber.stateNode
          if (typeof instance.componentDidMount === 'function') {
            safelyCallComponentDidMount(fiber, fiber.return, instance)
          }
          break
        }
      }

      // TODO (Offscreen) Check flags & RefStatic
      switch (fiber.tag) {
        case ClassComponent:
        case HostComponent:
          safelyAttachRef(fiber, fiber.return)
          break
      }
    } else if ((fiber.flags & LayoutMask) !== NoFlags) {
      const current = fiber.alternate
      commitLayoutEffectOnFiber(root, current, fiber, committedLanes)
    }

    if (fiber === subtreeRoot) {
      nextEffect = null
      return
    }

    const sibling = fiber.sibling
    if (sibling !== null) {
      ensureCorrectReturnPointer(sibling, fiber.return)
      nextEffect = sibling
      return
    }

    nextEffect = fiber.return
  }
}
```
