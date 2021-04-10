---
title: 与native交互
date: 2021-04-03 20:06:35
tags: [other, JavaScript]
---

### `Hybird App`

在 `Native App` 引用基础上结合了 `Web App` 应用所形成的模式，一般通过 `webview` 的模式引入

#### 特点

- 系统资源较少，包括 `CPU` 、内存、网卡、网络链接等。
- 支持更新的浏览器特性，不用考虑 `IE` 的兼容性问题
- 可以实现离线应用，通过新的浏览器特性或 `Native` 的文件读取机制进行文件级的文件缓存和离线更新
- 不同机型设备的兼容问题
- 可以调用客户端 `Native` 的能力，例如摄像头、定位、传感器、本地文件访问等。

### `Web` 到 `Native` 的协议调用

#### 通过 `URI` 请求

在系统中注册一个 `Schema` 协议的 `URI` ，这个 `URI` 可以在系统的任意地方调起一段原生方法或一个原生的界面

![`web` 通过 `URI` 请求 `Native` 流程](/images/webtonative.svg)

#### 通过 `addJavascriptInterface` 注入方法到页面中调用

通过 `addJavascriptInterface` 方法向页面中注入一个全局对象以供调用

#### 注入对象

```java
// 声明 ws 实例
WebSettings ws = webView.getSetting();
// 开启执行 JavaScript 脚本
ws.setJavaScriptEnabled(true);
// 加载页面
ws.loadUrl("xxx");
// 注入全局对象
ws.addJavascriptInterface(new Object(), "native")
```

#### 调用

```html
<html>
  ...
  <script>
    // 调用注入的 native 方法
    native.method()
  </script>
</html>
```

### `Native` 到 `Web` 的调用

- 安卓：通过 `webView.loadUrl` 方法实现
- iOS ：通过 `stringByEvaluatingJavaScriptFromString` 方法实现

#### html 定义方法

```html
<html>
  ...
  <script>
    function log(msg) {
      console.log(msg)
    }
  </script>
</html>
```

#### 原生调用

```java
// 声明 ws 实例
WebSettings ws = webView.getSetting();
// 开启执行 JavaScript 脚本
ws.setJavaScriptEnabled(true);
// 加载页面
ws.loadUrl("xxx");
// 调用 js 方法
webView.loadUr("javascript: log('hello world')")
```

### `JSBridge`

通信规则： `jsBridge://className:callbackMethod/methodName?jsonObj`

#### 安卓实现

通过 `prompt` 方式调用。 `addJavascriptInterface` 存在安全漏洞，可以通过 `JavascriptInterface` 来解决，但是其存在兼容性问题。所以通过 `webView.setWebChromeClient` 来实现： `JavaScript` 在执行 `alert` 和 `prompt` 时， `Native` 端会自动触发 `onJsAlert` 和 `onJsPrompt` 的方法回调函数，由于 `alert` 比较常用，所以可以通过重写 `onJsPrompt` 的方法实现对 `Native` 端方法的调用

```java
// 设置 prompt 监听
webView.setWebChromeClient(new WebChromeClient() {
    @Override
    public boolean onJsPrompt(WebView wv, String url, String msg, String defaultValue, JsPromptResult res) {
        res.confirm(JSBridge.callJsPrompt(MainActivity.this, wv, msg));
        return true
    }
});
```

#### `iOS` 实现

通过 `iframe` 的方式调用

#### 调用流程

1. 安卓通过 `prompt(jsBridge://className:callbackMethod/methodName?jsonObj)` 调用，`iOS` 通过 `iframe` 方式调用
2. `Native` 解析协议，调用对应的 `className` 对象中的 `methodName` 方法，并把对应的参数 `jsonObj` 序列化后作为方法的参数
3. 执行完成后调用 `JavaScript` 回调函数返回结果

![调用流程](/images/jsbridge.svg)
