---
layout: hexo
title: deploy与github帐户关联
date: 2018-03-20 21:49:59
tags: 资源
---

### 设置git的`username`和`email`

+ 用`git config --global user.name "username"`设置用户名
+ 用`git config --global user.email "email"`设置邮箱

### 生成公钥和密钥
+ 用`ssh-keygen -t rsa -C "email"`生成公钥和密钥，一路回车即可
+ 检查`C:\Users\Administrator\.ssh\`是否存在`id_rsa`和`id_rsa.pub`两个文件

### 添加公钥和`KEY`到`ssh-agent`
+ 用`eval "$(ssh-agent -s)"`添加密钥到`ssh-agent`
+ 用`ssh-add ~/.ssh/id_rsa`添加生成的`SSH key`到`ssh-agent`

### 把公钥添加到`github`

### 测试是否成功
+ 用`ssh -T git@github.com`测试是否成功，成功后会在返回的`Hi`后返回你的用户名
