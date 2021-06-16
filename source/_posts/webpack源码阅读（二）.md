---
title: webpack源码阅读（二）
date: 2021-06-16 19:22:20
tags: [JavaScript, webpack]
---

### webpack Compilation 执行过程

1. 构建 `Compilation` 实例
2. 调用 `compilation.finish` 执行构建
3. 异步调用 `finishModules` 钩子函数
4. 调用 `compilation.seal` 完成构建
5. 构建 `ChunkGraph` 实例，并调用 `ChunkGraph.setChunkGraphForModule(module, chunkGraph)`
6. 同步调用 `seal` 钩子函数
7. 同步调用 `optimizeDependencies` 钩子函数，等待钩子函数执行完毕
8. 同步调用 `afterOptimizeDependencies` 钩子函数
9. 同步调用 `beforeChunks` 钩子函数
10. 构建 `chunk`
11. 同步调用 `afterChunks` 钩子函数
12. 同步调用 `optimize` 钩子函数
13. 同步调用 `optimizeModules` 钩子函数，等待钩子函数执行完毕
14. 同步调用 `afterOptimizeModules` 钩子函数
15. 同步调用 `optimizeChunks` 钩子函数，等待钩子函数执行完毕
16. 同步调用 `afterOptimizeChunks` 钩子函数
17. 异步调用 `optimizeTree` 钩子函数
18. 同步调用 `afterOptimizeTree` 钩子函数
19. 异步调用 `optimizeChunkModules` 钩子函数
20. 同步调用 `afterOptimizeChunkModules` 钩子函数
21. 同步调用 `shouldRecord` 钩子函数
22. 同步调用 `reviveModules` 钩子函数
23. 同步调用 `beforeModuleIds` 钩子函数
24. 同步调用 `moduleIds` 钩子函数
25. 同步调用 `optimizeModuleIds` 钩子函数
26. 同步调用 `afterOptimizeModuleIds` 钩子函数
27. 同步调用 `reviveChunks` 钩子函数
28. 同步调用 `beforeChunkIds` 钩子函数
29. 同步调用 `chunkIds` 钩子函数
30. 同步调用 `optimizeChunkIds` 钩子函数
31. 同步调用 `afterOptimizeChunkIds` 钩子函数
32. 若 `shouldRecord` 钩子函数为正，则同步调用 `recordModules` 钩子函数
33. 若 `shouldRecord` 钩子函数为正，则同步调用 `recordChunks` 钩子函数
34. 同步调用 `optimizeCodeGeneration` 钩子函数
35. 同步调用 `beforeModuleHash` 钩子函数
36. 同步调用 `afterModuleHash` 钩子函数
