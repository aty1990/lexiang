require(['$', 'const', 'pm', 'drag-refresh'], function ($, CONST, PM, DragRefresh) {
  var stateParam = PM.stateParam;

  var pageNo = 1;
  var noMoreData = false;

  var serverUrl = sessionStorage.getItem('serverUrl');

  var loadData = function (forPage) {
    // 分页情景下, 没有更多数据了, 则不请求了
    if (forPage && noMoreData) {
      return false;
    }

    if (forPage) {
      pageNo++;
    } else {
      pageNo = 1;
    }

    $.httpGet('/appraisal/getAppraisalList.json', {
      goodsId: stateParam.goodsId,
      pageNo: pageNo,
      pageSize: CONST.PAGE_SIZE
    }).then(function (result) {
      if (forPage) {
        if (!result || !result.appraisalList || result.appraisalList.length <= 0) {
          noMoreData = true;
        } else {
          loadMoreData(result);
          if (result.appraisalList.length < CONST.PAGE_SIZE) noMoreData = true;
        }
      } else {
        initComment(result);
      }
    });
  };

  // init first load ...
  loadData();

  var initComment = function (data) {
    var $commentRoot = $('#goods_comment_main');

    var html = `
      <div class="row line-h-45 bg-white">
        <span class="font-orange font-16">好评率:<span id="goods_comment_rate">${data.rate}</span></span>
      </div>
      <div class="goods-comments mgt-10 bg-white" id="goods_comment_list">
        ${getListHtml(data.appraisalList)}
      </div>
    `;

    $commentRoot.html(html);
    DragRefresh.pullUpAndDown({
      moreData: true, element: 'goods_comment_scroller',
      refreshData: function () {
        loadData();
      },
      loadData: function () {
        loadData(true);
        DragRefresh.scrollRefresh();
      }
    });
  };

  var getListHtml = function (list) {
    if (!list) return '';

    var getAppraisalTypeStr = function (type) {
      if (type === 1) {
        return '好评';
      } else if (type === 2) {
        return '中评';
      } else if (type === 3) {
        return '差评';
      } else {
        return '';
      }
    };

    var html = '';
    for (var i = 0; i < list.length; i++) {
      var item = list[i];
      if (!item.note) item.note = '';
      html += `<div class="item">
                <div class="user-img">
                    <img src="${item.headImgUrl ? item.headImgUrl : serverUrl + '/app/img/user-default.png'}" class="img">
                </div>
                <div class="comments-content">
                    <div class="row">
                        <span class="title">${item.nickname ? item.nickname : '匿名评论'}</span>
                        <span class="font-gray font-12">${item.modifyTime}</span>
                    </div>
                    <div class="row">
                        <span class="font-orange font-12">${getAppraisalTypeStr(item.appraisalType)}</span>
                    </div>
                    <div class="row">
                        ${item.note}
                    </div>
                </div>
            </div>`;
    }
    return html;
  };

  var loadMoreData = function (data) {
    // 更新 百分比
    $('#goods_comment_rate').html(data.rate);
    $('#goods_comment_list').append(getListHtml(data.appraisalList));
  }
});


