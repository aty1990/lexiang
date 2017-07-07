require(['$', 'pm', 'weui', 'const', 'util'], function ($, PM, WEUI, CONST, Util) {

    var stateParam = PM.stateParam;
    // 如果是修改
    if(stateParam){
        var form = $("#addAddressForm");
        form.find("input[name=consignee]").val(stateParam.name);
        form.find("input[name=consigneeMobile]").val(stateParam.tel);
        form.find("textarea[name=consigneeAddr]").val(stateParam.address);
    }

  // form中input得到/获取焦点事件时，处理验证
  WEUI.form.checkIfBlur('#addAddressForm', { regexp: CONST.VALIDATION_REGEXP });

  $('#addAddressForm').on('submit', function (e) {
    e.preventDefault();

    // form提交时，处理验证
    var that = this;
    WEUI.form.validate(this, function (error) {
      if (!error) {
        const loading = WEUI.loading('地址创建中');
        var params = Util.parseToObject($(that).serializeArray());
        params.wechat = sessionStorage.getItem('openId');
        params.addressId = "";
        params.wechatName = sessionStorage.getItem('nickname');
        var fromStr = localStorage.getItem("from");
        // 判断是否是修改
        if(stateParam.addressId){
            params.addressId = stateParam.addressId;
        }
        $.httpPost('/address/saveAddress.json', params).then(function (result) {
            loading.hide();
            if(result && result.resultCode=="-1"){
                WEUI.toast('保存失败', 1000);
            }else{
                WEUI.toast('地址创建成功', 1000);
                if (stateParam.backUrlName) {
                    history.back();
                    setTimeout(function(){
                        history.back();
                        setTimeout(function(){
                           if(fromStr=="purchase"){
                                $(".toPurchase").trigger("tap");
                            }else if(fromStr=="group-purchase"){
                                $(".toGroupPurchase").trigger("tap");
                            } 
                        },100)
                    },100);
                } else {
                    history.back();
                    setTimeout(function(){
                        history.back();
                        setTimeout(function(){
                           location.href="#/mine/address";
                        },100)
                    },50);
                }
            }
        }, function () {
            loading.hide();
            WEUI.toast('地址创建失败', 1000);
        });
      }
    }, {
      regexp: CONST.VALIDATION_REGEXP
    });
  });

});