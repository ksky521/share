title: 手机百度速度优化
speaker: 三水清
url: https://js8.in
transition: pulse
files: /css/theme.moon.css,/js/speed/puff.js
highlightStyle: monokai_sublime

[slide]
# 手机百度速度优化
<small><a href="//weibo.com/sanshuiqing">@三水清</a></small>

[slide]
# 项目背景介绍
------
<p>手机百度hybrid app页面主要分两个模块：搜索和频道+配置</p>
<div class="fade">
    <img src="../img/speed/2.pic.jpg" alt="首页">
    <img src="../img/speed/1.pic.jpg" alt="搜索结果页">
    <img src="../img/speed/3.pic.jpg" alt="频道页面">
    <img src="../img/speed/4.pic.jpg" alt="频道页面">
</div>


[slide data-transition="cover-diamond"]

# 建立监控平台 {:&.flexbox.vleft}

> 摸底数据，数据分析，效果评估


[slide]
## 监控平台
----
* web页面性能监控平台 {:&.moveIn}
    * 收集客户端加载网页和web页面渲染数据 {:&.fadeIn}
* 客户端性能监控平台
    * CI级别的性能监控 {:&.fadeIn}
    * 发版前速度准入，灰度收集速度数据

[slide]
* web监控：更加关注的是**用户真实体验**
* client对关键时间点进行打点
* 页面通过js接口获取客户端性能数据
* web监控采用**js打点**作为参考值

<div class="fade">
    <img src="../img/speed/camera.jpg" alt="">
</div>

[note]

什么是真实的用户体验：用户从点击搜索按钮开始，一直到用户看到首屏。
主要关注的时间点有：

* 用户输入query时间
* client初始化
* client转场动画时间
* 网络时间
* 页面首屏渲染时间


维度：

* 网络类型
* 版本号
* 内核
* 系统等
[/note]


[slide]
## 客户端的监控平台
-----
![](../img/speed/client.png)

[slide]
## 通过**python+adb**脚本实现
-----
![](../img/speed/6.pic.jpg)

[note]
关注指标：
* 冷启动时间
* 热启动时间
* 头图展现时间
* 首屏卡片展现时间
[/note]


[slide data-transition="cover-diamond"]
# 搜索结果页速度优化

<small>搜索是手机百度的第一大需求</small>

[slide]
## 网络传输层
----
{:&.fadeIn}

<span class="yellow">DNS预连接</span> / <span class="yellow">SPDY协议</span> / <span class="yellow">限制上行</span> / <span class="yellow">减少下行</span>

[note]
限制上行：

* 缩短url
* 减少cookie
* 增加cookie白名单

减少下行：重点减少页面大小
[/note]


[slide]
## 代码层次优化
----
{:&.fadeIn}

<span class="red">ls缓存</span> / <span class="red">首屏优化</span> / <span class="red">渲染优先</span> / <span class="red">同步wise成果</span>

[note]
* 基础库下移
* 非首屏css下移
* chunk等项目
* 减少图片，采用css3
[/note]
[slide]
## 用户感知
----

<p class="fadeIn">
<span class="yellow">进度条优化</span> &nbsp; <span class="yellow">底部搜索框</span>
</p>

<div class="column-2 fadeIn">
    <img src="../img/speed/8.pic.jpg" alt="">
    <img src="../img/speed/7.pic.jpg" alt="">
</div>

[slide data-transition="cover-diamond"]
# 频道页速度优化
<small>localstorage和html渲染模式</small>

[slide]
## 二次拉取版localstorage缓存
------
![](../img/speed/ls.png)


[slide]
## cookie版localstorage缓存
------
![](../img/speed/ls-plus.png)

[note]
疑问？cookie能存多少版本号？cookie多大合适？太大是否会限制上行速度，造成速度退化？
[/note]

[slide]
## 升级版localstorage缓存
-----
<h3 class="bounceIn"><span class="red">特点一：细粒度</span></h3>

* 代码分层： {:&.moveIn} <span class="fadeIn"><span>基础层</span> <span>通用层</span> <span>业务层</span></span>
* 版本号缩短：<span class="fadeIn"><span>36进制</span></span>

<div class="zoomIn" style="width:300px;margin:20px auto 0">
    <table>
        <tr><td>key</td><td>bdapp_lsv</td></tr>
        <tr><td>value</td><td class="highlight">jA-1_jZ-3_cN-1</td></tr>
    </table>
</div>
[note]
* 基础层：zepto，zepto-ajax
* 通用层：Bdbox
* 业务层：业务逻辑代码

cookie有效期一周，36进制可以保证版本号长度始终为1！

[/note]

[slide]
## 升级版localstorage缓存
-----
<h3 class="bounceIn"><span class="red">特点二：多维度</span></h3>

* 利用cookie二维性： {:&.moveIn} <span class="fadeIn"><span>domain / </span><span>path</span></span>
* domain：<span class="fadeIn"><span>全站都用的模块版本号，zepto、reset等</span></span>
* path：<span class="fadeIn"><span>频道级别通用+业务代码版本号，common样式和具体业务模块</span></span>


