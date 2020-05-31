---
title: js基础知识系列（四）
date: 2020-05-06 22:21:54
tags: JavaScript
---

## 字符串

### 创建自符串

- 构造函数创建 `new String('t')`
- 字面量创建 `"t"`
- 使用函数转化为字符串 `String("t")`

#### 区别

```JS
const t1 = new String("t")
const t2 = String("t")
const t3 = "t"

t1 === t2 // false
t1 === t3 // false
t3 === t2 // true

typeof t1 // "object"
typeof t2 // "string"
typeof t3 // "string"

```

上述代码可以看出 `new String('t')` 创建的是一个引用类型-对象，而 `"t"` 和 `String("t")` 是一个基本类型-字符串，但是都具有字符串具有的属性

### 字符串方法

- `charAt(n)` 返回字符串中第 `n + 1` 个单字符，若字符不存在则返回空字符串
- `charCodeAt(n)` 返回字符串中第 `n + 1` 个单字符编码，若字符不存在则返回 `NaN`
- `concat(str)` 拼接字符串，类似与 `+` 号，但 `+` 存在类型转化问题，`concat(str)` 调用时必须为字符串拼接其它类型，函数中其它类型会被强制转化为字符串
- `indexOf(str, n)` 从第 n 位由左向右查找字符串，找到返回 `index`，没有找到返回 `-1`
- `lastIndexOf(str, n)` 从第 n 位由右向左查找字符串，找到返回 `index`，没有找到返回 `-1`
- `trim()` 去除字符串两边的空格
- `toLowerCase()` 和 `toLocaleLowerCase()` 字符串转化为小写，建议使用 `toLocaleLowerCase()` ，在某些语种下表现不一致
- `toUpperCase()` 和 `toLocaleUpperCase()` 字符串转化为大写，建议使用 `toLocaleUpperCase()` ，在某些语种下表现不一致
- `str1.localeCompare(str2)`，str1 排在 str2 之前返回负数，相同位置返回 0，之后返回正数，比较是拿 str1 字符串中的字符与 str2 的字符逐位相减
- `fromCharCode(num1,num2,...numn)` 字符编码转化为字符串

#### `slice`、`substr`、`substring` 异同，以字符串 `"123456"` 为例

##### 相同点

都是对字符串进行切割且不改变原有字符串，都接收一到两个参数，没有参数时都返回整个字符串

##### 不同点

- `slice` 参数为（起始位置，结束位置）
- `substr` 参数为（起始位置，长度）
- `substring` 参数为（起始位置，结束位置）

```JS
"123456".slice(3) // "456"
"123456".substr(3) // "456"
"123456".substring(3) // "456"

"123456".slice(9) // ""
"123456".substr(9) // ""
"123456".substring(9) // ""

"123456".slice(-2) // "56" 小于 0 从字符串长度 + 该值的位置开始计算
"123456".substr(-2) // "123456" 小于 0 从字符串起始位置开始计算
"123456".substring(-2) // "56" 小于 0 从字符串长度 + 该值的位置开始计算

"123456".slice(2,2) // "" （起始位置，结束位置）
"123456".substr(2,2) // "34" （起始位置，长度）
"123456".substring(2,2) // "" （起始位置，结束位置）


"123456".slice(2,1) // "" （起始位置，结束位置）
"123456".substr(2,1) // "3" （起始位置，长度）
"123456".substring(2,1) // "2" （起始位置，结束位置），把参数中较小的值作为起始位置

"123456".slice(2,-7) // "345" （起始位置，结束位置），小于0的值按照 N * len + n 的方式计算位置
"123456".substr(2,-7) // "" （起始位置，长度）
"123456".substring(2,-7) // "12" （起始位置，结束位置），把参数中较小的值作为起始位置且当起始位置小于0时按照0计算
```

#### 字符串的匹配

- `match(regexp)` 方法，类似于正则的 `exec` 方法，返回一个数组
- `search(regexp)` 返回第一个匹配项的索引，未匹配到返回 `-1`
- `replace(regexp, replaceStr)` 替换字符串
- `split(regexp)` 分割字符串，返回数组

##### `replace(regexp, replaceStr)` 正则替换字符串

- `replaceStr` 可以使用的特殊字符串

| 字符序列 | 替换文本                                      |
| -------- | --------------------------------------------- |
| `$$`     | \$                                            |
| `$&`     | 匹配整个模式的字符串                          |
| `$'`     | 匹配的子字符串之前的字符串                    |
| \$\`     | 匹配的子字符串之后的字符串                    |
| `$n`     | 匹配第 n 个捕获组的子字符串， n 范围 0 ~ 9    |
| `$nn`    | 匹配第 nn 个捕获组的子字符串，nn 范围 01 ~ 99 |

- `replaceStr` 为函数，类似于 `function(match,pos,originalText)`，参数分别表示匹配项、匹配的位置、原始字符串

  ```JS
  function htmlEscape(text) {
      return text.replace(/[<>"&]/g, function(match, pos, originalText){
          switch(match) {
              case "<": return "&lt;";
              case ">": return "&gt;";
              case "&": return "&amp;";
              case "\"": return "&quot;";
          }
      })
  }

  htmlEscape("<h1 class=\"test\">test</h1>") // &lt;h1 class=&quot;test&quot;&gt;test&lt;/h1&gt;
  ```
