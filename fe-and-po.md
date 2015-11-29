title: 前端&amp;运营组技术和平台
speaker: 三水清
url: //cms.m.baidu.com/fe
transition: move
theme: moon
files: /assets/box-fe-road/css/main.css

[slide]
# 前端知识体系和运营平台介绍

[slide]
## 团队现状和职能
---------
* 框前端工作支持 
* 框运营活动支持
* 框CMS管理系统
* 团队规模：11
    - php 4人
    - fe 4人
    - fe实习生 1人
    - fe外包 2人


[slide]
## 前端知识体系
-----

![手机百度前端工程化体系](/assets/box-fe-road/img/box-fe.png)



[slide]
## 前端知识体系
----
* 构建工具 {:&.moveIn}
* 类库
* php和smarty扩展
* 解决方案
* 数据和性能
* 调试和框环境模拟
* 文档规范


[slide]
## 构建工具
-----
* smarty/前端模版编译 {:.fadeIn}
* 类库和解决方案封装
* 规范检查
* 代码打包部署

[slide]
## 构建工具
------

![构建工具](/assets/fe-and-po/build.png)

[slide]
## 类库：Bdbox
---------

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

[subslide]
## Bdbox文档平台
------
![](/assets/fe-and-po/bdbox-doc.png)
=============
## Bdbox文档平台
------
![](/assets/fe-and-po/bdbox-doc1.png)
[/subslide]

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
## 其他类库
-----
* openjs：公司内部开发库 {:.fadeIn}
* Muse：jssdk
* Fenix：开放平台jssdk
* game：运营游戏和canvas
* bsass：sass 库
    - reset
    - css3
    - ui

[slide]
## 解决方案
-----
* 细粒度缓存 {:.fadeIn}
* 渲染模式：inline/tag/combo
* 智能适配
* component：js模板+css+js
* SPA：`Bdbox.app.*`

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

[slide]
## 数据和性能
-----
* stalker系统 {:.fadeIn}
* js报错
* 劫持
* 速度性能
* h5，css3特性嗅探
* 日志分析

[mdp.baidu.com](//mdp.baidu.com)

[slide]
## stalker实时统计
------
基于 nodejs 开发，支持多种数据落地方案的实时统计数据，一台实体机，支持3亿打点数据请求

<iframe data-src="http://fe.baidu.com/doc/kuang/mdp/stalker.pdf"></iframe>


[slide]
## 联调模拟
-----
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


* 制定接口/接口联调/webview页面联调 {:&.fadeIn}


[slide]
## 手机百度chrome扩展功能
---
[subslide]
![chrome扩展](/assets/box-fe-road/img/chrome.png)
============
* 支持FIS调试，ORP预览机调试
* 客户端接口模拟
* 手机百度userAgent模拟
* 快速生成二维码
* CRD客户端js接口自助测试
* 内置JSON-handler
* URL映射和框URL生成
[/subslide]

[slide]
## 文档规范
--------
* [前端&运营文档平台](//cms.m.baidu.com/fe)
* [运营组件化文档](//cms.m.baidu.com/wiki)
* [Bdbox文档](http://cms.m.baidu.com/fe/bdbox/)

[slide]
# 运营组件化平台 {:&.flexbox.vleft}

> 打造运营活动闭环，提高运营活动效率


[slide]
![](/assets/fe-and-po/pocms.png)

河图 <span class="label label-info">无障碍</span> 平台，<span class="label-danger label">P4</span>，首批即用接口平台，打通运营活动开发、联调、管理到数据回归各个环节

[slide]
## 七个API接口
-----
* 投票
* 抽奖
* 评论
* 用户
* 问答
* ip归属地
* 图片


[slide]
## 三个系统
-----
* [在线测试和代码生成](http://cms.m.baidu.com/fe/static/po-api-test.html)
* [cms管理系统](//cms.m.baidu.com/pocms)
* [文档中心](//cms.m.baidu.com/wiki)

[slide]
## SDK
-----
* [php sdk](http://cms.m.baidu.com/wiki/sdk/php_sdk.html)
* [js sdk](http://cms.m.baidu.com/wiki/sdk/js_sdk.html)
* [cms sdk](http://cms.m.baidu.com/wiki/sdk/cms_sdk.html)

[slide]
# 现在我们正在做什么？ {:&.flexbox.vleft}

[slide]
* 框运营位管理平台
* 框运营活动cms化
* 数据中心
* 抽样和配置下发

[slide]
## 框运营位管理平台
-----
* 框运营位申请
* 审批
* 提交物料
* 测试
* 上线
* 数据回归

[slide]
## 框运营活动cms化
------
* 话题卡片和落地页
* 笑报+今日资讯（等待迁移）
* 官网更新
* 灰度升级
