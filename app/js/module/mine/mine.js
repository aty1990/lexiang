require(['$', 'pm'], function ($, PM) {
    function MineObj(){
        // 确保只有单例
        if( MineObj.unique !== undefined ){
            return MineObj.unique; 
        }
        this.page = $('.page-mine');
        this.isGroupOwner = sessionStorage.getItem("isGroupOwner");
        this.nickname   = sessionStorage.getItem("nickname");
        this.headImgUrl = sessionStorage.getItem("headImgUrl");

        MineObj.unique = this;
    }
    MineObj.prototype = {
        init : function(){
            this.initPage().bindEvent();
        },
        bindEvent : function(){
            // 我的订单
            this.page.find('.go-order').click(function () {
                $('[data-state-name="order"]').click();
            });
            return this;
        },
        initPage : function(){
            var _self = this;
            // 是否群主
            if (_self.isGroupOwner == 1) {
                _self.page.find('.go-group').show();
                _self.page.find('.go-group').on('click', function () {
                    PM.go('mine-group', {openId: sessionStorage.getItem('openId')});
                });
                _self.page.find(".my-group-card").show();
                _self.page.find(".my-profit").show();
            } else {
                _self.page.find('.go-group').remove();
            }
            // 是否存在微信名称
            if (_self.nickname) {
                _self.page.find('.mine-nickname').text(_self.nickname);
            }
            // 是否有头像
            if (_self.headImgUrl) {
                _self.page.find('.mine-headimage').children('.app-icon').remove();
                _self.page.find('.mine-headimage').children('img').attr('src', _self.headImgUrl).css("display", "inline");
            }
            // 设置当然访问地址
            localStorage.setItem("from","mine");

            // 返回this 以便链式调用
            return this;
        }
    }    
    new MineObj().init();

});