title: 好声音项目分享（游戏部分）
speaker: 三水清
url: https://github.com/ksky521/nodePPT
transition: move
files: /js/requestAnimationFrame.js,/js/voice-of-china.js,/js/voice-of-china/game.js,/js/voice-of-china/init.js
date: 2013年10月29日

[slide style="background-image:url('/img/bg1.png')"]

# 好声音项目分享
## 游戏部分

[slide]

{:.flexbox.vcenter}

<canvas id="canvas" width="320" height="400" style="border:1px solid #ccc;background:#222222"></canvas>
<center><button id="start">开始</button></center>

[slide]
## 动画基础
----

* 60fps: 1000ms/60 ≈ 16ms
* requestAnimationFrame __V.S__ setInterval/Timeout
* 动画处理：
    * 保总时间
    * 保总帧数

[slide data-incallback="loadDelayImages" data-outcallback="clearDelay"]

[note]
本次游戏只有一个计时器，所有精灵都是在一个计时器中做动画，需要处理不同精灵的fps
[/note]
## 延时：保帧数的策略
---
<div class="columns-2">
    <div style="width:45%"><button id="delay0btn">开始0</button></div>
    <div style="width:45%">
        <button id="delay1btn">开始1</button>
    </div>
</div>
<div class="columns-2">
    <canvas id="delay0" width="320" height="150" style="border:1px solid skyblue;"></canvas>
    <canvas id="delay1" width="320" height="150" style="border:1px solid skyblue;"></canvas>
</div>


[slide]
## 延时代码
---
```javascript
var fps = 5, lastTime = 0, index = 0;
var durtion = 1000 / fps;
function start() {
    requestAnimationFrame(start);
    var now = Date.now();
    if (now - lastTime < durtion) {
        return;
    }
    lastTime = now;
    index = index === delayImages.length ? 0 : index;
    ctx.clearRect(0, 0, 320, 200);
    ctx.drawImage(delayImages[index], 0, 50);
    index++;
}
start();
```


[slide]
## 主要文件
----
* stage.js：舞台
* circle.js：点击圆圈效果
* sprite.js：精灵类
    * star.js：星星
    * boss.js：钻石
        * quoit.js：钻石光晕
* pool.js：对象池
* howler：声音管理

[slide]
## 一些约定
-----

* 每个类都有destroy方法<span class="blue2"> → 内存管理</span> {:&.moveIn}
* 每个精灵都有update方法<span class="blue2"> → 每帧管理</span>
* 每个精灵都有evtClick方法<span class="blue2"> → 点击管理</span>
* 唯一计时器<span class="blue2"> → 游戏控制stop/pause。。</span>
* Stage是”唯一接口人“
* 链式<span class="blue2"> → return this 成习惯</span>
* 游戏效果可配置<span class="blue2"> → 应对需求变更</span>

[slide]
## Stage：中央处理器
-----
* 时间控制：
    * timeline
    * duration
* 游戏控制
    * play/pause/stop
    * reset
    * score
    * sound
* canvas控制
    * clearRect
    * update

