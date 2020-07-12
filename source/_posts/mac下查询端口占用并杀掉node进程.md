---
title: mac 下查询端口占用情况并杀掉对应 node 进程
date: 2020-07-12 20:55:18
tags: node
---

## 准备工作

### 命令行下查询端口占用情况

```bash
lsof -i tcp:8080
```

返回结果如下

```
COMMAND     PID USER   FD   TYPE             DEVICE SIZE/OFF NODE NAME
node      45971 xxxx   21u  IPv6 0xxxxxxxxxxxxxxxxx      0t0  TCP *:http-alt (LISTEN)
```

### mac 下杀掉进程的命令

```
kill pid
```

### node 下执行命令

- 异步执行命令

```js
require("child_process").exec("cmd");
```

- promise 包裹后通过 async await 的方式来执行

```js
const { stdout, stderr } = require("util").promisify(
  require("child_process").exec
)("cmd");
```

## 开发

### 提取对应占用对应端口的 node pid

- 通过命令行获取对应的端口占用情况
- 获取到的字符串统一转为小写
- 通过正则表达式匹配出想要筛选的 node 进程
- 通过正则提取对应进程的 pid

```js
const { stdout, stderr } = await require("util").promisify(
  require("child_process").exec
)(`lsof -i tcp:8080`);

const list = stdout
  .toLowerCase()
  .split("\n")
  .filter(Boolean)
  .filter((str) => /^node/.test(str))
  .map((str) => {
    const reg = /^node\s+(\w+)\s+/.exec(str);
    return Number(reg[1]);
  });
```

### 执行 kill 命令杀掉对应的 node 进程

- 遍历进程数组执行命令杀掉对应进程

```js
const { stdout, stderr } = await require("util").promisify(
  require("child_process").exec
)(`kill 45971`);
```

## 扩展

- 可以通过构建 node cli 实现端口查杀对应占用进程的功能

## 完整代码

注：`utils` 文件主要是通过 `console` 实现的打印功能

```js
const { exec } = require("child_process");
const util = require("util");

const { log, error, info } = require("./utils");

const pExec = util.promisify(exec);

async function getPid(port) {
  try {
    const { stdout, stderr } = await pExec(`lsof -i tcp:${port}`);
    if (stderr) {
      throw new Error(stderr);
    } else {
      const list = stdout
        .toLowerCase()
        .split("\n")
        .filter(Boolean)
        .filter((str) => /^node/.test(str))
        .map((str) => {
          log(str);
          const reg = /^node\s+(\w+)\s+/.exec(str);
          return Number(reg[1]);
        });
      return list;
    }
  } catch (e) {
    error(e);
    return [];
  }
}

async function kill(pid) {
  try {
    const { stdout, stderr } = await pExec(`kill ${pid}`);
    if (stderr) {
      throw new Error(stderr);
    } else {
      if (stdout) {
        log(stdout);
      }
      info(`kill pid ${pid} success`);
    }
  } catch (e) {
    error(e);
  }
}

async function init(port) {
  const pids = await getPid(port);
  try {
    await Promise.all(pids.map((pid) => kill(pid)));
    process.exit(0);
  } catch (e) {
    error(e);
    process.exit(1);
  }
}

init(8080);
```
