---
title: typescript自定义实现
date: 2024-09-21 23:43:17
tags: [TypeScript]
---

## 介绍

TypeScript 是微软开发推出的语言，是 JavaScript 的超集，补充了静态类型检查等功能
大多数情况下，TypeScript 需要编译为 JavaScript 再运行

## 类型

### 模块

用 import 和 export 来导入和创建模块

```typescript
// test.ts
export function test() {
  console.log('hello world')
}
```

### 命名空间

用 namespace 将具有相似功能或属性的类、接口等进行分组，避免命名冲突的方式

```typescript
// test.ts
namespace Test {
  export function test() {
    console.log('hello world')
  }
}

// 使用时
/// <reference path="test.ts" />
Test.test()
```

### 类型守卫

运行时的类型断言

```typescript
const test: any = 'sss'
if (typeof test === 'string') {
  // string 类型时
}
```

### Interface

接口定义，可以用来定义接口、函数和数组

```typescript
// 函数
interface Fun {
  (a: number): void
}

// 数组
interface Arr {
  [index: number]: string
}
```

### 装饰器

装饰器是一种特殊类型的声明，可以附加到类、方法、访问符、属性或参数上，以修改其行为。在 TypeScript 中，装饰器提供了一种在声明时定义如何处理类的方法、属性或参数的机制。

- 类装饰器

```typescript
function classDecorater<T extends { new (...args: any): {} }>(constructor: T) {
  return class extends constructor {
    public test = 'xxxx'
  }
}

@classDecorater
class Test {
  public aaa = 'aaa'
}
```

- 方法或属性装饰器

```typescript
function propDecorater() {
  return function (obj: any, key: string, config: PropertyDescriptor) {
    // 装饰器逻辑
    console.log('obj', obj, 'key', key, 'config', config)
  }
}

class Test {
  @propDecorater()
  aaa: string
}
```

## 内置类型实现

- Exclude

```typescript
type MyExclude<T, K> = T extends K ? never : T
```

- Include

```typescript
type MyInclude<T, K> = T extends K ? T : never
```

- Omit

```typescript
type MyOmit<T extends Object, K> = Pick<T, Exclude<keyof T, K>>
```

- Partial

```typescript
type MyPartial<T extends Object> = { [K in keyof T]?: T[K] }
```

- Pick

```typescript
type MyPick<T extends Object, K> = {
  [M in MyInclude<keyof T, K>]: T[M]
}
```

- Required

```typescript
type MyRequired<T> = { [K in keyof T]-?: T[K] }
```

- Parameters

```typescript
type MyParameters<T extends (arg: any) => any> = T extends (arg: infer K) => any
  ? K
  : never
```

- ConstructorParameters

```typescript
  type MyConstructorParameters<T extends abstract new(arg: any): any > = T extends abstract new(arg: infer K): any ? K : never
```

- ReturnType

```typescript
type MyReturnType<T extends (arg: any) => any> = T extends (arg: any) => infer K
  ? K
  : never
```

## 场景

- 提取对象中的值类型

```typescript
function getPropType<T, K extends keyof T>(obj: T, key: K) {
  return obj[key]
}
```

- 非空校验

```typescript
type NotNull<T> = T extends null | undefined ? never : T
```

- 模版字符串

```typescript
function call<T extends `aaa_${string}`>(a: T) {
  console.log('aa', a)
}

call('xxx') // Argument of type '"xxx"' is not assignable to parameter of type '`aaa_${string}`'.
```

- Infer

```typescript
type test<T extends number> = `${T}` extends `-${infer M}` ? never : T

function testCall<T extends number>(a: test<T>) {
  console.log('testCall', a)
}

testCall(-1) // Argument of type 'number' is not assignable to parameter of type 'never'.
```

参考

- https://juejin.cn/post/7321542773076082699
- https://www.typescriptlang.org/play/
