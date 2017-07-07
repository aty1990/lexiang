require(['$', 'const', 'pm', 'iscroll', 'wx-util','weui'], function ($, CONST, PageManager, IScroll, WxUtil,WEUI) {
    let $home = $('#home_root');
    let homeScroller = "";
    //如果不是微信打开就不显tabber
    var ua = window.navigator.userAgent.toLowerCase();
    if(ua.match(/MicroMessenger/i) != 'micromessenger'){
        $(".weui-tabbar").remove();
        $(".page-home").removeClass('has-tab');
    }

    var Home = function(){}

    // 原型扩展
    Home.prototype = {
        init : function(){
            this.initData();
            this.initBind();
        },
        initBind : function(){
            // 判断当前用户是否关注过湖南乐享
            if($("#subscribe").val()=="0"){
                let followHtml = '<div class="follow-ui">\
                    <div class="msg-tip"></div>\
                </div>';

                $("#home-page").append(followHtml);
            }

            $home.on('tap', '.more', function () {
                PageManager.go('home-more', {'classId': $(this).data('id')});
            });

            $home.on('tap', '.toGoods', function () {
                PageManager.go('goods', {'goodsId': $(this).data('id')});
            });

            // 微超市
            $home.on('tap', '.supermarket', function () {
                PageManager.go('goods-supermarket-list', {});
            });
            
            // 点击关注
            $("body").on("tap",'.follow-ui',function(){
                location.href = "https://mp.weixin.qq.com/mp/profile_ext?action=home&__biz=MzU4MjAyOTQ3NQ==&scene=124#wechat_redirect";
            });
        },
        initData : function(){
            var _self = this;
            $.httpGet('/goods/getWechatImages').then(function (result) {
                _self.initBanner(result.topGoods);
                _self.initMidGoods(result.midGoods);
            });

            $.httpGet('/goods/getGoodsClassList.json', null).then(function (result) {
                _self.initGoodsClass(result);
                _self.initGoodsPane(result);
                homeScroller = new IScroll('#home_root');
            });

        },
        initBanner : function( list ){
            var $banner = $('#banner');
            var html = '';
            for (var i = 0; i < list.length; i++) {
                var item = list[i];
                html += '<a class="slide toGoods" data-id="'+item.goodsId+'">\
                            <img src="'+item.wechatShowImage+'">\
                        </a>';
            }

            $banner.find('.scroller').html(html);
            var bannerScroller = $banner.scroll({
                pageTarget: '#banner-indicator',
                pageClass: 'scroller-page'
            });

            // 添加自动滚动
            setInterval(function () {
                const currentPage = bannerScroller.currentPage.pageX;
                if (currentPage === list.length - 1) {
                    bannerScroller.goToPage(0, 0);
                } else {
                    bannerScroller.next();
                }
            }, 5000);
        },
        initMidGoods : function( data ){
            if (data) {
                let $mid = $('#home-adv');
                let html = '<a class="home-adv toGoods" data-id="'+data.goodsId+'">\
                                <img src="'+data.wechatMidImage+'" class="img">\
                            </a>';
                $mid.html(html);
            }
        },
        // 初始化 商品分类栏目
        initGoodsClass : function ( data ) {
            var html = '<div class="slide"><div class="list">';
            for (var i = 0; i < data.length; i++) {
              var item = data[i];
              if (i >= 10 && i % 10 == 0) {
                html += '</div></div><div class="slide"><div class="list">';
              }
              html += '<a class="item more" href="javascript:void(0)" data-id="'+item.classId+'">\
                        <div class="img">\
                            <img src="'+item.classImage+'">\
                        </div>\
                        <div class="txt">'+item.className+'</div>\
                    </a>';
            }
            /*html += '<a class="item supermarket" href="javascript:void(0)">\
                <div class="img">\
                    <img src="http://file.hngangxin.com/LX/img/20170307/03ad7166-728c-4ea0-81d2-f92014aaf72a.png">\
                </div>\
                <div class="txt">微超市</div>\
            </a>';*/

            html += '</div></div>';
            $('#classified .scroller').html(html);

            $('#classified').scroll({
                pageTarget: '#classified-indicator',
                pageClass: 'scroller-page2'
            });
        },
        // 初始化 每一个商品分类 版面
        initGoodsPane : function( data ){
            for (var i = 0; i < data.length; i++) {
                var item = data[i];
                if (item.topTenGoods && item.topTenGoods.length > 0) {
                    var html = `<div class="home-pane bg-white mgt-10">
                            <div class="pane-head">
                                <span class="pane-title">${item.className}</span>
                                <a href="javascript:void(0)" class="more" data-id="${item.classId}">更多 >></a>
                            </div>
                            <div class="pane-content scroller-box">
                        <div class="scroller">`;
                    for (var j = 0; j < item.topTenGoods.length; j++) {
                      var item2 = item.topTenGoods[j];
                      if (!item2.saleAmount) item2.saleAmount = 0;
                      html += `
                        <a class="item slide toGoods" data-id="${item2.goodsId}">
                          <div class="img">
                            <img src="${item2.smallImage}">
                          </div>
                          <div class="title">${item2.goodsName}</div>
                          <div class="detail">
                            <span style="white-space:nowrap;">已售${item2.saleAmountDesc}件</span>
                            <span class="money">
                              <span class="discount">${((item2.groupPriceStr/item2.priceStr)*10).toFixed(1)}折</span>
                              <span class="rmb">${item2.groupPriceStr}</span>
                            </span>
                          </div>
                        </a>
                      `;
                    }
                    html += '</div></div></div>';
                    $home.children().append(html);
                    $home.find('.home-pane:last').find('.scroller-box').scrollGoods();
                }
            }
        }
    }
    new Home().init();
});


