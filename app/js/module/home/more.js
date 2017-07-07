/**
 * Created by sjin on 17/2/28.
 */
require(['$', 'pm', 'weui'], function ($, PM, WEUI) {

  $.httpGet('/goods/getGoodsByClassId.json', {classId: PM.stateParam.classId}).then(function (result) {
    if (result.length > 0) {
      addData(result);
    } else {
      WEUI.toast('暂无商品出售', {
        duration: 3000,
        callback: function () {
          history.back();
        }
      });
    }
  });

  var addData = function (list) {
    var $target = $('#home_more');

    var html = '';
    for (var i = 0; i < list.length; i++) {
      var item = list[i];
      if (!item.saleAmount) item.saleAmount = 0;
      html += `<div class="item" data-id="${item.goodsId}">
            <div class="bg-white pdb-8 item-active">
                <div class="img">
                    <img src="${item.smallImage}" alt="">
                </div>
                <div class="title">${item.goodsName}</div>
                <div class="detail">
                    <span>已售${item.saleAmountDesc}件</span>
                    <span class="money">
                        <span class="discount">${((item.groupPriceStr/item.priceStr)*10).toFixed(1)}折</span>
                        <span class="rmb">${item.groupPriceStr}</span>
                    </span>
                </div>
            </div>
        </div>`;
    }
    $target.append(html);

    $target.on('tap', '.item', function (){
      PM.go('goods', {'goodsId': $(this).data('id')});
    })
  };
});


