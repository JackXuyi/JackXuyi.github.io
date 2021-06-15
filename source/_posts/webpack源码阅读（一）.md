---
title: webpack源码阅读（一）
date: 2021-06-15 12:52:53
tags: [JavaScript, webpack]
---

### webpack

1. 获取默认基础参数
2. 构建 `Compiler` 实例
3. 通过插件 `NodeEnvironmentPlugin` 插入日志输出，构建缓存，监听文件变化，监听 `NodeEnvironmentPlugin` 事件
4. 注入自定义的插件
5. 设置默认配置
6. 执行 `environment` 绑定的事件
7. 注入预设的插件系统
8. 执行 `initialize` 绑定的事件
9. 执行 run ，开始构建

```ts
// file: lib/webpack.js
const webpack = /** @type {WebpackFunctionSingle & WebpackFunctionMulti} */ (
  options,
  callback,
) => {
  const create = () => {
    let compiler
    let watch = false
    /** @type {WatchOptions|WatchOptions[]} */
    let watchOptions
    if (Array.isArray(options)) {
      // 多个 compiler
    } else {
      /** @type {Compiler} */
      compiler = createCompiler(options)
      // watch 配置
    }
    return { compiler, watch, watchOptions }
  }

  const { compiler, watch, watchOptions } = create()
  // 执行 run ，开始构建
  compiler.run((err, stats) => {
    compiler.close((err2) => {
      callback(err || err2, stats)
    })
  })
  return compiler
}

const createCompiler = (rawOptions) => {
  const options = getNormalizedWebpackOptions(rawOptions)
  applyWebpackOptionsBaseDefaults(options) // 构建默认基础选项
  const compiler = new Compiler(options.context) // 构建 compiler 实例
  compiler.options = options
  new NodeEnvironmentPlugin({
    infrastructureLogging: options.infrastructureLogging,
  }).apply(compiler) // 插入日志输出，构建缓存系统，监听文件变化，监听 NodeEnvironmentPlugin 事件
  // 注入插件
  if (Array.isArray(options.plugins)) {
    for (const plugin of options.plugins) {
      if (typeof plugin === 'function') {
        plugin.call(compiler, compiler)
      } else {
        plugin.apply(compiler)
      }
    }
  }
  applyWebpackOptionsDefaults(options) // 设置默认配置
  compiler.hooks.environment.call() // 执行 environment 绑定的事件
  compiler.hooks.afterEnvironment.call() // 执行 afterEnvironment 绑定的事件
  new WebpackOptionsApply().process(options, compiler) // 注入预设的插件系统
  compiler.hooks.initialize.call() // 执行 initialize 绑定的事件
  return compiler
}
```
