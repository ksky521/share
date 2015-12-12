title: Stalker——基于Node的实时统计服务
speaker: 三水清
url: https://github.com/ksky521/nodePPT
transition: fadein
theme: moon

[slide]

# Stalker
## 基于Node的实时统计服务

[slide]
## 目录
--------
* 后处理统计 V.S. 实时统计
* Stalker项目
    - 服务器架构设计
    - 插件介绍
    - 运维相关
* 番外篇：Node分析日志

[slide]
[subSlide]

## 什么是后处理统计
----
1. 使用Nginx等Server服务，打日志 {:&.rollIn}
2. 按小时将日志拆分成小日志
3. 通过定时执行分析脚本将日志进行分析

===========
## 后处理统计的问题
-----
* 日志存储占用空间 {:&.rollIn}
* 日志分析浪费时间
[/subSlide]

[slide]
<p class="fadeIn">
    <span>举个[IP归属地分析]例子</span>
</p>
<p class="fadeIn">
    <span>一次请求30~40ms</span>
</p>

<h1 class="bounceIn">
    <span>36ms * 1000,000</span> <span>= 36000s</span> <span>= <mark>10h</mark></span>
</h1>

[note]
* 依赖后端ip归属地接口
* 接口响应时间30~40ms，为了好计算按照36ms算
* 一小时100w条的日志耗时
* 数据不能实时展现
[/note]


[slide]
## 实时统计
----
1. 请求来到Server
2. Server实时处理成想要的数据
3. 数据落地存储

[slide]
## 后处理统计 V.S. 实时统计
-----

        类型|占用空间|时效性    |原始日志
-----------|-------|----------|---------
 后处理统计 | 较大   | 延时严重 | 原始日志完整
 实时统计   | 较小   | 实时    | 原始日志不完整

* 数据宝贵，具有长期分析价值（挖掘），机房多且服务复杂，适用于后处理统计
* 时效性要求高，对原始数据要求不高，适用于实时统计

[slide]

# Stalker — Node实现的实时统计服务

[slide]
## Stalker现状
-----
* 现在支持[设备画像项目](http://mdp.baidu.com/)统计数据
* 每天处理大概1.2亿+的请求数据
* 服务部署在一台12核实体机
* 实时统计数据类型：
    - 注入型劫持 {:&.fadeIn}
    - html5 css3新特性支持
    - 搜索结果页页面性能
    - js报错
* 另外有后分析数据服务
    - 跳转型劫持数据

[slide]
## Stalker特点
----
* 插件化，可拔插
* 服务配置化
* 性能/服务稳定
* 支持多种落地存储类型
    - txt/log
    - json
    - mysql
    - mongodb
    - csv

[note]
* 自14年10月左右上线以来，停过两次服务，一次是服务器重启，一次是硬盘打满。。。
[/note]

[slide]
## Stalkder的日志落地
------
* txt/log，传统的日志格式
* json
    - 方便node分析
    - 也是导入mongodb的中间格式
    - qps高，先存储为json格式，后续导入mongodb
* mysql，受限IO，适合qps小的服务，如js报错
* mongodb，适合无序，字段长度不定的存储，也受限IO
* csv，高qps时，mysql的中间格式

[slide]
## Stalker架构设计
-----
<iframe data-src="http://fe.baidu.com/doc/kuang/mdp/stalker.pdf" src="about:blank;"></iframe>

[slide]
## Stalker插件介绍
------
Stalker的插件都是统一的node模块，统一的入口函数（task/init），从分析流程划分为四类：

* 解析器 parser
    - 处理header和request信息
    - Stalker有内置parser解析出JSON传入后续流程
* 预处理器 processor
    - 对parser处理后的JSON数据进行继续加工
    - 例如ip归属，userAgent解析
* 预存储器 prestorer
    - 针对单个服务进行日志划分，调整数据字段等
    - 例如：劫持类需要按小时划分
* 存储器 storer
    - 将prestorer数据按照落地格式和类型完成存储
    - 例如csv，mysql等

[slide]
## Stalker插件规范
------
* 数据由上一个流程插件，经过处理后传入下一个插件
* 插件入口函数是task，接收data,settings,name,options
    - parser类是：data,req,res,settings,name,options
* 每个流程的插件应该返回（return）处理后的JSON格式数据
* 如果上一个流程返回的数据是false/空，则终止后续流程

[slide]
## Stalker 运维
-----
使用PM2做运维，存在reload问题

![pm2 list](/img/stalker/2015-03-13_100346.png)

[slide]
## pm2 monit

![pm2 monit](/img/stalker/2015-03-13_100320.png)

[slide]

# 番外篇：Node分析日志

[slide]
## Node做日志分析
-----
* 利用Node的stream读取日志，日志再大也不怕
* 每个流程中使用pipe
* 利用split将日志按行切开
* 按条分析日志，利用node的Url模块对日志进行分析
* 将处理完的日志，按格式进行落地存储
