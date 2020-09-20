---
title: antd中遇到的问题（一）
date: 2020-09-20 22:42:42
tags: [react, antd]
---

### antd v4 版本中 Form.Item 子组件 value 不生效问题

#### 背景

在 `Form.Item` 中使用 `Input` 输入框设置 `value` 时发现其不生效，查看使用文档也没有发现问题

#### 猜测

`Form.Item` 对子组件的 `value` 属性做了劫持，导致手动设置的 `value` 被覆盖

#### 代码验证

1. 通过查找 `return` 语句，发现执行了 `renderLayout` 这个方法
2. 查看 `renderLayout` 的具体实现子组件实际渲染的是方法的实际参数 `baseChildren`
3. 查看 `renderLayout` 的调用发现在 `!hasName && !isRenderProps && !dependencies` 才会直接渲染子组件，其它情况会注入 `value` 等属性

```tsx
// 先执行
if (!hasName && !isRenderProps && !dependencies) {
  return renderLayout(children)
}

// 再执行
if (React.isValidElement(children)) {
  childNode = (
    <MemoInput
      value={mergedControl[props.valuePropName || 'value']}
      update={updateRef.current}
    >
      {React.cloneElement(children, childProps)}
    </MemoInput>
  )
}
```

#### 修复

去除 `Form.Item` 中的 `name` 属性，验证 `value` 属性生效
