---
title: js获取位置信息
date: 2022-08-19 22:36:09
tags: JavaScript
---

项目中需要获取定位信息，js 提供了对于的接口去获取，整体可以分为以下几步

### 前置检查

通过判断 `navigator` 是否具有 `geolocation` 这个属性来判断是否支持获取定位信息

```ts
function checkGeolocation() {
  return 'geolocation' in navigator
}
```

### 权限校验

通过接口获取当前浏览器的定位授权状态

```ts
async function checkPermission() {
  const res = await navigator?.permissions?.query({ name: 'geolocation' })
  return res?.state || 'prompt'
}
```

授权状态共有 `denied`、`granted`、`prompt` 三种状态

- `denied`：拒绝授权
- `granted`： 已经授权
- `prompt`：需要用户手动授权

### 获取位置

#### 一次获取位置

```ts
navigator.geolocation.getCurrentPosition(callback, handleError, options)
```

#### 监听位置变化

```ts
// 注册事件监听
const geoWatchID = navigator.geolocation.watchPosition(
  callback,
  handleError,
  options
)

// 清楚监听事件
navigator.geolocation.clearWatch(geoWatchID)
```

#### 参数

##### `callback`

获取位置信息后的回调，类型为 `(position: GeolocationPosition) => void`

```ts
interface GeolocationCoordinates {
  readonly accuracy: number // 表示纬度和经度属性精度的双精度值，以米为单位
  readonly altitude: number | null // 海拔高度
  readonly altitudeAccuracy: number | null // 一个双精度值，表示以米为单位的高度精度。此值可以为空。
  readonly heading: number | null // 返回表示设备运行方向的双精度值。该值以度为单位，表示设备偏离正北方航向的距离。0度表示正北方，方向为顺时针方向（即东90度，西270度）。如果速度为0，航向为NaN。如果设备无法提供航向信息，则该值为空。
  readonly latitude: number // 维度
  readonly longitude: number // 经度
  readonly speed: number | null // 返回表示设备速度的双精度值，单位为米/秒。此值可以为空。
}

/** Available only in secure contexts. */
interface GeolocationPosition {
  readonly coords: GeolocationCoordinates // 表示设备在地球上的位置和海拔，以及计算这些属性的精确度
  readonly timestamp: EpochTimeStamp // 表示获取到的位置的时间
}
```

##### `handleError`

获取位置信息失败的回调，类型为 `(error: GeolocationPositionError) => void`

```ts
interface GeolocationPositionError {
  /**
   * 错误原因
   * 1 -> PERMISSION_DENIED: 地理位置信息的获取失败，因为该页面没有获取地理位置信息的权限。
   * 2 -> POSITION_UNAVAILABLE:	地理位置获取失败，因为至少有一个内部位置源返回一个内部错误。
   * 3 -> TIMEOUT: 获取地理位置超时，通过定义PositionOptions.timeout 来设置获取地理位置的超时时长。
   **/
  readonly code: number
  readonly message: string // 描述错误的详细信息
}
```

##### `options`

```ts
interface PositionOptions {
  enableHighAccuracy?: boolean // 表示应用程序希望接收最佳可能结果。如果为真，并且如果设备能够提供更准确的位置，它将这样做。请注意，这可能导致响应时间变慢或功耗增加（例如，使用移动设备上的GPS芯片）。另一方面，如果为假，则设备可以通过更快地响应和/或使用更少的功率来自由节省资源。默认值：false。
  maximumAge?: number // 可接受返回的可能缓存位置的最大时间（以毫秒为单位）。如果设置为0，则表示设备无法使用缓存位置，必须尝试检索实际当前位置。如果设置为无穷大，则设备必须返回缓存位置，而不管其使用年限如何。默认值：0。
  timeout?: number // 表示设备返回位置所允许的最大时间长度（以毫秒为单位）。默认值为无穷大，这意味着getCurrentPosition（）在位置可用之前不会返回。
}
```

### 注意

- `iOS`或部分 `Android` 设备需要当前页面为 `HTTPS` 才被允许获取位置信息
- 可以通过[当前页面](https://sensorbox.glitch.me/)检测设备是否支持获取位置信息

### 参考

- [Geolocation 获取位置](https://developer.mozilla.org/zh-CN/docs/Web/API/Geolocation/getCurrentPosition)
