---
title: typedoc源码阅读系列（一）
date: 2020-04-19 23:09:21
tags: javascript
---

## 了解 typedoc

TypeDoc 是一款支持 TypeScript 的文档生成工具。

[查看源码](https://github.com/TypeStrong/typedoc)

[查看文档](https://typedoc.org/api/index.html)

## typedoc 运行流程

### 入口

查看 `package.json` 代码

```json
{
    ...
    "bin": {
        "typedoc": "bin/typedoc"
    }
    ...
}

```

执行了 `bin/typedoc` 这个文件

```js
#!/usr/bin/env node

const td = require("../dist/lib/cli.js");
const app = new td.CliApplication();
app.bootstrap();
```

通过引入 `../dist/lib/cli.js` ，实例化了 `CliApplication` 对象，经过分析发现，这个文件的源文件是 `src/lib/cli.ts`

```ts
import { Application } from "./application";
import { BindOption } from "./utils/options";
import { TypeDocAndTSOptions } from "./utils/options/declaration";

export const enum ExitCode {
  OptionError = 1,
  NoInputFiles = 2,
  NoOutput = 3,
  CompileError = 4,
  OutputError = 5,
}

export class CliApplication extends Application {
  @BindOption("out")
  out!: string;

  @BindOption("json")
  json!: string;

  @BindOption("version")
  version!: boolean;

  @BindOption("help")
  help!: boolean;

  /**
   * Run TypeDoc from the command line.
   */
  bootstrap(options?: Partial<TypeDocAndTSOptions>) {
    // 其它代码
    const result = super.bootstrap(options);
    // 其它代码
    const src = this.expandInputFiles(result.inputFiles);
    const project = this.convert(src);
    if (project) {
      if (this.out) {
        this.generateDocs(project, this.out);
      }
      if (this.json) {
        this.generateJson(project, this.json);
      }
      if (!this.out && !this.json) {
        this.generateDocs(project, "./docs");
      }
    }
    // 其它代码
    return result;
  }
}
```

`CliApplication` 继承了 `Application` 对象，并且新增了 `out`、`json`、`version`、`help`等属性，实现了 `bootstrap`方法。

### CliApplication 分析

#### `bootstrap`的实现

- 调用父组件的 `bootstrap` 获取结果
- 调用 `expandInputFiles` 获取输入的文件
- 调用 `convert` 逐个转化需要转化的源文件，得到 `project` 对象
- 调用 `generateDocs` 生成对应的输出文件

##### 注：`expandInputFiles`、`convert`、`generateDocs`通过继承的方式源自父类

### 父类 `Application`
