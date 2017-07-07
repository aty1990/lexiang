define(['$'], function ($) {

  function getOrderHtmlTpl(data,option) {
    var orderHtmlTpl='';
    orderHtmlTpl+=('<div class="order-item mgb-12">');
    orderHtmlTpl+=('<div class="main">');
    orderHtmlTpl+=('<div class="weui-flex"><i class="app-icon order-lx-mall mgr-4"></i><span>乐享商城</span></div>');
    orderHtmlTpl+=('<div class="text-orange">'+data.orderCode+'</div>');
    orderHtmlTpl+=('</div>');
    orderHtmlTpl+=('<div class="detail">');
    orderHtmlTpl+=('<a class="weui-media-box weui-media-box_appmsg"  name="orderList" data-order-id='+data.orderId+' >');
    orderHtmlTpl+=('<div class="weui-media-box__hd">');
    orderHtmlTpl+=('<img class="weui-media-box__thumb" src="/app//img/order/goods-exp.png" alt="">');
    orderHtmlTpl+=('</div>');
    orderHtmlTpl+=('<div class="weui-media-box__bd">');
    orderHtmlTpl+=('<div class="head">'+data.goodsName);
    if(data.groupStatusStr!=null){
      orderHtmlTpl+=('<span class="group-icon">'+data.groupStatusStr+'</span>');
    }
    orderHtmlTpl+=('</div><div class="content">');
    // orderHtmlTpl+=('<div>'+data.goodsWeight+'g</div>');
    orderHtmlTpl+=('<div class="mgt-8"><span class="font-red">¥ '+data.salePrice+'</span>×'+data.quantity+'<span class="float-right">'+data.createTime+'</span></div>');
    orderHtmlTpl+=('</div>');
    orderHtmlTpl+=('</div>');
    orderHtmlTpl+=('</a>');
    orderHtmlTpl+=('</div>');
    orderHtmlTpl+=('<div class="pd-all-12 order-total"><span>合计:¥ '+data.saleMoney+'</span>');

    if(option.tabStatus==1){
      orderHtmlTpl+=('<a  name="toPayBtn" data-order-id='+data.orderId+' >继续付款</a>');
    }else if(option.tabStatus==3){
      orderHtmlTpl+=('<a  name="toReceiptBtn" data-order-id='+data.orderId+' >确认收货</a>');
    }if(option.tabStatus==4){
      orderHtmlTpl+=('<a  name="toEvaluateBtn" data-order-id='+data.orderId+' >评价</a>');
    }
    orderHtmlTpl+=('</div></div>');
    return orderHtmlTpl;
  };

  var buildHtmlTpl = function buildOrderHtmlTpl(option,$this) {
    var htmlTpl = '';
    var getHtmlTpl=eval(option.htmTpl);
    option.dataList.forEach(function (data) {
      htmlTpl += getHtmlTpl(data,option);
    });
    $this.append(htmlTpl);
  };

  $.fn['buildHtmlTpl'] = function (option) {
    return buildHtmlTpl(option, $(this));
  };

});