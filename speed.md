title: 手机百度速度优化
speaker: 三水清
url: https://js8.in
transition: fade
files: /css/theme.moon.css,/js/speed/puff.js
highlightStyle: monokai_sublime

[slide class="title-slide"]
# 手机百度速度优化
<small><a href="//weibo.com/sanshuiqing">@三水清</a></small>

[slide]
## 自我介绍
-----
* 王永青
* 网名：[@三水清](//weibo.com/sanshuiqing)
* 手机百度前端运营组负责人
* 招聘邮箱
    * wangyongqing01#baidu.com
    * 有妹子，有水果机

[slide]
## 目录
--------

* 项目背景
* 整个搜索流程和项目分工
* 以真实用户体验为标准
* 怎样和客户端一起做速度项目

[slide]
## 项目背景
------
* 2013年7月：搜索速度需要与移动搜索速度持平
    * 目标： 3G+wifi用户，绝大多数可以在1s内看到首屏
* 2013年11月：做搜索最快的客户端
    * 目标： 搜索速度超越竞品


[slide]
## 整个搜索流程
-------
![搜索流程](/img/speed/http.png)

[slide]
## 流程对应的架构
------

![搜索流程](/img/speed/framework.png)


[slide]
## 流程决定分工
----
![搜索流程](/img/speed/team.png)


[slide]
## 整个项目划分
-------
* 监控：知己知彼
* 优化：核心工作
* 准入：防止退化


[slide]
## 以真实用户体验为标准
----

* 怎样收集用户整个搜索体验时间？ {:&.fadeIn}
* 究竟我们和竞品的差距在哪里？
* js打点得到的数据是用户的真实体验吗？
* 用户的使用习惯真的是我们想象的吗？


<p class="fadeIn"><span>要解答上面问题，就需要利用监控系统来做数据分析！</span></p>

[slide]
## 收集完整搜索体验时间
---------
![搜索流程](/img/speed/http.png)

* 客户端时间 = 客户端打点 {:&.fadeIn}
* 服务器处理 = log id 标注
* 页面渲染时间 = js埋点
* 网络时间 = 首字节-客户端loadUrl-服务器处理

[slide]
## 现状&竞品数据
-----


                | 手机百度 | 竞品        | 数据测算方法  | 解决方法
----------------| --------| ------------| -----------  |----------
点击搜索到首屏展示| 2497ms  | 1222ms      | 上下游统计    | --
客户端耗时       | 882ms   | N/A         | 客户端RD测算  | 精简动画/框架 {:&.fadeIn}
网络+服务器耗时  | 878ms+300ms|608+360ms  | 请求log日志  | 内核/网络/HHVM/chunked {:&.fadeIn}
首屏渲染         | 437ms    | 254ms      | js埋点       | 内核/差异化模板 {:&.fadeIn}

P.S：wifi环境，15日均值

<h3 class="bounceIn"><span>客户端：网络：页面 = </span><span class="yellow">2: 2: 1</span></h3>

[note]
* 解决了第一个疑问：我们究竟和竞品差距在哪里？
* 大家都知道各自分工和差距
* 工作重点
* APP是可以优化自己客户端的
[/note]


[slide]
## js打点能体现用户真实的体验？
----------

<div class="fade">
    <img src="/img/speed/camera.jpg" alt="">
</div>



[slide]
## js打点能体现用户真实的体验？
----------

![](/img/speed/js.png)

[slide]
## 结论
* js打点方式要早于UI展现 {:&.fadeIn}
* 两者走势是match的
* <span class="yellow">有内核反而更差，为什么？</span>
    * <span class="yellow">从“切片”到&lt;paint>标签</span> {:&.fadeIn}

[slide]
## 用户的使用习惯真的是我们想象的吗？
-----
* 用户输入搜索词时间：10s~14s {:&.fadeIn}
* 空sug比例：20%
* 用户很关注进度条
* 底部搜索框使用情况：&lt;5‰

[slide]
## 基于用户使用习惯我们做了什么？
----

* 利用用户输入搜索词时间： DNS预连接
* sug：空sug不发请求，sug预充
* 体验优化

[slide]
## 用户很关注进度条：强迫症吗？
-----

![进度条](/img/speed/8.pic.jpg)



[note]
两个视频
[/note]

[slide]
## 通过实验验证方案
------

* AA实验
* AB实验

[note]
保证数量和性质都一致
[/note]


[slide]
## 底部框sug去除实验
-----

![7.pic.jpg](/img/speed/7.pic.jpg)

[slide]
## 底部框去除后数据
--------

           |A：保留搜索框| B：去除搜索框
-----------|-----------|-----------
页面大小    |125K       | 104K
首屏时间    | 296      | 294
十条结果    |420       | 418
用户可操作  | 970      | 917
总下载时间  | 1331      | 1289

结论：因为代码在非首屏，并不会对首屏造成影响，但是因为代码量的减少，会缩短domready之后的时间

[slide]
## 准入：防止退化，保护成果
--------
利用<em class="yellow">Python+adb+monkey</em>脚本

<div class="fade">
    <img src="/img/speed/6.pic.jpg" alt="">
</div>

[slide]
## 准入：防止退化，保护成果
--------

![6.pic.jpg](/img/speed/client.png)


[slide]
## 结果：高速摄像头测试数据
### 冷启动时间（优化后）
----------
![冷启动时间](/img/speed/lengqidong.png)

手机百度5.0  >  竞品1  > 竞品2 > 竞品3

[slide]
## 结果：高速摄像头测试数据
### 搜索结果（优化后）
----------
![搜索结果](/img/speed/result1.png)

手机百度在稳定性和速度上都超过竞品

[slide]
## 速度项目怎么做？
---------
* 监控+分析：
    * 从全局抓，从大头抓
    * 数据支持理论，不要想当然
* 优化开展：
    * 多团队合作
    * 做好效果评估和原因分析
* 准入系统：
    * 确立标准
    * 防止退化