[slide]
## 升级版localstorage缓存
-----

key | domain | path | value
:------|:---------:|:------:|----
bdapp_lsv | x.baidu.com | / | jA-1_jZ-3_jB-2
bdapp_ls {:.highlight} | x.baidu.com | /novel {:.highlight} | cN-1_jN-2
bdapp_ls {:.highlight} | x.baidu.com | /discovery {:.highlight} | cD-1_tD-2_jT-2

间隔采用**_**和**-**，urlencode不会转义~保证长度不变~


[slide data-transition="cover-diamond"]
## 静态资源的引入方式
----
从静态资源引入方式来区分，将html渲染模式分为：

内嵌(inline) {:.yellow}

```html
<script>code</script>
<style>xxx</style>
```

外链(tag) {:.yellow}

```html
<link href="//domain.com/css/path_0.css" rel="stylesheet"/>
<link href="//domain.com/css/path_1.css" rel="stylesheet"/>
<script src="//domain.com/code/path_0.js"></script>
<script src="//domain.com/code/path_1.js"></script>
```

combo {:.yellow}

```html
<link href="//domain.com/??css/path_0.css,css/path_1.css" rel="stylesheet" />
<script src="//domain.com/??code/path_0.js,code/path_1.js"></script>
```

[slide]
## 优劣比较
-------
* inline {:&.moveIn}
    * http请求少，不存在并发下载问题，省电，但是每次代码都要下发
    * 可以通过localstorage做缓存，不过有实现成本
    * 单域名ls存储空间有限，命名冲突
* tag
    * 利用http协议实现cache
    * 页面模块多，则外链多，请求也多，存在并发限制，费电
* combo
    * 将页面多个请求合并成一个
    * 减少http请求，可结合CDN和http协议cache优势

[slide data-transition="cover-diamond"]

{:&.fadeIn}

## 那么问题来了 {:.red}
## 能不能在用户访问页面时，根据当时的网络环境自动在3种模式间切换？

[slide]
## 这是一个静态资源如何管理的问题
<h3 class="bounceIn"><span class="red">利用FIS release后的`map.json`！</span></h3>

[slide]
## `map.json`
-----

```json
{
    "common:bdbox/io/xDomain": {
        "uri": "/static/searchbox/bdbox/io/xDomain.js",
        "type": "js",
        "deps": [
            "common:bdbox/event/xMessage",
            "common:bdbox/utils/queryToJson"
        ],
        "content": "xDomain代码...."
    }
}
```

[slide]
## inline模式
### <span class="yellow">线上环境</span>，适合<span class="red">慢速</span>网络
----
{:&.fadeIn}

```html
{%html rendermode="inline"%}
```
![inline模式](/assets/box-fe-road/img/inline-mode.png)

[slide]
## tag模式
### <span class="yellow">线下开发环境</span>，适合<span class="red">debug</span>
----
{:&.fadeIn}

```html
{%html rendermode="tag"%}
```

![tag模式](/assets/box-fe-road/img/tag-mode.png)

[slide]
## combo模式
### <span class="yellow">线上环境</span>，适合<span class="red">3G及以上</span>网络
----
{:&.fadeIn}

```html
{%html rendermode="combo"%}
```

![combo模式](/assets/box-fe-road/img/combo-mode.png)


`combo.php`是线下测试combo的文件，实际使用场景中文件url都带有hash值

[slide data-transition="cover-diamond"]
## 根据网速智能切换渲染模式
----
<p class="moveIn"><span class="yellow">客户端知道页面访问时，用户所处网络环境</span></p>
<p class="fadeIn">
    <span class="yellow">根据IP测速库可推算出网络延迟</span>
</p>

<pre class="fadeIn"><code class="smarty hljs mel">&lt;!DOCTYPE html&gt;
<em>{%<span class="hljs-keyword">if</span> <span class="hljs-variable">$network</span> == <span class="hljs-string">'fast'</span> <span class="hljs-variable">%}</span>
    {<span class="hljs-variable">%html</span> rendermode=<span class="hljs-string">"combo"</span><span class="hljs-variable">%}</span>
{<span class="hljs-variable">%<span class="hljs-keyword">else</span></span><span class="hljs-variable">%}</span>
    {<span class="hljs-variable">%html</span> rendermode=<span class="hljs-string">"inline"</span> localstorage=<span class="hljs-string">"true"</span> lscookiepath=<span class="hljs-string">"/xxx"</span> <span class="hljs-variable">%}</span>
{<span class="hljs-variable">%/</span><span class="hljs-keyword">if</span><span class="hljs-variable">%}</span></em>
{<span class="hljs-variable">%head</span><span class="hljs-variable">%}</span>
.....
{<span class="hljs-variable">%/</span>head<span class="hljs-variable">%}</span>
....
</code></pre>

[note]
## 按H键，有动效
[/note]



