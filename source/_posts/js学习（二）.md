---
title: js学习（二）
date: 2018-08-04 20:54:32
tags: JavaScript
---

## web存储

通过监听onstorage事件监听web存储事件

#### 本地存储

+ 全局属性localStorage访问，返回storage对象，用键值对形式存储数据
+ 通过清除浏览器数据清除本地存储中的数据，即存储时间为永久

#### 会话存储

+ 全局属性sessionStorage访问，返回storage对象，用键值对形式存储数据
+ 生命周期为窗口的存活周期

## 获取地理位置

#### `navigator.geolocation.getCurrentPosition`获取浏览器当前的位置
+ 第一个参数是获取地理位置成功的回调函数（唯一一个参数为坐标和更新时间对象）
+ 第二个参数是获取地理位置失败的回调函数（唯一一个参数是返回的错误码和错误原因的对象）
+ 第三个参数为请求地理位置的参数

### `navigator.geolocation.watchPosition`监控浏览器位置

+ 返回监视器的id，通过调用`navigator.geolocation.clearWatch`清除监视器
+ 第一个参数是获取地理位置成功的回调函数（唯一一个参数为坐标和更新时间对象）
+ 第二个参数是获取地理位置失败的回调函数（唯一一个参数是返回的错误码和错误原因的对象）
+ 第三个参数为请求地理位置的参数

参考文档：[使用地理位置定位](https://developer.mozilla.org/zh-CN/docs/Web/API/Geolocation/Using_geolocation)