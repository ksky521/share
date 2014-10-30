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
localstorage缓存
首屏代码优化
渲染优先

[slide]
## 用户感知
----
进度条
底部搜索框

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
### 细粒度

代码分层
版本号细化、36进制
cookie携带版本

[slide]
## 升级版localstorage缓存
-----
### 多维度
利用cookie二维性：domain/path
domain：全站公共版本号
path：频道级别版本号


[slide]
## 智能渲染模式
----
从静态资源输出上来区分，渲染模式分为：
内嵌
外链

[slide]
## 分屏渲染
----


