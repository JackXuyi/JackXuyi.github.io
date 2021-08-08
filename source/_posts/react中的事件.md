---
title: react中的事件
date: 2021-06-12 12:34:30
tags: [JavaScript, react]
---

![react 中的事件](/images/react/react-event.jpg)

#### 初始化

![react 事件初始化](/images/react/react-event-init.jpg)

1. 在 `react-dom` 模块的 `src/client/ReactDOM` 中引入 `ReactDOMEventHandle` 文件，把该文件中的 `createEventHandle` 函数导出为 `unstable_createEventHandle` 以供第三方使用
2. 在 `ReactDOMEventHandle` 文件中引入 `events/DOMPluginEventSystem` 文件，在模块中注册了顶级事件
   ```js
   // file: packages/react-dom/src/events/DOMPluginEventSystem.js
   SimpleEventPlugin.registerEvents()
   EnterLeaveEventPlugin.registerEvents()
   ChangeEventPlugin.registerEvents()
   SelectEventPlugin.registerEvents()
   BeforeInputEventPlugin.registerEvents()
   ```
3. 记录 `dom` 事件和 `react` 事件的映射关系

   ```js
   // file: packages/react-dom/src/events/DOMEventProperties.js
   export const topLevelEventsToReactNames = new Map()

   // 记录 dom event 和 react event 的映射
   function registerSimpleEvent(domEventName, reactName) {
     topLevelEventsToReactNames.set(domEventName, reactName)
     registerTwoPhaseEvent(reactName, [domEventName])
   }

   export function registerSimpleEvents() {
     for (let i = 0; i < simpleEventPluginEvents.length; i++) {
       const eventName = ((simpleEventPluginEvents[i]: any): string)
       const domEventName = ((eventName.toLowerCase(): any): DOMEventName)
       const capitalizedEvent = eventName[0].toUpperCase() + eventName.slice(1)
       registerSimpleEvent(domEventName, 'on' + capitalizedEvent)
     }
     // Special cases where event names don't match.
     registerSimpleEvent(ANIMATION_END, 'onAnimationEnd')
     registerSimpleEvent(ANIMATION_ITERATION, 'onAnimationIteration')
     registerSimpleEvent(ANIMATION_START, 'onAnimationStart')
     registerSimpleEvent('dblclick', 'onDoubleClick')
     registerSimpleEvent('focusin', 'onFocus')
     registerSimpleEvent('focusout', 'onBlur')
     registerSimpleEvent(TRANSITION_END, 'onTransitionEnd')
   }
   ```

4. 在 `events/EventRegistry` 模块中调用方法把注册的事件放入存储的 `Set` 和对象中，`allNativeEvents Set` 负责存储所有注册过的 `dom` 事件名称，`registrationNameDependencies` 以 `{[reactEventName]: [nativeEventName] }`负责存储注册的事件依赖，同时注册了冒泡事件和捕获事件

   ```js
   // file: packages/react-dom/src/events/EventRegistry.js
   export const allNativeEvents: Set<DOMEventName> = new Set()

   /**
    * Mapping from registration name to event name
    */
   export const registrationNameDependencies = {}

   export function registerTwoPhaseEvent(
     registrationName: string,
     dependencies: Array<DOMEventName>
   ): void {
     registerDirectEvent(registrationName, dependencies)
     registerDirectEvent(registrationName + 'Capture', dependencies)
   }

   export function registerDirectEvent(
     registrationName: string,
     dependencies: Array<DOMEventName>
   ) {
     registrationNameDependencies[registrationName] = dependencies
     for (let i = 0; i < dependencies.length; i++) {
       allNativeEvents.add(dependencies[i])
     }
   }
   ```

5. 合成事件的初始化完毕

#### 注册原生事件

![react 注册原生事件](/images/react/react-event-init.jpg)

