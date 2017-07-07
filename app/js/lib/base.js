// RequireJS 入口
define('base',
  ['$','const', 'weui', 'pm', 'iscroll', 'util', 'lexiang-iscroll', 'iscroll-pullable', 'list', 'spinner', 'drag-refresh', 'html-tpl', 'tabs', 'http-util', 'wx-util','parabola'],
  function ($,CONST, WEUI, PM, IScroll, Util) {
    // 注册路由
    PM.state('home', {
      url: '/home',
      tplUrl: 'tpl/module/home/home.html',
      root: true,
      animation: ['fadeIn', 'fadeOut']
    }).state('order', {
      url: '/order',
      tplUrl: 'tpl/module/order/order.html',
      root: true,
      animation: ['fadeIn', 'fadeOut']
    }).state('order-detail', {
      url: '/order/detail',
      tplUrl: 'tpl/module/order/order-detail.html'
    }).state('mine', {
      url: '/mine',
      tplUrl: 'tpl/module/mine/mine.html',
      root: true,
      animation: ['fadeIn', 'fadeOut']
    });

    PM.state('home-more', {
      url: '/home/more',
      tplUrl: 'tpl/module/home/more.html'
    });

    PM.state('goods', {
      url: '/goods',
      tplUrl: 'tpl/module/goods/goods.html'
    }).state('goods-comment', {
      url: '/goods/comment',
      tplUrl: 'tpl/module/goods/comment.html'
    }).state('goods-purchase', {
      url: '/goods/purchase',
      tplUrl: 'tpl/module/goods/purchase.html'
    }).state('goods-group-purchase', {
      url: '/goods/groupPurchase',
      tplUrl: 'tpl/module/goods/group-purchase.html'
    }).state('goods-qrcode', {
      url: '/goods/qrcode',
      tplUrl: 'tpl/module/goods/qrcode.html'
    }).state('goods-detail', {
      url: '/goods/detail',
      tplUrl: 'tpl/module/goods/detail.html'
    }).state('goods-supermarket-list', {
      url: '/goods/supermarketList',
      tplUrl: 'tpl/module/goods/supermarket-list.html'
    }).state('goods-list', {
      url: '/goods/goodsList',
      tplUrl: 'tpl/module/goods/goods-list.html'
    });

    

    // 配置"我的"模块路由
    PM.state('mine-address-add', {
      url: '/mine/address/add',
      tplUrl: 'tpl/module/mine/address-add.html'
    }).state('mine-address', {
      url: '/mine/address',
      tplUrl: 'tpl/module/mine/address.html'
    }).state('mine-group', {
      url: '/mine/group',
      tplUrl: 'tpl/module/mine/group.html'
    }).state('mine-group-detail', {
      url: '/mine/group/detail',
      tplUrl: 'tpl/module/mine/group-detail.html'
    }).state('mine-qcode', {
      url: '/mine/qcode',
      tplUrl: 'tpl/module/mine/qcode.html'
    }).state('mine-relation', {
      url: '/mine/relation',
      tplUrl: 'tpl/module/mine/relation.html'
    }).state('mine-profit', {
      url: '/mine/profit',
      tplUrl: 'tpl/module/mine/profit.html'
    });

    PM.state('order-detail', {
      url: '/order/order-detail',
      tplUrl: 'tpl/module/order/order-detail.html'
    }).state('order-history', {
      url: '/order/order-history',
      tplUrl: 'tpl/module/order/order-history.html'
    }).state('receipt-confirm', {
      url: '/order/receipt-confirm',
      tplUrl: 'tpl/module/order/receipt-confirm.html'
    }).state('order-evaluate', {
      url: '/order/order-evaluate',
      tplUrl: 'tpl/module/order/order-evaluate.html'
    }).state('receipt-confirm', {
      url: '/order/receipt-confirm',
      tplUrl: 'tpl/module/order/receipt-confirm.html'
    });

    // 通过 约定的hash 来确定一进来是否要跳转页面
    var toPath = null;
    var toPathParams = null;
    if (location.hash) {
      var hashArr = location.hash.split('/');
      $.each(hashArr, function (index, data) {
        if (index == 1) {
          toPath = data;     // 第一个参数表示跳某个 路由, 后面才是 进路由需要带的参数
        } else if (index > 1) {
          var itemArr = data.split('=');
          if (itemArr.length === 2) {   // 杜绝   #/goods/pur/sle   这样的无效 hash码    只处理  #/goods/goodsId=32/goodsName=xxx   这样的有效hash码
            if (!toPathParams) toPathParams = {};    //  后文 根据 toPathParams 是否为空来判断, 所以这里 必要时才对其赋值
            toPathParams[itemArr[0]] = itemArr[1];
          }
        }
      });
    }

    if (toPath) {
      PM.go(toPath, toPathParams);
    } else {
      // 默认展示首页
      $('[data-state-name="home"]').click();
    }

    // 保存用户信息
    sessionStorage.setItem("openId", $('#user_openId').val());
    sessionStorage.setItem("nickname", $("#user_nickname").val());
    sessionStorage.setItem("headImgUrl", $("#user_headImgUrl").val());
    sessionStorage.setItem("isGroupOwner", $("#user_isGroupOwner").val());

    // 保存当前域名
    sessionStorage.setItem('serverUrl', location.protocol + '//' + location.hostname);

    // 保存 appId
    sessionStorage.setItem("appId", $('#app_id').val());

    // 集成微信JS-SDK
    wx.config({
      debug: false,
      appId: $('#app_id').val(),
      timestamp: $('#ticket_timestamp').val(),
      nonceStr: $('#ticket_nonce_str').val(),
      signature: $('#ticket_signature').val(),
      jsApiList: ['chooseImage', 'onMenuShareTimeline', 'onMenuShareAppMessage','hideMenuItems','onMenuShareQQ','onMenuShareQZone']
    });

    wx.error(function (res) {
      console.error(res);
    });

    // wx.ready(function () {
    //   console.log('wx is ready!');
    // });

  });