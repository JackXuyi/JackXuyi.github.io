---
title: 用ts搭建express项目
date: 2020-07-05 15:19:01
tags: node
---

### 初始化项目

进入项目文件夹，执行 `npm init` 命令，一路回车，最后输入 `yes` 即可创建项目，生成项目的 `package.json` 文件，文件内容如下

```json
{
  "name": "express-ts",
  "version": "1.0.0",
  "description": "",
  "main": "index.js",
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1"
  },
  "author": "",
  "license": "ISC"
}
```

### 安装相关依赖

- 用 `npm install express` 安装 `express`
- 用 `npm install typescript @types/node @types/express -D` 安装相关 `ts` 相关依赖
- 用 `npm install @babel/cli @babel/core babel-plugin-module-resolver hjson -D` 安装相关 `babel` 相关依赖
- 用 `npm install ts-node nodemon tsconfig-paths -D` 安装开发环境相关依赖
- 用 `npm install hjson rimraf -D` 安装其它依赖

### 配置项目

- 在根目录下创建 `tsconfig.json`，配置 `ts`

```json
{
  "compilerOptions": {
    "module": "commonjs", //指定生成哪个模块系统代码
    "allowJs": true, // 允许编译javascript文件
    "target": "es5", //目标代码类型
    "noImplicitAny": false, //在表达式和声明上有隐含的'any'类型时报错。
    "sourceMap": false, //用于debug
    "baseUrl": "./", // 解析非相对模块名的基准目录
    "rootDir": "src", //仅用来控制输出的目录结构--outDir。
    "listFiles": false, // 编译过程中打印文件名
    "locale": "zh", // 显示错误信息时使用的语言
    "outDir": "dist", //重定向输出目录。
    "skipDefaultLibCheck": true, // 忽略库的默认声明文件的类型检查
    "types": ["node", "express"],
    "paths": {
      // 模块名到基于 baseUrl的路径映射的列表
      "@utils/*": ["src/utils/*"]
    }
  },
  "include": ["./src/"],
  "exclude": ["node_modules"]
}
```

- 在根目录下创建 `babel.config.js` 文件配置 `babel`，本项目中只用到了 `babel` 编译路径别名的功能

```js
const hjson = require("hjson");
const fs = require("fs");
const path = require("path");

const text = fs.readFileSync("./tsconfig.json", { encoding: "utf8" });

const tsConfig = hjson.parse(text);

const pathMap = tsConfig.compilerOptions.paths || {};
const pathAlias = Object.keys(pathMap).reduce((prev, curr) => {
  const realKey = `${curr}`.replace(/\/\*$/, "");
  const realPath = `/${(pathMap[curr] || [])[0]}`
    .replace(/\/\*$/, "")
    .replace(/^\S*src/, "./dist");
  prev[realKey] = realPath;
  return prev;
}, {});

module.exports = function (api) {
  api.cache(true);

  const plugins = [
    [
      "module-resolver",
      {
        root: ["dist/"],
        alias: pathAlias,
      },
    ],
  ];

  return {
    plugins,
  };
};
```

- 在根目录下创建 `nodemon.json`，配置开发环境

```json
{
  "restartable": "rs",
  "ignore": ["node_modules/**/node_modules"],
  "verbose": true,
  "execMap": {
    "ts": "ts-node -r  tsconfig-paths/register src/index.ts --files"
  },
  "watch": ["./src"],
  "env": {
    "NODE_ENV": "development"
  },
  "ext": "ts"
}
```

### 编写测试代码

- 创建 `scr/index.ts` 文件

```ts
import * as express from "express";
import { log } from "@utils/log";

const app = express();
const port = 8000;

app.get("/", (req, res) => {
  res.send("hello world");
});

app.listen(port, () => {
  log(`Server is listening on http://localhost:${port}`);
});
```

- 创建 `scr/utils/log.ts` 文件

```ts
import { isDev } from "./env";

export const log = (...args) => {
  if (isDev) {
    console.log(...args);
  }
};
```

- 创建 `scr/utils/env.ts` 文件

```ts
export const isDev = process.env.NODE_ENV !== "production";
```

### 配置相关脚本

- `nodemon` 开发环境编译命令：`"dev:server": "nodemon"`
- `ts-node` 开发环境编译命令: `"dev:ts:server": "ts-node -r tsconfig-paths/register src/index.ts --files"`
- 生产环境编译命令: `"build:server": "rimraf ./dist && tsc --build ./tsconfig.json && babel ./dist/index.js --out-dir ./dist"`
- 生产环境启动服务命令: `node ./dist/index.js`

#### 最终 `package.json`

```json
{
  "name": "express-ts",
  "version": "1.0.0",
  "description": "",
  "main": "index.ts",
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1",
    "start:server": "node ./dist/index.js",
    "dev:server": "nodemon",
    "dev:ts:server": "ts-node -r  tsconfig-paths/register src/index.ts --files",
    "build:server": "rimraf ./dist && tsc --build ./tsconfig.json && babel ./dist/index.js --out-dir ./dist"
  },
  "author": "",
  "license": "ISC",
  "dependencies": {
    "express": "^4.17.1"
  },
  "devDependencies": {
    "@babel/cli": "^7.10.4",
    "@babel/core": "^7.10.4",
    "@types/express": "^4.17.6",
    "@types/node": "^14.0.14",
    "babel-plugin-module-resolver": "^4.0.0",
    "hjson": "^3.2.1",
    "nodemon": "^2.0.4",
    "rimraf": "^3.0.2",
    "ts-node": "^8.10.2",
    "tsconfig-paths": "^3.9.0",
    "typescript": "^3.9.6"
  }
}
```

#### 开发环境

在根目录执行 `npm run dev:server` 或者执行 `npm run dev:ts:server` 就可以启动服务，访问 `http://localhost:8000`，即可在浏览器中看到 `hello world`，注意 `npm run dev:ts:server` 文件有更改后不会自动重启服务

#### 生产环境

在根目录执行 `npm run build:server`，然后再执行 `npm run start:server`就可以启动服务，访问 `http://localhost:8000`，即可在浏览器中看到 `hello world`

### 目录结构

```js
src // 源码目录
|--- utils // 工具文件目录
|   |--- log.ts // 输出日志文件
|   |--- env.ts // 环境参数相关
|--- index.ts // 项目入口文件
|--- babel.config.js // babel 相关配置
|--- nodemon.json // nodemon 相关配置
|--- package.json // 项目配置
|--- tsconfig.json // ts 相关配置
```

[完整项目参考链接](https://github.com/JackXuyi/web-exercise/tree/master/express-ts)

### 相关知识

- [高度包容、快速而极简的 Node.js Web 框架 express](https://expressjs.com/zh-cn/)
- [typescript](https://www.tslang.cn/docs/home.html)
- [nodemon 用来监视 node.js 应用程序中的任何更改并自动重启服务](https://github.com/remy/nodemon#nodemon)
- [可以直接的运行 ts 代码的工具 ts-node](https://github.com/TypeStrong/ts-node)
- [一个 JavaScript 编译器 babel](https://www.babeljs.cn/docs/)
- [一个可以去除注释的 json 格式化工具 hjson](https://github.com/hjson/hjson-js)
