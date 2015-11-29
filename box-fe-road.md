title: 手机百度前端工程化之路
speaker: 三水清
url: https://js8.in
transition: move
files: http://apps.bdimg.com/libs/fontawesome/4.0.3/css/font-awesome.min.css,/assets/box-fe-road/css/main.css
highlightStyle: monokai_sublime
date: 2014年08月29日

[slide]
# 手机百度前端工程化之路
<small>天蝎系统介绍</small>

[slide]
## 背景介绍
----
* 手机百度是一款hybrid APP {:&.moveIn}
* 处于发展期，开发迭代快，主线版本并行开发
* 琐碎事情
    * 接入方多 {:&.fadeIn}
    * 运营活动需求
    * cms需求



[slide]

# 发现问题，选择最合适产品特点的解决方案 {:&.flexbox.vleft}

> 成熟的团队不应该还停留在炫技和跟风阶段

[slide]
## 问题
----
* FE开发、联调和代码部署成本高
* 重复事情特别多，对团队和个人发展都不利
* **一刀切**的解决方案太多
    * 静态资源内嵌
    * localstorage存储方案
* 没有自己产品的js库
* 页面太多，不方便统一管理

**立足现状，布局未来**

[slide]
# 第一步：将前端common从template中抽离 {:&.flexbox.vleft}

> svn模块太多，要做统一的前端解决方案，只能将公共的代码单独维护，通过svn:externals属性

[slide]
## 前端common svn
### 将前端common从template的svn中脱离
----
```bash
 common
  ├─demo # demo示例目录，不上线
  ├─docs # 文档目录，jsdoc生成，svn忽略
  ├─plugin # smarty插件和解决方案
  ├─static # 静态资源
  │  ├─bdbox # js模块化库
  │  ├─css
  │  ├─img
  │  └─js
  ├─test # 放fis的调试json文件，用于本地开发，不上线
  │  └─page
  │      └─xxx
  ├─widget # widget目录
  └─nodejsLib # nodejs工具
```

[slide]
# 第二步：根据团队实际情况做好前端js库 {:&.flexbox.vleft}

> 重复代码抽离，模块间依赖关系明确，方便静态资源管理；用不用第三方库？

[slide]

[note]
故事分享：刚开始做模块库的时候，进入一个误区！
[/note]

## 关于用不用第三方库的思考
---
* 团队成员是否都能自己手写原生js，并且保证质量和工作效率
* 选择的第三方库，社区是否活跃，团队是否可以cover住bug
* 扩展性，模块间耦合程度，模块可拔插
* 有些模块要”私人订制“

[slide]
## zepto + 私人订制的AMD库Bdbox
----
* zepto
    * dom操作，事件，ajax（单独）
    * 去掉不常用的模块
* Bdbox
    * 手机百度js模块库
    * 跟zepto互补
    * 做前端静态资源管理的基石


[slide]
## Bdbox模块库
----
[note]
* 并非严格按照大类划分
* 粒度适合，有大粒度的moplus，也有小粒度的utils类
* 类似AMD规范，模块编写是commonJS规范，更像是node模块
* 功能全，甚至有50行的简版百度统计代码
* 一些场景可替代zepto，比如对外开放库jssdk
[/note]

| 说明 | 包含模块
:----------:|------|-------
端能力   | 跟客户端相关 | ios，android，apad，invoke，moplus，lbs等
通用&方案 | 通信、事件、跨域、SPA | io，event，app，xDomain，Deffered等 {:.highlight}
工具     | 粒度小，用途广泛 | cookie，detect，dateFormat等
性能&监控| 用户行为统计、速度监控和错误收集 | monitor，S，cache（ls/接口/静态资源）
交互     | 页面交互相关，zepto扩展 | Dialog，mask，swipe，fastclick
运营     | 抽奖游戏，pv和行为统计，跨域通信，游戏类 | 刮刮乐，摇一摇，跑马灯，游戏舞台/精灵/对象池/easing

18个大类，50+个模块，覆盖手机百度所有应用场景


