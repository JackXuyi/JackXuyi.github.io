---
title: gulp打包
date: 2020-04-14 22:52:46
tags: node
---

## 项目初始化

- 在文件夹下执行 `npm init`，一直回车，最后输入 `yes`即可创建模板文件
- 执行 `npm install --save-dev gulp gulp-copy` 安装 `gulp` 依赖
- 执行 `npm install -save-dev typescript gulp-typescript @babel/preset-typescript` 安装 `typescript` 相关依赖把 `ts` 编译为 `js`
- 执行 `npm install -save-dev @babel/core @babel/preset-env @babel/preset-react gulp-babel` 安装 `babel` 相关依赖
- 执行 `npm install react react-dom` 安装 `react` 相关依赖
- 配置`babel`，参考 [babel 网站](https://www.babeljs.cn/docs/)，项目简单配置如下

  ```json
  {
    "presets": [
      "@babel/preset-env",
      "@babel/preset-react",
      "@babel/preset-typescript"
    ]
  }
  ```

- 配置 gulpfile 文件，参考 [gulp 官网](https://www.gulpjs.com.cn/docs/getting-started/quick-start/)，项目简单配置如下

  ```js
  const gulp = require("gulp");
  const babel = require("gulp-babel");
  const ts = require("gulp-typescript");
  const copy = require("gulp-copy");
  const tsProject = ts.createProject("./tsconfig.json");

  gulp.task("tsx", function () {
    return gulp
      .src(["src/**/*.ts", "src/**/*.tsx"])
      .pipe(tsProject())
      .pipe(gulp.dest("./temp"));
  });

  gulp.task("js", function () {
    return gulp.src(["temp/**/*.js"]).pipe(babel()).pipe(gulp.dest("./lib"));
  });

  gulp.task("declare", function () {
    return gulp
      .src(["temp/**/*.d.ts"])
      .pipe(copy("./lib", { prefix: 1 }))
      .pipe(gulp.dest("./lib"));
  });
  gulp.task("default", gulp.series("tsx", gulp.parallel("js", "declare")));
  ```

- 在 `package.json` 加入相关命令，文件内容如下

  ```json
  {
    "name": "test",
    "version": "1.0.0",
    "description": "",
    "main": "index.js",
    "scripts": {
      "build": "gulp -f ./gulpfile.js",
      "test": "echo \"Error: no test specified\" && exit 1"
    },
    "author": "",
    "license": "ISC",
    "devDependencies": {
      "@babel/core": "^7.9.0",
      "@babel/preset-env": "^7.9.5",
      "@babel/preset-react": "^7.9.4",
      "@babel/preset-typescript": "^7.9.0",
      "gulp": "^4.0.2",
      "gulp-babel": "^8.0.0-beta.2",
      "gulp-copy": "^4.0.1",
      "gulp-typescript": "^6.0.0-alpha.1",
      "typescript": "^3.8.3"
    },
    "dependencies": {
      "react": "^16.13.1",
      "react-dom": "^16.13.1"
    }
  }
  ```

## 项目文件目录

```
+ src/              // 源文件目录
|--- index.tsx      // 打包源文件
+ .babelrc          // babel 配置文件
+ gulpfile.js       // gulp 配置文件
+ package.json      // 项目配置文件
+ tsconfig.json     // ts 配置文件
```

## 参考链接

- [使用 Babel](https://www.babeljs.cn/setup#installation)
- [gulp 官网](https://www.gulpjs.com.cn/docs/getting-started/quick-start/)
- [ts 编译选项](https://www.tslang.cn/docs/handbook/compiler-options.html)
