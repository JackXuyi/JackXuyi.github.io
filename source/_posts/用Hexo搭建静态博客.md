---
title: 用Hexo搭建静态博客
tags: [other, JavaScript, node]
---

## 环境准备

- Git 安装及使用：[廖雪峰的网站](http://www.liaoxuefeng.com/wiki/0013739516305929606dd18361248578c67b8067c8c017b000)
- Node.js 的安装：[Node.js 安装配置](http://www.runoob.com/nodejs/nodejs-install-setup.html)
- Hexo 的安装及使用：[Hexo 文档](https://hexo.io/zh-cn/docs/index.html)
- yilia 主题的安装配置：[yilia 简介、安装、配置](https://github.com/litten/hexo-theme-yilia)

## hexo 环境配置

- 创建文件夹 blog 作为项目文件夹
- 初始化项目文件夹

* 指定文件夹初始化

      hexo init blog

* 或者，进入文件夹再初始化

      cd blog
      hexo init

- 安装插件 deployer

      npm install hexo-deployer-git --save

- 修改根目录下的 \_config.yml 文件

      deploy:
      type: git
      repo: git@github.com:JackXuyi/JackXuyi.github.io.git
      branch: master

- 配置域名：在 source 目录下添加 CNAME 文件，并在文件里写入你的域名

      xuyi-emb.win

## 使用说明

- 源代码和发布的网站的存储位置不在同一个地方，使用不同分支保存数据，具体解释见 [使用 hexo，如果换了电脑怎么更新博客？](http://www.zhihu.com/question/21193762)
