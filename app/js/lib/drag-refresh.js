/**
 * Created by rain on 17/3/1.
 */
define(['$', 'iscroll'], function ($, IScroll) {
  var pullDownEl, pullUpEl, pullDownIcon, pullUpIcon, pullDownLabel, pullUpLabel, myScroll;

  var pullUpAndDown = function ($param) {
    if (!$param) return;

    var $element = $('#' + $param.element);
    pullDownEl = $element.find('.pull-down') || [];
    pullUpEl = $element.find('.pull-up') || [];
    pullDownIcon = $element.find('.pull-down-icon') || [];
    pullUpIcon = $element.find('.pull-up-icon') || [];
    pullDownLabel = $element.find('.pull-down-label')[0] || [];
    pullUpLabel = $element.find('.pull-up-label')[0] || [];

    pullDownEl.hide();
    pullUpEl.hide();

    myScroll = myScroll ? myScroll : new IScroll('#' + $param.element);

    myScroll.on('refresh', function () {
      if (pullDownEl != [] && 'loading' == pullDownEl.attr('process')) {
        pullDownEl.removeAttr('process');
        setTimeout(function () {
          pullDownEl.hide();
        }, 1000);
      } else if (pullUpEl != [] && 'loading' == pullUpEl.attr('process')) {
        pullUpEl.removeAttr('process');
        setTimeout(function () {
          pullUpEl.hide();
        }, 1000);
      }
    });

    myScroll.on('scrollEnd', function () {
      if (pullDownEl != [] && 'flip' == pullDownEl.attr('process')) {
        pullDownEl.attr('process', 'loading');
        pullDownIcon.attr('class', 'app-icon comm-refresh');
        pullDownLabel.innerHTML = '数据刷新中';
        pullDownEl.show();
        if ($param.refreshData) $param.refreshData();
        myScroll.refresh();

      } else if (pullUpEl != [] && 'flip' == pullUpEl.attr('process')) {
        pullUpEl.attr('process', 'loading');
        pullUpIcon.attr('class', 'app-icon comm-refresh');
        pullUpLabel.innerHTML = '数据加载中';
        pullUpEl.show();
        if ($param.moreData) {
          $param.loadData();//必须在得到结果出重新刷新渲染元素，由于异步只能在外围函数调用返回处刷新
        } else {
          myScroll.refresh();
        }
      }
    });

    myScroll.on('scrollStart', function () {
      if (pullDownEl != [] && this.y >= 0 && this.directionY == -1) {
        pullDownEl.attr('process', 'flip');
        pullDownLabel.innerHTML = '释放即可刷新';
        pullDownIcon.attr('class', 'app-icon comm-pull-down');
        pullDownEl.show();
      } else if (pullUpEl != [] && this.y <= this.maxScrollY && this.directionY == 1) {
        pullUpEl.attr('process', 'flip');
        pullUpIcon.attr('class', 'app-icon comm-pull-down');
        pullUpLabel.innerHTML = '释放即可加载';
        pullUpEl.show();
      }
    });

  };

  var scrollTop = function () {//跳转到最开始
    myScroll.scrollTo(0, 0);
    myScroll.refresh();
  };

  var scrollDestroy = function () {//销毁
    if (myScroll) {
      myScroll.destroy();
      myScroll = null;
    }
  };

  var scrollRefresh = function () {//刷新
    myScroll.refresh();
  };

  return {
    'pullUpAndDown': pullUpAndDown,
    'scrollTop': scrollTop,
    'scrollDestroy': scrollDestroy,
    "scrollRefresh": scrollRefresh
  };
});