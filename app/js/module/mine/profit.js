require(['$', 'pm'], function ($, PM) {
    // 我的收益对象
    function ProfitObj(){
        // 确保只有单例
        if( ProfitObj.unique !== undefined ){
            return ProfitObj.unique; 
        }
        this.date = new Date();
        ProfitObj.unique = this;
    }
    // 原型扩展
    ProfitObj.prototype = {

        init : function(){
            this.initData();
        },
        initData : function(){
            var _self = this;
            $.httpGet('/wechatUser/getWechatProfit',{year:this.date.getFullYear(),month:this.date.getFullYear()+1,openId:_self.openId}).then(function (data) {
                _self.dealData(data);
           });
        },
        dealData : function(data){
            var ul = $("<ul></ul>");
            $(".cur-year").html(this.date.getFullYear());
            // 获取年度收益
            $(".year-profit").html("￥"+data.moneyYearStr);
            // 获取当月收益
            if(data.profitList.length>0){
                $(".cur-month").html(data.profitList[0].profitMonth);
                $(".cur-profit").html("￥"+data.profitList[0].moneyStr);
            }
            // 获取上月收益
            if(data.profitList.length>1){
                $(".prev-month").html(data.profitList[1].profitMonth);
                $(".prev-profit").html("￥"+data.profitList[1].moneyStr);
            }
        }
    }
    new ProfitObj().init();
});