1.  调用 `react-dom` 模块中的 `render` 时，若第一次挂载则递归依次调用 `legacyCreateRootFromDOMContainer`、`createLegacyRoot` 创建容器对象 `ReactDOMLegacyRoot` 的实例
2.  `ReactDOMLegacyRoot` 递归依次调用 `createRootImpl`、`createContainer` 创建了组件挂载的根元素，并表及为根元素
3.  调用 `listenToAllSupportedEvents` 在根元素上挂载事件，若当前容器为注释元素，则取当前元素的父元素为事件挂载的节点
4.  在 `listenToAllSupportedEvents` 中遍历初始化时注册的 `allNativeEvents` 事件列表注册事件，判断根元素是否为 `documet` 节点，不是则获取 `document` 节点，在 `document` 节点节点上注册 `selectionchange` 事件

    ```ts
    // file: packages/react-dom/src/events/DOMPluginEventSystem.js
    const listeningMarker = '_reactListening' +Math.random().toString(36).slice(2);
    export function listenToAllSupportedEvents(rootContainerElement: EventTarget) {
      if (!(rootContainerElement: any)[listeningMarker]) {
        rootContainerElement[listeningMarker] = true
        allNativeEvents.forEach((domEventName) => {
          // We handle selectionchange separately because it
          // doesn't bubble and needs to be on the document.
          if (domEventName !== 'selectionchange') {
            if (!nonDelegatedEvents.has(domEventName)) {
              listenToNativeEvent(domEventName, false, rootContainerElement)
            }
            listenToNativeEvent(domEventName, true, rootContainerElement)
          }
        })
        const ownerDocument =
          rootContainerElement.nodeType === DOCUMENT_NODE
            ? rootContainerElement
            : (rootContainerElement).ownerDocument
        if (ownerDocument !== null) {
          // The selectionchange event also needs deduplication
          // but it is attached to the document.
          if (!(ownerDocument)[listeningMarker]) {
            ownerDocument[listeningMarker] = true
            listenToNativeEvent('selectionchange', false, ownerDocument)
          }
        }
      }
    }
    ```

5.  `createEventListenerWrapperWithPriority` 函数先获取事件优先级，再根据优先级确定构造监听器的函数

    ```js
    // file: packages/react-dom/src/events/ReactDOMEventListener.js
    export function createEventListenerWrapperWithPriority(
      targetContainer: EventTarget,
      domEventName: DOMEventName,
      eventSystemFlags: EventSystemFlags
    ): Function {
      const eventPriority = getEventPriority(domEventName)
      let listenerWrapper
      switch (eventPriority) {
        case DiscreteEventPriority:
          listenerWrapper = dispatchDiscreteEvent
          break
        case ContinuousEventPriority:
          listenerWrapper = dispatchContinuousEvent
          break
        case DefaultEventPriority:
        default:
          listenerWrapper = dispatchEvent
          break
      }
      return listenerWrapper.bind(
        null,
        domEventName,
        eventSystemFlags,
        targetContainer
      )
    }
    ```

6.  调用 `createEventListenerWrapperWithPriority` 创建监听函数，根据 `passive` 属性的支持和 `capture` 情况分别调用不同的事件监听方式

    ```js
    // file: packages/react-dom/src/events/DOMPluginEventSystem.js
    export function listenToNativeEvent(
      domEventName: DOMEventName,
      isCapturePhaseListener: boolean,
      target: EventTarget
    ): void {
      let eventSystemFlags = 0
      if (isCapturePhaseListener) {
        eventSystemFlags |= IS_CAPTURE_PHASE
      }
      addTrappedEventListener(
        target,
        domEventName,
        eventSystemFlags,
        isCapturePhaseListener
      )
    }

    function addTrappedEventListener(
      targetContainer: EventTarget,
      domEventName: DOMEventName,
      eventSystemFlags: EventSystemFlags,
      isCapturePhaseListener: boolean,
      isDeferredListenerForLegacyFBSupport?: boolean
    ) {
      let listener = createEventListenerWrapperWithPriority(
        targetContainer,
        domEventName,
        eventSystemFlags
      )
      // If passive option is not supported, then the event will be
      // active and not passive.
      let isPassiveListener = undefined
      if (passiveBrowserEventsSupported) {
        // 是否支持 passive 属性， https://developer.mozilla.org/zh-CN/docs/Web/API/EventTarget/addEventListener
        if (
          domEventName === 'touchstart' ||
          domEventName === 'touchmove' ||
          domEventName === 'wheel'
        ) {
          isPassiveListener = true
        }
      }

      targetContainer =
        enableLegacyFBSupport && isDeferredListenerForLegacyFBSupport
          ? (targetContainer: any).ownerDocument
          : targetContainer

      let unsubscribeListener
      // TODO: There are too many combinations here. Consolidate them.
      if (isCapturePhaseListener) {
        if (isPassiveListener !== undefined) {
          unsubscribeListener = addEventCaptureListenerWithPassiveFlag(
            targetContainer,
            domEventName,
            listener,
            isPassiveListener
          )
        } else {
          unsubscribeListener = addEventCaptureListener(
            targetContainer,
            domEventName,
            listener
          )
        }
      } else {
        if (isPassiveListener !== undefined) {
          unsubscribeListener = addEventBubbleListenerWithPassiveFlag(
            targetContainer,
            domEventName,
            listener,
            isPassiveListener
          )
        } else {
          unsubscribeListener = addEventBubbleListener(
            targetContainer,
            domEventName,
            listener
          )
        }
      }
    }
    ```

