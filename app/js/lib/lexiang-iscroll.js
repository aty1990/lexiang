/**
 * Created by sjin on 17/2/28.
 */
define(['$', 'iscroll'], function ($, IScroll) {


  var iscrollBaseConfig = {
    // 设置只能水平滚动
    scrollX: true,
    scrollY: false,

    // 只能水平滑动，上下滑动只会滚动这个页面
    eventPassthrough: true
  };

  /**
   * $('#id').scroll({
   *  pageTarget: '#id',
   *  pageClass: 'className'
   * })
   */
  $.fn['scroll'] = function (options) {
    /**
     * 屏幕宽度
     */
    /*var dpi = window.devicePixelRatio;//获取屏幕分辨率
     var width = sysWidth / dpi;//用系统返回宽度除以分辨率。
     console.log(width);*/
    var width = $(window).width(); // 用jQuery或者zepto获取屏幕宽度的方法最为简单，但是在Android平台上，有时会获取的不准确（为0），从而影响布局。在IOS平台上还是很稳定。
    // var width = document.body.scrollWidth; // scrollWidth获取屏幕宽度还比较准，也比较稳定，但可能会有细微出入。

    return new initScroll(options, $(this), width);
  };

  var initScroll = function (options, $this, width) {
    var $slides = $this.find('.slide'),
        $imgs = $this.find('img'),
        loadedImgs = 0;

    // set width for all  item
    $slides.css({'width': width + 'px'});

    // set width for scroll div
    $this.find('.scroller').css({'width': width * $slides.length + 'px'});

    // 分页标记
    for (var i = 0; i < $slides.length; i++) {
      $(options.pageTarget).append('<i class="app-icon ' + options.pageClass + '"></i>');
    }



    // 分页标记位移
    $(options.pageTarget).css({'margin-left': '-' + ($slides.length * 12) / 2 + 'px'});   // classified 分页元素 位移



    var scroller = new IScroll($this[0], $.extend({
        snap: true,
        snapSpeed: 200,
        indicators: {
            el: $(options.pageTarget)[0],
            resize: false
        }
    }, iscrollBaseConfig,true));

    $imgs.on('load', function () {
      loadedImgs++;
      if (loadedImgs == $imgs.length) {
        setTimeout(function () {
          scroller.refresh();
        }, 15);
      }
    });

    return scroller;
  };

  /**
   * $('#id').scrollGoods({
   *  width: 130,
   *  padding: 12
   * })
   */
  $.fn['scrollGoods'] = function (options) {
    if (!options) options = {};
    if (!options.width) options.width = 130;
    if (!options.padding) options.padding = 12;
    return new initScrollForGoods(options, $(this));
  };

  var initScrollForGoods = function (options, $this) {
    var $slides = $this.find('.slide');

    // set width for all  item
    $slides.css({'width': options.width + 'px'});

    // set width for scroll div
    $this.find('.scroller').css({'width': (options.width + options.padding) * $slides.length + options.padding + 'px'});

    var scroller = new IScroll($this[0], iscrollBaseConfig);

    return scroller
  }

});