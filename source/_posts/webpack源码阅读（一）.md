---
title: webpack源码阅读（一）
date: 2021-06-15 12:52:53
tags: [JavaScript, webpack]
---

### webpack compile 执行过程

1. 获取默认基础参数
2. 构建 `Compiler` 实例
3. 通过插件 `NodeEnvironmentPlugin` 插入日志输出，构建缓存，监听文件变化，监听 `NodeEnvironmentPlugin` 事件
4. 注入自定义的插件
5. 设置默认配置
6. 同步执行 `environment` 钩子函数
7. 同步执行 `afterEnvironment` 钩子函数
8. 注入预设的插件系统
9. 同步执行 `initialize` 钩子函数
10. 执行 `run` ，开始构建

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

#### `run` 执行过程

1. 异步调用 `beforeRun` 钩子函数
2. 异步调用 `run` 钩子函数
3. 异步读取构建记录
4. 实例化 `NormalModuleFactory` 对象，同步调用 `NormalModuleFactory` 钩子函数
5. 实例化 `ContextModuleFactory` 对象，同步调用 `ContextModuleFactory` 钩子函数
6. 构建 `Compilation` 需要的实例参数
7. 异步调用 `beforeCompile` 钩子函数
8. 同步调用 `compile` 钩子函数
9. 构建 `Compilation` 实例
10. 注入 `name` 和 `records` 属性
11. 同步调用 `thisCompilation` 钩子函数
12. 同步调用 `compilation` 钩子函数
13. 异步调用 `make` 钩子函数
14. 异步调用 `finishMake` 钩子函数
15. 在 `nextTick` 中依次调用 `compilation.finish` 和 `compilation.seal`
16. 异步调用 `afterCompile` 钩子函数
17. 同步调用 `shouldEmit` 钩子判断是否需要输出资源
18. 输出资源文件，异步调用 `emit` 钩子函数
19. 同步调用 `needAdditionalPass` 钩子函数
20. 把构建记录 `records` 写入文件
21. 异步调用 `done` 钩子函数
22. 回调 `callback` 完成构建
23. 同步调用 `afterDone` 钩子函数

```js
// file: lib/Compiler.js
class Compiler {
  run(callback) {
    const finalCallback = (err, stats) => {
      this.idle = true
      this.cache.beginIdle()
      this.idle = true
      this.running = false
      // 回调，然后调用 afterDone 钩子函数，结束构建
      if (callback !== undefined) callback(err, stats)
      this.hooks.afterDone.call(stats)
    }

    const startTime = Date.now()
    this.running = true

    const onCompiled = (err, compilation) => {
      // 不需要输出资源直接结束此次构建
      if (this.hooks.shouldEmit.call(compilation) === false) {
        compilation.startTime = startTime
        compilation.endTime = Date.now()
        const stats = new Stats(compilation)
        this.hooks.done.callAsync(stats, (err) => {
          return finalCallback(null, stats)
        })
        return
      }

      process.nextTick(() => {
        this.emitAssets(compilation, (err) => {
          // 判断是否需要新增资源，如果需要新增则结束此次编译流程，然后重新启动一个新的编译流程
          if (compilation.hooks.needAdditionalPass.call()) {
            compilation.needAdditionalPass = true
            compilation.startTime = startTime
            compilation.endTime = Date.now()
            const stats = new Stats(compilation)
            this.hooks.done.callAsync(stats, (err) => {
              this.hooks.additionalPass.callAsync((err) => {
                this.compile(onCompiled)
              })
            })
            return
          }

          // 输出构建的记录，结束编译流程
          this.emitRecords((err) => {
            compilation.startTime = startTime
            compilation.endTime = Date.now()
            const stats = new Stats(compilation)
            this.hooks.done.callAsync(stats, (err) => {
              this.cache.storeBuildDependencies(
                compilation.buildDependencies,
                (err) => {
                  return finalCallback(null, stats)
                },
              )
            })
          })
        })
      })
    }

    const run = () => {
      this.hooks.beforeRun.callAsync(this, (err) => {
        this.hooks.run.callAsync(this, (err) => {
          // 读取编译记录
          this.readRecords((err) => {
            // 开始执行编译
            this.compile(onCompiled)
          })
        })
      })
    }
    run() // 开始执行编译进程
  }

  compile(callback) {
    const params = this.newCompilationParams() // 构建 Compilation 参数
    this.hooks.beforeCompile.callAsync(params, (err) => {
      this.hooks.compile.call(params)
      const compilation = this.newCompilation(params) // 构建 Compilation 实例，开始一次编译
      this.hooks.make.callAsync(compilation, (err) => {
        this.hooks.finishMake.callAsync(compilation, (err) => {
          process.nextTick(() => {
            // 执行 Compilation 内的钩子
            compilation.finish((err) => {
              compilation.seal((err) => {
                // 一次编译完成
                this.hooks.afterCompile.callAsync(compilation, (err) => {
                  return callback(null, compilation)
                })
              })
            })
          })
        })
      })
    })
  }
}
```

#### 代码执行流程图

![webpack compile 代码执行流程](/images/webpack-compile.png)
