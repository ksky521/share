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

[前端知识体系脑图](http://naotu.baidu.com/viewshare.html?shareId=auoa568nruw4)

[slide]
## 前端知识体系
----
* 构建工具 {:&.moveIn}
* 类库
* php和[smarty扩展](http://cms.m.baidu.com/fe/template/smarty.html)
* 解决方案
* 数据和性能
* 调试和框环境模拟
* 文档规范


[slide]
## 构建工具
-----
* smarty/前端模版编译 {:&.rollIn}
* 类库和解决方案封装
* 规范检查
* 代码打包部署

[slide]
## 构建工具
------

![构建工具](/assets/fe-and-po/build.png)

[http://cms.m.baidu.com/fe/framework/package.html](http://cms.m.baidu.com/fe/framework/package.html)
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

18个大类，50+个模块，覆盖框所有应用场景，[codepicker](http://cms.m.baidu.com/fe/static/codepicker.html)

[slide]

[subslide]
## Bdbox文档平台
------
![](/assets/fe-and-po/bdbox-doc.png)

[http://cms.m.baidu.com/fe/bdbox/](http://cms.m.baidu.com/fe/bdbox/)
=============
## Bdbox文档平台
------
![](/assets/fe-and-po/bdbox-doc1.png)
[/subslide]


[slide]
## 其他类库
-----
* [openjs](http://cms.m.baidu.com/wiki/fe/)：公司内部开发库 {:&.rollIn}
* [Muse](http://cms.m.baidu.com/fe/jssdk.html)：jssdk
* [Fenix](http://cms.m.baidu.com/wiki/sdk/js_sdk.html)：开放平台jssdk
* game：[运营游戏](http://cms.m.baidu.com/wiki/game.html)和canvas
* [bsass](http://cms.m.baidu.com/fe/framework/bsass.html)：sass 库
    - reset
    - css3
    - ui

[slide]
## 解决方案
-----
* [细粒度缓存](http://cms.m.baidu.com/fe/framework/solution.localstorage.html) {:&.rollIn}
* [渲染模式](http://cms.m.baidu.com/fe/framework/solutionauto-render.html)：inline/tag/combo
* 智能适配
* [component](http://cms.m.baidu.com/fe/framework/component.html)：前端组件模板
* [SPA](http://cms.m.baidu.com/fe/framework/webapp.html)：`Bdbox.app.*`

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
* stalker系统 {:&.fadeIn}
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

[框chrome扩展帮助文档](http://cms.m.baidu.com/fe/environment/chrome.html)
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
    - 目录/html/js/css/sass/组件/图片/js编码性能
* [运营组件化文档](//cms.m.baidu.com/wiki)
* [Bdbox文档](http://cms.m.baidu.com/fe/bdbox/)
* [框端能力备案平台Invoker](//invoker.baidu.com)

[slide]
# 运营组件化平台 {:&.flexbox.vleft}

> 打造运营活动闭环，提高运营活动效率


[slide]
![](/assets/fe-and-po/pocms.png)

河图 <span class="label label-info">无障碍</span> 平台，<span class="label-danger label">P4</span>，首批即用接口平台，打通运营活动开发、联调、管理到数据回归各个环节

[slide]
## 七个API接口
-----
* [投票](http://cms.m.baidu.com/wiki/vote.html)
* [抽奖](http://cms.m.baidu.com/wiki/lottery.html)
* [评论](http://cms.m.baidu.com/wiki/comment.html)
* [用户](http://cms.m.baidu.com/wiki/user.html)
* [问答](http://cms.m.baidu.com/wiki/quiz.html)
* [ip归属地](http://cms.m.baidu.com/wiki/ip.html)
* [图片](http://cms.m.baidu.com/wiki/image.html)


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
* 数据中心：计划
* 抽样平台：计划

[slide]
## 框运营位管理平台
-----
完成框运营位申请、审批、物料提交和上线全流程，增加多种维度控制

* 框运营位申请 {:&.rollIn}
* 审批
* 提交物料
* 测试
* 上线
* 数据回归

[slide]
## 框运营活动cms化
------
运营活动UI组件化，时效性活动和卡片落地页cms化

* 卡片及其落地页 {:&.fadeIn}
* 时效性和突发类运营活动模板
* 笑报+今日资讯（等待迁移）
* 官网更新
* 灰度升级
