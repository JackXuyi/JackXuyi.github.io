---
title: mysql数据库操作
date: 2020-09-13 22:21:24
tags: mysql
---

### 创建用户

`CREATE USER 'username'@'host' IDENTIFIED BY 'password';`

- `host` 代表可以登录地址，`%` 表示任意地址
- 可选选项 `WITH mysql_native_password` 语句表示密码的存储方式

### 修改用户密码

`ALTER USER 'username'@'host' IDENTIFIED WITH mysql_native_password BY 'password';`

### 授权

`grant 权限 privileges on dbName.数据表 to 'tools';`

- 权限包括增删查改，`all` 代表所有权限
- 数据库和数据表可以用 `*` 表示通配

### 刷新权限

`FLUSH PRIVILEGES;`

- 数据权限并不会自动更新，需要手动执行命令才会刷新

### 查看列表数据库

`show databases;`

### 查看数据表的结构

`desc 数据库.数据表;`
