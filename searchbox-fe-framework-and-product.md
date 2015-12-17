title: 手机百度前端架构和产品介绍
speaker: 三水清
url: https://js8.in
transition: slide
files: /assets/main/css/timeline.css,/assets/main/js/timeline.js,/assets/searchbox-fe-framework-and-product/main.js
date: 2015年12月20日

[slide]
# 手百前端架构和产品介绍

[slide]

# 先介绍下我们团队和工作

[slide]
[magic data-transition="earthquake"]
## 三大垂类
-----
<div class="columns3">
    <img src="/assets/searchbox-fe-framework-and-product/Snip20151209_11.png" height="450">
    <img src="/assets/searchbox-fe-framework-and-product/Snip20151209_10.png" height="450">
    <img src="/assets/searchbox-fe-framework-and-product/Snip20151209_12.png" height="450">
</div>
====
## 手百账号&搜索增强
-----
<div class="columns4">
    <img src="/assets/searchbox-fe-framework-and-product/Snip20151209_13.png" height="320">
    <img src="/assets/searchbox-fe-framework-and-product/1.pic.jpg" height="320">
    <img src="/assets/searchbox-fe-framework-and-product/Snip20151209_15.png" height="320">
    <img src="/assets/searchbox-fe-framework-and-product/Snip20151209_16.png" height="320">
</div>
====
## 运营支撑
----
<div class="columns2">
    <img src="/assets/searchbox-fe-framework-and-product/tiny-life.jpg" height="350" />
    <img src="/assets/searchbox-fe-framework-and-product/Snip20151211_37.png" height="350" />
</div>
[/magic]

[slide]
# 发展历程

[slide data-on-enter="showTimeline" data-on-build="nextTimeline"]
<div id="timeline">
    
</div>

[slide]
## 目录
----
* 基础建设
* 工程化建设
* 平台化产品建设
* 2016规划



