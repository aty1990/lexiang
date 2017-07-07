require(['$', 'pm', 'iscroll', 'const'], function ($, PM, IScroll, CONST) {
    let stateParam = PM.stateParam,
    $page = $('.page-goods-detail'),
    $goodsRoot = $page.find('#goods_detail').children(),
    goodsScroller;

    var GoodsDetail = function(){}

    GoodsDetail.prototype = {
        init : function(){
            this.initData();
        },
        initData : function(){
            var _self = this;
            $.httpGet('/goods/getGoodsDetail.json', {goodsId: stateParam.goodsId}).then(function (result) {
                _self.initGoods(result.goods);
            });
            return this;
        },
        initGoods : function(goods){
            var html = '<div class="main-img">\
                    <img src="'+goods.bigImage+'" style="width: 100%; height: 100%;">\
                    <div class="sell">已售'+goods.saleAmountDesc+'件</div>\
                </div>\
                <div class="bg-white">\
                    <div class="row flex-space-between line-h-50">\
                        <div class="money font-red">\
                            <span class="rmb">'+parseFloat(goods.priceStr).toFixed(2)+'</span>\
                            <div class="detail">\
                                '+goods.groupLimit+'人团立即省'+(goods.priceStr - goods.groupPriceStr).toFixed(2)+'元\
                            </div>\
                        </div>\
                        <a class="call-phone font-red" href="'+CONST.SERVE_TEL+'">\
                            <i class="app-icon goods-phone"></i>联系客服\
                        </a>\
                    </div>\
                    <div class="row title">'+goods.goodsName+'</div>\
                    <div class="row font-gray">商品描述: '+goods.goodsDesc+'</div>\
                    <div class="row font-gray">'+goods.goodsSpec+'</div>\
                </div>\
                <div class="bg-white mgt-10">\
                    <div class="row font-gray line-h-45 border-b">商品详情</div>\
                    <div class="goods-imgs">\
                        <img src="'+goods.descImage+'" alt="" class="img">\
                    </div>\
                </div>\
                <div class="bg-white mgt-10 mgb-10">\
                    <div class="row border-b flex-space-between line-h-50">\
                        <span class="title-15">赔付标准</span>\
                        <div class="font-gray">\
                            <span class="font-12 mgr-4">扫码即快赔</span>\
                            <i class="app-icon goods-qrcode"></i>\
                        </div>\
                    </div>\
                    <div class="row flex-space-between line-h-50">\
                        <span class="title-15">'+goods.compensateDesc+'</span>\
                    </div>\
                </div>';

            $goodsRoot.html(html);

            goodsScroller = new IScroll('#goods_detail');

            let $goodsImgs = $page.find('img'),

            loadedCount = 0;

            $goodsImgs.load(function () {
                loadedCount++;
                if ($goodsImgs.length == loadedCount) {
                    setTimeout(function () {
                        goodsScroller.refresh();
                    }, 15);
                }
            });
            this.bindEvent();
        },
        bindEvent:function(){
            $page.find('.call-phone').tap(function () {
                location.href = $(this).attr('href');
            });

            $page.find('.goods-qrcode').on('tap', function () {
                PM.go('goods-qrcode');
            });
        }
    }

    new GoodsDetail().init();
});


