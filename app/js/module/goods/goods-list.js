/**
 * 微超市下的商品列表页
 */
require(['$', 'pm', 'util', 'iscroll','weui','parabola'], function ($, PM, Util, IScroll, WEUI) {
    var GoodsList = function(){ 
        this.goodsList  = $(".goods-list-page");
        this.numIcon    = $(".shopping-cart .num-icon");
        this.unpurchase = $(".shopping-cart .unpurchase");
        this.settlement = $(".shopping-cart .settlement");
        this.goodsDetail= $(".shopping-cart .goods-detail");
        this.layer      = $(".goods-detail-layer");
        this.goodsMask  = $(".goods-mask-layer");
        this.cartArr    = {};       // 购物车数据
        this.totalNum   = 0;        // 购买车商品总数量
    }

    GoodsList.prototype = {
        init : function(){
            this.bindEvent();
        },
        initData : function(){
            
        },
        bindEvent : function(){
            var _self = this;
            // 数量加一
            _self.goodsList.on("tap",".icon-plus",function(){
                var number = Math.floor($(this).prev().html());
                // 当前商品数量
                $(this).prev().html(++number);
                // 总数量
                _self.numIcon.html(++_self.totalNum);
                if(number>0){
                    $(this).siblings().css("visibility","visible");
                }
                // 如果购物车里不存在此商品
                if(!_self.cartArr[$(this).data("id")]){
                    _self.cartArr[$(this).data("id")] = [];
                }
                _self.cartArr[$(this).data("id")].push($(this).data("goods"));
                // 观察购物车变化
                _self.watchCartArr();
                _self.initBoll(this);
            });

            // 数量减一
            _self.goodsList.on("tap",".icon-minus",function(){
                var number = Math.floor($(this).next().html());
                if(number>0){
                    $(this).next().html(--number);
                }
                // 总数量
                _self.numIcon.html(--_self.totalNum);

                // 隐藏减号图标和数量
                if(number==0){
                    $(this).css("visibility","hidden").next().css("visibility","hidden");
                }
                // 删除购物车对应的商品
                if($(this).data("id") in _self.cartArr){
                    if(_self.cartArr[$(this).data("id")].length>1){
                        _self.cartArr[$(this).data("id")].shift();  
                    }else{
                        delete _self.cartArr[$(this).data("id")];
                    }
                }
                // 观察购物车变化
                _self.watchCartArr();
            });

            // 详情页
            _self.goodsList.on("tap",".img",function(){
                // 详情页
                PM.go('goods', {goodsId:146});
            });

            // 结算
            _self.goodsList.on("tap",".settlement-checked",function(){
                // 详情页
                console.log(_self.cartArr);
            });

            // 查看购物车
            _self.goodsList.on("tap",".goods-detail",function(){
                if(JSON.stringify(_self.cartArr)=="{}")return;
                if(_self.layer.hasClass("show-cart")){
                    _self.layer.removeClass("show-cart").addClass("hide-cart");
                    _self.goodsMask.hide();
                }else{
                    _self.layer.removeClass("hide-cart").addClass("show-cart");
                    _self.goodsMask.show().css("opacity","0.6");
                }
                _self.listGoods();
                // 详情页
                new IScroll('.data-box');
            });

             // 点击遮罩层隐藏购物详情页
            _self.goodsList.on("tap",".goods-mask-layer",function(){
                // 购物车详情页
                _self.goodsDetail.trigger("tap");
            });

            //清空购物车
            _self.goodsList.on("tap",".clear-cart",function(){
                _self.clearCart();
            });

            // 购物车商品列表中的减号
            _self.goodsList.on("tap",".cart-icon-minus",function(){
                var totalNum = Math.floor($(this).next().html());
                if(totalNum==1){
                    $(this).parents("li").remove();
                }else{
                    $(this).next().html(totalNum-1);
                    var total = Util.formatMoney().multiply(parseFloat($(this).attr("prices")),Math.floor($(this).next().html()));
                    $(this).parent().prev().find("span.simple-total-money").html(total);
                }
                // 2：获取对应商品下的加号触发点击事件
                var target = $(".page-goods-list div[data-id='"+$(this).data("id")+"']");
                
                target.find("i.icon-minus").trigger("tap");

            });

             // 购物车商品列表中加号
            _self.goodsList.on("tap",".cart-icon-plus",function(){
                // 1: 计算数量，总价
                $(this).prev().html(Math.floor($(this).prev().html())+1);
                var total = Util.formatMoney().multiply(parseFloat($(this).attr("prices")),Math.floor($(this).prev().html()));
                $(this).parent().prev().find("span.simple-total-money").html(total);

                // 2：获取对应商品下的加号触发点击事件
                var target = $(".page-goods-list div[data-id='"+$(this).data("id")+"']");
                target.find("i.icon-plus").trigger("tap");
            });
        },
        initBoll : function(obj){
            var _self = this;
            $("<div>").appendTo("body").addClass("boll-icon").css({
                "top": $(obj).offset().top,
                "left": $(obj).offset().left
            });
            var cartPos = $(".goods-num-icon");
            new Parabola({
                el: ".boll-icon",
                offset:[cartPos.offset().left-$(obj).offset().left+10,cartPos.offset().top-$(obj).offset().top],
                curvature: "0.006",
                duration: 300,
                callback: function () {
                    $(".boll-icon").remove();
                    _self.unpurchase.toggleClass("pulse");
                    setTimeout(function(){
                        _self.unpurchase.toggleClass("pulse");
                    },300);
                },
                stepCallback: function (x, y) {}
            }).start();
        },
        //清空购物车
        clearCart : function(){
            var _self = this;
            WEUI.confirm('清空购物车', {
                buttons: [{
                        label: '取消',
                        type: 'default',
                        onClick: function(){}
                    }, {
                        label: '清空',
                        type: 'primary',
                        onClick: function(){ 
                            // 清楚购物车数据
                            _self.cartArr = {};
                            _self.goodsList.find("i.icon-minus").css("visibility","hidden");
                            _self.goodsList.find("i.goods-num").html(0).css("visibility","hidden");
                            // 重新初始化购物车
                            setTimeout(function(){_self.watchCartArr();},1001);
                        }
                }]
            });
        },
        // 观察购物车变化
        watchCartArr:function(){
            var _self = this;
            if(JSON.stringify(this.cartArr)!="{}"){
                _self.unpurchase.addClass("purchase-checked");
                _self.settlement.addClass("settlement-checked");
                _self.numIcon.show();
            }else{
                _self.unpurchase.removeClass("purchase-checked");
                _self.settlement.removeClass("settlement-checked");
                _self.layer.removeClass("show-cart").addClass("hide-cart");
                _self.goodsMask.hide();
                _self.numIcon.hide();
                _self.totalNum = 0;
            }
            // 计算金额
            this.calcMoney();
        },
        // 计算购买车总金额
        calcMoney : function(){
            var totalMoney = 0,
                _self = this,
                rmbIcon = $(".shopping-cart .rmb-icon");
            for(var goods in _self.cartArr){
                if(_self.cartArr[goods].length>0){
                    var sumMoney = Util.formatMoney().multiply(parseFloat(_self.cartArr[goods][0].prices),_self.cartArr[goods].length);
                    totalMoney+=sumMoney;
                }
            }
            // 赋值总金额
            $(".shopping-cart .total-money").html(totalMoney==0?"未选择商品":totalMoney);
            rmbIcon.css("visibility",totalMoney==0?"hidden":"visible");
        },
        // 显示所有购买的商品列表
        listGoods : function(){
            var _self = this;
            var tempData = "";
            for(var goods in _self.cartArr){
                if(_self.cartArr[goods].length>0){
                    
                    tempData += '<li>\
                                    <span class="goods-item goods-text-desc">'+_self.cartArr[goods][0].name+'</span>\
                                    <span class="goods-item goods-prices-desc">￥<span class="simple-total-money">'+ Util.formatMoney().multiply(parseFloat(_self.cartArr[goods][0].prices),_self.cartArr[goods].length)+'</span></span>\
                                    <span class="goods-item goods-opt-desc" data-goods="'+JSON.stringify(_self.cartArr[goods][0])+'">\
                                        <i class="cart-icon-minus" data-id='+goods+'  prices="'+_self.cartArr[goods][0].prices+'">&nbsp;</i>\
                                        <i class="cart-goods-num">'+_self.cartArr[goods].length+'</i>\
                                        <i class="cart-icon-plus"  data-id='+goods+' prices="'+_self.cartArr[goods][0].prices+'">&nbsp;</i>\
                                    </span>\
                                </li>';
                }
            }
            $(".goods-detail-layer .data-ul").html(tempData);
        }
    }
    new GoodsList().init();
});