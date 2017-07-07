require(['$', 'pm', 'iscroll', 'const', 'wx-util','util','weui'], function ($, PM, IScroll, CONST, WxUtil,util,WEUI) {
    let stateParam = PM.stateParam,
    classId = "",
    $page = $('.page-goods'),
    $goodsRoot = $page.find('#goods_root').children(),
    goodsScroller,
    currentUrl = location.href + "/:goodsId="+stateParam.goodsId;
    $.httpGet('/goods/getGoodsDetail.json', {goodsId: stateParam.goodsId}).then(function (result) {
        // 此变量判断该商品是超级特惠团还是小规模团还是个人独品
        classId = result.goods.classId;
        // 注册 自定义分享
        wx.ready(function () {
            WxUtil.shareApp({
                title : result.goods.goodsName,
                desc  : result.goods.goodsDesc,
                state : "goods/goodsId="+result.goods.goodsId,
                qqlink : currentUrl,
                imgUrl  : result.goods.smallImage,
                success : function(){}
            });
        });

        initGoods(result);

        goodsScroller = new IScroll('#goods_root');

        let $goodsImgs = $page.find('img'),
          loadedCount = 0;

        $goodsImgs.load(function () {
          loadedCount++;
          if ($goodsImgs.length == loadedCount) {
            setTimeout(function () {
              goodsScroller.refresh();
            }, 15);
          }
        });
    });

  var initGoods = function (data) {
    var getGoodsGroupHtml = function (list, goods) {

      return list.length > 0 ? `
          <div class="bg-white mgt-10">
            <div class="row font-gray line-h-45 border-b">以下小伙伴在开团</div>
            <div class="group-purchase">${getGroupItemHtml(list, goods)}</div>
          </div>
      ` : '';
    };

    var getGroupItemHtml = function (list, goods) {
      var html = '';
      for (var i = 0; i < list.length; i++) {
        var item = list[i];
        var countdownHtml = getCountdownHtml(item.createTime, item.hourLimit, item.groupOrderCode, goods);
        html += countdownHtml.txt == '<span>过期</span>' ? '' : `
            <div class="item flex-space-between">
                <div>
                    <div class="user-img myClearfix mgt-10">
                        <img src="${item.headImgUrl ? item.headImgUrl : '/app/img/user-default.png'}" class="img">
                    </div>
                    <div class="info">
                        <div class="username">${item.buyerName}</div>
                        <div class="font-gray"><span class="font-red">还差${item.needNum}人</span>,${countdownHtml.txt}</div>
                    </div>
                </div>
                <div>
                    ${countdownHtml.btn}
                </div>
            </div>
        `;
      }
      return html;
    };

    var getCountdownHtml = function (createTime, hourLimit, groupOrderCode, goods) {
      var countdown = getCountdown(createTime, hourLimit);
      if (countdown > 0) {
        return {
          txt: `<span>剩余<span class="countdown">${formatCountdown(countdown, true)}</span></span>`,
          btn: `<a class="btn-join" data-group="${groupOrderCode}"
            data-id="${goods.goodsId}" data-name="${goods.goodsName}" data-desc="${goods.goodsDesc}" data-price="${goods.groupPriceStr}" data-image="${goods.smallImage}" data-team="1">去参团</a>`
        };
      } else {
        return {
          txt: '<span>过期</span>',
          btn: ''
        };
      }
    };

    var goods = data.goods;
    var appraisal = data.appraisal;
    var goodsGroup = data.groupOrders;

    if (!goods.saleAmount) goods.saleAmount = 0;
    if (!appraisal.rate) appraisal.rate = '100%';

    var html = `<div class="main-img">
            <img src="${goods.bigImage}" style="width: 100%; height: 100%;">
            <div class="sell">已售${goods.saleAmountDesc}件</div>
        </div>

        <div class="bg-white">
            <div class="row flex-space-between line-h-50">
                <div class="money font-red">
                    <span class="rmb">${parseFloat(goods.priceStr).toFixed(2)}</span>
                    <div class="detail">
                      ${goods.groupLimit}人团立即省${(goods.priceStr - goods.groupPriceStr).toFixed(2)}元
                    </div>
                </div>
                <a class="call-phone font-red" href="${CONST.SERVE_TEL}">
                    <i class="app-icon goods-phone"></i>联系客服
                </a>
            </div>
            <div class="row title">${goods.goodsName}</div>
            <div class="row font-gray">商品描述: ${goods.goodsDesc}</div>
            <div class="row font-gray">${goods.goodsSpec}</div>
            <a class="row border-t line-h-45 flex-space-between mgt-8 toComment" href="javascript:void(0)" data-id="${goods.goodsId}">
                <span class="font-gray">用户评价</span>
                <span class="font-orange">已有${appraisal.appraisalNum}条评价  好评率${appraisal.rate}</span>
            </a>
        </div>
        
        ${getGoodsGroupHtml(goodsGroup, goods)}

        <div class="bg-white mgt-10">
            <div class="row font-gray line-h-45 border-b">商品详情</div>
            <div class="goods-imgs">
                <img src="${goods.descImage}" alt="" class="img">
            </div>
        </div>
        <div class="bg-white mgt-10 mgb-10">
            <div class="row border-b flex-space-between line-h-50">
                <span class="title-15">赔付标准</span>
                <div class="font-gray">
                    <span class="font-12 mgr-4">扫码即快赔</span>
                    <i class="app-icon goods-qrcode"></i>
                </div>
            </div>

            <div class="row flex-space-between line-h-50">
                <span class="title-15">${goods.compensateDesc}</span>
            </div>
        </div>`;

    $goodsRoot.html(html);

    $goodsRoot.on('tap', '.toComment', function () {
        PM.go('goods-comment', {'goodsId': $(this).data('id')});
    });

    $page.find('.call-phone').tap(function () {
        location.href = $(this).attr('href');
    });

    $page.find('.goods-qrcode').on('tap', function () {
        PM.go('goods-qrcode');
    });

    //btn s
    var $goodsBtns = $('#goods_btns');
    var btnsHtml = `
      <a class="btn orange toPurchase" data-id="${goods.goodsId}" data-name="${goods.goodsName}" data-desc="${goods.goodsDesc}" data-price="${goods.priceStr}">
        <span class="rmb">${parseFloat(goods.priceStr).toFixed(2)}</span>
        <span class="mgl-10">单独购买</span>
      </a>
      <a class="btn red toGroupPurchase" data-id="${goods.goodsId}" data-name="${goods.goodsName}" data-desc="${goods.goodsDesc}" data-price="${goods.groupPriceStr}" data-image="${goods.smallImage}" data-team="2" data-groupLimit="${goods.groupLimit}">
        <span class="rmb">${parseFloat(goods.groupPriceStr).toFixed(2)}</span>
        <span class="mgl-10">一键开团（${goods.groupLimit}人团）</span>
      </a>
    `;
    $goodsBtns.html(btnsHtml);

    $goodsBtns.on('tap', '.toPurchase', function () {
      var $this = $(this);
      PM.go('goods-purchase',
        {
          'goodsId': $this.data('id'),
          'goodsName': $this.data('name'),
          'goodsDesc': $this.data('desc'),
          'goodsPrice': parseFloat($this.data('price')).toFixed(2)
        }
      );
    });

    var toGroupPurchase = function ($this) {
        var params = {
            'goodsId': $this.data('id'),
            'classId' : classId ,           // 
            'goodsName': $this.data('name'),
            'goodsDesc': $this.data('desc'),
            'goodsGroupPrice': parseFloat($this.data('price')).toFixed(2),
            'smallImage': $this.data('image'),
            'groupLimit': $this.data('groupLimit'),
            'groupOrderCode': $this.data('group'),
            'team':  $this.data('team')
        };
      // 注册 自定义分享
      if (params.groupOrderCode) {
        // 下面这句千万不要换行
        var stateStr = `goods-group-purchase/goodsId=${params.goodsId}/goodsName=${params.goodsName}/goodsDesc=${params.goodsDesc}/goodsGroupPrice=${params.goodsGroupPrice}/smallImage=${params.smallImage}/groupOrderCode=${params.groupOrderCode}`.trim();
        WxUtil.shareApp(params.goodsName, params.goodsDesc, stateStr, params.smallImage);
      }
      PM.go('goods-group-purchase',params);
    };
    $goodsBtns.on('tap', '.toGroupPurchase', function () {
        toGroupPurchase($(this));
        
    });
    $goodsRoot.on('tap', '.btn-join', function () {
      toGroupPurchase($(this));
    });

    countdownTimer();
  };

  // 根据 创建时间和有效期,获得剩余时间  返回单位 毫秒
  var getCountdown = function (createTime, hourLimit) {
    var createTime = +(new Date(createTime.replace(/-/g, '/')));
    var now = +(new Date());
    var ssLimit = parseInt(hourLimit) * 3600000;   // 小时转毫秒    *60*60*1000

    var endTime = createTime + ssLimit;   // 结束时间戳

    var countdown = endTime - now;  // 剩余时间
    return (countdown <= 0) ? 0 : countdown;
  };

  // 根据  x天x:x:x 的格式返回  秒
  var getCountdownForStr = function (str) {
    var ss = 0, mm = 0, hh = 0, dd = 0;
    if (str.includes('天')) {
      var timeArr = str.split('天');
      dd = timeArr[0];
      var timeArr2 = timeArr[1].split(':');
      hh = timeArr2[0];
      mm = timeArr2[1];
      ss = timeArr2[2];
    } else {
      var timeArr = str.split(':');
      hh = timeArr[0];
      mm = timeArr[1];
      ss = timeArr[2];
    }
    ss = parseInt(ss);
    if (dd) ss += parseInt(dd * 86400);   // 24*3600
    if (hh) ss += parseInt(hh * 3600);
    if (mm) ss += parseInt(mm * 60);
    return ss;
    // return str.split(':');
  };

  // 格式化 剩余时间, 传入单位 毫秒,
  var formatCountdown = function (countdown, forDay) {
    function prefixInteger(num) {
      return (Array(2).join(0) + num).slice(-2);
    }

    if (countdown > 0) {
      var ss = parseInt(countdown) / 1000;  // 秒
      var mm = 0, hh = 0, dd = 0, mon = 0, yy = 0; // 从左至右依次是：分、时、天、月、年
      if (ss > 60) {
        mm = parseInt(ss / 60);
        ss = parseInt(ss % 60);
        if (mm > 60) {
          hh = parseInt(mm / 60);
          mm = parseInt(mm % 60);
          if (forDay && hh > 24) {
            dd = parseInt(hh / 24);
            hh = parseInt(hh % 24);
          }
        }
      }
      var rStr = '';
      if (dd && forDay) rStr += dd + '天';
      rStr += (hh ? prefixInteger(hh) : '00') + ':';
      rStr += (mm ? prefixInteger(mm) : '00') + ':';
      rStr += ss ? prefixInteger(ss) : '00';
      return rStr;
    } else {
      return '';
    }
  };

  // 计时器
  var countdownTimer = function () {

    var temp1 = setInterval(function () {
      var isClear = true;  // 默认清除定时器

      var $countdownArr = $('.countdown');
      if ($countdownArr && $countdownArr.length > 0) {
        $countdownArr.each(function () {
          var ss = getCountdownForStr($(this).html()) - 1;
          if (ss > 0) {
            isClear = false;  // 只要有一个没有过期, 就不清除定时器
            $(this).html(formatCountdown(ss * 1000, true));
          } else {
            $(this).parents('.item').find('.btn-join').remove();
            $(this).parent().html('过期');
          }
        });
      }

      // 根据状态清除定时器。
      if (isClear) {
        clearInterval(temp1);
        temp1 = null;
      }
    }, 1000);
  };


    // 如果不是微信下打开则移除购买按钮
    if(!util.isWeiXin()){
        $(".footer").remove();
        $(".goods.has-footer").css("bottom",0);
    }
});


