---
title: typedoc源码阅读系列（二）
date: 2020-04-26 21:15:13
tags: JavaScript
---

## ChildableComponent 对象

```ts
/**
 * 含有子组件的组件.
 *
 * @template O 组件的所有者
 * @template C 包含的子组件
 */
export abstract class ChildableComponent<
  O extends ComponentHost,
  C extends Component
> extends AbstractComponent<O> {
  /**
   *子组件对象
   */
  private _componentChildren?: { [name: string]: C };

  // 默认组件
  private _defaultComponents?: { [name: string]: ComponentClass<C> };

  /**
   * 创建新的组件
   */
  constructor(owner: O | typeof DUMMY_APPLICATION_OWNER) {
    super(owner);

    // 遍历默认组件加入当前组件中作为子组件使用
    _.entries(this._defaultComponents || {}).forEach(([name, component]) => {
      this.addComponent(name, component);
    });
  }

  /**
   * 通过名称获取子组件
   */
  getComponent(name: string): C | undefined {
    return (this._componentChildren || {})[name];
  }

  // 获取全部子组件
  getComponents(): C[] {
    return _.values(this._componentChildren);
  }

  // 是否存在该组件
  hasComponent(name: string): boolean {
    return !!(this._componentChildren || {})[name];
  }

  // 新增组件，存在就返回已经存在的组件，不存在则添加，同时触发新增组件事件
  addComponent<T extends C>(
    name: string,
    componentClass: T | ComponentClass<T, O>
  ): T {
    // 1. 组件存在就直接返回
    // 2. 组件未实例化则实例化，绑定到当前 this，已经实例化则直接保存
    // 3. 触发组件添加事件
  }

  removeComponent(name: string): C | undefined {
    // 1. 获取组件
    // 2. 停止组件的事件监听
    // 3. 从对象中删除组件
  }

  removeAllComponents() {
    // 1. 遍历组件，停止事件监听
    // 2. 组件对象清空
  }
}
```

从上面的代码中可以看出此对象实现了 `getComponent`、`getComponents`、`hasComponent`、`addComponent`、`removeComponent`、`removeAllComponents`方法，结合上一篇分析的 `Application` 对象看，`Application`调用的关于组件`Component`都在此对象中定义好了。此对象实现组件注册、查找、删除功能，按照`KEY => Component` 存放在对象中，便于快速查找和调用

## AbstractComponent 对象

```ts
/**
 * Component base class.  Has an owner (unless it's the application root component),
 * can dispatch events to its children, and has access to the root Application component.
 *
 * @template O type of component's owner.
 */
export abstract class AbstractComponent<O extends ComponentHost>
  extends EventDispatcher
  implements ComponentHost {
  /**
   * 所属对象
   */
  private _componentOwner: O | typeof DUMMY_APPLICATION_OWNER;

  /**
   * 组件名称 @Component 装饰器设置.
   */
  public componentName!: string;

  /**
   * 参数列表
   */
  private _componentOptions?: DeclarationOption[];

  constructor(owner: O | typeof DUMMY_APPLICATION_OWNER) {
    super();
    this._componentOwner = owner;
    this.initialize();
  }

  /**
   * 初始化
   */
  protected initialize() {}

  // 事件冒泡
  protected bubble(name: Event | EventMap | string, ...args: any[]) {
    super.trigger(name, ...args);

    if (
      this.owner instanceof AbstractComponent &&
      this._componentOwner !== DUMMY_APPLICATION_OWNER
    ) {
      this.owner.bubble(name, ...args);
    }

    return this;
  }

  /**
   * 返回组件的所有参数生声明
   */
  getOptionDeclarations(): DeclarationOption[] {
    return (this._componentOptions || []).slice();
  }

  /**
   * 返回根应用和组件
   */
  get application(): Application {
    return this._componentOwner === DUMMY_APPLICATION_OWNER
      ? ((this as any) as Application)
      : this._componentOwner.application;
  }

  /**
   * 组件所有者
   */
  get owner(): O {
    return this._componentOwner === DUMMY_APPLICATION_OWNER
      ? (this as any)
      : this._componentOwner;
  }
}
```

此对象保存了组件的参数、所属对象、组件名称，定义了事件冒泡的方式，定义了一个空的 `initialize` 方法，避免继承的对象没有实现此方法抛出异常

## EventDispatcher 对象

