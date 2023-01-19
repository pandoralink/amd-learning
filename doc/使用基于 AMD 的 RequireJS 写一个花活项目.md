开启掘金成长之旅！这是我参与「掘金日新计划 · 12 月更文挑战」的第23天，[点击查看活动详情](https://juejin.cn/post/7167294154827890702 "https://juejin.cn/post/7167294154827890702")

最近在研究前端模块化，大多数文章都提到了 `AMD`，关于 `AMD` 的模块标准（或者说规范）讲的都很清楚，什么异步加载、保证正确顺序，对付八股很够，但是唯独没有关于 `AMD` 的实操工程，大多数是纸上谈兵，所以经过我的博览群书（其实是翻垃圾桶，十个九个抄）终于找到了在 `AMD` 那个年代的工程和一些简单实现）

# AMD

[AMD(Asynchronous Module Definition)](https://github.com/amdjs/amdjs-api/blob/master/AMD.md) - 异步模块定义，`AMD` 是一个模块规范（或者说标准），它其实是 `CommonJS` 规范的分支，这也就是为什么很多文章里提到 `CommonJS` 时往往会带上 `AMD`

# 定义

使用 `AMD` 规范的模块要求如下

```js
define(id?, dependencies?, factory);
```

1. `id` 是名称
2. `dependencies` 是依赖
3. `factory` 是模块逻辑

以上仅为简述，完整的 `AMD` 介绍请参考[文档](https://github.com/amdjs/amdjs-api/blob/master/AMD.md)

# 实现

规范只是理论而不是实现，像 `CommonJS` 规范就有很多实现，其中最出名的就是 `Node.js`，还有比较经典的理论和实现的例子有 `Promise A+` 规范和一系列的 `Promise` 实现，比如浏览器的 `ES6 Promise` 原生实现、开源实现 [kriskowal/q](https://github.com/kriskowal/q)...，而 `AMD` 的实现就是在 `2009` 年 `2` 月的推出的 `RequireJS`

文章例子就是基于 `RequireJS` 的工程实现

# RequireJS 的使用

_`RequireJS` 源于 `CommonJS` 但后面又从其中独立出去成立了新社区，因此没有和 `CommonJS` 的实现 `Node.js` 及其生态（`npm`）产生**太多联系**，也就是说 `RequireJS` 的项目是不需要 `Node.js` 环境的_

_文章使用的是 `require.js@2.3.6`_

文章实现的是通过 `JS` 传递颜色名称并将对应的十六进制颜色渲染到 `DOM` 中，其中文件结构

```
├── tools             - 构建目录
|  ├── build.js       - 打包配置
|  └── r.js           - RequireJS 打包工具
├── www               - 项目目录
|  ├── app            - 项目代码
|  |  ├── utils.js    - 工具模块
|  |  └── main.js     - 主逻辑
|  ├── lib            - 第三方库
|  |  ├── draw-dom.js
|  |  └── require.js
|  ├── app.js         - 入口文件（包含 require.js 的配置）
|  └── index.html
```

目录结构基于 `RequireJS` 官网给出的文档中的单页应用的例子（`2011` 年就有单页应用的说法了！）

```html
<!-- index.html -->
<head>
  <script data-main="app.js" src="lib/require.js" async></script>
</head>
<body>
  <h1 id="app">amd-learning</h1>
</body>
```

# 入口

入口文件主要是配置 `require.js` 和加载入口函数

```js
// app.js
require.config({
  baseUrl: "lib",
  paths: {
    app: "../app",
  },
});

require(["app/main"]);
```

1. `baseUrl` 用于指定第三方模块的位置，后期在主逻辑中可以直接通过名称调用，比如 `lib` 目录下的 `draw-dom` 模块 `require(draw-dom)`

`baseUrl` 是一个相对路径，和 `Node` 本地 `I/O` 不一样，`baseUrl` 的值要交给运行在浏览器的 `require.js` 去处理，因此本地开发目录中这个值是相对于 `index.html` 的位置，不是相对于 `app.js`

![](https://raw.githubusercontent.com/pandoralink/my-drawing-bed/main/img/202301192323927.png)

2. `paths` 用来指定各个模块的加载路径，路径是相对于 `baseUrl` 的路径或者是一个网址，比如 `CDN` 的链接，`paths` 通常包括源代码和第三方模块

```js
// 其实就是 lib 的上一级目录下的 app 目录
paths: {
  app: "../app",
},
```

_paths 主要是为了避免每次调用都要输入一长串路径_

3. `require([id])` 里面是一个 `id` 数组，`id` 就是模块名称，包含 `paths` 指定路径的、`baseUrl` 目录下对应的 `.js` 文件

它也分入口文件（就是上面目录结构的 `app.js`）和模块内部解析

入口文件解析示例

如 `require(["app/main"])`，其实就是指加载 `app` 目录下的 `main.js` 文件

相关模块 `ID` 内部请求解析示例：

-   如果模块 `"a/b/c"` 请求 `"../d"`，则解析为 `"a/d"`
-   如果模块 `"a/b/c"` 请求 `"./e"`，则解析为 `"a/b/e"`

解析完 `id` 之后，如果是之前没有 `define` 过的（`define` 是 `RequireJS` 提供的另一个 `API`，用于加载模块），就会根据当前 `window.location.href` 加上这个解析后路径去请求文件，并执行，使其加入到浏览器内存建立的模块树中

```
比如 "a/b/c"
如果没有 define 过
且 window.location.href = http://127.0.0.1:5501/www/index.html
则浏览器会请求 http://127.0.0.1:5501/www/index.html/a/b/c
```

内存中的模块树可以通过打印 `window.require.s.contexts._.defined` 查看

_PS: 之所以强调**没有 define 过**，是因为后面的打包部分的 define 是集中在单一 js 文件中完成的，不是像本地开发一个个请求_

# 自定义模块

目录中的 `utils` 就是自定义模块，在主逻辑中可以根据相对路径去引用

```js
// app/main.js
define(function (require) {
  var drawDOM = require("draw-dom");
  var utils = require("./utils");

  drawDOM.draw("app", utils.translate("red"));
});
```

注意，在引用模块时必须使用 `require`，而 `require` 由 `define` 函数的参数传入（这是 `require.js` 的默认模块）

_PS: require("./utils") 应套用**模块 ID 内部请求解析规则**，即模块 "app/main" 请求 "./util", 解析为 "app/util"_

而自定义模块导出可以选择返回一个对象作为导出值

> 如果工厂函数返回一个值（一个对象、函数或任何 Truthy 值），那么该值应该被分配为模块的导出值

如下

```js
// app/utils.js
define(function () {
  return {
    translate: function (name) {
      let color = "";
      switch (name) {
        case "red":
          color = "#FF0000";
          break;
        default:
          color = "#000000";
      }
      return color;
    },
  };
});
```

# 第三方模块

`require.js` 使用的模块需要在模块源码提供处下载，此处放置在 `lib` 目录统一管理，为了便于描述我直接手撸了一个

```js
define("draw-dom", ["exports"], function (exports) {
  exports.draw = function (id, color) {
    document.querySelector(String("#" + id)).style.color = color;
  };
});
```

注意，导出可以使用 `exports` 模块（`exports` 和 `require` 一样都是 `require.js` 的默认模块）

最后例子的运行效果如下

![IMG](https://raw.githubusercontent.com/pandoralink/my-drawing-bed/main/img/202212220203530.png)

请求路径如下

![](https://raw.githubusercontent.com/pandoralink/my-drawing-bed/main/img/202301200033855.png)

# 打包

对于 `AMD` 也是有打包的概念的，在 `AMD` 的实践 `require.js` 出现的同期，`r.js` 就出现了，因为在 `AMD` 制定的那个年代具有请求限制的规定，比如 `Chrome` 最多只能 `8` 个请求并行下载，所以部署时需要将模块打包至单一文件，减少请求次数

![](https://raw.githubusercontent.com/pandoralink/my-drawing-bed/main/img/202301191829738.png)

`r.js` 主要有两个功能

1. 在 Node 和 Nashorn、Rhino 和 xpcshell 中运行基于 AMD 的项目
2. 包括 RequireJS 优化器，它结合了脚本以优化浏览器发版

第二点就是打包的意思，毕竟无论是部署还是第三方模块开发，最终构建的时候还是打包成单一文件比较方便

_关于 r.js 更详细的部分参考[文档](https://requirejs.org/docs/optimization.html)_

在项目根目录执行以下命令

```shell
node tools/r.js -o tools/build.js
```

根目录下会出现和 `www` 目录结构一致的 `dist` 目录，主要有下面两个作用

1. 压缩 `www` 目录下的文件至一行
2. 集成各模块代码到入口文件中

`dist` 的目录结构和 `www` 的目录结构一致，不过里面的所有文件都被压缩成了一行

![](https://raw.githubusercontent.com/pandoralink/my-drawing-bed/main/img/202301200044593.png)

`dist` 里的 `app.js` 包含了整个项目里的模块

```js
// prettier 格式化后
define("draw-dom", ["exports"], function (e) {
  e.draw = function (e, r) {
    document.querySelector(String("#" + e)).style.color = r;
  };
}),
  define("app/utils", [], function () {
    return {
      translate: function (e) {
        var r = "";
        switch (e) {
          case "red":
            r = "#FF0000";
            break;
          default:
            r = "#000000";
        }
        return r;
      },
    };
  }),
  define("app/main", ["require", "draw-dom", "./utils"], function (e) {
    var r = e("draw-dom"),
      a = e("./utils");
    r.draw("app", a.translate("red"));
  }),
  require.config({ baseUrl: "lib", paths: { app: "../app" } }),
  require(["app/main"]),
  define("app", function () {});
```

_因为所有模块都定义过了（define 已经执行），因此 require.config 里的 baseUrl, paths 就没有用处了，它更像是**开发配置而不是生产配置**_

实际部署我们只需要 `app.js`、`require.js`、`index.html`

```
├── lib            - 第三方库
|  └── require.js
├── app.js         - 入口文件（包含 require.js 的配置）
├── index.html
```

此时请求顺序如下

![](https://raw.githubusercontent.com/pandoralink/my-drawing-bed/main/img/202301200048331.png)

## 注意问题

项目中不要出现 ES2015+|ES6+ 的代码，比如 const、let，否则会报错

```
SyntaxError: Unexpected token: XXX

If the source uses ES2015 or later syntax, please pass "optimize: 'none'" to r.js and use an ES2015+ compatible minifier after running r.js. The included UglifyJS only understands ES5 or earlier syntax.
```

# 参考资料

1. [Javascript模块化编程（三）：require.js的用法 - 阮一峰的网络日志](https://www.ruanyifeng.com/blog/2012/11/require_js.html)
2. [《编程时间简史系列》JavaScript 模块化的历史进程](https://segmentfault.com/a/1190000023017398)
3. [AMD(Asynchronous Module Definition)](https://github.com/amdjs/amdjs-api/blob/master/AMD.md)
4. [RequireJS - 入门指南、进阶使用详解（附样例） - hangge](https://www.hangge.com/blog/cache/detail_1702.html)
5. [javaScript 的AMD - 博客园 - rhino](https://www.cnblogs.com/happyPawpaw/archive/2012/05/31/2528864.html)