#### 事件触发

![react 事件触发](/images/react/react-event-dispatch.jpg)

1. 有事件触发时，调用 `events/ReactDOMEventListener` 下的 `dispatchEvent` 触发事件
2. 当事件不可重新触发时直接调用 `attemptToDispatchEvent` 进行事件的触发，否则事件放入队列等待调用

   ```js
   // file: packages/react-dom/src/events/ReactDOMEventListener.js
   export function dispatchEvent(
     domEventName: DOMEventName,
     eventSystemFlags: EventSystemFlags,
     targetContainer: EventTarget,
     nativeEvent: AnyNativeEvent
   ): void {
     const allowReplay = (eventSystemFlags & IS_CAPTURE_PHASE) === 0

     if (
       allowReplay &&
       hasQueuedDiscreteEvents() &&
       isReplayableDiscreteEvent(domEventName)
     ) {
       //更新队列中就把事件放入更新队列
       queueDiscreteEvent(
         null, // Flags that we're not actually blocked on anything as far as we know.
         domEventName,
         eventSystemFlags,
         targetContainer,
         nativeEvent
       )
       return
     }

     const blockedOn = attemptToDispatchEvent(
       domEventName,
       eventSystemFlags,
       targetContainer,
       nativeEvent
     )

     if (blockedOn === null) {
       // 触发事件成功
       if (allowReplay) {
         clearIfContinuousEvent(domEventName, nativeEvent)
       }
       return
     }

     // 其它逻辑
   }
   ```

3. 获取触发事件的元素，然后获取最近的虚拟 `dom` 节点的实例（向上查找，注：`dom` 上存储了虚拟 `dom` 的引用，快速查找），通过虚拟 `dom` 节点获取最近挂载的 `fiber` 节点（向上查找）

   ```js
   // file: packages/react-dom/src/events/ReactDOMEventListener.js
   // Attempt dispatching an event. Returns a SuspenseInstance or Container if it's blocked.
   export function attemptToDispatchEvent(
     domEventName: DOMEventName,
     eventSystemFlags: EventSystemFlags,
     targetContainer: EventTarget,
     nativeEvent: AnyNativeEvent
   ): null | Container | SuspenseInstance {
     const nativeEventTarget = getEventTarget(nativeEvent)
     let targetInst = getClosestInstanceFromNode(nativeEventTarget)

     if (targetInst !== null) {
       const nearestMounted = getNearestMountedFiber(targetInst)
       if (nearestMounted === null) {
         // 树已经被销毁，触发对象置空
         targetInst = null
       } else {
         // 其它逻辑
       }
     }
     dispatchEventForPluginEventSystem(
       domEventName,
       eventSystemFlags,
       nativeEvent,
       targetInst,
       targetContainer
     )
     // We're not blocked on anything.
     return null
   }
   ```

