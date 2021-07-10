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
37. 同步调用 `beforeCodeGeneration` 钩子函数
38. 调用 `codeGeneration` 生成代码
39. 同步调用 `afterCodeGeneration` 钩子函数
40. 同步调用 `beforeRuntimeRequirements` 钩子函数
41. 提取 `modules` 中的 `runtime`，对于每个 `module` 的 `runtime` 都同步调用 `additionalModuleRuntimeRequirements` 钩子函数
42. 若存在对应的 `runtimeRequirementInModule` 钩子函数，则同步调用该钩子函数
43. 对每个 `chunk` 同步调用 `additionalChunkRuntimeRequirements` 钩子函数
44. 对每个 `chunk` 中依赖的 `runtime` 调用 `runtimeRequirementInChunk` 钩子函数
45. 构建含有重复依赖的依赖树
46. 每个入口文件的依赖进行扁平化处理，去掉重复依赖，然后同步调用 `additionalTreeRuntimeRequirements` 钩子函数
47. 每个入口文件的依赖一次调用 `runtimeRequirementInTree` 钩子函数
48. 同步调用 `afterRuntimeRequirements` 钩子函数
49. 同步调用 `beforeHash` 钩子函数
50. 同步调用 `updateHash` 钩子函数
51. 若为非 `fullHashModules` 是同步调用 `contentHash` 钩子函数
52. 同步调用 `fullHash` 钩子函数
53. 对每个 `chunk` 同步调用 `fullHash` 钩子函数
54. 同步调用 `afterHash` 钩子函数
55. 若需要记录则同步调用 `shouldRecord` 钩子函数
56. 清理 `chunk` 记录的文件
57. 同步调用 `beforeModuleAssets` 钩子函数
58. 针对 `module` 的每一个需要输出的资源同步调用 `moduleAsset` 钩子函数
59. 同步调用 `shouldGenerateChunkAssets` 判断是否需要输出资源
60. 输出资源前同步调用 `beforeChunkAssets` 钩子函数
61. 针对每个 `chunk` 构建一个 `manifest` 文件
62. 为每个 `chunk` 写入包含的资源
63. 同步调用 `chunkAsset` 钩子函数
64. 异步调用 `processAssets` 钩子函数
65. 同步调用 `afterProcessAssets` 钩子函数
66. 构建依赖
67. 若需要记录则同步调用 `record` 钩子函数
68. 同步调用 `needAdditionalSeal` 钩子函数，判读是否需要新增
69. 异步调用 `afterSeal` 钩子函数
70. 回调

#### `Module`

```js
{
  /** @type {string} */
		type: type,
		/** @type {string} */
		context: context,
		/** @type {boolean} */
		needId: true,

		// Unique Id
		/** @type {number} */
		debugId:  debugId++,

		// Info from Factory
		/** @type {ResolveOptions} */
		resolveOptions: EMPTY_RESOLVE_OPTIONS,
		/** @type {object | undefined} */
		factoryMeta: undefined,
		// TODO refactor this -> options object filled from Factory
		// TODO webpack 6: use an enum
		/** @type {boolean} */
		useSourceMap: false,
		/** @type {boolean} */
		useSimpleSourceMap: false,

		// Info from Build
		/** @type {WebpackError[] | undefined} */
		_warnings: undefined,
		/** @type {WebpackError[] | undefined} */
		_errors: undefined,
		/** @type {BuildMeta} */
		buildMeta: undefined,
		/** @type {object} */
		buildInfo: undefined,
		/** @type {Dependency[] | undefined} */
		presentationalDependencies: undefined,
}
```

#### `chunk` 具有的属性

```js
{
  /** @type {number | string | null} */
  id: null,
  /** @type {(number|string)[] | null} */
  ids: null,
  /** @type {number} */
  debugId: debugId++,
  /** @type {string} */
  name: name,
  /** @type {SortableSet<string>} */
  idNameHints: new SortableSet(),
  /** @type {boolean} */
  preventIntegration: false,
  /** @type {(string | function(PathData, AssetInfo=): string)?} */
  filenameTemplate: undefined,
  /** @private @type {SortableSet<ChunkGroup>} */
  _groups: new SortableSet(undefined, compareChunkGroupsByIndex),
  /** @type {RuntimeSpec} */
  runtime: undefined,
  /** @type {Set<string>} */
  files: new ChunkFilesSet(),
  /** @type {Set<string>} */
  auxiliaryFiles: new Set(),
  /** @type {boolean} */
  rendered: false,
  /** @type {string=} */
  hash: undefined,
  /** @type {Record<string, string>} */
  contentHash: Object.create(null),
  /** @type {string=} */
  renderedHash: undefined,
  /** @type {string=} */
  chunkReason: undefined,
  /** @type {boolean} */
  extraAsync: false,
}
```

#### `ChunkGraph` 具有的属性

```js
{
 /** @private @type {WeakMap<Module, ChunkGraphModule>} */
		_modules: new WeakMap(),
		/** @private @type {WeakMap<Chunk, ChunkGraphChunk>} */
		_chunks:  new WeakMap(),
		/** @private @type {WeakMap<AsyncDependenciesBlock, ChunkGroup>} */
		_blockChunkGroups: new WeakMap(),
		/** @private @type {Map<string, string | number>} */
		_runtimeIds: new Map(),
		/** @type {ModuleGraph} */
		moduleGraph: moduleGraph;
}
```

#### 备注

1. 对于一份同逻辑的代码，当我们手写下一个一个的文件，它们无论是 `ESM` 还是 `commonJS` 或是 `AMD`，他们都是 `module`
2. 当我们写的 `module` 源文件传到 `webpack` 进行打包时，`webpack` 会根据文件引用关系生成 `chunk` 文件，`webpack` 会对这个 `chunk` 文件进行一些操作；
3. `webpack` 处理好 `chunk` 文件后，最后会输出 `bundle` 文件，这个 `bundle` 文件包含了经过加载和编译的最终源文件，所以它可以直接在浏览器中运行。
