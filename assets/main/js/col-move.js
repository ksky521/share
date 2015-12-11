(function(window) {
    var emptyArr = [];

    function toArray(arrayLike) {
        return emptyArr.slice.call(arrayLike);
    }

    var Box = function(container, domSelector, inClass, outClass) {
        this.inClass = inClass;
        this.outClass = outClass;
        this.doms = this._get(domSelector);
        this.length = this.doms.length;
        this.container = container;
        this.done = false;
        this.curStep = 0;
    };
    Box.prototype._get = function(selector) {
        return toArray(this.container.querySelectorAll(selector));
    };
    Box.prototype.step = function(dir) {
        // dir===-1||1;
        var old = this.curStep
        this.curStep = this.curStep + dir;
        if (this.length === this.curStep) {
            this.done = true;
            return this;
        } else {
            this.done = false;
        }
        var curList = this.doms[this.curStep].classList;
        cur.add(this.inClass);
        cur.remove(this.outClass);
        curList = this.doms[old].classList;
        curList.remove(this.inClass);
        curList.add(this.outClass);

        return this;
    };
}(window));
