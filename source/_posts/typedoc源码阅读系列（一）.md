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

````ts
export class Application extends ChildableComponent<
  Application,
  AbstractComponent<Application>
> {
  /**
   * The converter used to create the declaration reflections.
   */
  converter: Converter;

  /**
   * The renderer used to generate the documentation output.
   */
  renderer: Renderer;

  /**
   * The serializer used to generate JSON output.
   */
  serializer: Serializer;

  // 其它属性

  /**
   * Create a new TypeDoc application instance.
   *
   * @param options An object containing the options that should be used.
   */
  constructor() {
    super(DUMMY_APPLICATION_OWNER);

    this.logger = new ConsoleLogger();
    this.options = new Options(this.logger);
    this.options.addDefaultDeclarations();
    this.serializer = new Serializer();
    this.converter = this.addComponent<Converter>("converter", Converter);
    this.renderer = this.addComponent<Renderer>("renderer", Renderer);
    this.plugins = this.addComponent("plugins", PluginHost);
  }

  /**
   * Initialize TypeDoc with the given options object.
   *
   * @param options  The desired options to set.
   */
  bootstrap(
    options: Partial<TypeDocAndTSOptions> = {}
  ): { hasErrors: boolean; inputFiles: string[] } {
    // 日志相关配置

    this.plugins.load();

    this.options.reset();
    this.options.setValues(options).mapErr((errors) => {
      for (const error of errors) {
        this.logger.error(error.message);
      }
    });
    this.options.read(this.logger);

    return {
      hasErrors: this.logger.hasErrors(),
      inputFiles: this.inputFiles,
    };
  }

  /**
   * Run the converter for the given set of files and return the generated reflections.
   *
   * @param src  A list of source that should be compiled and converted.
   * @returns An instance of ProjectReflection on success, undefined otherwise.
   */
  public convert(src: string[]): ProjectReflection | undefined {
    const result = this.converter.convert(src);
    // 其它代码
    return result.project;
  }

  /**
   * Run the documentation generator for the given set of files.
   *
   * @param out  The path the documentation should be written to.
   * @returns TRUE if the documentation could be generated successfully, otherwise FALSE.
   */
  public generateDocs(
    input: ProjectReflection | string[],
    out: string
  ): boolean {
    const project =
      input instanceof ProjectReflection ? input : this.convert(input);

    out = Path.resolve(out);
    this.renderer.render(project, out);
  }

  /**
   * Run the converter for the given set of files and write the reflections to a json file.
   *
   * @param out  The path and file name of the target file.
   * @returns TRUE if the json file could be written successfully, otherwise FALSE.
   */
  public generateJson(
    input: ProjectReflection | string[],
    out: string
  ): boolean {
    const project =
      input instanceof ProjectReflection ? input : this.convert(input);
    if (!project) {
      return false;
    }

    out = Path.resolve(out);
    const eventData = {
      outputDirectory: Path.dirname(out),
      outputFile: Path.basename(out),
    };
    const ser = this.serializer.projectToObject(project, {
      begin: eventData,
      end: eventData,
    });
    writeFile(out, JSON.stringify(ser, null, "\t"), false);

    return true;
  }

  /**
   * Expand a list of input files.
   *
   * Searches for directories in the input files list and replaces them with a
   * listing of all TypeScript files within them. One may use the ```--exclude``` option
   * to filter out files with a pattern.
   *
   * @param inputFiles  The list of files that should be expanded.
   * @returns  The list of input files with expanded directories.
   */
  public expandInputFiles(inputFiles: string[] = []): string[] {
    const files: string[] = [];

    const exclude = this.exclude ? createMinimatch(this.exclude) : [];

    function isExcluded(fileName: string): boolean {
      return exclude.some((mm) => mm.match(fileName));
    }

    const supportedFileRegex = this.options.getCompilerOptions().allowJs
      ? /\.[tj]sx?$/
      : /\.tsx?$/;
    function add(file: string, entryPoint: boolean) {
      let stats: FS.Stats;
      try {
        stats = FS.statSync(file);
      } catch {
        // No permission or a symbolic link, do not resolve.
        return;
      }
      const fileIsDir = stats.isDirectory();
      if (fileIsDir && !file.endsWith("/")) {
        file = `${file}/`;
      }

      if ((!fileIsDir || !entryPoint) && isExcluded(file.replace(/\\/g, "/"))) {
        return;
      }

      if (fileIsDir) {
        FS.readdirSync(file).forEach((next) => {
          add(Path.join(file, next), false);
        });
      } else if (supportedFileRegex.test(file)) {
        files.push(file);
      }
    }

    inputFiles.forEach((file) => {
      add(Path.resolve(file), true);
    });

    return files;
  }
}
````

通过上面代码的分析可以梳理出调用流程

1. 类初始化时，依次注入 `serializer`、`converter`、`renderer`、`plugins`等属性。`serializer` 序列化输入数据成 `JSON` 格式；`converter` 创建映射对象；`renderer` 主要是控制文档数据的输出；`plugins` 数据转化过程中执行的一系列插件，主要是对映射对象进行操作。
2. `bootstrap` 是整个流程的调用入口，主要用途是加载插件和重置参数，返回一个包含错误信息和输入文件列表的对象
3. `convert` 函数主要作用就是调用 `converter` 属性中的 `convert` 创建映射对象并返回映射对象
4. `generateDocs` 生成文档文件
5. `generateJson` 生成 `JSON` 文件
6. `expandInputFiles` 过滤输入的文件，返回需要转化的全部文件完整列表

### 待完成

`serializer`、`converter`、`renderer`、`plugins` 等对象实现细节解析
