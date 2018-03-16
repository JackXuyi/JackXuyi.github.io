---
title: npm和webpack搭建react开发环境
date: 2018-03-16 09:30:41
tags: JavaScript
---

## npm环境搭建

+ `nodejs`安装参考[`Nnodejs`官网](https://nodejs.org/zh-cn/)
+ 安装完毕后用`npm --version`查看`nodejs`是否安装成功

***

## 工程初始化

+ 用`npm init`初始化工程，在根目录产生一个`package.json`文件

***

## webpack安装

+ 用`npm install webpack webpack-cli webpack-dev-server webpack-merge`安装`webpack`和其相关的包，安装完毕后会在`package.json`文件的`dependencies`选项中看到刚刚安装的包

***

## react安装

+ 用`npm install react react-dom`安装`react`和其相关的包，安装完毕后会在`package.json`文件的`dependencies`选项中看到刚刚安装的包
+ 由于`react`使用`ES6`语法大多数无法支持，所以还需用`npm install babel babel-core babel-loader babel-preset-env babel-preset-es2015 babel-preset-react`安装`babel`和其相关的包把`ES6`语法转化为，安装完毕后会在`package.json`文件的`dependencies`选项中看到刚刚安装的包

***

## hello word的实现

+ 用`npm install uglifyjs-webpack-plugin html-webpack-plugin clean-webpack-plugin`安装其它依赖包
+ 在根目录下新建`webpack.config.js`文件作为`webpack`的基础通用配置，配置文件如下：

```
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const webpack = require('webpack');

module.exports = {
  entry: './src/index.js',
  plugins: [
    new CleanWebpackPlugin(['dist']), // 清理数据
    new HtmlWebpackPlugin({ // 自动打包数据
      title: '测试',
      template: './src/index.html', // html文件模板
    }),
  ],
  output: {
    filename: '[name].[hash].bundle.js', // 输出文件名称
    path: path.resolve(__dirname, 'dist') // 输出文件路径
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/, //配置要处理的文件格式，一般使用正则表达式匹配
        use: ['babel-loader'], //使用的加载器名称
        exclude: /node_modules/
      }
    ],
  }
};
```

+ 在根目录下新建`webpack.dev.js`文件作为`webpack`的开发者模式配置，配置文件如下：

```
const merge = require('webpack-merge');
const webpack = require('webpack');
const config = require('./webpack.config.js');

module.exports = merge(config, {
  devtool: 'inline-source-map', // 开发工具
  plugins: [
    new webpack.HotModuleReplacementPlugin(), // 热替换
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify('development') // 定义开发者模式
    })
  ],
  devServer: { // 开发模式下服务器配置
    contentBase: './dist', // 编译后文件路径
    hot: true, // 是否开启热替换
    host: 'localhost' // 主机
  }
});
```

+ 在根目录下新建`webpack.prod.js`文件作为`webpack`的生产环境配置，配置文件如下：

```
const webpack = require('webpack');
const merge = require('webpack-merge');
const UglifyJSPlugin = require('uglifyjs-webpack-plugin');// 精简输出
const config = require('./webpack.config.js');

module.exports = merge(config, {
  plugins: [
    new UglifyJSPlugin({
      sourceMap: true // 调试
    }),
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify('production') // 定义生产模式
    })
  ]
});
```
+ 在根目录下新建`.babelrc`文件作为`react`的开发环境下`babel`的配置，配置文件如下：

```
{
  "presets": [
    "react",
    "es2015"
  ]
}
```
+ 在根目录下的`packge.json`中加入命令，配置文件如下：

```
{
  "name": "react-exercise",
  "version": "0.0.0",
  "description": "react exercise",
  "main": "index.js",
  "scripts": {
    "test": "echo \"Project completed\"",
    "build": "webpack --config webpack.prod.js",
    "start": "webpack-dev-server --open --config webpack.dev.js"
  },
  "keywords": [
    "react-exercise"
  ],
  "author": "xxx",
  "license": "ISC",
  "dependencies": {
    "babel": "^6.23.0",
    "babel-cli": "^6.26.0",
    "babel-core": "^6.26.0",
    "babel-loader": "^7.1.4",
    "babel-preset-env": "^1.6.1",
    "babel-preset-es2015": "^6.24.1",
    "babel-preset-react": "^6.24.1",
    "clean-webpack-plugin": "^0.1.19",
    "html-webpack-plugin": "^3.0.6",
    "react": "^16.2.0",
    "react-dom": "^16.2.0",
    "uglifyjs-webpack-plugin": "^1.2.3",
    "webpack": "^4.1.1",
    "webpack-cli": "^2.0.12",
    "webpack-dev-server": "^3.1.1",
    "webpack-merge": "^4.1.2"
  }
}
```
+ 在根目录下新建`src`文件夹，并在文件夹下新建`index.js`，`index.html`，`componentTest.js`文件
  + `index.js`是`webpack`的入口文件，文件内容如下：
  ```
    import React, { Component } from 'react';
    import ReactDOM from 'react-dom';
    import ComponentTest from './componentTest';
    ReactDOM.render(
        <ComponentTest />,
        document.getElementById('root')
    );
  ```
  + `index.html`是`webpack`的打包模板文件，文件内容如下：
  ```
  <!doctype html>
  <html>
    <head>
      <title>Getting Started</title>
    </head>
    <body>
      <div id="root"></div>
    </body>
  </html>
  ```
  + `componentTest.js`是`react`的一个组件，文件内容如下：
  ```
  import React from 'react';
  const componentTest = () => (
    <h1>hello react</h1>
  );
  export default componentTest;
  ```

+ 在命令行中输入`npm start`即可运行项目，在打开的`http://localhost:8080/`网页中看到输出的`hello react`

## 总结

+ 文件目录结构
```
src
-----index.html
-----index.js
.babelrc
package-lock.json(自动生成的文件)
package.json
webpack.config.js
webpack.dev.js
webpack.prod.js
```