```ts
/**
 * 事件对象
 *
 * You may bind a callback to an event with `on` or remove with `off`;
 * `trigger`-ing an event fires all callbacks in succession.
 */
export class EventDispatcher {
  /**
   * 注册的事件处理对象
   */
  private _events?: EventHandlers;

  /**
   * Map of all objects this instance is listening to.
   */
  private _listeningTo?: EventListeners;

  /**
   * Map of all objects that are listening to this instance.
   */
  private _listeners?: EventListeners;

  /**
   * 唯一性 id
   */
  private get _listenId(): string {
    return this._savedListenId || (this._savedListenId = _.uniqueId("l"));
  }
  private _savedListenId?: string;

  /**
   * 绑定事件回调，类型为 all 时绑定所有事件
   */
  on(
    nameOrMap: EventMap | string,
    callback: EventCallback,
    context?: any,
    priority?: number
  ) {
    this.internalOn(nameOrMap, callback, context, priority);
    return this;
  }

  /**
   * Guard the `listening` argument from the public API.
   */
  private internalOn(
    name: EventMap | string,
    callback: EventCallback | undefined,
    context?: any,
    priority: number = 0,
    listening?: EventListener
  ) {
    this._events = eventsApi(
      onApi,
      this._events || <EventHandlers>{},
      name,
      callback,
      {
        context: context,
        ctx: this,
        listening: listening,
        priority: priority,
      }
    );

    if (listening) {
      const listeners = this._listeners || (this._listeners = {});
      listeners[listening.id] = listening;
    }
  }

  /**
   * 只绑定一次事件
   */

  once(
    name: EventMap | string,
    callback?: EventCallback,
    context?: any,
    priority?: number
  ) {
    // Map the event into a `{event: once}` object.
    const events = eventsApi(
      onceMap,
      <EventMap>{},
      name,
      callback,
      _.bind(this.off, this)
    );
    return this.on(events, void 0, context, priority);
  }

  /**
   * 移除事件回调
   */
  off(name?: EventMap | string, callback?: EventCallback, context?: any) {
    if (!this._events) {
      return this;
    }

    this._events = eventsApi(offApi, this._events, name, callback, {
      context: context,
      listeners: this._listeners,
    });

    return this;
  }

  /**
   * 监听其它对象的事件
   */
  listenTo(
    obj: EventDispatcher,
    name: EventMap | string,
    callback?: EventCallback,
    priority?: number
  ) {
    if (!obj) {
      return this;
    }
    const id = obj._listenId;
    const listeningTo = this._listeningTo || (this._listeningTo = {});
    let listening = listeningTo[id];

    // This object is not listening to any other events on `obj` yet.
    // Setup the necessary references to track the listening callbacks.
    if (!listening) {
      const thisId = this._listenId;
      listening = listeningTo[id] = {
        obj: obj,
        objId: id,
        id: thisId,
        listeningTo: listeningTo,
        count: 0,
      };
    }

    // Bind callbacks on obj, and keep track of them on listening.
    obj.internalOn(name, callback, this, priority, listening);
    return this;
  }

  /**
   * 监听其它对象事件一次
   */
  listenToOnce(
    obj: EventDispatcher,
    name: EventMap | string,
    callback?: EventCallback,
    priority?: number
  ) {
    // Map the event into a `{event: once}` object.
    const events = eventsApi(
      onceMap,
      <EventMap>{},
      name,
      callback,
      _.bind(this.stopListening, this, obj)
    );
    return this.listenTo(obj, events, void 0, priority);
  }

  /**
   * 停止监听事件
   */
  stopListening(
    obj?: EventDispatcher,
    name?: EventMap | string,
    callback?: EventCallback
  ) {
    const listeningTo = this._listeningTo;
    if (!listeningTo) {
      return this;
    }

    const ids = obj ? [obj._listenId] : _.keys(listeningTo);
    for (let i = 0; i < ids.length; i++) {
      const listening = listeningTo[ids[i]];

      // If listening doesn't exist, this object is not currently
      // listening to obj. Break out early.
      if (!listening) {
        break;
      }

      listening.obj.off(name, callback, this);
    }

    if (_.isEmpty(listeningTo)) {
      this._listeningTo = void 0;
    }

    return this;
  }

  /**
   * 触发事件
   */
  trigger(name: Event | EventMap | string, ...args: any[]) {
    if (!this._events) {
      return this;
    }

    if (name instanceof Event) {
      triggerApi(
        this._events,
        name.name,
        void 0,
        [name],
        (events: EventHandler[], args: any[]) => {
          let ev: EventHandler,
            i = -1,
            l = events.length;
          while (++i < l) {
            if (name.isPropagationStopped) {
              return;
            }
            ev = events[i];
            ev.callback.apply(ev.ctx, args);
          }
        }
      );
    } else {
      eventsApi(triggerApi, this._events, name, void 0, args);
    }

    return this;
  }
}
```

定义了事件对象，监听一次、监听、取消监听、分发事件方法

- `_listenId` 产生唯一性 id ，便于快速查找对应的对应的事件处理方法
- `trigger` 触发事件，触发一个或多个事件
- `listenToOnce` 监听事件一次
- `stopListening` 停止监听事件，使用 `id` 快速定位事件处理函数
- `listenTo` 多次监听事件
- `off` 移除监听事件
- `once` 绑定一个只会触发一次的事件
- `internalOn` 派发事件对象
- `on` 监听事件

## 待完成

整理实例化的 `Application` 具有的所有属性
