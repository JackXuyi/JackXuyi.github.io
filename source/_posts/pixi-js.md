---
title: pixi.js
date: 2022-11-27 19:20:55
tags: [JavaScript]
---

Pixi 是一个非常快的 2D sprite 渲染引擎。

### 特点

- 速度快：在 2D 渲染方面，PixiJS 是最快的。
- 灵活：友好的、功能丰富的 API 让 PixiJS 轻松处理基本问题，同时您可以专注于生成令人难以置信跨平台体验。
- 免费： PixiJS 永久开源，并拥有庞大的支持社区推动它的发展和演变。

### 安装

通过 `npm` 安装最新的 6.5.8 版本，7.x 版本暂时还有一些问题，建议使用 6.x 版本

```bash
npm i pixi.js@6.5.8
```

### 使用

1. 创建应用，并把应用挂载到 dom 中

```ts
import PIXI, { Application, Sprite } from 'pixi.js'

const app = new Application({
  width: 500,
  height: 500,
  antialias: true, // default: false 反锯齿
  resolution: 1, // default: 1 分辨率
})
root.appendChild(app.view as any)
```

2. 加载资源并把资源放在画布的中间

```ts
app.loader.add('bunny', logo).load((loader, resources) => {
  // This creates a texture from a 'bunny.png' image.
  const bunny = new Sprite(resources.bunny.texture)

  // Setup the position of the bunny
  bunny.x = app.renderer.width / 2
  bunny.y = app.renderer.height / 2

  // Rotate around the center
  bunny.anchor.x = 0.5
  bunny.anchor.y = 0.5

  // Add the bunny to the scene we are building.
  app.stage.addChild(bunny)
})
```

3. 让图片运动起来

```ts
// Listen for frame updates
app.ticker.add(() => {
  // each frame we spin the bunny around a bit
  // console.log('bunny.anchor.x', bunny.anchor)
  if (bunny.x >= app.renderer.width) {
    bunny.x = 0
  } else {
    bunny.x += 1
  }
})
```

### 示例图片

![示例图片](/images/2d/demo.jpg)

### 参考

[ Pixi.js 中文网](http://pixijs.huashengweilai.com/)