4. 在 `attemptToDispatchEvent` 调用 `dispatchEventForPluginEventSystem`，找出触发事件元素的根节点实例，然后通过 `dispatchEventsForPlugins` 批量更新

   ```js
   // file: packages/react-dom/src/events/DOMPluginEventSystem.js
   export function dispatchEventForPluginEventSystem(
     domEventName: DOMEventName,
     eventSystemFlags: EventSystemFlags,
     nativeEvent: AnyNativeEvent,
     targetInst: null | Fiber,
     targetContainer: EventTarget
   ): void {
     let ancestorInst = targetInst
     if (
       (eventSystemFlags & IS_EVENT_HANDLE_NON_MANAGED_NODE) === 0 &&
       (eventSystemFlags & IS_NON_DELEGATED) === 0
     ) {
       const targetContainerNode = ((targetContainer: any): Node)

       if (targetInst !== null) {
         // The below logic attempts to work out if we need to change
         // the target fiber to a different ancestor. We had similar logic
         // in the legacy event system, except the big difference between
         // systems is that the modern event system now has an event listener
         // attached to each React Root and React Portal Root. Together,
         // the DOM nodes representing these roots are the "rootContainer".
         // To figure out which ancestor instance we should use, we traverse
         // up the fiber tree from the target instance and attempt to find
         // root boundaries that match that of our current "rootContainer".
         // If we find that "rootContainer", we find the parent fiber
         // sub-tree for that root and make that our ancestor instance.
         let node = targetInst

         mainLoop: while (true) {
           if (node === null) {
             return
           }
           const nodeTag = node.tag
           if (nodeTag === HostRoot || nodeTag === HostPortal) {
             let container = node.stateNode.containerInfo
             if (isMatchingRootContainer(container, targetContainerNode)) {
               break
             }
             if (nodeTag === HostPortal) {
               // The target is a portal, but it's not the rootContainer we're looking for.
               // Normally portals handle their own events all the way down to the root.
               // So we should be able to stop now. However, we don't know if this portal
               // was part of *our* root.
               let grandNode = node.return
               while (grandNode !== null) {
                 const grandTag = grandNode.tag
                 if (grandTag === HostRoot || grandTag === HostPortal) {
                   const grandContainer = grandNode.stateNode.containerInfo
                   if (
                     isMatchingRootContainer(
                       grandContainer,
                       targetContainerNode
                     )
                   ) {
                     // This is the rootContainer we're looking for and we found it as
                     // a parent of the Portal. That means we can ignore it because the
                     // Portal will bubble through to us.
                     return
                   }
                 }
                 grandNode = grandNode.return
               }
             }
             // Now we need to find it's corresponding host fiber in the other
             // tree. To do this we can use getClosestInstanceFromNode, but we
             // need to validate that the fiber is a host instance, otherwise
             // we need to traverse up through the DOM till we find the correct
             // node that is from the other tree.
             while (container !== null) {
               const parentNode = getClosestInstanceFromNode(container)
               if (parentNode === null) {
                 return
               }
               const parentTag = parentNode.tag
               if (parentTag === HostComponent || parentTag === HostText) {
                 node = ancestorInst = parentNode
                 continue mainLoop
               }
               container = container.parentNode
             }
           }
           node = node.return
         }
       }
     }

     batchedEventUpdates(() =>
       dispatchEventsForPlugins(
         domEventName,
         eventSystemFlags,
         nativeEvent,
         ancestorInst,
         targetContainer
       )
     )
   }
   ```

5. `dispatchEventsForPlugins` 先获取当前 `Fiber` 上绑定的对应事件，然后 `processDispatchQueue` 通过按照顺序 `processDispatchQueueItemsInOrder` 处理各个事件

   ```js
   // file: packages/react-dom/src/events/DOMPluginEventSystem.js
   function dispatchEventsForPlugins(
     domEventName: DOMEventName,
     eventSystemFlags: EventSystemFlags,
     nativeEvent: AnyNativeEvent,
     targetInst: null | Fiber,
     targetContainer: EventTarget
   ): void {
     const nativeEventTarget = getEventTarget(nativeEvent)
     const dispatchQueue: DispatchQueue = []
     extractEvents(
       dispatchQueue,
       domEventName,
       targetInst,
       nativeEvent,
       nativeEventTarget,
       eventSystemFlags,
       targetContainer
     )
     processDispatchQueue(dispatchQueue, eventSystemFlags)
   }

   function extractEvents(
     dispatchQueue: DispatchQueue,
     domEventName: DOMEventName,
     targetInst: null | Fiber,
     nativeEvent: AnyNativeEvent,
     nativeEventTarget: null | EventTarget,
     eventSystemFlags: EventSystemFlags,
     targetContainer: EventTarget
   ) {
     SimpleEventPlugin.extractEvents(
       dispatchQueue,
       domEventName,
       targetInst,
       nativeEvent,
       nativeEventTarget,
       eventSystemFlags,
       targetContainer
     )
     // 其它逻辑
   }

   export function processDispatchQueue(
     dispatchQueue: DispatchQueue,
     eventSystemFlags: EventSystemFlags
   ): void {
     const inCapturePhase = (eventSystemFlags & IS_CAPTURE_PHASE) !== 0
     for (let i = 0; i < dispatchQueue.length; i++) {
       // 取出事件监听函数执行
       const { event, listeners } = dispatchQueue[i]
       processDispatchQueueItemsInOrder(event, listeners, inCapturePhase)
     }
   }

   function processDispatchQueueItemsInOrder(
     event: ReactSyntheticEvent,
     dispatchListeners: Array<DispatchListener>,
     inCapturePhase: boolean
   ): void {
     let previousInstance
     if (inCapturePhase) {
       // 捕获事件从后往前执行
       for (let i = dispatchListeners.length - 1; i >= 0; i--) {
         const { instance, currentTarget, listener } = dispatchListeners[i]
         if (instance !== previousInstance && event.isPropagationStopped()) {
           return
         }
         executeDispatch(event, listener, currentTarget)
         previousInstance = instance
       }
     } else {
       // 冒泡事件从前往后执行
       for (let i = 0; i < dispatchListeners.length; i++) {
         const { instance, currentTarget, listener } = dispatchListeners[i]
         if (instance !== previousInstance && event.isPropagationStopped()) {
           return
         }
         executeDispatch(event, listener, currentTarget)
         previousInstance = instance
       }
     }
   }
   ```

