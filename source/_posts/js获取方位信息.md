---
title: js获取方位信息
date: 2022-08-20 22:56:47
tags: JavaScript
---

js 提供了获取方位信息的方法，整体可以分为以下几步

### 前置检查

通过判断 `window` 是否具有 `DeviceOrientationEvent` 这个属性来判断是否支持获取方位信息

```ts
function checkOrientation() {
  return Boolean(window.DeviceOrientationEvent)
}
```

### 获取方位信息

通过监听事件实现对方位信息的获取

```ts
function watchOrientation(callback: (e: DeviceOrientationEvent) => void) {
  if (checkOrientation()) {
    window.addEventListener('deviceorientation', callback, true)
    return () => {
      window.removeEventListener('deviceorientation', callback, true)
    }
  }
  return loop
}
```

#### 参数

##### `callback`

获取方位信息后的回调，类型为 `(e: DeviceOrientationEvent) => void`

```ts
interface DeviceOrientationEvent extends Event {
  readonly absolute: boolean // 一个布尔值，指示设备是否绝对提供方向数据。
  readonly alpha: number | null // 表示设备绕z轴运动的数字，以度表示，值范围为0（包括）到360（不包括）。以正北方向为 0 度
  readonly beta: number | null // 表示设备绕x轴运动的数字，以度表示，值范围为-180（包括）到180（不包括）。这表示设备的前后运动。
  readonly gamma: number | null // 表示设备绕y轴运动的数字，以度表示，值范围为-90（包括）到90（不包括）。这表示设备从左到右的运动。
}
```

### 注意

- 需要当前页面为 `HTTPS` 才被允许获取方位信息
- 可以通过[当前页面](https://sensorbox.glitch.me/)检测设备是否支持获取方位信息

### 参考

- [Geolocation 获取位置](https://developer.mozilla.org/zh-CN/docs/Web/API/Geolocation/getCurrentPosition)
