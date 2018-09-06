---
title: react+webpack项目中的babel配置
date: 2018-09-05 21:25:42
tags: JavaScript
---

## babel配置位置

+ 项目根目录`.babelrc`中配置，`json`格式

    ```json
    {
        "presets": ["预设条件"],
        "plugins": ["插件"],
    }
    ```

+ 在`package.json`文件中配置

    ```javascript
    {
        "name": "project",
        "version": "0.0.1",
        "babel": {
            // babel配置
        }
    }
    ```

## `react`中的`babel`配置

+ `react`解析`jsx`语法，`npm install babel-preset-react`安装相关依赖
+ `es2015`解析`es6`语法，`npm install babel-preset-es2015`安装相关依赖
+ `es`提案各个阶段的语法支持插件，`npm install babel-preset-stage-0 babel-preset-stage-1 babel-preset-stage-2 babel-preset-stage-3`安装相关依赖

    ```json
    {
        "presets": ["react", "es2015"],
        "plugins": ["插件"],
    }
    ```

## 配置示例

+ 无参数

    ```json
    {
        "presets": [
            "react",
            "es2015"
        ],
        "plugins": [
            "transform-es2015-arrow-functions", //转译箭头函数
            "transform-es2015-classes", //转译class语法
            "transform-es2015-spread", //转译数组解构
            "transform-es2015-for-of" //转译for-of
        ]
    }
    ```

+ 有参数

    ```json
    {
        "presets": [
            "react",
            "es2015"
        ],
        "plugins": [
            //改为数组，第二个元素为配置项
            ["transform-es2015-arrow-functions", { "spec": true }]
        ]
    }
    ```

## 说明

+ 官方推荐`babel-preset-env`，上面的插件已经不推荐，参考链接[官方babel-preset-env配置参考](https://www.babeljs.cn/docs/plugins/preset-env/)

## 参考资源

+ [babel插件列表](https://babeljs.io/docs/en/plugins/)
+ [babel预设条件插件列表](https://babeljs.io/docs/en/plugins/#presets)
