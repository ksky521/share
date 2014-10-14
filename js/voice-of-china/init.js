window.addEventListener('load', function() {
    var stage = new Stage('canvas');

    function start() {
        var starNum = random(1, 2);
        var startTime = 7000 / starNum;

        for (var i = 0; i < starNum; i++) {
            stage.timeline({
                startTime: startTime * i,
                endTime: startTime * i + 1500,
                beforeStart: function(d) {
                    var x = Math.min(stage.width - 40, random(0, 4) * 60 + random(35, 60));
                    var y = Math.min(stage.height - 40, random(0, stage.height / 60 - 1) * 60 + random(35, 60));
                    var star = new Star(x, y);
                    d.star = star;
                    stage.addSprite(star);
                },
                afterEnd: function(d) {
                    // d.star.setAni('flash');
                    stage.removeSprite(d.star);
                    d.star = null;
                }
            });
        }

        stage.timeline({
            startTime: 7000,
            endTime: 10000,
            beforeStart: function(d) {
                var x = Math.min(stage.width - 70, random(0, 2) * 120 + random(60, 120));
                var y = Math.min(stage.height - 70, random(0, stage.height / 100 - 1) * 100 + random(60, 120));
                var boss = new Boss(x, y);
                d.boss = boss;
                stage.addSprite(boss);
            },
            afterEnd: function(d) {
                stage.removeSprite(d.boss);
                d.boss = null;
            }
        }).init().play();
        update();
    }
    document.getElementById('start').addEventListener('click', function() {
        start();
    }, false);

    function update() {
        if (stage.duration > 10000) {
            stage.stop();
            if (stage.hits < 80) {
                stage.sound.play('level1');
            } else if (stage.hits < 150) {
                stage.sound.play('level2');
            } else if (stage.hits < 250) {
                stage.sound.play('level3');
            } else if (stage.hits >= 250) {
                stage.sound.play('level4');
            }
            alert('游戏结束，共点击：' + stage.hits);
            return;
        }
        requestAnimationFrame(update);
        stage.update();
    }
    // window.stage = stage;
}, false);
