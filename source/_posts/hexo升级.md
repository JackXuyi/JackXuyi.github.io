---
title: hexo升级
date: 2024-09-19 21:10:11
tags: [other]
---

## 检查版本

- [检查 `hexo` 目标版本的 `node` 版本依赖](https://hexo.io/zh-cn/docs/)
- 检查 `node` 版本是否符合要求
  ```bash
  node  -v
  ```
- [升级 `node` 版本](https://nodejs.org/zh-cn/download/package-manager)

## hexo 升级

以 `yarn` 为例

1. 检查 hexo 版本

```bash
npx hexo -v
```

2. 执行升级命令更新到最新版本

```bash
yarn upgrade --latest
```

## 参考

- [yarn upgrade](https://classic.yarnpkg.cn/docs/cli/upgrade/)
