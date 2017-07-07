/**
 * 微超市列表
 */
require(['$', 'pm'], function ($, PM) {

    var SuperMark = function(){

    }
    SuperMark.prototype = {
        init : function(){
            this.bindEvent();
        },
        initData : function(){

        },
        bindEvent : function(){
            $(".supermark-page").on("tap",".item",function(){
                // 跳转到商品列表页
                PM.go('goods-list', {});
            })
        }
    }
    new SuperMark().init();
});