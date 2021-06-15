---
title: react中配置eslint和flow
date: 2018-07-21 17:00:45
tags: [JavaScript, webpack, react]
---

## react 中配置 eslint 和 flow

### react 中配置 flow

- 用`npm install -g flow-bin flow-scripts`全局安装`flow`
- 用`npm install babel-preset-flow flow-bin flow-scripts`安装`babel-preset-flow flow-bin flow-scripts`相关包
- 在根目录下的`.babelrc`文件中做`flow`相关的配置，配置文件如下：

```
  "presets": [
    "react",
    "es2015",
    "flow"
  ]
```

- 在工程根目录下运行`flow init`初始化`flow`，产生一个`.flowconfig`文件，加入相关配置后的文件具体内容如下：

```
[ignore]
.*/node_modules/.*
[include]
./src/**/*.js
[libs]
./node_modules/.*
[lints]

[options]

[strict]
```

- 在需要引入`flow`检查的文件的头部加入`//@flow`或者`/*@flow*/`对文件进行`flow`检查
- 具体用法参考[flow](https://flow.org)

### react 中配置 eslint

- 用`npm install -g eslint`命令全局安装`eslint`
- 用`npm install babel-eslint eslint-plugin-jsx-a11y eslint-plugin-react`安装`eslint`的`react`插件
- 用 `eslint --init`初始化工程项目，按照提示给出答案，在项目根目录下产生`.eslintrc.js`文件
- 在根目录下新建`.eslintignore`文件，在文件中添加需要忽略的文件和文件夹
