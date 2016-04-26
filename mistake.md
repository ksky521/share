title: 那些年犯过的错
speaker: 三水清
url: https://js8.in
transition: move
highlightStyle: monokai_sublime
date: 2016年04月21日

[slide]
# 那些年犯过的错

[slide]
## moduleId
----
* `po:js/xxx`
* `po:static/js/xxx.js`

[slide]
* 为了缩短，少些字母
* 不标准：AMD
* 写全：`require('../xxx')`

[slide]
## define 设计错误
-----

```js
function define(id, factory){
  //......
  var ret = $.isFunction(factory) ? factory.apply(mod, [require, mod.exports, mod, $]) : factory;

  if (ret) {
    mod.exports = ret;
  }
  root[lastName] = mod.exports;
}
```

[slide]
## 错误一：$===Bdbox
-----
```js
define('po:js/xxx', function(require, exports, module, $)){
  //$===Bdbox
  //* 不想用zepto，自建一套库
  //* 因为库体积大
  //* 跟一开始做速度优化有关系
}
```

[slide]
## 错误二：Bdbox全局变量
-----

```js
function define(id, factory){
  //......
  if (ret) {
    mod.exports = ret;
  }
  root[lastName] = mod.exports;
}
```

[slide]
```js
var a = require('xxxx');
a();
//错误使用
require('xxx');
Bdbox.xxx()
```

[slide]
## 错误三：factory执行
-----

```js
function define(id, factory){
  //......
  //脱离打包过程，做load依赖管理很难
  var ret = $.isFunction(factory) ? factory.apply(mod, [require, mod.exports, mod, $]) : factory;

  if (ret) {
    mod.exports = ret;
  }
  root[lastName] = mod.exports;
}
```

[slide]
## 正确做法
----
```js
function require(){
  //...
  //写在require，define扫描factory依赖关系
  var ret = $.isFunction(factory) ? factory.apply(mod, [require, mod.exports, mod, $]) : factory;

  if (ret) {
    mod.exports = ret;
  }
}
```

[slide]
* 一开始觉得很妙的点子，也许就让路子越走越窄
* 定规则很重要，很考研能力

[slide]
## 当然我们也做了很多好的实践
----
* 本地调试
* FIS改造
* 渲染模式
* localstorage细粒度缓存
* components

[slide]
## 个人对这两年前端发展看法
----
- 更好的人机交互，用户体验和审美提升
- 开发效率
- 代码组织形式：模块化、Promise、语法糖
- 大型网站架构
- 移动转型
- 催化剂：node
- 推动剂：浏览器（chrome/webkit）

