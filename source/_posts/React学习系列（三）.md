---
title: React学习系列（三）
date: 2019-08-12 21:45:25
tags: react
---

# `react 16`中的`hooks`

在`function`组件中可以使用`state`和生命周期等`class`组件的属性

## 基础`HOOKS`

### `useState`

在`function`组件中使用`state`

```javascript
const [state, setState] = useState(initialState); // 定义state和更新state的函数，state每次都会返回最新的state值
setState(newState); // 更新state，用法同class组件中的setState
```

#### 懒初始化`state`

```javascript
const [state, setState] = useState(() => {
  const initialState = someExpensiveComputation(props);
  return initialState;
});  // 只会在init render中执行一次初始化
```

### `useEffect`

在`function`组件中使用`didMount`和`didupdate`及`willUnmout`生命周期

```javascript
useEffect(() => {
  // 在didMount和didupdate生命周期执行
  const subscription = props.source.subscribe();
  // 返回的方法将会在组件将要卸载时执行
  return () => {
    subscription.unsubscribe();
  };
}, [props.source]); // 第二个参数表示当传入属性变化时才会执行useEffect的回调，避免钩子函数重复执行
```

### `useContext`

```javascript
const value = useContext(MyContext);
```

接受一个`context`对象（数据来自`React.createContext`），返回当前`context`对象的最新值。当前`context`对象指虚拟`dom`树中最近`<MyContext.Provider>`的值。当最近的`<MyContext.Provider>`的上级组件更新时，这个`HOOK`也会用当前`context`对象的最新值重绘组件。

## 附加的`HOOKS`

### `useReducer`

```javascript
const initialState = {count: 0};

function reducer(state, action) {
  switch (action.type) {
    case 'increment':
      return {count: state.count + 1};
    case 'decrement':
      return {count: state.count - 1};
    default:
      throw new Error();
  }
}

function Counter() {
  const [state, dispatch] = useReducer(reducer, initialState); // 当initialState为一个函数时只会在第一次初始化时调用，多个组件使用时
  return (
    <>
      Count: {state.count}
      <button onClick={() => dispatch({type: 'increment'})}>+</button>
      <button onClick={() => dispatch({type: 'decrement'})}>-</button>
    </>
  );
}
```

### `useCallback`

只有当依赖`[a, b]`有更新时才会返回一个新的`memoizedCallback`，优化子组件的不必要渲染

```javascript
const memoizedCallback = useCallback(
  () => {
    doSomething(a, b);
  },
  [a, b], // 当依赖不提供时每次都会生成一个新的函数
);
```

### `useMemo`

只有当依赖`[a, b]`有更新时才会返回一个新的`memoizedValue`，优化子组件的不必要渲染
```javascript
const memoizedValue = useMemo(() => computeExpensiveValue(a, b), [a, b]); // 当依赖不提供时每次都会生成一个新的值
```

### `useRef`

获取引用对象

```javascript
function TextInputWithFocusButton() {
  const inputEl = useRef(null);
  const onButtonClick = () => {
    // `current` points to the mounted text input element
    inputEl.current.focus();
  };
  return (
    <>
      <input ref={inputEl} type="text" />
      <button onClick={onButtonClick}>Focus the input</button>
    </>
  );
}
```