[slide]
## 基础库
----
* Bdbox：前端模块化库，[文档](http://cms.m.baidu.com/fe/bdbox/)
    * openjs
    * aladinjs(uiamd)
    * seed
* bsass：sass库
    - css3
    - animation
    - icon fonts

[slide]
## Bdbox模块
----
| 说明 | 包含模块
:----------:|------|-------
端能力   | 跟客户端相关 | ios，android，apad，invoke，moplus，lbs等
通用&方案 | 通信、事件、跨域、SPA | io，event，app，xDomain，Deffered等 {:.highlight}
工具     | 粒度小，用途广泛 | cookie，detect，dateFormat等
性能&监控| 用户行为统计、速度监控和错误收集 | monitor，S，cache（ls/接口/静态资源）
交互     | 页面交互相关，zepto扩展 | Dialog，mask，swipe，fastclick
运营     | 抽奖游戏，pv和行为统计，跨域通信，游戏类 | 刮刮乐，摇一摇，跑马灯，游戏舞台/精灵/对象池/easing

18个大类，60+个模块，覆盖手机百度所有应用场景，灵活的core设计，方便切换

[slide]
## 移动适配切图方案
---
* 页面head引入`flexible.js` ，计算rem初始值
* 布局使用bsass提供的<span class="red">rem</span>
* 字体使用bsass提供的<span class="red">fontsize</span>

[slide]
<h1 class="red">切图过程</h1>
<ul class="yellow bounceIn">
    <li><span class="red">$rem-baseline</span> = 视觉稿宽度/10px</li>
    <li><span class="red">$font-baseline</span> = 12px</li>
    <li>根据标注<b class="blue">原比例</b>切图</li>
</ul>

[slide]
## 代码举例
----

```sass
@import 'bsass/base';
$rem-baseline: 64px; //设置baseline
$font-baseline: 12px; //设置字体初始值
//原值切图
.demo{
    @include rem(padding, 20px 30px);
    @include rem(height, 200px);
    //文字需要提前除以dpr
    @include fontsize(24px);
}
```


[slide]
## 前端组件化
------

![](/assets/searchbox-fe-framework-and-product/video-comp.png)

[slide]
## 前端组件化
------
* 前端模板采用artTemplate
* 模板被构建工具预编译成js文件
* js/tmpl/css三者相互依赖

[slide]
## <span class="text-warning">widget</span> VS <span class="text-warning">components</span>
------

 |widget| components
:-------|:------:|--------
实现 | smarty模板的组件 | js模板的组件
组成 | tpl、js、css | tmpl、js、css<br>artTemplate模板
路径 | widget/* | components/*
规范 | module/module.* | module/module.*
使用 | `ns:widget/module/module.tpl`<br/>{%widget name=""%} | `namespace:c_xxx/xxx`<br/>{%require name=""%}<br/>require('')


[slide]
## 单页APP：基于事件总线设计
----

* HTML代码规划，controller划分
* 确定router规则
* 编写各自view的前端组件代码
* 配置controller
* 使用Bdbox.app粘合

[slide]
## 写代码更像写配置
```js
var detail = Bdbox.app.controller({
    name: 'detail',
    router: /^detail\/(\d+)$/,
    apis: [{
        name: 'loadmore',
        url: './loadmore.json'
        type: 'get',//缺省是get
        //接口存储器所需参数
        store:{
            expire: 30e3, //缓存30s
            type: 'session'//或者local
        }
    }],
    root: '#pl-con-detail',
    //无参数
    init: function(){},
    before: function(view, query, pathname){},
    //match是根据router正则匹配的match对象
    main: function(view, query, pathname, match){},
    after: function(view, query, pathname){}
});
```


[slide]
# 工程化建设

[slide]
## FIS-Plus+
### 基于fisp做了很多fis改动和插件
----

* components-pack
* parser-tmpl
* template-wrapper
* preprocessor-gethash
* code-checker
* linsl
* debug
* json2php

[slide]
## 静态资源管理
### 基于fis的map.json做了扩展
----
* content：文件内容 {:&.rollIn}
* hash：文件md5版本号
* rUri：文件release路径
* uri：带domain的地址
* uUri：没有压缩的代码地址
* Smarty扩展`FISResource`
* Smarty扩展`FISLocalstorage`

[slide]
## 渲染模式
----

<div class="columns5 rollIn">
    <div class="label-primary"><del>inline</del></div>
    <div class="label-info">tag</div>
    <div class="label-success">combo</div>
    <div class="label-danger">seed</div>
    <div class="label-warning">unpack</div>
</div>


[slide]
[magic data-transition="move"]

## 渲染模式
---
<pre><code class="smarty">{%html framework=&quot;common:bdbox&quot; rendermode=&quot;<b>inline|tag|combo</b>&quot;%}
</code></pre>

====

## tag模式
### 线下开发调试环境，适合debug
----
![tag模式](/assets/box-fe-road/img/tag-mode.png)

=====

## combo模式
### 线上环境，适合3G+网络
----
![combo模式](/assets/searchbox-fe-framework-and-product/combo.png)
[/magic]

[slide]
# build工具
### 打通开发、联调、部署、上线全部流程

[slide]
[magic]
# <b class="red">make</b> [command] [args]
====
## make [<b class="red">command</b>] [args]
----
* dev
* local
* prod
* remote

=====
## make [command] [<b class="red">args</b>]
----
* --debug
* --lint
* --optimize
* --domain
* --md5

[/magic]

[slide]
## Debug

[slide]
[magic data-transition="cover-circle"]
## 手百chrome扩展：popup页面
----
![](/assets/searchbox-fe-framework-and-product/Snip20151209_24.png)

====
## 手百chrome扩展：webview调试
----
![](/assets/searchbox-fe-framework-and-product/chrome-2.png)

====
## 手百chrome扩展：本地调试
----
![](/assets/searchbox-fe-framework-and-product/Snip20151212_3.png)

[/magic]

[slide]

[magic data-transition="zoomin"]
## js debug注释
--------
```js
var a = 1;
/*<debug>
alert(a);
</debug>*/
var b = a + 2;
```
==========
## js debug 编译后
--------
```js
var a = 1;
alert(a);
var b = a + 2;
```
==========
## 页面 debug 注释
--------
```html
<!DOCTYPE html>
<html>
<head>
    <title>debug</title>
</head>
<body>
    <!--<debug> <h1>这里debug内容</h1> </debug>-->
</body>
</html>
```
========
## 页面 debug 编译后
--------
```html
<!DOCTYPE html>
<html>
<head>
    <title>debug</title>
</head>
<body>
    <h1>这里debug内容</h1>
</body>
</html>
```
[/magic]

[slide]
# 文档积累和沉淀

[slide]
[magic data-transition="vertical3d"]
## Bdbox文档
----
![](/assets/searchbox-fe-framework-and-product/Snip20151212_6.png)


====
## 文档平台
----
![](/assets/searchbox-fe-framework-and-product/Snip20151212_5.png)


[/magic]

[slide]
# 平台建设
<div class="columns3">
    <div class="label-danger">组件API</div>
    <div class="label-danger">Tiny平台</div>
    <div class="label-danger">Stalker监控</div>
</div>


[slide]
# 运营开放组件平台：运营接口API化

[slide]
## 河图无障碍P4级平台服务
----

![](/assets/searchbox-fe-framework-and-product/Snip20151211_35.png)

[河图平台连接](http://hetu.baidu.com/api/platform/index?platformId=978)

[slide]
[magic data-transition="vertical3d"]
## CMS
----
![](/assets/searchbox-fe-framework-and-product/Snip20151212_4.png)

====
## API测试平台
---
![](/assets/searchbox-fe-framework-and-product/Snip20151212_7.png)

====
## 文档平台
----
![](/assets/searchbox-fe-framework-and-product/Snip20151212_8.png)

[/magic]

[slide]
# Tiny平台：运营活动快速搭建UI平台

[slide]
[magic]
## 生活服务类
----
![](/assets/searchbox-fe-framework-and-product/tiny-life.jpg)

====
## 评论&运营
----
![](/assets/searchbox-fe-framework-and-product/tiny-act.jpg)
====
## 电视合作/日常/时效/专题
----
![](/assets/searchbox-fe-framework-and-product/tiny-daily.jpg)

[/magic]

[slide]
# Stalker监控

[slide]
[magic data-transition="cover-circle"]
## 首页
----
![](/assets/searchbox-fe-framework-and-product/Snip20151212_9.png)

====
## PM2监控
----
![PM2监控](/img/stalker/2015-03-13_100320.png)

====
## 设备数据监控
----
![设备数据监控](/assets/searchbox-fe-framework-and-product/stalker-1.png)

====
## 劫持数据监控
----
![劫持数据监控](/assets/searchbox-fe-framework-and-product/stalker-2.png)

====
## 架构流程
----
<iframe data-src="/assets/searchbox-fe-framework-and-product/stalker.pdf" src="about:blank;"></iframe>
[/magic]


[slide]
# 2016规划

[slide]

* nodejs：基于yog2，已经有自己的node集群和运维平台 {:&.bounceIn}
* 性能优化：`Bdbox.app`，前端渲染，接口缓存，seed落地
* UI组件化
* stalker v2：增强js报错，进程守候、配置增强
* reactNative：跟着iOS学开发
* 自动化测试
