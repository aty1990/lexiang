define(['$', 'const', 'pm', 'iscroll-pullable'], function ($, CONST, PM, IScrollPullable) {

  let pageNo = 1,
      hasMore = true;

  let $page = $('.order-history'),
      $orderList = $page.find('.order-list'),
      $orderListScroller = $orderList.children();

  let orderScroller = new IScrollPullable(
      $orderList[0], null,
      function () {
        pageNo = 1;
        hasMore = true;
        loadOrderHistory();
      },
      function () {
        loadOrderHistory();
      }
  );

  $orderList.on('tap', "[name='orderDetail']", function (e) {
    e.stopPropagation();
    PM.go('order-detail', {orderId: $(this).data('orderId')});
  });

  loadOrderHistory();

  function loadOrderHistory () {
    if (hasMore) {
      $.httpGet('/order/getOrderList', {
        buyerWechat: sessionStorage.getItem('openId'),
        tabStatus: 77,  // 只查询已完成和已关闭状态的订单
        pageNo: pageNo,
        pageSize: CONST.PAGE_SIZE
      }).then(function (orderList) {

        hasMore = false;

        if (Array.isArray(orderList) && orderList.length > 0) {
          $orderListScroller[pageNo > 1 ? 'append' : 'html'](orderList.map(function (order) {
            return getOrderTpl(order);
          }).join(''));

          setTimeout(function () {
            orderScroller.refresh();
          }, 15);

          if (orderList.length == CONST.PAGE_SIZE) {
            pageNo++;
            hasMore = true;
          }
        }
      });
    }
  }

  function getOrderTpl (data) {
    return `
        <div class="order-item mgb-12">
          <div class="main">
            <div class="weui-flex">
              <i class="app-icon order-lx-mall mgr-4"></i>
              <span>乐享商城</span>
            </div>
            <div class="text-orange">${data.orderCode}</div>
          </div>
          <div class="detail">
            <a class="weui-media-box weui-media-box_appmsg" name="orderDetail" data-order-id=${data.orderId}>
              <div class="weui-media-box__hd">
                <img class="weui-media-box__thumb"
                    src="${data.goodsImage ? data.goodsImage : '//app/img/order/goods-exp.png'}">
              </div>
              <div class="weui-media-box__bd">
                <div class="head">
                  ${data.goodsName}
                  ${data.orderStatusStr ? '<span class="group-icon">' + data.orderStatusStr + '</span>' : ''}
                </div>
                <div class="content">
                  <div class="mgt-8">
                    <span class="font-red">
                      <span style="font-size:12px;">¥</span>
                      ${data.salePriceYuan}
                    </span> × ${data.quantity}
                    <span class="float-right">${data.createTime}</span>
                  </div>
                </div>
              </div>
            </a>
          </div>
          <div class="pd-all-12 order-total">
            <span>合计：<span style="font-size:12px;">¥</span> ${data.saleMoneyYuan}</span>
          </div>
        </div>
    `;
  }

});