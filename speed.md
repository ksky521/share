title: 手机百度速度优化
speaker: 三水清
url: https://js8.in
transition: slide2
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
    * CI级别的性能监控 {:&.fadeIn}
    * 发版前速度准入，灰度收集速度数据

[slide]
整个监控从4.8版本开始建设，到5.2版本完成

期间使用了高速摄像头等设备验证了一些结论


![](../img/speed/camera.jpg)

[slide]

![](../img/speed/client.png)

[slide]
# 搜索结果页速度优化

<small>搜索是百度APP的第一大需求</small>

[slide]
## 网络传输层
----
{:&.fadeIn}

<span class="yellow">DNS预连接</span> / <span class="yellow">SPDY协议</span> / <span class="yellow">限制上行</span> / <span class="yellow">减少下行</span>



[slide]
## 代码层次优化
----
{:&.fadeIn}

<span class="red">ls缓存</span> / <span class="red">首屏优化</span> / <span class="red">渲染优先</span> / <span class="red">同步wise成果</span>


[slide]
## 用户感知
----
{:&.fadeIn}

<span class="yellow">进度条优化</span> / <span class="yellow">底部搜索框</span>


[slide]
# 频道页速度优化

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

[slide]
## 升级版localstorage缓存
-----
<h3 class="bounceIn"><span class="red">特点二：多维度</span></h3>

* 利用cookie二维性： {:&.moveIn} <span class="fadeIn"><span>domain / </span><span>path</span></span>
* domain：<span class="fadeIn"><span>全域名公共版本号</span></span>
* path：<span class="fadeIn"><span>频道级别版本号</span></span>


[slide]
## 升级版localstorage缓存
-----

key | domain | path | value
:------|:---------:|:------:|----
bdapp_lsv | x.baidu.com | / | jA-1_jZ-3_jB-2
bdapp_ls {:.highlight} | x.baidu.com | /novel {:.highlight} | cN-1_jN-2
bdapp_ls {:.highlight} | x.baidu.com | /discovery {:.highlight} | cD-1_tD-2_jT-2


[slide]
## 智能渲染模式
----
从静态资源输出格式来区分，渲染模式分为：

内嵌 {:.yellow}

```html
<script>code</script>
```

外链 {:.yellow}

```html
<script src="//code/path"></script>
```

[slide]
## 能不能两种+模式相互切换？
## 静态资源怎么管理？
------
<h3 class="bounceIn"><span class="red">答案就是一张资源配置表！</span></h3>

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


`combo.php`是线下测试combo的文件，实际使用场景中文件url都带有hash值

[slide]
## 根据网速智能切换渲染模式
----
<p class="moveIn"><span class="yellow">客户端知道页面访问时，用户所处网络环境</span></p>
<p class="fadeIn">
    <span class="yellow">根据IP测速库可推算出网络延迟</span>
</p>

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



