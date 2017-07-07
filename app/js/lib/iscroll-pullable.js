;define(['$', 'iscroll'], function ($, IScroll) {

  var _IScroll = function (el, options, pullDownFn, pullUpFn) {
    options = options || { probeType: 3 };

    var scroller = new IScroll(el, options),
        $scrollerEl = $(scroller.scroller);

    $scrollerEl.before('<div class="pull-down"><i class="pull-down-icon app-icon comm-pull-down"></i><div class="pull-down-label">下拉刷新</div></div>');
    $scrollerEl.after('<div class="pull-up"><i class="pull-up-icon app-icon comm-pull-down"></i><div class="pull-up-label">上拉加载</div></div>');

    var $pullDown = $scrollerEl.prev(),
        $pullUp = $scrollerEl.next();

    scroller.on('scroll', function () {
      var height = this.y,
          bottomHeight = this.maxScrollY - height;

      if (height > 0 && height <= 60 && !this._isPullDown) {
        $pullDown.css('top', (height - 60) + 'px');
      }

      if (bottomHeight > 0 && bottomHeight <= 60 && !this._isPullUp) {
        $pullUp.css('bottom', (bottomHeight - 60) + 'px');
      }

      if (height > 60 && !this._isPullDown) {
        this._isPullDown = true;
        $pullDown.find('.pull-down-label').text('释放刷新');
        $pullDown.find('.pull-down-icon').addClass('comm-refresh');
      }

      else if (bottomHeight > 60 && !this._isPullUp) {
        this._isPullUp = true;
        $pullUp.find('.pull-up-label').text('释放加载');
        $pullUp.find('.pull-up-icon').addClass('comm-refresh');
      }
    });

    scroller.on('scrollEnd', function () {
      $pullDown.css('top', '-60px');
      $pullUp.css('bottom', '-60px');

      if (this._isPullDown) {
        this._isPullDown = false;
        $pullDown.find('.pull-down-label').text('下拉刷新');
        $pullDown.find('.pull-down-icon').removeClass('comm-refresh');

        if ($.isFunction(pullDownFn)) pullDownFn.call(this);
      }
      else if (this._isPullUp) {
        this._isPullUp = false;
        $pullUp.find('.pull-up-label').text('上拉加载');
        $pullUp.find('.pull-up-icon').removeClass('comm-refresh');

        if ($.isFunction(pullUpFn)) pullUpFn.call(this);
      }
    });

    return scroller;
  };

  return _IScroll;

});