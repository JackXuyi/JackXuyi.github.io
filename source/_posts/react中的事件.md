---
title: react中的事件
date: 2021-06-12 12:34:30
tags: [JavaScript, react]
---

### `react` 中的事件

#### 初始化

1. 在 `react-dom` 模块的 `src/client/ReactDOM` 中引入 `ReactDOMEventHandle` 文件，把该文件中的 `createEventHandle` 函数导出为 `unstable_createEventHandle` 以供第三方使用
2. 在 `ReactDOMEventHandle` 文件中引入 `events/DOMPluginEventSystem` 文件，在模块中注册了顶级事件
   ```js
   // TODO: remove top-level side effect.
   SimpleEventPlugin.registerEvents()
   EnterLeaveEventPlugin.registerEvents()
   ChangeEventPlugin.registerEvents()
   SelectEventPlugin.registerEvents()
   BeforeInputEventPlugin.registerEvents()
   ```
3. 在 `events/EventRegistry` 模块中调用方法把注册的事件放入存储的 `Set` 和对象中，`allNativeEvents Set` 负责存储所有注册过的事件名称，`registrationNameDependencies` 以 `{[reactEventName]: [nativeEventName] }`负责存储注册的事件依赖
4. 合成事件的初始化完毕

#### 事件挂载

1.  调用 `react-dom` 模块中的 `render` 时，若第一次挂载则递归依次调用 `legacyCreateRootFromDOMContainer`、`createLegacyRoot` 创建容器对象 `ReactDOMLegacyRoot` 的实例
2.  `ReactDOMLegacyRoot` 递归依次调用 `createRootImpl`、`createContainer` 创建了组件挂载的根元素，并表及为根元素
3.  调用 `listenToAllSupportedEvents` 在根元素上挂载事件，若当前容器为注释元素，则取当前元素的父元素为事件挂载的节点
4.  在 `listenToAllSupportedEvents` 中遍历初始化时注册的 `allNativeEvents` 事件列表注册事件，判断根元素是否为 `documet` 节点，不是则获取 `document` 节点，在 `document` 节点节点上注册 `selectionchange` 事件

    ```ts
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

#### 组件事件注册

#### 事件触发

1. 有事件触发时，调用 `events/ReactDOMEventListener` 下的 `dispatchEvent` 触发事件
2. 当事件不可重新触发时直接调用 `attemptToDispatchEvent` 进行事件的触发，否则事件放入队列等待调用
3. 在 `attemptToDispatchEvent` 调用 `events/DOMPluginEventSystem` 文件下的 `dispatchEventForPluginEventSystem`，找出触发事件元素的根节点，然后通过 `dispatchEventsForPlugins` 批量更新
4. `dispatchEventsForPlugins` 先获取当前 `Fiber` 上绑定的对应事件，然后 `processDispatchQueue` 通过按照顺序 `processDispatchQueueItemsInOrder` 处理各个事件
