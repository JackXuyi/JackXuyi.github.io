---
title: js基础知识系列（一）
date: 2019-07-20 17:10:50
tags: javascript
---

## `script`标签

可以通过内联和外联的方式引入脚本，当引入外部脚本后，当前标签内联的脚本就不会执行

### 属性

+ `async`：立即下载脚本，但不阻塞页面渲染，脚本下载完毕之后立即执行，不能保证脚本按照顺序执行
+ `charset`：指定脚本的编码字符集
+ `defer`：脚本延迟到页面完全解析后依次执行脚本
+ `language`：脚本语言，已废弃
+ `src`：脚本`url`
+ `type`：脚本语言类型（也称为`MIME`类型），外联脚本可不填，可以为`text/ecmascript`和`text/javascript`，默认为`text/javascript`

## `javascript`基本语法

### 标识符

+ 必须以字母、下划线、或美元符号开头
+ 其它字符可以为字母、下划线、美元符号或数字等字符

### 严格模式（`ECMAScrpit5`引入）

+ 通过`"use strict;"`启用严格模式
+ 本质是一个编译指示，告诉引擎切换到严格模式
+ 严格模式下，`ECMAScrpit3`一些不确定行为会抛出异常

### 数据类型

基本的数据类型（简单数据类型）有5种：`undefined`、`null`、`boolean`、`number`、`string`，复杂数据类型`object`

+ `typeof`操作符
  + `null`或者对象都返回`object`

+ `Boolean`类型转化


  | 数据类型 | 转化为`true`的值 | 转化为`false`的值 |
  |:---|:----|:----|
  | string | 任何非空值 | "" |
  | number | 任何非0数值（包括无穷大） | 0和NaN |
  | object | 任何对象 | null |
  | undefined | | undefined |

+ `number`类型
  + 八进制用`0`开头，16进制用`0x`开头
  + 科学计数法`3e5`表示300000
  + 数值转化
    + `true`转化为1，`false`转化为0
    + `undefined`转化为`NaN`

+ `string`类型
  + `toString`方法，参数可选基数2、8、10、16，默认为10进制
  + `String`方法
    + 若存在`toString`方法，则调用`toString`方法转化为10进制字符串
    + 若为`null`，则返回`"null"`
    + 若为`undefined`，则返回`"undefined"`

+ `object`对象
  + `constructor`：创建对象的函数
  + `hasOwnProperty`：属性是否存在于当前对象而不是原型链中
  + `isPropertyOf`：检查传入对象是否为当前对象的原型
  + `propertyIsEnumerable`：检查属性是否可以用`for-in`枚举
  + `toLocaleString`：返回对象的字符串表示
  + `toString`：返回对象的字符串表示
  + `valueOf`：返回对象的字符串、数值或布尔值表示，通常于`toString`相同

### 操作符

+ 位操作符
  + `~`按位非
  + `&`按位与
  + `|`按位或
  + `^`按位异或
  + `>>`有符号右移
  + `<<`有符号左移
  + `>>>`无符号右移

+ 相等操作符
  + 相等（==）和不相等（!=），强制转化数据类型后再比较
  + 全等（===）和全不等（!==），不转化数据类型直接比较

+ 逗号操作符
  + 一条语句执行多个操作
  + 赋值时返回表达式的最后一项

### 语句

  + `for - in`语句循环，没有顺序，`null`和`undefined`会抛出异常
  + `label`语句，在代码中添加标签，和`break`及`continue`配合使用
  
    ```javascript
    // 存在lable标签
    let count = 0;
    for (let i = 0; i < 10; i ++) {
      outermost:
      for (let j = 0; j < 10; j ++) {
        for (let k = 0; k < 10; k ++) {
          if (i >= 5 && k >= 5) {
            break outermost;
          }
          count ++;
        }
      }
    }
    console.log(count); // 525

    // 不存在lable标签
    let count = 0;
    for (let i = 0; i < 10; i ++) {
      for (let j = 0; j < 10; j ++) {
        for (let k = 0; k < 10; k ++) {
          if (i >= 5 && k >= 5) {
            break;
          }
          count ++;
        }
      }
    }
    console.log(count); // 750
    ```
  
  + `with`语句
    + 限定作用域在局部对象中，若在局部变量中找不到定义，则在`with`对象中查找对应的属性
    
      ```javascript
      with(location) {
        console.log(pathname); // location.pathname
        console.log(this); // window
      }
      ```

    + `with`造成性能下降及调试困难，建议少用

+ 函数

  + `arguments`参数
    + 类似数组，可通过下标形式访问参数，通过length属性获取传入参数个数
    + `arguments`值与对应参数值同步，但不是共用一块内存，而是值的复制

      ```javascript
      function doAdd(num1, num2) {
        arguments[1] = 10;
        return arguments[0] + num2;
      }
      console.log(doAdd(1, 2)); // 11
      ```

  + 没有签名，因为参数是由包含0个或者多个值的数组实现的
  + 没有重载，后定义的函数覆盖之前定义的函数