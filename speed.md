title: 手机百度速度优化
speaker: 三水清
url: https://js8.in
transition: slide3
files: /css/theme.moon.css
highlightStyle: monokai_sublime

[slide]
# 手机百度速度优化
<small><a href="//weibo.com/sanshuiqing">@三水清</a></small>


[slide]

# 建立监控平台 {:&.flexbox.vleft}

> 摸底数据，数据分析，效果评估


[slide]
## 监控平台
----
* web页面性能监控平台 {:&.moveIn}
    * 收集客户端+web页面数据 {:&.fadeIn}
* 客户端性能监控平台
    * 每次CI都自动做性能分析 {:&.fadeIn}
    * 发版前速度准入

[slide]
整个监控从4.8版本开始建设，到5.2版本完成，期间使用了高速摄像头等设备验证了一些结论


[slide]
# 搜索结果页速度优化 {:&.flexbox.vleft}

> 百度APP的第一大需求是搜索

[slide]
## 网络传输层
----
* DNS预连接 {:&.moveIn}
* SPDY协议：T5内核支持
* 严格限制上行
* 减少下行

[slide]
## 代码层次优化
----
* localstorage缓存
* 首屏代码优化
* 渲染优先
* 同步wise成果

[slide]
## 用户感知
----
* 进度条
* 底部搜索框

[slide]
# 频道页速度优化

[slide]
## localstorage缓存
-----
* 将使用频率高的代码存入localstorage
* 版本号使用cookie携带

[slide]
## 升级版localstorage缓存
-----
<h3 class="bounceIn"><span>特点一：细粒度</span></h3>

* 代码分层： {:&.moveIn} <span class="fadeIn"><span>基础层</span> <span>通用层</span> <span>业务层</span></span>
* 版本号缩短：<span class="fadeIn"><span>36进制</span></span>
* cookie携带版本：<span class="fadeIn"><span>避免二次请求</span></span>

<div class="zoomIn" style="width:300px;margin:20px auto 0">
    <table>
        <tr><td>key</td><td>bdapp_lsv</td></tr>
        <tr><td>value</td><td class="highlight">jA-1_jZ-3_cN-1</td></tr>
    </table>
</div>
[slide]
## 升级版localstorage缓存
-----
<h3 class="bounceIn"><span>特点二：多维度</span></h3>

* 利用cookie二维性： {:&.moveIn} <span class="fadeIn"><span>domain / </span><span>path</span></span>
* domain：<span class="fadeIn"><span>全域名公共版本号</span></span>
* path：<span class="fadeIn"><span>频道级别版本号</span></span>

[slide]
## 升级版localstorage缓存
-----

key | domain | path | value
:------|:---------:|:------:|:----:
bdapp_lsv | po.m.baidu.com | / | jA-1_jZ-3_jB-2
bdapp_ls | po.m.baidu.com | /novel | cN-1_jN-2
bdapp_ls | po.m.baidu.com | /discovery | cD-1_jD-2_jT-2


[slide]
## 智能渲染模式
----
从静态资源输出上来区分，渲染模式分为：
* 内嵌

```html
<script>code</script>
```

* 外链

```html
<script src="//code/path"></script>
```

[slide]
## 静态资源怎么管理？
------
<h3 class="bounceIn"><span>我们需要一张资源配置表！</span></h3>

[slide]
## 页面渲染模式介绍
----
* inline {:&.moveIn}
    * 即所有的静态资源都内嵌到页面
    * http请求少，省电
* tag
    * 即使用script和link标签，引入外链的js和css
    * PC常见方式，利用http cache
* combo
    * 将页面多个请求合并成一个
    * 减少http请求，可结合CDN和http cache优势

[slide]
## inline模式
### 线上环境，适合慢速网络
----
![inline模式](/assets/box-fe-road/img/inline-mode.png)

[slide]
## tag模式
### 线下开发调试环境，适合debug
----
![tag模式](/assets/box-fe-road/img/tag-mode.png)

[slide]
## combo模式
### 线上环境，适合3G+网络
----
![combo模式](/assets/box-fe-road/img/combo-mode.png)

nginx combo服务：[box.bdimg.com](http://box.bdimg.com/??bdbox/bdbox.js,bdbox/template.js,bdbox/utils/getVersion.js)

`combo.php`是线下测试combo的文件，实际使用场景中文件url都带有hash值

[slide]
## 根据网速智能切换渲染模式
----
* 客户端知道用户现在所处网络环境，而且页面公共参数含有该信息 {:&.moveIn}
* wise有ip测速库

<pre class="fadeIn"><code class="smarty hljs mel">&lt;!DOCTYPE html&gt;
<em>{<span class="hljs-variable">%if</span> <span class="hljs-variable">$network</span> == <span class="hljs-string">'fast'</span> <span class="hljs-variable">%}</span>
    {<span class="hljs-variable">%html</span> rendermode=<span class="hljs-string">"combo"</span><span class="hljs-variable">%}</span>
{<span class="hljs-variable">%else</span><span class="hljs-variable">%}</span>
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



