require(['$', 'pm','list','weui'], function ($,PM,list,WEUI) {
    var $list = $('.my-address .weui_cells');
    var AddressObj = function(){
        this.flag = true;
    }
    // 原型扩展
    AddressObj.prototype = {
        init : function(){
            this.initData().bindEvent();
        },
        // 初始化页面数据
        initData : function(){
            var _self = this;
            $.httpGet('/address/getAddressList.json',{wechat: sessionStorage.getItem('openId'),'isDefault':0}).then(function (addressList) {
                // 遍历地址数组
                if(addressList.length>0) {
                    var addressTpls = [];
                    for(let i=0;i<addressList.length;i++){
                        addressTpls.push(_self.getItemTpl(addressList[i]));
                    }
                    $list.append(addressTpls.join(''));

                    $list.prepend("<p class='address-tips'>您可以使用左滑来编辑和删除地址</p>");

                    // 初始化滑动插件
                    list.list();
                    // 事件绑定
                    _self.bindEvent();
                }else{
                    $(".page-mine-address").append("<div class='no-data-ele'></div>");
                }
            });
            return _self;
        },
        bindEvent : function(){
            var _self = this;
            // 删除地址
            $(".my-address").on("tap","span.dels",function(e){
                e.stopPropagation();
                if(_self.flag){
                    _self.flag = false;
                    _self.delAddr($(this));
                }
            });
            // 编辑地址
            $(".my-address").on("tap","span.edit",function(e){
                e.stopPropagation();
                _self.editAddr($(this));
            });

            // 新增地址
            $(".my-address").on("tap",".plus-address",function(){
                PM.go("mine-address-add",{});
            });

            $(".my-address").on("tap",".weui_cell_bd",function(e){
                e.stopPropagation();
                if(_self.flag){
                    _self.flag = false;
                    _self.setDefaultAddr($(this).parent());
                }
            });
        },
        // 组装地址html
        getItemTpl : function( address ){
            return '<div class="weui_cell slidelefts" id="'+address.addressId+'" name="'+address.consignee+'" address="'+address.consigneeAddr+'" tel="'+address.consigneeMobile+'" >\
                <div class="weui_cell_bd weui_cell_primary ">\
                    <span>\
                        <div class="pd-4">'+address.consignee+'<span class="pull-right">'+address.consigneeMobile+'</span></div>\
                        <div class="pd-4">\
                            <span class="font-red">'+(address.defaultFlag == 1?"[默认地址]":"")+'</span>\
                            '+address.consigneeAddr+'\
                        </div>\
                    </span>\
                    <span class="'+(address.defaultFlag == 1?"checkbox-checked":"checkbox-uncheck")+' opt-icon"></span>\
                </div>\
                <div class="slideleft">\
                    <span class="edit" id="'+address.addressId+'" name="'+address.consignee+'" tel="'+address.consigneeMobile+'" address="'+address.consigneeAddr+'">编辑</span>\
                    <span class="bg-red  dels" id="'+address.addressId+'">删除</span>\
                </div>\
            </div>';
        },
        // 删除地址
        delAddr : function( addr ){
            var _self = this;
            $.httpPost('/address/delAddress', {addressId: addr.attr("id")}).then(function (result) {
                if(result && result.resultCode=="-1"){
                    WEUI.alert(result.resultMessage,function(){
                        addr.parent().prev().css('-webkit-transform','translateX('+0+'px)');
                    });
                }else{
                    WEUI.toast("删除成功",300);
                    var addressBox = addr.parents(".address-box .weui_cells");
                    var isDefault = addr.parent().prev().find(".opt-icon").hasClass("checkbox-checked")?true:false;
                    // 设置为默认地址
                    addr.parents("div.slidelefts").remove();
                    if(addressBox.children("div.slidelefts").length==0){
                        $(".address-box").remove();
                        $(".page-mine-address").append("<div class='no-data-ele'></div>");
                    }
                    if(addressBox.children("div.slidelefts").length>1 && isDefault){
                        addressBox.children("div.slidelefts").eq(0).find(".weui_cell_bd").trigger("tap");
                    }
                    _self.flag = true;
                }
            });
        },
        // 编辑地址
        editAddr: function( addr ){
            PM.go("mine-address-add",{
                'addressId': addr.attr('id'),
                'name' : addr.attr('name'),
                'tel' : addr.attr('tel'),
                'address' : addr.attr('address')
            });
        },
        // 设为默认地址
        setDefaultAddr : function( addr ){
            var _self = this;
            $.httpPost('/address/setDefaultAddress', {addressId: addr.attr("id"),openId:sessionStorage.getItem('openId')}).then(function(){
                //WEUI.toptips('默认地址修改成功','info');
                $(".my-address .opt-icon").removeClass("checkbox-checked").addClass("checkbox-uncheck");
                $(".my-address .font-red").html("");
                addr.find(".opt-icon").addClass("checkbox-checked").removeClass("checkbox-uncheck");
                addr.find(".font-red").html("[默认地址]");
                // 判断是单独购买还是一键开团
                let from = localStorage.getItem("from");
                if(from=="purchase"){
                    let addressObj = $(".page-goods-purchase .list-address");
                    addressObj.find("label.item").attr("data-id",addr.attr("id"));
                    if(addressObj.find("label.item").length==0){
                        var addressHtml = $('<label class="item" data-id="'+addr.attr("id")+'">\
                                <div class="item-hd">\
                                    <span class="address-icon"></span>\
                                </div>\
                                <div class="item-bd">\
                                    <div class="item-bd-inner_column">\
                                        <div class="item-bd_row">'+addr.attr("name")+"  "+addr.attr("tel")+'</div>\
                                        <div class="item-bd_row font-12">'+addr.attr("address")+'</div>\
                                    </div>\
                                </div>\
                                <a class="item-ft app-icon clickable group-purchase-link"  href="#/mine/address"></a>\
                            </label>');
                        addressObj.append(addressHtml);
                        $(".page-goods-purchase .add-address-btn").remove();
                    }else{
                        $(".page-goods-purchase .list-address .item-bd_row:eq(0)").html(addr.attr("name")+"  "+addr.attr("tel"));
                        $(".page-goods-purchase .list-address .item-bd_row:eq(1)").html(addr.attr("address"));
                        addressObj.attr("data-id",addr.attr("id"));
                    }
                    history.back();
                }else if(from=="group-purchase"){
                    let addressObj = $(".page-goods-group-purchase .list-address");
                    addressObj.find("label.item").attr("data-id",addr.attr("id"));
                    // 当购买页面无地址时动态添加
                    if(addressObj.find("label.item").length==0){
                        var addressHtml = $('<label class="item" data-id="'+addr.attr("id")+'">\
                                <div class="item-hd">\
                                    <span class="address-icon"></span>\
                                </div>\
                                <div class="item-bd">\
                                    <div class="item-bd-inner_column">\
                                        <div class="item-bd_row">'+addr.attr("name")+"  "+addr.attr("tel")+'</div>\
                                        <div class="item-bd_row font-12">'+addr.attr("address")+'</div>\
                                    </div>\
                                </div>\
                                <a class="item-ft app-icon clickable group-purchase-link"  href="#/mine/address"></a>\
                            </label>');
                        addressObj.append(addressHtml);
                        $(".page-goods-group-purchase .add-address-btn").remove();
                    }else{
                        $(".page-goods-group-purchase .list-address .item-bd_row:eq(0)").html(addr.attr("name")+"  "+addr.attr("tel"));
                        $(".page-goods-group-purchase .list-address .item-bd_row:eq(1)").html(addr.attr("address"));
                    }
                    history.back();
                }else{
                    _self.flag = true;
                }
            });
        }
    }
    new AddressObj().init();
});



