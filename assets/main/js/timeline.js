(function(window, document) {
    var emptyArr = [];

    function toArray(arrayLike) {
        return emptyArr.slice.call(arrayLike);
    }
    /**
     * times = [
     *     {year: xxx,title:xxx,content:xxx, date:xx,}
     * ];
     */
    /**
     * [TimeLine description]
     * @param {[type]} opts [description]
     */
    function TimeLine(dom, times) {
        if (Array.isArray(dom)) {
            times = dom;
            dom = document.body;
        }
        this.times = times || [];
        var length = this.times.length;

        this.eachLen = 100 / (length + 1);
        this.container = dom || document.body;
        var $div = document.createElement('div');
        $div.innerHTML = this.html();
        this.container.appendChild($div);
        this.bindEvent();
    }

    TimeLine.prototype.html = function() {
        var dotHtml = ['<div class="J-timeline">'];
        var contentHtml = ['<div class="J-tl-content">'];
        var id = +(Date.now() + '').slice(-3);
        var eachLen = this.eachLen;
        this.times.forEach(function(v, i) {
            var _id = id + i;
            dotHtml.push('<div class="J-tl-dot" id="J-tl-' + _id + '" style="left:' + (eachLen * (i + 1)) + '%;background-color:' + v.color + '" data-year="' + v.year + '"><span></span><date>' + v.year + '</date></div>');
            contentHtml.push('<article class="J-tl-modal" id="J-tl-' + _id + '-con">' + v.content + '</article>');
        });
        dotHtml.push('<div class="J-tl-inside"></div></div>');
        contentHtml.push('</div>');
        return dotHtml.join('\n') + contentHtml.join('\n');
    };
    TimeLine.prototype._get = function(selector) {
        return toArray(this.container.querySelectorAll(selector));
    };
    TimeLine.prototype.showYear = function(year) {
        var event = document.createEvent('MouseEvents');
        event.initEvent('click', true, true);
        var dom = this._get('[data-year="' + year + '"]')[0];
        dom && dom.dispatchEvent(event);
    };
    TimeLine.prototype.reset = function() {
        this.hideAll();
        var $inside = this._get('.J-tl-inside')[0];
        $inside.style.width = 0;
    };
    TimeLine.prototype.hideAll = function() {
        var contents = this._get('article.J-tl-modal');
        contents.forEach(function(v) {
            v.classList.remove('J-tl-fadeIn');
        });
    };
    TimeLine.prototype.bindEvent = function() {
        var eachLen = this.eachLen;
        var $inside = this._get('.J-tl-inside')[0];
        var contents = this._get('article.J-tl-modal');

        this._get('.J-tl-dot').forEach(function(dom, i) {
            dom.addEventListener('click', function(i) {
                return function() {
                    $inside.style.width = eachLen * i + '%';
                    var id = dom.id + '-con';
                    var $dom = document.getElementById(id);
                    var $style = $dom.style;
                    hideAll(id);
                    $dom.classList.add('J-tl-fadeIn');
                };
            }(i + 1), true);
        });

        function hideAll(id) {
            contents.forEach(function(v) {
                if (v.id === id) {
                    return;
                }
                v.classList.remove('J-tl-fadeIn');
            });
        }
    };
    window.TimeLine = TimeLine;
}(window, document));
