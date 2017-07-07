define(['$', 'weui', 'const', 'pm', 'util', 'iscroll', 'iscroll-pullable'], function ($, WEUI, CONST, PM, Util, IScroll, IScrollPullable) {

  // 初始化显示的订单状态
  var currentPage = 0;

  var $tabContainer = $('.switch-tabs'),
      $orderMainList = $('.order-main-list'),
      $orderWarning = $orderMainList.find('.warning-title'),
      $orderMessage = $orderWarning.find('#orderRemind');

  // 订单状态参数
  var orderStateParams = {
    'order-to-pay' : {
      selected: true,
      orderStatus: CONST.ORDER_STATE.TO_PAY,
      scrollNumber: 0,
      onShow: function () {
        $orderWarning.show();
        $orderMessage.text('订单超过3天未付款系统将自动取消订单');
      }
    },
    'order-gp-buying' : {
      orderStatus: CONST.ORDER_STATE.GROUPING,
      scrollNumber: 1,
      onShow: function () {
        $orderWarning.show();
        $orderMessage.text('订单超过2天未拼团成功系统将自动取消订单');
      }
    },
    'order-to-deliver' : {
      orderStatus: CONST.ORDER_STATE.TO_DELIVER,
      scrollNumber: 2,
      onShow: function () {
        $orderWarning.hide();
      }
    },
    'order-to-receipt' : {
      orderStatus: CONST.ORDER_STATE.TO_RECEIPT,
      scrollNumber: 3,
      onShow: function () {
        $orderWarning.show();
        $orderMessage.text('订单超过3天未确认收货系统将自动确认收货');
      }
    },
    'order-to-evaluate' : {
      orderStatus: CONST.ORDER_STATE.TO_COMMENT,
      scrollNumber: 4,
      onShow: function () {
        $orderWarning.show();
        $orderMessage.text('订单超过5天未评价系统将自动评价订单');
      }
    }
  };

  var $orderListContainer = $orderMainList.find('.order-list'),
      $orderList = $orderListContainer.find('.orders'),
      size = +$orderList.length;

  if (isNaN(size) || size <= 0) {
    throw Error('构建订单列表时发生异常');
  }

  // 初始化订单状态参数
  for (let tabName in orderStateParams) {
    orderStateParams[tabName].hasMore = true;
    orderStateParams[tabName].pageNo = 1;
    orderStateParams[tabName].$orderContainer = $orderListContainer.find('.' + tabName);
    orderStateParams[tabName].$orderScroller = orderStateParams[tabName].$orderContainer.children();
    orderStateParams[tabName].scroller = new IScrollPullable(
        orderStateParams[tabName].$orderContainer[0],
        null,
        function () {
          orderStateParams[tabName].pageNo = 1;
          orderStateParams[tabName].hasMore = true;
          loadOrders(tabName);
        },
        function () {
          loadOrders(tabName);
        }
    );
  }

  // 初始化订单点击事件
  // 进入订单详情
  $orderListContainer.on('tap', '[name="orderDetail"]', function () {
    PM.go('order-detail', { orderId: $(this).data('orderId') });
  });

  // 继续付款
  var repeatPayTimeout = null;
  $orderMainList.on('tap', '[name="toPayBtn"]', function () {
    const $this = $(this),
        $orderItem = $this.parents('.order-item');

    repeatPayTimeout && clearTimeout(repeatPayTimeout);
    repeatPayTimeout = setTimeout(function () {
      if (sessionStorage.getItem('isGroupOwner') == 1) {
        WEUI.confirm('请选择支付方式', {
          buttons: [{
            label: '虚拟购买',
            type: 'default',
            onClick: function () {
              doPay($this, $orderItem);
            }
          }, {
            label: '真实购买',
            type: 'primary',
            onClick: function () {
              doPay($this, $orderItem, true);
            }
          }]
        });
      } else {
        doPay($this, $orderItem, true);
      }
    }, 100);
  });

  const doPay = function ($el, $orderItem, isReal) {
    const orderId = $el.data('orderId');
    const virtual = isReal ? 0 : 1;
    if (!isReal) {
      $.httpPost('/order/payOrder', { orderId: orderId, virtual: virtual }).then(paySuccess.bind(null, $orderItem), payFail);
    }
    else {
      const unPaidUnifiedOrder = JSON.parse(sessionStorage.getItem(orderId));

      if (unPaidUnifiedOrder == null) {
        const totalFee = $el.data('totalFee'),
            orderCode = $el.data('orderCode'),
            goodsInfo = $el.data('goodsInfo');

        Util.doWePay(totalFee, orderCode, goodsInfo).then(function () {
          $.httpPost('/order/payOrder', { orderId: orderId, virtual: virtual }).then(paySuccess.bind(null, $orderItem), payFail);
          sessionStorage.removeItem(orderId);
        }, function (errMsg, unifiedOrder) {
          sessionStorage.setItem(orderId, JSON.stringify(unifiedOrder));  // 缓存统一下单对象
          WEUI.toast(errMsg, 2000);
        });
      }
      else {
        Util.doInvokeWePay(unPaidUnifiedOrder).then(function () {
          $.httpPost('/order/payOrder', { orderId: orderId, virtual: virtual }).then(paySuccess.bind(null, $orderItem), payFail);
          sessionStorage.removeItem(orderId);
        }, function (errMsg) {
          WEUI.toast(errMsg, 2000);
        });
      }
    }
  };

  const paySuccess = function ($orderItem) {
    WEUI.toast('支付成功', 1000);
    selectTab('[data-tab-name="order-to-deliver"]');
    $orderItem.remove();
    setTimeout(function () {
      orderStateParams['order-to-pay'].scroller.refresh();
    }, 15);

    /*callback: function () {
      // 支付成功后，刷新代付款状态的订单
      orderStateParams['order-to-pay'].pageNo = 1;
      orderStateParams['order-to-pay'].hasMore = true;
      loadOrders('order-to-pay');
    }*/
  };

  const payFail = function () {
    WEUI.toast('支付失败', 1000);
  };

  // 确认收货
  $orderMainList.find(".orders.order-to-receipt").on('tap', '[name="toReceiptBtn"]', function () {
    PM.go('receipt-confirm', { orderId: $(this).data('orderId') });
  });

  // 评价
  $orderMainList.find(".orders.order-to-evaluate").bind('tap', '[name="toEvaluateBtn"]', function () {
    PM.go('order-evaluate', { orderId: $(this).data('orderId') });
  });

  // 初始化订单状态 scroll
  var windowWidth = $(window).width();
  $orderListContainer.width(windowWidth);
  $orderListContainer.find('.order-list-scroller').width(windowWidth * size);
  $orderList.width(windowWidth);
  var mainOrderScroll = new IScroll('.order-list', {
    scrollX: true,
    scrollY: false,
    momentum: false,
    snap: '.orders',
    snapSpeed: 200
  });
  mainOrderScroll.on('scrollEnd', function () {
    var targetPageNumber = mainOrderScroll.currentPage.pageX;
    if (currentPage !== targetPageNumber) {
      currentPage = targetPageNumber;

      for (var state in orderStateParams) {
        var orderState = orderStateParams[state];
        if (currentPage == orderState.scrollNumber) {
          selectTab(`[data-tab-name="${state}"]`);
        }
      }
    }
  });

  // 绑定订单状态切换事件
  $tabContainer.on('tap', '.switch-tab', function () {
    selectTab(this);
  });

  // 进入页面后选中默认订单状态
  var selectedTab = PM.stateParam.tabState || 'order-to-pay';

    selectTab(`[data-tab-name="${selectedTab}"]`);

  function selectTab (tabSelector) {
    var $tab = $(tabSelector);

    if (!$tab.hasClass('tab-item-on')) {
      var name = $tab.data('tabName');

      $tab.addClass('tab-item-on')
          .find('div').addClass('font-red').end()
          .find('.app-icon').removeClass(name).addClass(name + '-selected');

      showOrdersByState(name);

      var $other = $tab.siblings('.tab-item-on');
      if ($other.length > 0) {
        var otherName = $other.data('tabName');

        $other.removeClass('tab-item-on')
            .find('div').removeClass('font-red').end()
            .find('.app-icon').removeClass(otherName + '-selected').addClass(otherName);

        orderStateParams[otherName].selected = false;
      }
    }
  }

  function showOrdersByState (tabName) {
    orderStateParams[tabName].selected = true;
    let orderStateParam = orderStateParams[tabName];
    currentPage = orderStateParam.scrollNumber;
    mainOrderScroll.goToPage(Math.floor(orderStateParam.scrollNumber), 0 ,1000);
    orderStateParam.onShow();
    loadOrders(tabName, true);
  }

  function loadOrders (tabName, fromTabSwitch) {
    let orderStateParam = orderStateParams[tabName];

    if (orderStateParam.hasMore) {
      if (!fromTabSwitch || (fromTabSwitch && orderStateParam.pageNo == 1)) {

        $.httpGet('/order/getOrderList', {
          buyerWechat: sessionStorage.getItem('openId'),
          tabStatus: orderStateParam.orderStatus,
          pageNo: orderStateParam.pageNo,
          pageSize: CONST.PAGE_SIZE
        }).then(function (orderList) {
            
          orderStateParams[tabName].hasMore = false;

          if (Array.isArray(orderList) && orderList.length > 0) {
            let htmlTpl = '';
            for (var i=0;i<orderList.length;i++) {
                htmlTpl += getOrderTpl(orderList[i], orderStateParam.orderStatus);
            }
            orderStateParam.$orderScroller[orderStateParam.pageNo > 1 ? 'append' : 'html'](htmlTpl);
            setTimeout(function () {
              orderStateParam.scroller.refresh();

            }, 15);

            if (orderList.length == CONST.PAGE_SIZE) {
              orderStateParams[tabName].pageNo++;
              orderStateParams[tabName].hasMore = true;
            }
          }
        });
      }
    }
  }

  function getOrderTpl (data, orderState) {
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
                  ${data.groupStatusStr ? '<span class="group-icon">' + data.groupStatusStr + '</span>' : ''}
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
            ${orderState == CONST.ORDER_STATE.TO_PAY ? '<a name="toPayBtn" data-order-id="' + data.orderId + '" data-total-fee="' + data.saleMoney + '" data-order-Code="' + data.orderCode + '" data-goods-info="' + data.goodsName + '">继续付款</a>'
                : orderState == CONST.ORDER_STATE.TO_RECEIPT ? '<a name="toReceiptBtn" data-order-id="' + data.orderId + '">确认收货</a>' 
                : orderState == CONST.ORDER_STATE.TO_COMMENT ? '<a name="toEvaluateBtn" data-order-id="' + data.orderId + '">评价</a>' 
                : ''}
          </div>
        </div>
    `;
  }

});