[slide]
## 对模块的管理
----
* 利用FIS-PLUS自动包裹AMD规范（有别于官方）
* 生成静态资源配置文件： `common-map.json`
    * 扩展FIS-PLUS，包含高频源码和文件hash
* 对smarty require/widget 标签语法进行改造
    * 支持资源多种<b>动态</b>合并
* 通过注释，使用jsdoc产出[Bdbox文档](http://fe.baidu.com/doc/kuang/fe/docs/index.html)

[slide]
## 模块编写：像写node模块
----
```javascript
/**
 * 简单模板
 * @memberOf Bdbox.utils
 * @name template
 * @param  {String} html 模板String内容
 * @param  {Object} data 模板data对象
 * @return {String}      返回处理后的模板
 * @author wangyongqing01
 * @version $Id: template.js 175996 2014-05-16 00:48:03Z wangyongqing01 $
 * @example
 * var t = Bdbox.utils.template('I am <%=name%>', {name:'Theo Wang'});
 * // I am Theo Wang
 * console.log(t);
 */
module.exports = function(html, data) {
    for (var i in data) {
        html = html.replace(new RegExp('<%=\\s*' + i + '\\s*%>', 'g'), data[i]);
    }
    return html;
};
```

[slide]
## 编译后：AMD模块
----
```javascript
define('common:bdbox/utils/template', function(require, exports, module, $){
    module.exports = function(html, data) {
        for (var i in data) {
            html = html.replace(new RegExp('<%=\\s*' + i + '\\s*%>', 'g'), data[i]);
        }
        return html;
    };
});
```

[slide]
# 第三步：模板根据action拆分成父子模板 {:&.flexbox.vleft}

> 父模板做解决方案，子模板专注于业务，父子继承关系

[slide]
## 模板拆分方案
----
* 修改odp Router和Template类
* 父模板按照action来划分，放在 `tpl/layout`
* 子模板按照具体页面来分，放在 `tpl/page`
* 跟php约定父子模板路径smarty变量

```smarty
{%extends file=$tplData.parentTplPath %}
{%block name="head"%}...{%/block%}
{%block name="body"%}...{%/block%}
```

[slide]
# 第四步：父模板做解决方案 {:&.flexbox.vleft}

> 利用Smarty标签扩展机制，做好解决方案；解决代码调试，速度性能，抽样和静态资源管理

[slide]
## 页面渲染模式
### 解决联调成本和静态资源管理混乱等问题
----

<pre class="bounceIn"><code class="smarty">{%html framework=&quot;common:bdbox&quot; rendermode=&quot;<b>inline|tag|combo</b>&quot;%}
</code></pre>
[note]
## 按H键，有动效
[/note]

[slide]
## 页面渲染模式介绍
----
* inline
    * 即所有的静态资源都内嵌到页面，最古老的一刀切方案
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
* 客户端知道用户现在所处网络环境，而且页面公共参数含有该信息
* wise有ip测速库

<pre><code class="smarty hljs mel">&lt;!DOCTYPE html&gt;
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

[slide]
## inline+localstorage存储
### 解决慢速网络cache问题
### 粒度细/多维度，存储更多，降低更新频率
----

[slide]
## localstorage存储和更新方案
---
* 细粒度
    * 代码根据更新频率分层：基础、通用和业务
    * 业务代码更新不会下发基础和通用代码
* 利用cookie记录版本号，避免二次请求
* 多维度
    * 原理：cookie可根据domain和path两个维度设置
    * 条件：不同频道页面path不同，但是domain相同
    * 效果：访问A频道，再访问B频道，B频道跟A相同的代码将不再下发
* 打包自动更新版本配置文件：localstorage.json和lsconfig.php
* 打包工具自动包裹版本逻辑

[slide]
## localstorage.json举例
----
```json
{
    "jA": {
        "hash": "2c79d70",
        "files": [
            "common:widget/localstorage/zepto-ajax.tpl"
        ],
        "version": 1
    },
    "jZ": {
        "hash": "5358395",
        "files": [
            "common:widget/localstorage/zepto.tpl"
        ],
        "version": 1
    }
}
```
[slide]
## 文件版本逻辑自动生成
----

```html
<script data-lsid="jZ">
    __inline('/static/js/zepto.js');
</script>
```

编译后：

```smarty
{%if ($_ls_nonsupport) || ($_parsedLSCookies.jZ.isUpdate ) %}
    <script data-lsv="{%$_parsedLSCookies.jZ.version|escape:html%}"  data-lsid="jZ">
    var Zepto=xxx
    </script>
{%else%}
    <script>LS.exec("jZ","js");</script>
{%/if%}
```
* 有效避免新手出错，解放双手！
* php判断变量都是通过解析`localstorage.json`和对比cookie得到的

[slide]
## cookie存储版本号效果
---
![cookie存储版本号效果](/assets/box-fe-road/img/lscookie.png)

![cookie存储版本号效果2](/assets/box-fe-road/img/lscookie2.png)

版本号是36进制，如果超过36则从1开始，以保证始终长度为1。

cookie过期时间一周，不需要考虑版本号重叠问题

[slide]
## 小结
---
* 通过客户端公共参数和wise测速ip库智能选择页面渲染模式
* 2G等网络延时长使用inline和localstorage存储
* 3G以上使用CDN+combo渲染模式
* 开发中使用tag渲染模式，方便快速定位bug所在模块
* localstorage细粒度多维度和自动化更新

<p class="fadeIn"><span>哪天4G普及了，只要去掉慢速的逻辑分支，既可以全部更换到最优方案</span></p>

[slide]

# 第五步：前端模板组件化 {:&.flexbox.vleft}

> js模板编译成Bdbox模块，方便管理、跨域拉取和模块化存储

[slide]
## 模板选型：artTemplate
----
* 基本不跟smarty语法冲突
* 性能
* 扩展能力
* 编译支持
* 国人开发，情怀~

[slide]
## 模板选型
----
synax| eJS | doT | artTempalte
--- | --- | ---- | ----
是否支持定界符自定义 | Y |Y | Y
是否支持include | Y | Y | Y
是否支持Node | Y | Y | Y
是否支持简洁语法 | Y | Y | Y
是否支持格式化输出 | filters方式 | N | filters
是否支持浏览器端 | Y | Y | Y

[slide]
## 模板编译：编译之前
----
```html
{{include '../public/header'}}
<div id="main">
    <h3>{{title}}</h3>
    <ul>
        {{each list}}
        <li><a href="{{$value.url}}">{{$value.title}}</a></li>
        {{/each}}
    </ul>
</div>

{{include '../public/footer'}}
```


[slide]
## 模板编译：编译之后为Bdbox模块
----
```javascript
define('baiduboxapp:tmpl/test/test2', function(require, exports, module, $) {
    $.template('baiduboxapp:tmpl/test/test2', function($data, $filename) {
        //忽略部分代码
        include('../public/header');
        $out += '\n\n<div id="main">\n    <h3>';
        $out += $escape(title);
        $out += '</h3>\n    <ul>\n        ';
        $each(list, function($value, $index) {
            $out += '\n        <li><a href="';
            $out += $escape($value.url);
            $out += '">';
            $out += $escape($value.title);
            $out += '</a></li>\n        ';
        });
        $out += '\n    </ul>\n</div>\n\n';
        include('../public/footer');
        $out += '\n';
        return new String($out);
    });
    module.exports = function(id, data) {
        var html = $.template("baiduboxapp:tmpl/test/test2", data);
        $.byId(id).innerHTML = html;
    }
});
```

[slide]
## 编译之后：依赖自动生成
----
```json
"baiduboxapp:tmpl/test/test2": {
    "uri": "baiduboxapp/tmpl/test/test2.js",
    "type": "js",
    "deps": [
        "baiduboxapp:tmpl/public/header",
        "baiduboxapp:tmpl/public/footer"
    ]
}
```

[slide]
## 模板使用
----
<pre><code class="smarty hljs r">{%<span class="hljs-keyword">require</span> name=<span class="hljs-string">"common:bdbox/template"</span>%}
&lt;div id=<span class="hljs-string">"content"</span>&gt;&lt;/div&gt;
{%script%}
<em><span class="hljs-keyword">require</span>(<span class="hljs-string">'baiduboxapp:tmpl/test/test2'</span>);</em>
var data = {
    title:<span class="hljs-string">'加载模板演示'</span>,
    time: +new Date(),
    list: [<span class="hljs-keyword">...</span>]
};
var html = Bdbox.template(<span class="hljs-string">'baiduboxapp:tmpl/test/test2'</span>, data);
document.getElementById(<span class="hljs-string">'content'</span>).innerHTML = html;
//or
Bdbox.tmpl.test.test2(<span class="hljs-string">'content'</span>, data);
{%/script%}
</code></pre>

[note]
## 按H键有高亮动画
[/note]

[slide]
## rendermode="tag"的渲染模式下模板输出
----
![js模板解决方案](/assets/box-fe-road/img/template.png)

[slide]
## js模板解决方案
----
* 将js的string模板编译成可执行js代码片段
* 编译成Bdbox模块
* 依赖关系自动维护
* 减少js模板编译时间
* 解决跨域拉取string模板的问题
* 看不到js模板的存在！

[slide]
# 第六步：webapp的组件化开发 {:&.flexbox.vleft}

> 组件化之后，做页面更像再玩积木游戏


[slide]
### 组件化
-----
* 一个UI组件由：tmpl、js和css构成
* js文件是组件的核心
* 组件内css/js/tmpl 产生依赖关系


[slide]
## 组件化目录结构
----
```bash
# component举例：发现频道
components/discovery
    ├─header # 头部大banner
    │      header.css
    │      header.js
    │      header.tmpl
    │
    └─comment # 评论
            comment.css
            comment.js
            comment.tmpl
```

[slide]
## 组件化举例：`discovery/foo`
----
### 模板 foo.tmpl

```html
{{include './public/header'}}

<div id="main">
    <h3>{{title}}</h3>
    <ul>
        {{each list}}
        <li><a href="{{$value.url}}">{{$value.title}}</a></li>
        {{/each}}
    </ul>
</div>

{{include './public/footer'}}
```

[slide]
## 组件化举例：`discovery/foo`
----
### 交互 foo.js

```javascript
function bindEvent(id){
    $.byId(id).addEventListener(xxx);
    //....
}
module.exports = function(id, data){
    template(id, data);
    bindEvent(id);
}
```
编译后：

<pre class="fadeIn">
<code class="javascript hljs ">define(<span class="hljs-string">'baiduboxapp:c_discovery/foo'</span>, <span class="hljs-function"><span class="hljs-keyword">function</span><span class="hljs-params">(require, exports, module, $)</span>{</span>
    <em><span class="hljs-keyword">var</span> template=<span class="hljs-built_in">require</span>(<span class="hljs-string">"baiduboxapp:c_tmpl/discovery/foo"</span>);</em>
    <span class="hljs-function"><span class="hljs-keyword">function</span> <span class="hljs-title">bindEvent</span><span class="hljs-params">(id)</span>{</span>
        $.byId(id).addEventListener(xxx);
        <span class="hljs-comment">//....</span>
    }
    module.exports = <span class="hljs-function"><span class="hljs-keyword">function</span><span class="hljs-params">(id, data)</span>{</span>
        template(id, data);
        bindEvent(id);
    }
});
</code>
</pre>

[note]
## 按H键有高亮动画
[/note]

[slide]
## 编译产生依赖关系表
-----

```json
"baiduboxapp:c_discovery/foo": {
    "deps": [
        "baiduboxapp:c_css/discovery/foo",
        "baiduboxapp:c_tmpl/discovery/foo" ]
},
"baiduboxapp:c_tmpl/discovery/foo": {
    "deps": [
        "baiduboxapp:c_tmpl/discovery/public/header",
        "baiduboxapp:c_tmpl/discovery/public/footer",
        "baiduboxapp:c_css/discovery/foo"    ]
},
"baiduboxapp:c_css/discovery/foo": {
    "uri": "baiduboxapp/components/css/discovery/foo.css",
},
"baiduboxapp:c_tmpl/discovery/public/footer": {
    "deps": [ "baiduboxapp:c_tmpl/discovery/public/logo" ]
},
"baiduboxapp:c_tmpl/discovery/public/header": {
    "deps": [ "baiduboxapp:c_tmpl/discovery/public/logo" ]
},
"baiduboxapp:c_tmpl/discovery/public/logo": {
    "uri": "baiduboxapp/components/tmpl/discovery/public/logo.js",
}
```

[slide]
### 调用一个组件
-----
```javascript
require('baiduboxapp:c_discovery/foo');
Bdbox.c_discovery.foo('content', data);
```
实际输出：
```html
<!--先在head输出css-->
<link rel="stylesheet" type="text/css" href="baiduboxapp/components/css/discovery/foo.css" />
<!--在body依次输出模板依赖和js模块依赖-->
<script type="text/javascript" src="baiduboxapp/components/tmpl/discovery/public/logo.js"></script>
<script type="text/javascript" src="baiduboxapp/components/tmpl/discovery/public/header.js"></script>
<script type="text/javascript" src="baiduboxapp/components/tmpl/discovery/public/footer.js"></script>
<script type="text/javascript" src="baiduboxapp/components/tmpl/discovery/foo.js"></script>
<script type="text/javascript" src="baiduboxapp/components/discovery/foo.js"></script>
<div id="content"></div>
<script>
    Bdbox.c_discovery.foo('content', data);
</script>
```

<p class="fadeIn"><span>结合之前的解决方案，webapp的组件化开发更加得心应手！《<a href="http://fe.baidu.com/doc/kuang/fe/components.text">详细文档</a>》</span></p>

[slide]
# 第七步：自己开发工具，减少等待联调成本 {:&.flexbox.vleft}

> 使用工具，对接口进行模拟，提前跑通流程，减少联调时间


[slide]

<div class="flex-center-center">
    <div class="cir-wrapper">
        <div class="cir zoomIn">
            <h4>ServerRD</h4>
        </div>
        <div class="cir fe">
            <h4>FE</h4>
        </div>
        <div class="cir bounceIn">
            <h4>ClientRD</h4>
        </div>
    </div>
</div>

* 手机百度是一款hybrid APP {:&.fadeIn}
* 增加了客户端RD的角色，需要跟其配合
* 制定接口/接口联调/webview页面联调

[slide]
## 利用FIS减少和PHPer联调成本
---------
* 可以支持本地接口数据模拟
* ORP线上第一台可以调试数据
* 模拟数据放在 `tpl/test` 中，供他人复用

实际开发中，FE先自己指定数据格式，并且本地调试数据，等PHPer开发完，让其按照调试数据格式输出data即可~

[slide]
## 利用chrome扩展减少和CRD联调过成本
-----
![chrome扩展](/assets/box-fe-road/img/chrome.png)

实际开发中，FE利用chrome扩展，在document_start时注入js，模拟webview的js接口；等CRD开发完成，直接调用真是js接口即可~

[slide]
## 手机百度chrome扩展功能
---

* 支持FIS调试
* 客户端接口模拟
* 手机百度userAgent模拟
* 快速生成二维码
* CRD客户端js接口自助测试
* 内置JSON-handler
* URL映射和框URL生成


[slide]
<div id="logo">
    <h1>天蝎</h1>
    <h2>&lt;/Scorpion&gt;</h2>
</div>

[note]
* 整个工程化系统叫天蝎
* 整个FE-team叫天蝎（6人，2女，天蝎座）
* 对应美剧《天蝎》六个人，两个女生O(∩_∩)O~
[/note]

[slide]
[note]
* 立足产品做技术选型
* 前端模块化库，粒度适度
* 代码按修改频率分层，父子模板拆分
* 模块依赖管理，静态资源统一管理配置
* 渲染模式
* localstorage存储方案
* 把重复的事情抽象化
* 善用工具提高工作效率
* webapp的组件化开发是以上所有解决方案的集大成者
[/note]


## 手机百度前端工程化体系
----

![手机百度前端工程化体系](/assets/box-fe-road/img/box-fe.png)

