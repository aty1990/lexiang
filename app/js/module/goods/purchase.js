require(['$', 'pm', 'const', 'util', 'weui', 'wx-util','spinner'], function ($, PM, CONST, Util, WEUI,WxUtil) {
  localStorage.setItem("from","purchase");
  var stateParam = PM.stateParam;
  var $form = $('.purchase_form');
  var $choiseDiv = $('.choiseAddress_div');
  var $purchaseToast = $('#purchaseToast');
  var $purchaseLoadingToast = $('#purchaseLoadingToast');

  (function (data) {
    $form.html(`
        <div class="bg-white" >
            <div class="row line-h-55 border-b add-address-btn">
                <i class="app-icon plus"></i>
                <span class="font-orange font-15 border-b">请填写收货地址</span>
            </div>
            <div class="row line-h-55 border-b">
                <span class="title-15">${data.goodsName}</span>
            </div>
            <div class="row line-h-55 border-b flex-space-between">
                <span class="font-red font-18"><span class="rmb">${data.goodsPrice}</span></span>
                <input type="number" class="spinner purchase-num" name="num">
            </div>
            <div class="row line-h-55 border-b flex-space-between">
                <span class="title-15">总费用</span>
                <span class="font-red font-18"><span class="purchase-price rmb">00.00</span></span>
            </div>
            <div class="pd-all-12">
                <textarea class="textarea" placeholder="亲,还有什么备注吗?" name="note"></textarea>
            </div>
        </div>
    `);

    $form.find('.add-address-btn').tap(function (e) {
        e.stopPropagation();
        PM.go('mine-address', {});
    });

    $form.find('input.spinner').spinner({
      val: 1,
      step: 1,
      min: 1,
      onChange: function (val) {
        var price = (val * parseFloat(data.goodsPrice)).toFixed(2) || 0;
        $form.find('.purchase-price').html(price);
      }
    });

    var purchaseTimer = null;
    $('#goods_purchase_submit').tap(function (e) {
      e.preventDefault();
      e.stopPropagation();


      purchaseTimer && clearTimeout(purchaseTimer);
      purchaseTimer = setTimeout(function () {
        const isGroupOwner = sessionStorage.getItem('isGroupOwner'),
            openId = sessionStorage.getItem('openId'),
            totalFee = $form.find('.purchase-price').text(),
            addressId = $choiseDiv.find('.item').data('id');

        if (addressId == null) {
          WEUI.topTips('请填写收货地址', {
            duration: 3000
          });
          return null;
        }

        const params = {
          goodsId: stateParam.goodsId,
          quantity: parseInt($form.find('.purchase-num').val()),
          buyerNote: $form.find('[name="note"]').val(),
          addressId: addressId,
          totalMoney: totalFee,
          groupOrderCode: null,
          orderType: CONST.ORDER_TYPE.ORDINARY,
          wechat: openId,
          wechatName: sessionStorage.getItem('nickname')
        };

        if (isGroupOwner == 1) {
            WEUI.dialog({
                title: '支付方式',
                content: '请选择支付方式',
                className: 'custom-classname',
                buttons: [{
                    label: '虚拟购买',
                    type: 'primary',
                    onClick: function () { createOrder(params, data.goodsName); }
                }, {
                    label: '真实购买',
                    type: 'primary',
                    onClick: function () { createOrder(params, data.goodsName, true); }
                },{
                    label: '取消',
                    type: 'default',
                    onClick: function () {}
                }]
            });
        }
        else {
          createOrder(params, data.goodsName, true);
        }
      }, 100);
    });
  }(stateParam));


  let unPaidOrder = null;  // 平台的订单对象
  let unPaidUnifiedOrder = null;  // 微信的统一下单对象

  const createOrder = function (params, goodsInfo, isReal) {
    // 缓存订单对象不存在时创建
    if (unPaidOrder == null) {
      var loading = WEUI.loading('购买订单生成中');

      if (!isReal) params.virtual = 1;

      $.httpPost('/order/createOrder.json', params).then(function (order) {
        loading.hide();

        if (order.resultCode == -1) {
          WEUI.toast('购买订单生成失败', {
            duration: 2000,
            callback: function () {
              PM.go('home');
            }
          });
        }
        else {
          // 如果创建订单成功，缓存订单对象
          unPaidOrder = order;
          wePay((+params.totalMoney) * 100, unPaidOrder, goodsInfo, isReal);
        }
      });
    }
    // 缓存订单对象已存在时，直接支付
    else {
      wePay((+params.totalMoney) * 100, unPaidOrder, goodsInfo, isReal);
    }
  };

  const wePay = function (totalMoney, order, goodsInfo, isReal) {
    const virtual = isReal ? 0 : 1;
    if (isReal) {
      // 统一下单对象不存在时调用微信接口以创建
      if (unPaidUnifiedOrder == null) {
        Util.doWePay(totalMoney, order.orderCode, goodsInfo).then(function () {
          $.httpPost('/order/payOrder', { orderId: order.orderId, virtual: virtual }).then(paySuccess, payFail);
        }, function (errMsg, unifiedOrder) {
          WEUI.toast(errMsg, {
            duration: 2000,
            callback: function () {
                PM.go('order', { tabState:'order-to-pay' });
                // 缓存统一下单对象
                unPaidUnifiedOrder = unifiedOrder;
                if (errMsg === '支付功能需要在微信端运行') PM.go('order');
            }
          });
        });
      }
      // 统一下单对象存在时直接调用微信支付
      else {
        Util.doInvokeWePay(unPaidUnifiedOrder).then(function () {
          $.httpPost('/order/payOrder', { orderId: order.orderId, virtual: virtual }).then(paySuccess, payFail);
        }, function (errMsg) {
          WEUI.toast(errMsg, 2000);
        });
      }
    } else {
      $.httpPost('/order/payOrder', { orderId: order.orderId, virtual: virtual }).then(paySuccess, payFail);
    }
  };

  const paySuccess = function () {
    WEUI.toast('支付成功', {
      duration: 1000,
      callback: function () {
        console.info('local pay success.');
        PM.go('order', { tabState: 'order-to-deliver' });
      }
    });
  };

  const payFail = function () {
    WEUI.toast('支付失败', {
      duration: 1000,
      callback: function () {
        console.info('local pay fail.');

        PM.go('order');
      }
    });
  };

    $.httpGet('/address/getAddressList.json', {wechat: sessionStorage.getItem('openId'),'isDefault':1}).then(function (result) {
        if(result.length>0){
            initAddress(result[0]);
            $(".purchase_form .add-address-btn").remove();
        }
    });

    var initAddress = function (result) {
        var html = '<label class="item" data-id="'+result.addressId+'">\
            <div class="item-hd">\
               <span class="address-icon"></span>\
            </div>\
            <div class="item-bd">\
                <div class="item-bd-inner_column">\
                    <div class="item-bd_row">'+result.consignee+'  '+result.consigneeMobile+'</div>\
                    <div class="item-bd_row font-12">'+result.consigneeAddr+'</div>\
                </div>\
            </div>\
            <a class="item-ft app-icon clickable purchase-link" href="#/mine/address"></a>\
        </label>';
        $choiseDiv.html(html);
    };

    // 默认分享首页
    var url = location.href.slice(0,location.href.indexOf("#")+1);
    wx.ready(function () {
        // 注册 自定义分享
        WxUtil.shareApp({
            title : '乐享商城',
            desc : '乐享商城',
            state : 'home',
            qqlink : url + "/home",
            imgUrl : 'http://file.hngangxin.com/LX/20170504114045.jpg',
            success : function(){}
        });
    }); 

});


