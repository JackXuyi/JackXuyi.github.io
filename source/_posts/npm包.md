---
title: npm包
date: 2020-04-06 14:04:26
tags: node
---

## 发布 npm 包

### 注册账号

在 [npm](https://www.npmjs.com/signup?next=%2Fsettings%2Fzhijianren%2Fpackages) 上注册账号

### `npm init` 初始化项目

- `package.json`
  ```json
  {
    "name": "@test/test",
    "version": "0.0.1",
    "description": "test",
    "main": "index.js",
    "scripts": {
      "test": "echo \"Error: no test specified\" && exit 1"
    },
    "keywords": ["test"],
    "author": "",
    "license": "ISC"
  }
  ```
- `index.js`
  ```
  console.log("hello world!");
  ```

### 发布项目

- 用 `npm login` 登录
- `npm run publish` 发布到 `npm`

### 注意

- 如果发布的包是以 `@` 开头的公有包，请使用 `npm run publish --access public`
- 项目根目录的`.npmignore`可以指定忽略哪些文件发布到 `npm` 上

### 小技巧

- 快速修改版本号

  ```
  // version = v0.0.1
  npm version patch
  // v0.0.2
  npm version prepatch
  // v0.0.2-0
  npm version minor
  // v0.1.0
  npm version major
  // v1.0.0
  ```

### 参考链接

- [.npmignore 存在的问题](https://www.zcfy.cc/article/for-the-love-of-god-don-t-use-npmignore)
- [npm version](https://docs.npmjs.com/cli/version)
