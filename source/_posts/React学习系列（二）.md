---
title: React学习系列（二）
date: 2019-08-06 20:08:21
tags: react
---

# 高阶组件

高阶组件其实是一个函数，接收一个组件作为参数，返回一个包装组件作为返回值，类似于高阶函数。

## 属性代理

### 操作props

可以对原组件的props进行增删改查，通常是查找和增加，删除和修改的话，需要考虑到不能破坏原组件。

### 通过refs访问组件实例

可以通过ref回调函数的形式来访问传入组件的实例，进而调用组件相关方法或其他操作。

### 提取state

通过传入 props 和回调函数把 state 提取出来

### 包裹WrappedComponent

为了封装样式、布局等目的，可以将WrappedComponent用组件或元素包裹起来。

## 反向继承

高阶组件继承于被包裹的React组件

```javascript
const MyContainer = (WrappedComponent)=>{
  class extends WrappedComponent {
    render(){
      return super.render();
    }
  }
}
```

### 渲染劫持

渲染劫持就是指的是高阶组件可以控制 WrappedComponent的渲染过程，并渲染各种各样的结果。我们可以在这个过程中在任何React元素输出的结果中读取、增加、修改、删除props，或读取或修改React元素树，或条件显示。又或者用样式包裹元素树

```javascript
function hoc(ComponentClass) {
  return class HOC extends ComponentClass {
    render() {
      const elementTree = super.render();
      elementTree.props.children = elementTree.props.children.filter((z) => {
          return z.type !== "ul" && z;
      }
      const newTree = React.cloneElement(elementTree);
      return newTree;
    }
  }
}

@hoc
export default class ComponentClass extends React.Component {
    render() {
      const divStyle = {
        width: '100px',
        height: '100px',
        backgroundColor: 'red'
      };

      return (
        <div>
          <p style={{color: 'brown'}}>啦啦啦</p>
          <ul>
            <li>1</li>
            <li>2</li>
          </ul>
          <h1>哈哈哈</h1>
        </div>
      )
    }
}
```
### 操作state

HOC可以读取，编辑和删除WrappedComponent实例的state，可以添加state。不过这个可能会破坏WrappedComponent的state，所以，要限制HOC读取或添加state，添加的state应该放在单独的命名空间里，而不是和WrappedComponent的state混在一起。

### 条件渲染

当 this.props.loggedIn 为 true 时，这个 HOC 会完全渲染 WrappedComponent 的渲染结果。（假设 HOC 接收到了 loggedIn 这个 prop）

```js
function iHOC(WrappedComponent) {
  return class Enhancer extends WrappedComponent {
    render() {
      if (this.props.loggedIn) {
        return super.render()
      } else {
        return null
      }
    }
  }
}
```

### 解决WrappedComponent名字丢失问题

用HOC包裹的组件会丢失原先的名字，影响开发和调试。可以通过在WrappedComponent的名字上加一些前缀来作为HOC的名字，以方便调试。

```js
class HOC extends ... {
  static displayName = `HOC(${getDisplayName(WrappedComponent)})`
  //
}

// getDisplayName
function getDisplayName(WrappedComponent) {
  return WrappedComponent.displayName ||
         WrappedComponent.name ||
         'Component'
}
```