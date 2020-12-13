---
title: ts之type、interface和class区别
date: 2020-12-13 22:04:08
tags: TypeScript
---

### type

[任意类型的别名](https://www.typescriptlang.org/docs/handbook/2/everyday-types.html#type-aliases)

```
 We’ve been using object types and union types by writing them directly in type annotations. This is convenient, but it’s common to want to use the same type more than once and refer to it by a single name.
 A type alias is exactly that - a name for any type.
```

#### 示例

```ts
type test = number

// error: 标识符“test”重复。
// type test = string
```

#### 特点

- 任意类型的别名（包含基本类型）
- 只可以定义一次（多次定义报 ’标识符“test”重复‘ 错误）

### interface

[接口的作用就是为这些类型命名和为你的代码或第三方代码定义契约。](https://www.typescriptlang.org/docs/handbook/interfaces.html)

```
One of TypeScript’s core principles is that type checking focuses on the shape that values have. This is sometimes called “duck typing” or “structural subtyping”. In TypeScript, interfaces fill the role of naming these types, and are a powerful way of defining contracts within your code as well as contracts with code outside of your project.
```

#### 示例

```ts
interface Shape {
  color: string
}

interface Shape {
  size?: number
}

interface PenStroke {
  penWidth: number
}

interface Square extends Shape, PenStroke {
  sideLength: number
}

let square = <Square>{}
square.color = 'blue'
square.sideLength = 10
square.penWidth = 5.0
square.size = 100
```

### class

[类是“特殊的函数”，就像你能够定义的函数表达式和函数声明一样，类语法有两个组成部分：类表达式和类声明。](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Classes)

```
TypeScript offers full support for the class keyword introduced in ES2015. As with other JavaScript language features, TypeScript adds type annotations and other syntax to allow you to express relationships between classes and other types.
```

#### 示例

```ts
let passcode = 'secret passcode'

class Employee {
  private _fullName: string

  get fullName(): string {
    return this._fullName
  }

  set fullName(newName: string) {
    if (passcode && passcode == 'secret passcode') {
      this._fullName = newName
    } else {
      console.log('Error: Unauthorized update of employee!')
    }
  }
}

let employee = new Employee()
employee.fullName = 'Bob Smith'
if (employee.fullName) {
  alert(employee.fullName)
}
```

### abstract class

[抽象类做为其它派生类的基类使用。 它们一般不会直接被实例化。 不同于接口，抽象类可以包含成员的实现细节。 abstract 关键字是用于定义抽象类和在抽象类内部定义抽象方法。](https://www.tslang.cn/docs/handbook/classes.html)

```ts
abstract class Department {
  constructor(public name: string) {}

  printName(): void {
    console.log('Department name: ' + this.name)
  }

  abstract printMeeting(): void // 必须在派生类中实现
}

class AccountingDepartment extends Department {
  constructor() {
    super('Accounting and Auditing') // 在派生类的构造函数中必须调用 super()
  }

  printMeeting(): void {
    console.log('The Accounting Department meets each Monday at 10am.')
  }

  generateReports(): void {
    console.log('Generating accounting reports...')
  }
}

let department: Department // 允许创建一个对抽象类型的引用
department = new Department() // 错误: 不能创建一个抽象类的实例
department = new AccountingDepartment() // 允许对一个抽象子类进行实例化和赋值
department.printName()
department.printMeeting()
department.generateReports() // 错误: 方法在声明的抽象类中不存在
```

### 区别

- 接口创建了一个新的名字，可以在其它任何地方使用。 类型别名并不创建新名字—比如，错误信息就不会使用别名。
- 类型别名不能被 extends 和 implements（自己也不能 extends 和 implements 其它类型）。
- 接口只能用来声明对象，而不能重新命名基本数据类型。
- 接口名称将始终以原始形式出现在错误消息中，当按名称使用时才显示。
- 接口可以进行声明合并
- 抽象类和接口一样不可以被实例化，但是抽象类可以包含部分属性方法的实现
