define(['$', 'pm', 'const'], function ($, PM, CONST) {

  var $orderDetailForm = $('#orderDetailForm');

  $.httpGet('/order/getOrderDetail.json', {orderId: PM.stateParam.orderId}).then(function (orderDetail) {

    /*for (var key in orderDetail) {
      $orderDetailForm.find('[name="' + key + '"]').text(orderDetail[key]);
    }*/

    $orderDetailForm.html(getOrderTpl(orderDetail));

    if (orderDetail.orderType == 1) {//个人订单
      showGroupHtml(false, true, true);
    } else if (orderDetail.orderType == 2 && orderDetail.groupStatus == 1) {  // 拼团中
      showGroupHtml(true, false, true);
      var countdown = getCountdown(orderDetail.createTime, orderDetail.hourLimit);
      if (countdown > 0) {
        $orderDetailForm.find('[name="needTime"]').text(formatCountdown(countdown, true));
      } else {
        $orderDetailForm.find('[name="needTime"]').text(0);
      }
      countdownTimer();
    } else {//拼团成功或失败
      showGroupHtml(true, true, false);
    }

    // 已关闭订单隐藏拼团信息
    if (orderDetail.orderStatus == CONST.ORDER_STATE.CLOSED) {
      $('.group-purchase-info').hide();
    }
  });

  var showGroupHtml = function (t1, t2, t3) {
    t1 ? $orderDetailForm.find('[name="group-no"]').hide() : $orderDetailForm.find('[name="group-no"]').show();
    t2 ? $orderDetailForm.find('[name="group-in"]').hide() : $orderDetailForm.find('[name="group-in"]').show();
    t3 ? $orderDetailForm.find('[name="group-done"]').hide() : $orderDetailForm.find('[name="group-done"]').show();
  };

  // 根据 创建时间和有效期,获得剩余时间  返回单位 毫秒
  var getCountdown = function (createTime, hourLimit) {
    var createTime = +(new Date(createTime.replace(/-/g, '/')));
    var now = +(new Date());
    var ssLimit = parseInt(hourLimit) * 3600000;   // 小时转毫秒    *60*60*1000

    var endTime = createTime + ssLimit;   // 结束时间戳

    var countdown = endTime - now;  // 剩余时间
    return (countdown <= 0) ? 0 : countdown;
  };

  // 根据  x天x:x:x 的格式返回  秒
  var getCountdownForStr = function (str) {
    var ss = 0, mm = 0, hh = 0, dd = 0;
    if (str.includes('天')) {
      var timeArr = str.split('天');
      dd = timeArr[0];
      var timeArr2 = timeArr[1].split(':');
      hh = timeArr2[0];
      mm = timeArr2[1];
      ss = timeArr2[2];
    } else {
      var timeArr = str.split(':');
      hh = timeArr[0];
      mm = timeArr[1];
      ss = timeArr[2];
    }
    ss = parseInt(ss);
    if (dd) ss += parseInt(dd * 86400);   // 24*3600
    if (hh) ss += parseInt(hh * 3600);
    if (mm) ss += parseInt(mm * 60);
    return ss;
    // return str.split(':');
  };

  // 格式化 剩余时间, 传入单位 毫秒,
  var formatCountdown = function (countdown, forDay) {
    function prefixInteger(num) {
      return (Array(2).join(0) + num).slice(-2);
    }

    if (countdown > 0) {
      var ss = parseInt(countdown) / 1000;  // 秒
      var mm = 0, hh = 0, dd = 0, mon = 0, yy = 0; // 从左至右依次是：分、时、天、月、年
      if (ss > 60) {
        mm = parseInt(ss / 60);
        ss = parseInt(ss % 60);
        if (mm > 60) {
          hh = parseInt(mm / 60);
          mm = parseInt(mm % 60);
          if (forDay && hh > 24) {
            dd = parseInt(hh / 24);
            hh = parseInt(hh % 24);
          }
        }
      }
      var rStr = '';
      if (dd && forDay) rStr += dd + '天';
      rStr += (hh ? prefixInteger(hh) : '00') + ':';
      rStr += (mm ? prefixInteger(mm) : '00') + ':';
      rStr += ss ? prefixInteger(ss) : '00';
      return rStr;
    } else {
      return '';
    }
  };

  // 计时器
  var countdownTimer = function () {

    var temp1 = setInterval(function () {
      var isClear = true;  // 默认清除定时器

      var $countdownArr = $orderDetailForm.find('[name="needTime"]');
      if ($countdownArr && $countdownArr.length > 0) {
        var ss = getCountdownForStr($countdownArr.text()) - 1;
        if (ss > 0) {
          isClear = false;  // 只要有一个没有过期, 就不清除定时器
          $countdownArr.text(formatCountdown(ss * 1000, true));
        } else {
          $countdownArr.text(0);
        }
      }
      // 根据状态清除定时器。
      if (isClear) {
        clearInterval(temp1);
        temp1 = null;
      }
    }, 1000);
  };

  function getOrderTpl(order) {
    return `
        <div class="order-detail mgb-12 weui-form-preview">
          <div class="title weui-flex">
            <i class="app-icon order-lx-mall mgr-4"></i>
            <span>乐享商城</span>
          </div>
    
          <div class="main">
            <div>订单号：<span name="orderCode">${order.orderCode}</span></div>
            <div class="font-red" name="orderStatusStr">${order.orderStatusStr}</div>
          </div>
    
          <div class="detail">
            <a href="javascript:void(0);" class="weui-media-box weui-media-box_appmsg">
              <div class="weui-media-box__hd">
                <img class="weui-media-box__thumb" name="goodsImage" src="${order.goodsImage}">
              </div>
              <div class="weui-media-box__bd">
                <div class="head"><span name="goodsName">${order.goodsName}</span></div>
                <div class="content mgt-8">
                  <div>
                    <span class="font-red">
                      ¥ <span name="salePriceYuan">${order.salePriceYuan}</span>
                    </span>
                    ×
                    <span name="quantity">${order.quantity}</span>
                  </div>
                </div>
              </div>
            </a>
          </div>
    
          <div class="weui-form-preview__bd pd-all-0">
            <div class="weui-form-preview__item group-purchase-info">
              <label class="weui-form-preview__label">拼团信息:</label>
              <div class="weui-form-preview__value" name="group-in">
                <span class="font-red" name="groupStatusStr">${order.groupStatusStr}</span><br>
                还差
                <span class="font-red" name="needNum">${order.needNum}</span>
                人 剩余时间
                <span class="font-red" name="needTime">${order.needTime}</span>
              </div>
              <div class="weui-form-preview__value vertical" name="group-no">
                <span class="font-okred">个人订单</span>
              </div>
              <div class="weui-form-preview__value vertical" name="group-done">
                <span class="font-red" name="groupStatusStr">${order.groupStatusStr}</span>
              </div>
            </div>
    
            <div class="weui-form-preview__item">
              <label class="weui-form-preview__label">收货地址:</label>
              <div class="weui-form-preview__value">
                <span name="consignee">${order.consignee}</span>
                <span name="consigneeMobile">${order.consigneeMobile}</span><br>
                <span name="consigneeAddr">${order.consigneeAddr}</span>
              </div>
            </div>
    
            <div class="weui-form-preview__item">
              <label class="weui-form-preview__label">下单时间:</label>
              <div class="weui-form-preview__value vertical" name="createTime">${order.createTime}</div>
            </div>
    
            <div class="weui-form-preview__item no-border">
              <label class="weui-form-preview__label">备注:</label>
              <div class="weui-form-preview__value vertical" name="buyerNote">${order.buyerNote}</div>
            </div>
    
            <div class="bg-gray" style="padding-top: 18px;">
              <div class="weui-form-preview__item no-border">
                <label class="weui-form-preview__label">快递信息:</label>
                <div class="weui-form-preview__value vertical">
                  ${order.courierCode 
                      ? '<span name="expressCmpy">' + order.expressCmpy + '</span>单号:<span name="courierCode">' + order.courierCode + '</span>'
                      : ''
                  }                  
                </div>
              </div>
            </div>
          </div>
        </div>
    `;
  }

});