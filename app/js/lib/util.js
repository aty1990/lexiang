define(['$', 'weui', 'pm'], function ($, WEUI, PM) {

  var Util = {
    parseToObject: function (params) {
        var result = {};

        if (Array.isArray(params) && params.length > 0) {
            for (var i = 0; i < params.length; i++) {
                result[params[i].name] = params[i].value;
            }
        }
        return result;
    },

    doWePay: function (totalFee, orderNo, goodsInfo) {
      var httpDefer = $.Deferred();
      if (window.WeixinJSBridge) {
        var loading = WEUI.loading('预付单号生成中');
        $.httpPostServer('/wechatPlatform/unifiedOrder', {
          openId: sessionStorage.getItem('openId'),
          totalFee: totalFee,
          orderNo: orderNo,
          goodsInfo: goodsInfo
        }).then(function (unifiedOrder) {
            loading.hide();
            invokeWePay(unifiedOrder, httpDefer);
        });
      } else {
        httpDefer.reject('支付功能需要在微信端运行');
      }

      return httpDefer.promise();
    },

    doInvokeWePay: function (unifiedOrder) {
      var defer = $.Deferred();
      invokeWePay(unifiedOrder, defer);
      return defer.promise();
    },
      /**
       * 判断是否在微信中打开
       * @returns {boolean}
       */
    isWeiXin:function(){
        var ua = window.navigator.userAgent.toLowerCase();
        if(ua.match(/MicroMessenger/i) == 'micromessenger'){
            return true;
        }else{
            return false;
        }
    },
    formatMoney:function(){
        /*
         * 判断obj是否为一个整数
         */
        function isInteger(obj) {
            return Math.floor(obj) === obj;
        }
        
        /*
         * 将一个浮点数转成整数，返回整数和倍数。如 3.14 >> 314，倍数是 100
         * @param floatNum {number} 小数
         * @return {object}
         *   {times:100, num: 314}
         */
        function toInteger(floatNum) {
            var ret = {times: 1, num: 0};
            if (isInteger(floatNum)) {
                ret.num = floatNum;
                return ret;
            }
            var strfi  = floatNum + '';
            var dotPos = strfi.indexOf('.');
            var len    = strfi.substr(dotPos+1).length;
            var times  = Math.pow(10, len);
            var intNum = parseInt(floatNum * times + 0.5, 10);
            ret.times  = times;
            ret.num    = intNum;
            return ret;
        }
        
        /*
         * 核心方法，实现加减乘除运算，确保不丢失精度
         * 思路：把小数放大为整数（乘），进行算术运算，再缩小为小数（除）
         *
         * @param a {number} 运算数1
         * @param b {number} 运算数2
         * @param digits {number} 精度，保留的小数点数，比如 2, 即保留为两位小数
         * @param op {string} 运算类型，有加减乘除（add/subtract/multiply/divide）
         *
         */
        function operation(a, b, op) {
            var o1 = toInteger(a);
            var o2 = toInteger(b);
            var n1 = o1.num;
            var n2 = o2.num;
            var t1 = o1.times;
            var t2 = o2.times;
            var max = t1 > t2 ? t1 : t2;
            var result = null;
            switch (op) {
                case 'add':
                    if (t1 === t2) { // 两个小数位数相同
                        result = n1 + n2;
                    } else if (t1 > t2) { // o1 小数位 大于 o2
                        result = n1 + n2 * (t1 / t2);
                    } else { // o1 小数位 小于 o2
                        result = n1 * (t2 / t1) + n2;
                    }
                    return result / max;
                case 'subtract':
                    if (t1 === t2) {
                        result = n1 - n2;
                    } else if (t1 > t2) {
                        result = n1 - n2 * (t1 / t2);
                    } else {
                        result = n1 * (t2 / t1) - n2;
                    }
                    return result / max;
                case 'multiply':
                    result = (n1 * n2) / (t1 * t2);
                    return result;
                case 'divide':
                    return result = function() {
                        var r1 = n1 / n2;
                        var r2 = t2 / t1;
                        return operation(r1, r2, 'multiply');
                    }()
            }
        }
        
        // 加减乘除的四个接口
        function add(a, b) {
            return operation(a, b, 'add')
        }
        function subtract(a, b) {
            return operation(a, b, 'subtract')
        }
        function multiply(a, b) {
            return operation(a, b, 'multiply')
        }
        function divide(a, b) {
            return operation(a, b, 'divide')
        }
        
        // exports
        return {
            add: add,
            subtract: subtract,
            multiply: multiply,
            divide: divide
        }
    }
  };

  /**
   * 统一下单成功后调用支付界面
   */
  var invokeWePay = function (unifiedOrder, httpDefer) {
    window.WeixinJSBridge.invoke('getBrandWCPayRequest', unifiedOrder, function(res) {
        // 微信团队郑重提示：res.err_msg 将在用户支付成功后返回 ok，但并不保证它绝对可靠
        if (res.err_msg == "get_brand_wcpay_request:ok") {
            // 支付成功，丢弃已支付的预支付交易单
            httpDefer.resolve(res, unifiedOrder);
        }else {
            var errText = (res.err_msg == "get_brand_wcpay_request:fail") ? '支付失败' : '支付取消';
            httpDefer.reject(errText, unifiedOrder);
        }
    });
  };

  return Util;

});