6. `extractEvents` 提取事件监听函数

   ```js
   // file: packages/react-dom/src/events/plugins/SimpleEventPlugin.js
   function extractEvents(
     dispatchQueue: DispatchQueue,
     domEventName: DOMEventName,
     targetInst: null | Fiber,
     nativeEvent: AnyNativeEvent,
     nativeEventTarget: null | EventTarget,
     eventSystemFlags: EventSystemFlags,
     targetContainer: EventTarget
   ): void {
     const reactName = topLevelEventsToReactNames.get(domEventName)
     if (reactName === undefined) {
       return
     }
     let SyntheticEventCtor = SyntheticEvent
     let reactEventType: string = domEventName

     // 根据事件类型获取对应的构造函数

     const inCapturePhase = (eventSystemFlags & IS_CAPTURE_PHASE) !== 0
     if (
       enableCreateEventHandleAPI &&
       eventSystemFlags & IS_EVENT_HANDLE_NON_MANAGED_NODE
     ) {
       const listeners = accumulateEventHandleNonManagedNodeListeners(
         // TODO: this cast may not make sense for events like
         // "focus" where React listens to e.g. "focusin".
         ((reactEventType: any): DOMEventName),
         targetContainer,
         inCapturePhase
       )
       if (listeners.length > 0) {
         // Intentionally create event lazily.
         const event = new SyntheticEventCtor(
           reactName,
           reactEventType,
           null,
           nativeEvent,
           nativeEventTarget
         )
         dispatchQueue.push({ event, listeners })
       }
     } else {
       // Some events don't bubble in the browser.
       // In the past, React has always bubbled them, but this can be surprising.
       // We're going to try aligning closer to the browser behavior by not bubbling
       // them in React either. We'll start by not bubbling onScroll, and then expand.
       const accumulateTargetOnly =
         !inCapturePhase &&
         // TODO: ideally, we'd eventually add all events from
         // nonDelegatedEvents list in DOMPluginEventSystem.
         // Then we can remove this special list.
         // This is a breaking change that can wait until React 18.
         domEventName === 'scroll'

       const listeners = accumulateSinglePhaseListeners(
         targetInst,
         reactName,
         nativeEvent.type,
         inCapturePhase,
         accumulateTargetOnly,
         nativeEvent
       )
       if (listeners.length > 0) {
         // Intentionally create event lazily.
         const event = new SyntheticEventCtor(
           reactName,
           reactEventType,
           null,
           nativeEvent,
           nativeEventTarget
         )
         dispatchQueue.push({ event, listeners })
       }
     }
   }
   ```

7. 调用 `accumulateSinglePhaseListeners` 获取事件监听列表，从触发元素递归向上查询注册的事件然后放入监听器列表中返回

```js
// file: packages/react-dom/src/events/DOMPluginEventSystem.js
export function accumulateSinglePhaseListeners(
  targetFiber: Fiber | null,
  reactName: string | null,
  nativeEventType: string,
  inCapturePhase: boolean,
  accumulateTargetOnly: boolean,
  nativeEvent: AnyNativeEvent
): Array<DispatchListener> {
  const captureName = reactName !== null ? reactName + 'Capture' : null
  const reactEventName = inCapturePhase ? captureName : reactName
  let listeners: Array<DispatchListener> = []

  let instance = targetFiber
  let lastHostComponent = null

  // Accumulate all instances and listeners via the target -> root path.
  while (instance !== null) {
    const { stateNode, tag } = instance
    // Handle listeners that are on HostComponents (i.e. <div>)
    if (tag === HostComponent && stateNode !== null) {
      lastHostComponent = stateNode

      // createEventHandle listeners
      if (enableCreateEventHandleAPI) {
        const eventHandlerListeners =
          getEventHandlerListeners(lastHostComponent)
        if (eventHandlerListeners !== null) {
          eventHandlerListeners.forEach((entry) => {
            if (
              entry.type === nativeEventType &&
              entry.capture === inCapturePhase
            ) {
              listeners.push(
                createDispatchListener(
                  instance,
                  entry.callback,
                  (lastHostComponent: any)
                )
              )
            }
          })
        }
      }

      // Standard React on* listeners, i.e. onClick or onClickCapture
      if (reactEventName !== null) {
        const listener = getListener(instance, reactEventName)
        if (listener != null) {
          listeners.push(
            createDispatchListener(instance, listener, lastHostComponent)
          )
        }
      }
    }
    instance = instance.return
  }
  return listeners
}
```
