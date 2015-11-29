var delayImages = [];

function loadDelayImages() {
    var imgs = ['loading0@2x.png', 'loading1@2x.png', 'loading2@2x.png', 'loading3@2x.png'];
    for (var i = 0; i < imgs.length; i++) {
        var img = new Image();
        img.src = 'img/voice-of-china/' + imgs[i];
        delayImages.push(img);
    }
}
var delay0Timer, delay1Timer;

function delay0() {
    var canvas = document.getElementById('delay0');
    var ctx = canvas.getContext('2d');
    var index = 0;

    function start() {
        // console.log(1);
        delay0Timer = requestAnimationFrame(start);
        if (index === delayImages.length) {
            index = 0;
        }

        ctx.clearRect(0, 0, 320, 200);
        ctx.drawImage(delayImages[index], 0, 50);
        index++;
    }
    start();

}

function delay1() {
    var fps = 5,
        lastTime = 0,
        index = 0;
    var durtion = 1000 / fps;
    var canvas = document.getElementById('delay1');
    var ctx = canvas.getContext('2d');

    function start() {
        delay1Timer = requestAnimationFrame(start);
        var now = Date.now();
        if (now - lastTime < durtion) {
            return;
        }
        lastTime = now;
        if (index === delayImages.length) {
            index = 0;
        }
        ctx.clearRect(0, 0, 320, 200);
        ctx.drawImage(delayImages[index], 0, 50);
        index++;
    }
    start();
}

function clearDelay() {
    delay0Timer && cancelAnimationFrame(delay0Timer);
    delay1Timer && cancelAnimationFrame(delay1Timer);
}
$('delay0btn').addEventListener('click', delay0, false);
$('delay1btn').addEventListener('click', delay1, false);


function $(id) {
    return document.getElementById(id);
}
