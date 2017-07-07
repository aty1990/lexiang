/**
 * Created by sjin on 17/4/26.
 */
define(['$', 'const'], function ($, CONST) {

  // 共用的 注册分享 函数
  var shareApp = function (options ) {
    var serverUrl = sessionStorage.getItem('serverUrl');
    var appId = sessionStorage.getItem('appId');
    var link = serverUrl + '/wechatPlatform/shareLink?state=' + (options.state || 'home');
      wx.hideMenuItems({
          menuList: ['menuItem:copyUrl'] // 要隐藏的菜单项，只能隐藏“传播类”和“保护类”按钮，所有menu项见附录3
      });
    // 分享到朋友圈
    wx.onMenuShareTimeline({
      title: options.title, // 分享标题h
      desc: options.desc, // 分享描述
      link: link, // 分享链接
      imgUrl: options.imgUrl, // 分享图标
      success: function () {
        // 用户确认分享后执行的回调函数
        options.success && options.success();
      },
      cancel: function () {
            // 用户取消分享后执行的回调函数
            options.cancel && options.cancel();
      }
    });

    // 分享到微信好友
    wx.onMenuShareAppMessage({
      title: options.title, // 分享标题
      desc: options.desc, // 分享描述
      link: link, // 分享链接
      imgUrl: options.imgUrl, // 分享图标
      type: '', // 分享类型,music、video或link，不填默认为link
      dataUrl: '', // 如果type是music或video，则要提供数据链接，默认为空
      success: function () {
        // 用户确认分享后执行的回调函数
        if (success) success();
      },
      cancel: function () {
        // 用户取消分享后执行的回调函数
        if (cancel) cancel();
      }
    })
    // 分享到qq;
    wx.onMenuShareQQ({
        title: options.title, // 分享标题
        desc: options.desc, // 分享描述
        link:options.qqlink, // 分享链接
        imgUrl: options.imgUrl, // 分享图标
        success: function () {
            options.success && options.success()
        },
        cancel: function () {
            options.cancel && options.cancel()
        }
    });
    // 分享到QQ空间
    wx.onMenuShareQZone({
        title: options.title, // 分享标题
        desc: options.desc, // 分享描述
        link: options.qqlink, // 分享链接
        imgUrl: options.imgUrl, // 分享图标
        success: function () { 
            options.success && options.success()
        },
        cancel: function () { 
            options.cancel && options.cancel()
        }
    });



  };

  return {
    shareApp: shareApp
  }
});