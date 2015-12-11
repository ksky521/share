(function() {
    var show = false;
    var TL;

    function showTimeline() {
        if (show) {
            return;
        }
        show = true;
        var container = document.getElementById('timeline');
        TL = new TimeLine(container, [{
            year: 2013,
            color: '#e74c3c',
            content: '<date class="text-danger">人数：1→4，男女比例1：3</date><h3>13年底开始</h3><ol><li>搜索结果页速度优化</li>' +
                '<li>13年年底开始Bdbox和FIS-plus迁移</li><li>父子模板分离</li></ol>'
        }, {
            year: 2014,
            color: '#7b3',
            content: '<date class="text-danger">人数：4→3→4，男女比例1：1</date><h3>积累到爆发</h3><ol><li>静态资源管理方式探索</li><li>渲染模式：inline,tag,combo</li><li>chrome调试插件</li><li>组件化方案：components</li><li>运营活动API平台</li><li>Stalker监控系统</li><li>文档建设</li></ol>'
        }, {
            year: 2015,
            color: '#E4D03C',
            content: '<date class="text-danger">人数：4→9+3，男女比例1：6</date><h3>团队扩大，业务增多</h3><ol><li>新的打包工具</li><li>Tiny平台</li><li>rem切图方案</li><li>bsass正式使用</li></ol>'
        }]);
    }



    var nextYear = 2012;
    window.nextTimeline = function(e) {
        if (e.direction === 'prev') {
            nextYear--;
        } else {
            nextYear++;
        }
        if (e.direction === 'prev') {
            if (nextYear >= 2013) {
                TL.showYear(nextYear);
                e.stop();
            } else if (nextYear == 2012) {
                TL.reset();
                e.stop();
            } else if (nextYear < 2012) {
                nextYear = 2012;
            }
        } else if (e.direction === 'next') {
            if (nextYear <= 2015) {
                TL.showYear(nextYear);
                e.stop();
            } else if (nextYear >= 2016) {
                nextYear = 2015;
            }

        }
    };
    window.showTimeline = showTimeline;
}(window));
