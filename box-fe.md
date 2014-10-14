title: 手机百度前端技术述职
speaker: 王永青
url: http://fe.baidu.com/doc/kuang/
transition: cards

[slide]

# 手机百度前端技术述职

[slide]
## 框前端业务介绍
----

* 框页面：searchbox模块
* 框轻量版，承载落地页、活动页面：xbox模块
* 运营活动平台化：po/cms
* 特权中心模块，框用户特权领取分发

[slide]
## 前端改造推进方案
----
* 新模块，小模块先改造
    * xbox和po先做
    * searchbox后改造
    * 具体产品随主线逐个重构
* 统一前端通用模块
    * 通用模块以svn外链形式管理
    * 常用代码模块化
    * android/ios私有代码抹平差异，统一接口

[slide]
## 规范 & 文档
-----
* 编码规范 {:&.build}
* 目录结构规范
* php template类改造（xbox完成）
* 基础库文档（自动产出）

[slide]
## 现有解决方案
-----
* 编码 {:&.build}
* 工程化，自动化
* 开发调试

[slide]
## 现有解决方案：编码
-----
* AMD模块化库：Bdbox {:&.build}
* 业务层命名空间管理库：Box
* 父子模板拆分，方便抽样、监控和统一解决方案修改

[slide]
## 现有解决方案：工程化，自动化
-----
* localstorage细粒度存储 {:&.build}
* 前端监控系统：速度、js错误收集
* smarty插件：require、widget、html
* AMD模块自动按需打包
* 内嵌和外链可配

[slide]
## 现有解决方案：开发调试
-----
* chrome插件：解决客户端接口调试 {:&.build}
* 基于FIS的本地调试，数据模拟
* 测试机odp改造，支持FIS调试
* 线上第一台odp改造，支持数据调试

[slide]
## todolist
----
* 摸底客户端各webview实现差异 {:&.build}
* localstorage多维度缓存
* 代码部署流程改造（本机对本机）
* 编译改造：jshint语法规范检测
* 静态资源cdn-combo解决方案
* 根据网络速度和类型前端自动适配方案
* 结合后端php做抽样和模板组件化
* 推动UI设计标准、icon统一、交互统一
* Sass的推广
* 根据机型降级

