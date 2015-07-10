title: 移动适配和切图方案
speaker: 三水清
url: //cms.m.baidu.com/fe
transition: slide1
theme: moon


[slide]
# 移动适配和切图方案

[slide]
## 三个问题
----
* 高清屏
* 宽高计算
* 字体计算

[slide]
# 先说下设备像素比

[slide]
# dpr：设备像素比

<h2 class="fadeIn"><b class="text-warning">window.devicePixelRatio</b></h2>
<h2 class="fadeIn"><b class="text-warning">&lt;meta type="viewport"&gt;</b><b class="text-danger">content</b></h2>

[slide]
## dpr：设备像素比
![设备像素比](/assets/flexible/dpr.gif)

[slide]
# <span class="yellow">所以。。</span>
## <span class="yellow">640px的宽度在<span class="red">dpr=2</span>的宽度在的屏上长度是320px</span>

[slide]
# REM 是什么

[slide]
## em vs rem
---------
<div class="columns-2">
    <div style="font-size: 20px;">
        <ul class="">
            <li>这是20px字体</li>
            <li style="font-size: 1em">这是1em的字体</li>
            <li style="font-size: 1.5em">这是1.5em的字体
                <ul class="">
                    <li style="font-size: 1.2em">这是1.2em的字体</li>
                </ul>
            </li>
        </ul>
    </div>
    <div style="font-size: 20px;">
        <ul class="">
            <li>这是20px字体</li>
            <li style="font-size: 1rem">这是1rem的字体</li>
            <li style="font-size: 1.5rem">这是1.5rem的字体
                <ul class="">
                    <li style="font-size: 1.2rem">这是1.2rem的字体</li>
                </ul>
            </li>
        </ul>
    </div>
</div>

[slide]

<h1><span class="text-danger">R</span>EM</h1>
<h2 class="fadeIn"><b class="text-warning">document.documentElement</b></h2>
<h2 class="fadeIn"><b class="text-warning">&lt;HTML&gt;的</b><b class="text-danger">font-size</b></h2>

[slide]
# 扫完盲，直接说结论

[slide]
## 结论
----

* 布局使用：rem
* 字体使用百分比

[slide]
## 设置html的font-size
### 用于rem基准值
-----
```js
var docEl = document.documentElement;
var width = docEl.getBoundingClientRect().width;
var rem = width / 10;
docEl.style.fontSize = rem + 'px';
```

页面head顶部引入`flexible.js`

[slide]
## 设置body的font-size
### 用于页面字体基准值
-----

```sass
[data-dpr="1"] body{
    font-size: $font-baseline;
}
[data-dpr="2"] body{
    font-size: $font-baseline * 2;
}
[data-dpr="2.5"] body{
    font-size: $font-baseline * 2.5;
}
[data-dpr="2.75"] body{
    font-size: $font-baseline * 2.75;
}
[data-dpr="3"] body{
    font-size: $font-baseline * 3;
}
```

[slide]
<h1 class="red">页面宽高和字体怎么计算？</h1>
<ul class="yellow bounceIn">
    <li>根据设计稿宽度设置baseline</li>
    <li>根据标注<b class="blue">原比例</b>切图</li>
</ul>

[slide]
## bsass的两个mixin
----

```sass
@import 'bsass/base';
$rem-baseline: 64px;
$font-baseline: 12px;
.demo{
    @include rem(padding, 20px 30px);
    @include rem(height, 200px);
    //文字需要提前除以dpr
    @include fontsize(14px);
}
```

[slide]
![标注图](/assets/flexible/mark.png)

[slide]
<h1 class="red">$rem-baseline 怎么定？</h1>
<h2 class="yellow"><span>根据视觉稿宽度/2</span></h2>

[slide]
<h1 class="red">$font-baseline 怎么定？</h1>
<h2 class="yellow"><span>统一设置为12px！？</span></h2>
