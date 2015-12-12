title: new build
speaker: 王永青
url: //cms.m.baidu.com/fe
transition: move
theme: moon


[slide class="title-slide"]
# 新构建工具使用和介绍
<small><a href="//cms.m.baidu.com/fe">@三水清</a></small>

[slide]
## 配置文件
-------
复制`common/_build/conf/*`到项目对应

* mydev
* deploy.json
* path/lint-conf.js
* path/fis-conf.js
* common-fis-conf.js
* path/server.conf

[slide]
## make 相关配置：mydev
------

```bash
# 设置文件的机器
dev="work@cq01-wyq.epc"
# 设置接受template的路径
devTplPath="/home/work/odp"
# 设置静态资源的路径
devStaticPath="/home/work/sitedata"
``` 

`make` → `Makefile` (mydev) → `sh build.sh`

[slide]
## fisp 打包相关配置：deploy.json
------
```json
{
    "receiverUrl":"http://cq01-wyq.epc.baidu.com:8300/fis-receiver.php",
    "staticPath": "/home/work/sitedata/",
    "tplPath": "/home/work/orp001/template/pocms/",
    "domain": {
        "**.php": "",
        "**.css": "http://box.bdimg.com",
        "**.js": "",
        "image": "",
        "combo": "/static/cms/"
    },
    "onlineDomain": {}
}
```

[slide]
## fisp 配置文件
------
* `path/fis-conf.js`：对应path的fis-conf
* `common-fis-conf.js`：common的配置

基本不需要太多修改

都是基于`common/_build/fis-conf-base.js`

[slide]
## 本地调试rewrite：`path/server.conf`
-----

```js
rewrite ^\/bdbox\/(.+) /bdbox/$1
rewrite ^\/openjs\/(.+) /openjs/$1
rewrite ^\/json\/(.+) /a.php
```
本地release之后找不到静态文件，就修改下此文件


[slide]
## `make` 命令介绍

[slide]
## `make`

> 远程部署：scp到`mydev`的dev机器的路径，适合fis远程部署

[slide]
## `make local`
> 本地部署：copy到devTplPath，适合开发机和fis再同台机子


[slide]
## `make remote` 
> 适合pc到开发机远程部署

<p class="fadeIn"><span>等同于：`fisp release -r xx -d remote`</span></p>

[slide]
## `make` 的配置
------
* debug
* lint
* optimize
* domain
* md5
* remote

`make [command] debug=1 lint=1 optimize=0` {:&.fadeIn}

[slide]
## 强调和技巧

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
## <span class="text-warning">map.json</span>
---------
* 实现静态文件依赖管理
* 动态去重，动态分析页面需要的文件
* 建立开发路径和线上地址的映射关系



[slide]
## <span class="text-warning">{%require%}</span> VS <span class="text-warning">require</span>
-------
* `{%require%}`是smarty的扩展实现
* `require`是js的实现
* 是文件的动态的管理
* 都是利用`map.json`去重
* 都可以跨模块调用文件
* {%require%}支持外链去重
* 外链：`{%require name="http://xxxx"%}`



[slide]
## <span class="text-warning">inline</span> VS <span class="text-warning">{%require%}/require</span>
-------
* inline：打包之后就固定了，是静态的文件管理方式
* require/{%require%} 利用map.json实现的动态打包
* 推荐使用require类


[slide]
## `fisp release -r path -d remote -w`
> 技巧：利用watch功能实时release到远程开发机

[slide]
## 技巧：debug
--------
[magic]
```js
var a = 1;
/*<debug>
alert(a);
</debug>*/
var b = a + 2;
```
==========
```js
var a = 1;
alert(a);
var b = a + 2;
```
============
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
## 不要写release之后的地址！
> 强调：违背了静态资源的可维护性！

[slide]
## fis-plus+
--------

* components 
* artTemplate vs baiduTemplate
* localstorage
* modjs vs Bdbox
* {%html%} 改造： rendermode等
* {%require%} 改造：外链去重
* lint 
* debug
* combo + md5Hash














