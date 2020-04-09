---
layout: mac
title: iOS模拟器
date: 2020-04-09 23:02:23
tags: other
---

# mac 上 ios 模拟器调试开发

## 准备

- mac 电脑
- xcode 10.X
- ios 应用模拟器安装包

## 新建工程

- 打开 xcode 软件
- 新建工程

  ![新建工程](/images/ios/create_project_1.png)

- 选择默认的应用类型

  ![选择默认的应用类型](/images/ios/create_project_2.png)

- 设置工程名称和路径

  ![设置工程名称和路径](/images/ios/create_project_3.png)

- 点击 `next` 选择项目保存路径
- 点击构建启动模拟器

  ![点击构建启动模拟器](/images/ios/create_project_4.png)

- 若系统弹出如下弹窗提示需要授权，输入电脑开机密码授权就可以了

  <img src="/images/ios/create_project_5.png" style="width: 400px;" >

- 最后在程序坞中会出现如下图标，并在屏幕上显示模拟器

  <img src="/images/ios/create_project_6.png" style="width: 300px;" >

## 安装模拟器

以涂鸦模拟器包为例

- 把你的模拟器包拖到模拟器中(即下图的屏幕中)安装应用

  <img src="/images/ios/install_app_1.png" style="width: 300px;" >

- 安装成功之后会在屏幕中显示应用的图标

  <img src="/images/ios/install_app_2.png" style="width: 300px;" >

## 在模拟器里调试

### `safari` 浏览器准备

- 打开 `safari`，在菜单栏找到 `safari浏览器` 中的 `偏好设置`

  ![偏好设置](/images/ios/debug_web_1.png)

- 在 `高级` 设置中勾选 `在菜单栏中显示“开发”菜单` 就可以在菜单栏中显示开发菜单了

  ![开发菜单](/images/ios/debug_web_2.png)

### 开始调试应用中的 `h5` 页面

- 打开应用中的 `h5` 页面
- 在 safari 浏览器中选中 `开发` 下的 `模拟器-xxxx` 中页面对应的 `URL`，选中后模拟器中的对应页面会变色

  ![浏览器中选中页面](/images/ios/debug_web_3.png)

- 在 safari 浏览器中检查元素

  ![浏览器中检查元素](/images/ios/debug_web_4.png)

## 小技巧

- 在浏览器中查看当前页面的 URL 可以在控制台使用 `location.href`

  ![页面URL](/images/ios/debug_web_5.png)

- 在页面中查看 next 服务端请求的数据，在控制台输入

  ![页面 NEXT 数据](/images/ios/debug_web_6.png)
