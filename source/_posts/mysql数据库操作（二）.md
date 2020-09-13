---
title: mysql数据库操作（二）
date: 2020-09-13 22:50:06
tags: mysql node express TypeORM
---

### express 中使用 TypeORM 连接 mysql 数据库

#### TypeORM 介绍

TypeORM 是一个采用 TypeScript 编写的用于 Node.js 的优秀 ORM 框架，支持使用 TypeScript 或 Javascript(ES5, ES6, ES7)开发。

- [Nodejs 最好的 ORM - TypeORM](https://cloud.tencent.com/developer/article/1012625)
- [github 链接](https://github.com/typeorm/typeorm)

#### express 中使用

##### 安装

`yarn add typeorm mysql`

##### 初始化

```ts
import express, { Request, Response } from 'express'
import { createConnection } from 'typeorm'

export default createConnection(config.db)
  .then(() => {
    const app = express()
    app.listen(port, () => {
      info(
        `the server is start at port ${port}, listening on http://localhost:${port}`,
      )
    })
  })
  .catch((e) => {
    console.error('connection mysql error: ', e.message)
  })
```

### 使用

```ts
import { getRepository } from 'typeorm'
async function getList() {
  const [list, total] = await getRepository(Entity).findAndCount()
}
```