[slide]
## Stage：中央处理器
-----
* 事件管理
    * **[handleEvent](http://js8.in/983.html)**
    * on/off/fire
* 精灵管理
    * 通过数组统一管理
    * [update/add/remove]Circle
    * [add/remove]Sprite

[slide]
## Stage.update
---
* 清理画布
* 处理timeline
* 处理精灵类，Sprite.update
    * 参数：canvas 2D上下文，stage本身
    * 精灵获取当前帧的切片信息，drawImage
    * 状态是否过期
* 处理circle
* 触发其他update事件：this.fire('update', [ctx, this]);

[slide]
## Stage.touchstart
---
* 播放点击音效
* 计算touch点坐标
* 处理精灵类，Sprite.evtClick
    * 参数：传递坐标、stage
    * 判断是否点中
    * 修改状态、加分处理
* 添加circle点

[slide]
## Sprite：精灵类
-----
* 私有属性
    * 大小/坐标/位移速度
    * 状态：isLive
    * frames/curAnimate
    * timeout/duration
* 公共方法
    * update
    * getUpdateData
    * set[X/Y/SpeedX/SpeedY/FPS/Ani]
    * destroy/canDestroy/isTimeout
    * evtClick：emptyFn

[slide]
### Sprite 部分代码
```javascript
var Sprite = function(data) {
    //名称
    this.name = data.name;
    // 大小
    this.width = data.width;
    this.height = data.height;
    // ...
};
Sprite.prototype = {
    constructor: Sprite,
    imgURL: './sprite.png',
    canDestroy: function() {
        return !this.isLive;
    },
    init: function(){}
};
```

[slide]
### frames：动画帧相关信息
----
```javascript
var frames = {
    normal: {
        fps: 30,//帧数
        times: 0,//执行次数
        data: [
            [0, 0, 68, 68]//切片数据
        ]
    },
    touch: {
        fps: 3,
        times: 1,
        data: [
            [77, 1, 99, 88]
        ]
    }
}
```
[slide]
### 一个复杂的frames
----
```javascript
var enter = {
    fps: 100,
    times: 1,
    data: [
        [0, 0, 68, 68, 8, 8],
        [0, 0, 68, 68, 16, 16],
        [0, 0, 68, 68, 26, 26],
        [0, 0, 68, 68, 38, 38],
        [0, 0, 68, 68, 52, 52],
        [0, 0, 68, 68, 68, 68],
        [0, 0, 68, 68, 86, 86],
        [0, 0, 68, 68, 106, 106],
        [0, 0, 68, 68, 68, 68]
    ]
}
```

[slide]
## Star 和 Boss
---
* 继承Sprite类
* 比较简单
* evtClick
* frames
* nextAni

[slide]
### Star 继承 Sprite类
```javascript
var Star = function(x, y) {
    this.x = x;
    this.y = y;
    this.duration = 0;
    this.init('enter');
}
Star.prototype = new Sprite({
    name: 'Star',
    width: 67,
    height: 67,
    curAnimate: 'enter',
    frames: {
        // ...
    }
});
Star.prototype.constructor = Star;
```

[slide]
## Circle
---
* 比较简单
* update
* duration
* 主要是半径/颜色等控制

[slide]
## 性能优化
----
* 利用 requestAnimationFrame 避免无用功
    * 点击事件只是计算精灵状态
    * 点击事件只是添加点
* 对象池
* 内存回收
    * 通过约定destroy销毁对象

[slide]
## Pool：对象池
----
两个不同的状态组成的数组：

* 释放：freeObjArr
* 繁忙：busyObjArr

当游戏开始的时候，将需要用到的内容都 **实例化** 放在 ``freeObjArr``；

需要使用的时候，从 ```freeObjArr``` “捞”一个出来放在 ```busyObjArr``` 使用；

用完从 ```busyObjArr``` “捞出来，”扔”会 ```freeObjArr```。

[slide]
## 对象池的使用
----
```javascript
this.circlePool = new Pool({
    min: 1,
    max: 10,
    objectCreater: function() {
        return new Circle();
    }
});
//addCirlce
var circle = circlePool.getOne();
//removeSprite(circle);
circlePool.freeOne(circle);
```

[slide]
## 声音控制
----
## audio局限性

* 音频编码 {:&.rollIn}
* 音量
* 跨域
* 预加载：需要主动触发规定事件
* 单一性

<h2 class="moveIn"><span>解决方案</span></h2>

* 声音sprite {:&.moveIn}
* GoldWave处理成一条声音
* 输出不同编码格式

[slide]
## howler
### 纯属偷懒，所以选择了一个开源的sound sprite库
----

* 全端！
    * 太全！竟然使用了AudioContext
    * 太大！min文件9K，整个游戏20K

[slide]
## 结果。。。
----
  因为android对声音处理迟钝，所以android就不添加；

  后期阿拉丁时间紧，对audio预加载没有处理好，功能没上线


