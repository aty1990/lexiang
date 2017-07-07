define(function () {

  // var server = 'http://127.0.0.1:8080';
  var server = 'http://wechat.hngangxin.com';    // 测试
  // var server = 'http://yuan.natapp4.cc';    // 测试
  //var server = 'http://lx.hngangxin.com';    // 正式
  //var server = 'http://aty1990.natapp4.cc';    // 测试

  return {

    SERVE_TEL: 'tel:073184115555',

    // Form验证规则
    VALIDATION_REGEXP: {
      PHONE_NUMBER: /^1\d{10}$/
    },

    SERVER_URL: server,
    SERVER_API_URL: server + '/api/1.0',
    PAGE_SIZE: 15,

    ORDER_TYPE: {
      ORDINARY: 1,
      GROUP: 2
    },

    ORDER_STATE: {
      TO_PAY: 1,        // 待支付
      TO_DELIVER: 2,    // 待发货
      TO_RECEIPT: 3,    // 待收货
      TO_COMMENT: 4,    // 待评价
      GROUPING: 88,     // 拼团中
      CLOSED: 99        // 已关闭
    }

  };

});