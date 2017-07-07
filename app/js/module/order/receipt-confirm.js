define(['$', 'pm', 'weui'], function ($, PM, WEUI) {

  const orderId = PM.stateParam.orderId,
      $ReceiptConfirmForm = $('#receipt-confirm-form');

  $.httpGet('/order/getOrderDetail', { orderId }).then(function (orderDetail) {
    for (var key in orderDetail) {
      $ReceiptConfirmForm.find('[name="' + key + '"]').text(orderDetail[key]);
    }
    $ReceiptConfirmForm.find('.weui-media-box__thumb').attr('src', orderDetail.goodsImage);
  });

  /*
   * 确认收货并跳转到订单评价页面
   */
  $('#receipt-confirm-btn').click(function () {
    $.httpPost('/order/confirmReceived', {
      buyerWechat: sessionStorage.getItem('openId'),
      orderId: orderId
    }).then(function () {
      WEUI.toast("确认收货", 1000);
      PM.go('order-evaluate', { orderId }, true);
    });
  });

});