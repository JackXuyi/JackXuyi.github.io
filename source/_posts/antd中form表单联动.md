---
title: antd中form表单联动
date: 2022-01-02 15:19:35
tags: [antd, form, JavaScript]
---

日常开发过程中，经常涉及到 `form` 表单的联动，在 `A` 选项中的某个值选中时出现 `BCE` 选项，其它值选中时不显示

![选中 A 时无选项](/images/form/form-a.png)

切换选项后新增选项

![切换选项后新增选项](/images/form/form-a-more.jpg)

### 监听选项的 `onChange` 事件实现

```tsx
export function CustomForm() {
  const [a, setA] = useState()
  return (
    <>
      <Form.Item name="testa">
        <Radio.Group onChange={(e) => setA(e.target.value)}>
          <Radio value="A">A</Radio>
          <Radio value="B">B</Radio>
        </Radio.Group>
      </Form.Item>
      {a === 'B' && <Form.Item name="testb">表单项</Form.Item>}
    </>
  )
}
```

通过监听表单项的 `onChange` 事件来修改 `state` ，`state` 值来驱动表单项的显示，官方已不建议在 form 表单中使用 `onChange` 事件

### 监听表单的 `onValuesChange` 事件实现

```tsx
export function CustomForm() {
  const [a, setA] = useState()
  return (
    <Form
      onValuesChange={(_, values) => {
        const { testa } = values
        setA(testa)
      }}
    >
      <Form.Item name="testa">
        <Radio.Group>
          <Radio value="A">A</Radio>
          <Radio value="B">B</Radio>
        </Radio.Group>
      </Form.Item>
      {a === 'B' && <Form.Item name="testb">表单项</Form.Item>}
    </Form>
  )
}
```

通过监听表单的 `onValuesChange` 事件来修改 `state` ，`state` 值来驱动表单项的显示

### 自定义组件 `children` 的渲染实现

```tsx
export function Advertise(props: RadioGroupProps) {
  const { value, children, defaultValue, ...otherProps } = props
  const isShowChildren =
    (isUndefined(value) && defaultValue === 1) || value === 1
  return (
    <>
      <Radio.Group {...otherProps} value={value} defaultValue={defaultValue}>
        {AdActList.map((item) => (
          <Radio key={item.value} value={item.value}>
            {item.label}
          </Radio>
        ))}
      </Radio.Group>
      {isShowChildren && children}
    </>
  )
}
```

通过自定义的表单驱动其它元素的渲染，把逻辑收束到组件内

##### 提示：参考 `antd` 官方文档实现子定义表单控件

## 参考

- [antd form 表单](https://ant.design/components/form-cn/)
