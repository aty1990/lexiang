define(['$', 'pm', 'weui'], function ($, PM, WEUI) {

  const orderId = PM.stateParam.orderId,
      $orderEvaluateForm = $('#order-evaluate-form');

  let orderDetail;

  $.httpGet('/order/getOrderDetail', { orderId }).then(function (result) {
    orderDetail = result;
    for (var key in orderDetail) {
      $orderEvaluateForm.find('[name="' + key + '"]').text(orderDetail[key]);
    }
    $orderEvaluateForm.find('.weui-media-box__thumb').attr('src', orderDetail.goodsImage);
  });

  /**
   * 提交评价
   */
  $('#order-evaluate-btn').click(function () {
    const appraisalType = $orderEvaluateForm.find("input[name='appraisalType']:checked").val(),
        note = $orderEvaluateForm.find("[name='note']").html();

    if (appraisalType) {
      $.httpPost('/order/orderAppraisal', {
        buyerWechat: sessionStorage.getItem('openId'),
        wechatName: sessionStorage.getItem('nickname'),
        orderId: PM.stateParam.orderId,
        goodsId: orderDetail.goodsId,
        appraisalType,
        note
      }).then(function () {
        WEUI.toast("评价成功", 1000);
        PM.go('order-history', null, true);
      });
    } else {
      WEUI.toast('请评价订单', 1000);
    }
  });

});