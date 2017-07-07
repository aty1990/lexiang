require(['$', 'pm', 'const', 'util', 'weui','wx-util'], function ($, PM, CONST, Util, WEUI, WxUtil) {
	var stateParam = PM.stateParam;
	var $choiseDiv = $('.choiseAddress_group_div');
	var $choiseListDiv = $('.choiseAddress_list_group_div');
	var $form = $('.purchase_group_form');
	var unPaidOrder = null;  // 平台的订单对象
	var unPaidUnifiedOrder = null;  // 微信的统一下单对象
	var groupPurchaseTimer = null;

	var GroupObj = function(){
		this.addressId = "";
		this.consignee = "";			//团长姓名
		this.consigneeMobile = "";		//团长电话
	}
	GroupObj.prototype = {
		// 初始化页面数据
		init : function(){
			this.initData(this).bindEvent().isWx().initShare();
			// 如果不是微信打开则隐藏购买按钮
			return this;
		},
		// 默认分享首页
		initShare:function(){
			var url = location.href.slice(0,location.href.indexOf("#")+1);
			wx.ready(function () {
                // 注册 自定义分享
                WxUtil.shareApp({
                    title : '乐享商城',
                    desc : '乐享商城',
                    state : 'home',
                    qqlink : url + "/home",
                    imgUrl : 'http://file.hngangxin.com/LX/20170504114045.jpg',
                    success : function(){}
                });
            }); 
			return this;
		},
		initData : function(_self){
			localStorage.setItem("from","group-purchase");
			// 获取团订单信息
			$.httpPost('/order/getGroupOrderList.json', {groupOrderCode: stateParam.groupOrderCode,team:stateParam.team,goodsId:stateParam.goodsId,wechat: sessionStorage.getItem('openId')}).then(function (result) {
				$.extend(stateParam,result.goods,true);
				_self.renderData( result.goods );
				if(stateParam.team=="1"){
					if(result.list.length==0 || Math.floor(result.list[0].groupNum) <= Math.floor(result.list[0].alreadyGroup)){
						WEUI.alert("参团人员已满",function(){
							PM.go("home",{},-2);
						});
					}
					if(stateParam.classId=="10000042"){
						// 买家地址
						if(result.addressList.length>0){
							_self.consignee = result.addressList[0].consignee;
							_self.consigneeMobile = result.addressList[0].consigneeMobile;
						}
						// 取团地址
						_self.initAddress( result.list[0],"max" );

					}else{
						// 取本人默认地址
						$.httpGet('/address/getAddressList.json', {wechat: sessionStorage.getItem('openId'),'isDefault':1}).then(function (result) {
							_self.initAddress( result[0],"min" );
						});
					}
					// 初始化参团成员
					_self.showTeam( result.list );
					// 团成员人数
					stateParam.teamNumber = result.list.length;

				}else{
					// 取本人默认地址
					$.httpGet('/address/getAddressList.json', {wechat: sessionStorage.getItem('openId'),'isDefault':1}).then(function (result) {
						_self.initAddress( result[0],"" );
					});
				}
			});
			return this;
		},
		isWx:function(){
			if(!Util.isWeiXin()){
				$(".page-goods-group-purchase .footer").remove();
				$(".page-goods-group-purchase .has-footer").css("bottom",0);
			}
			return this;
		},
		popNotice : function( result ){
			WEUI.alert("<div class='pop-notice'>这是"+stateParam.groupLimit+"人超级特惠团，是统一配送到团长("+result.buyerName+")所指定的地址("+result.consigneeAddr+")，如不方便到此地址自提，请勿拍。</div>",function(){
			});
		},
		// 绑定事件
		bindEvent:function(){
			var _self = this;

			$('#goods_group_purchase_submit').click(function (e) {
				_self.toSubmit(e);
			});
			
			$('body').on('click','.showMore',function(){
				$(this).hide();
				$(".hideMore").show();
				$("span.hide-img").show();
			});

			$('body').on('click','.hideMore',function(){
				$(this).hide();
				$(".showMore").show();
				$("span.hide-img").hide();
			});

			$(".purchase_group_form").on("click",'.goods-title',function(){
				PM.go('goods-detail', {'goodsId': stateParam.goodsId});
			});
			return this;
		},
		// 提交订单
		toSubmit : function(e){
			var _self = this;
			e.preventDefault();
			e.stopPropagation();
			if(stateParam.team=="1" && !_self.consignee &&　stateParam.classId=="10000042"){
				var content = '<table>\
						<tr>\
							<td><input type="text" value="" name="buyerName" placeholder="姓名"/></td>\
						</tr>\
						<tr>\
							<td><input type="number" value="" name="buyerPhone" placeholder="联系电话"/></td>\
						</tr>\
					</table>'
				WEUI.dialog({
			      	title: '联系方式',
			      	content: content,
			     	className: 'custom-user-pop',
			      	buttons: [{
			          	label: '确定',
			          	type: 'primary',
			          	onClick: function () { 
			          		var buyerName = $(".custom-user-pop input[name=buyerName]").val();
			          		var buyerPhone = $(".custom-user-pop input[name=buyerPhone]").val();
			          		if(!buyerName || !buyerPhone)return false;
		          			_self.dealData(buyerName,buyerPhone);
			          	}
			     	},{
			         	label: '取消',
			          	type: 'default',
			          	onClick: function () {  

			          	}
			      	}]
			  	});
			}else{
				_self.dealData(_self.consignee,_self.consigneeMobile);
			}
		},
		dealData:function(buyerName,buyerPhone){
			var _self = this;
			groupPurchaseTimer && clearTimeout(groupPurchaseTimer);
			groupPurchaseTimer = setTimeout(function () {
				const   isGroupOwner = sessionStorage.getItem('isGroupOwner'),
						totalFee = $form.find('.purchase-price').text(),
						addressId = $choiseDiv.find('.item').data('id');

				if (addressId == null) {
				  	WEUI.topTips('请填写收货地址', {
						duration: 3000
				  	});
				  	return;
				}
				// 是超级团并且是团长则提示
				if( "10000042" == stateParam.classId && stateParam.colonel=="1"){
					WEUI.confirm('超级特惠团地址在支付成功后无法修改！是否继续？',  function(){ 
						_self.sendData(addressId,totalFee,isGroupOwner,true,buyerName,buyerPhone);
					}, function(){
						history.back();
					},{title: '支付提示'})
				}else{
					_self.sendData(addressId,totalFee,isGroupOwner,false,buyerName,buyerPhone);
				}
			}, 1001);
		},
		sendData:function(addressId,totalFee,isGroupOwner,flag,buyerName,buyerPhone){
			var _self = this;
			const params = {
				goodsId: stateParam.goodsId,
				quantity: parseInt($form.find('.purchase-num').val()),
				buyerNote: $form.find('[name="note"]').val(),
				addressId: addressId,
				totalMoney: totalFee,
				groupOrderCode: stateParam.groupOrderCode,
				orderType: CONST.ORDER_TYPE.GROUP,
				buyerName: buyerName,
				buyerPhone:buyerPhone,
				wechat: sessionStorage.getItem('openId'),
				wechatName: sessionStorage.getItem('nickname')
			};
			if (isGroupOwner == '1') {
				setTimeout(function(){ 
					WEUI.dialog({
				      	title: '支付方式',
				      	content: '请选择支付方式',
				     	className: 'custom-classname',
				      	buttons: [{
				          	label: '虚拟购买',
				          	type: 'primary',
				          	onClick: function () { _self.createOrder(params, stateParam.goodsName); }
				     	}, {
				         	label: '真实购买',
				          	type: 'primary',
				          	onClick: function () { _self.createOrder(params, stateParam.goodsName, true); }
				      	},{
				         	label: '取消',
				          	type: 'default',
				          	onClick: function () {  

				          	}
				      	}]
				  	});

				},flag?1001:0);
			}
			else {
				_self.createOrder(params, stateParam.goodsName, true);
			} 
		},
		// 创建订单
		createOrder : function(params, goodsInfo, isReal){
			var _self = this;
			 // 缓存订单对象不存在时创建
			if (unPaidOrder == null) {
				var loading = WEUI.loading('团购订单生成中');
				if (!isReal) params.virtual = 1;
				$.httpPost('/order/createOrder.json', params).then(function (order) {
					loading.hide();
					if (order.resultCode == -1) {
						WEUI.toast('团购订单生成失败', {
							duration: 2000,
							callback: function () {
								PM.go('home');
							}
						});
					}else {
						// 如果创建订单成功，缓存订单对象
						unPaidOrder = order;
						_self.wePay(Util.formatMoney().multiply(params.totalMoney,100), unPaidOrder, goodsInfo, isReal);
					}
				});
			}else {
				// 缓存订单对象已存在时，直接支付
				_self.wePay(Util.formatMoney().multiply(params.totalMoney,100), unPaidOrder, goodsInfo, isReal);
			}
		},
		wePay : function(totalMoney, order, goodsInfo, isReal){
			var _self = this;
			const virtual = isReal ? 0 : 1;
			if (isReal) {
				// 统一下单对象不存在时调用微信接口以创建
				if (unPaidUnifiedOrder == null) {
					Util.doWePay(totalMoney, order.orderCode, goodsInfo).then(function () {
						$.httpPost('/order/payOrder', { orderId: order.orderId, virtual: virtual }).then(function (orderCodeObj) { 
							_self.paySuccess(order.groupStatus,orderCodeObj); 
						},function(){
							WEUI.toast('数据同步异常');
						});
					}, function (errMsg, unifiedOrder) {
						WEUI.toast(errMsg, {
							duration: 2000,
							callback: function () {
								// 缓存统一下单对象
								unPaidUnifiedOrder = unifiedOrder;
								if (errMsg === '支付功能需要在微信端运行') PM.go('order');
								PM.go('order', { tabState:'order-to-pay' });
							}
						});

					});
				}else {
					// 统一下单对象存在时直接调用微信支付
					Util.doInvokeWePay(unPaidUnifiedOrder).then(function () {
						$.httpPost('/order/payOrder', { orderId: order.orderId, virtual: virtual }).then(function (orderCodeObj) { 
								_self.paySuccess(order.groupStatus,orderCodeObj); 
							},function(){
								WEUI.toast("支付失败");
								PM.go('order', { tabState:'order-to-deliver' });
							});
						}, function (errMsg) {
							WEUI.toast(errMsg, 2000);
					});
				}
			} else {
				$.httpPost('/order/payOrder', { orderId: order.orderId, virtual: virtual }).then(function (orderCodeObj) { 
					_self.paySuccess(order.groupStatus,orderCodeObj); 
				},function(){
					WEUI.toast("支付失败");
				});
			}
		},
		// 显示团成员
		showTeam : function( result ){
			let _self = this;
			if(result && result.length>0){
				var wrapObj = $("<div></div>");
				var box = $('<div class="bg-white row  line-h-45 border-b hasbgIcon">已参团成员('+result.length+'人)</div>');
				var teamHtml = $("<div class='team-box bg-white'></div>");
				$.each(result,function(index,ele){
					var str = $('<span class="img-box"><div class="img-item"><img src="'+ele.headImgUrl+'" width="40px" height="40px"/></div><span class="number-name">'+ele.buyerName+'</span></span>');
					if(ele.colonel=="1"){
						str.addClass('head');
						// 参团公告
						if("10000042" == stateParam.classId ){
							_self.popNotice(ele);
						}
					}
					if(index==11 && result.length>12){
						var showMore = $('<span class="img-box showMore"><span class="show-more-number"></span><span class="number-name font-gray">显示更多</span></span>'); 
						teamHtml.append(showMore);
					}
					if(index>10){
						str.addClass("hide-img").hide();
					}
					teamHtml.append(str);
				});
				if(result && result.length>12){
					var hideMore = $('<span class="img-box hideMore"><span class="hide-more-number"></span><span class="number-name font-gray">收起更多</span></span>');
						hideMore.hide();
					teamHtml.append(hideMore);     
				}
				wrapObj.append(box).append(teamHtml);
				$form.prepend(_self.addressStr);  
				wrapObj.insertAfter($(".add-address-btn"));
			}
		},
		payFail : function(){
			WEUI.toast('支付失败', {
				duration: 1000,
				callback: function () {
					PM.go('order');
				}
			});
		},
		// 渲染商品数据
		renderData : function( result ){
			var html = '<div class="bg-white ">\
				<div class="row line-h-55 border-b add-address-btn hide">\
					<i class="app-icon plus"></i>\
					<span class="font-orange font-15 border-b">请填写收货地址</span>\
				</div>\
				<div class="row line-h-45 border-b">\
					<i class="app-icon order-lx-mall"></i>\
					<span class="title-15">乐享商城</span>\
				</div>\
				<div class="row border-b flex-space-between goods-title">\
					<div class="img-box">\
						<img src="'+result.smallImage+'" alt="" class="img">\
					</div>\
					<div class="detail-content">\
						<span class="font-black">'+result.goodsName+'</span>\
						<span class="font-gray">'+result.goodsDesc+'</span>\
						<span class="font-red"><span class="rmb">'+result.groupPriceStr+'&nbsp;&nbsp;<i class="font-gray normal-style">× 1</i></span></span>\
					</div>\
				</div>\
				<div class="row line-h-55 flex-space-between">\
					<span class="title-15">购买数量</span>\
					<input type="number" class="spinner purchase-num" name="num">\
				</div>\
			</div>\
			<div class="bg-white mgt-10">\
				<div class="row line-h-55 flex-space-between">\
					<span></span>\
					<span>\
						<span class="font-gray">实付:</span>\
						<span class="font-red font-18"><span class="purchase-price rmb">00.00</span></span>\
					</span>\
				</div>\
				<div class="pdl-12 pdr-12 pdb-12">\
					<textarea class="textarea" placeholder="亲,还有什么备注吗" name="note"></textarea>\
				</div>\
			</div>\
			<div class="bg-white mgt-10 mgb-10">\
				<div class="row line-h-45 border-b"><span class="font-gray font-16">拼团玩法</span></div>\
				<div class="group-introduction">\
					<div class="i-head">\
						<div class="item">\
							<div class="step">1</div>\
							<span>开团或参团</span>\
						</div>\
						<div class="item">\
							<div class="step">2</div>\
							<span>邀请参团</span>\
						</div>\
						<div class="item">\
							<div class="step">3</div>\
							<span>等待满团</span>\
						</div>\
					</div>\
					<div class="i-content">\
						<div>\
							<span class="font-black">拼团:</span>\
							<span>与好友共同团购,获取优惠的购买方式</span>\
						</div>\
						<div>\
							<span class="font-black">团长:</span>\
							<span>开团并支付的人</span>\
						</div>\
						<div>\
							<span class="font-black">拼团成功:</span>\
							<span>从团长开团48小时内参团人数达到团购人数即拼团成功</span>\
						</div>\
						<div>\
							<span class="font-black">拼团失败:</span>\
							<span>开团48小时后,未达到相应参团人数,或团未满而商品提前售罄,该团失败</span>\
						</div>\
						<div>\
							<span class="font-black">退款说明:</span>\
							<span>拼团失败,系统会在2天内提交微信处理,3个个工作日自动退回您的账户</span>\
						</div>\
					</div>\
				</div>\
			</div>';

			$form.html(html);

			$form.find('.add-address-btn').tap(function (e) {
				e.stopPropagation();
				PM.go('mine-address');
			});

			$form.find('input.spinner').spinner({
				val: 1,
				step: 1,
				// max:2,
				min: 1,
				onChange: function (val) {
					var price = (val * parseFloat(result.groupPriceStr)).toFixed(2);
					$form.find('.purchase-price').html(price);
				}
			});
		},
		paySuccess : function( groupStatus,orderCodeObj ){
			WEUI.toast('支付成功');
			var qqlink = location.href.slice(0,location.href.indexOf("#")+1)+'/goods-group-purchase/:goodsId='+stateParam.goodsId+'/:groupOrderCode='+orderCodeObj.groupOrderCode+"/:team=1";
			var unNumber = Math.floor(stateParam.groupLimit)-1-Math.floor(stateParam.teamNumber?stateParam.teamNumber:0);
			setTimeout(function(){
				// 如果人数已满，则不设置分享 默认跳转到订单页面
				if(unNumber==0){
					PM.go('order', { tabState: groupStatus == 2 ? 'order-to-deliver' : 'order-gp-buying' });
				}else{
					var sharePop = $(".share-pop");
						sharePop.find(".title").html("离满团还差<i class='font-red'>"+unNumber+"</i>人,点击右上角…按钮<br/>分享到好友吧");
						sharePop.show();
					var stateStr = 'goods-group-purchase/:goodsId='+stateParam.goodsId+'/:groupOrderCode='+orderCodeObj.groupOrderCode+"/:team=1";
					var title =  (stateParam.classId=="10000042"?"超级特惠团，":"")+"离满团还差"+unNumber+"人，快来参加吧";
					WxUtil.shareApp({
						title : title,
						desc  : stateParam.goodsName,
						state : stateStr,
						qqlink  : qqlink,
						imgUrl  : stateParam.smallImage,
						success : function(){
							PM.go('order', { tabState: groupStatus == 2 ? 'order-to-deliver' : 'order-gp-buying' });
						}
					});

					// 查看订单
					$('body').on('tap','.select-order',function(){
						PM.go('order', { tabState: groupStatus == 2 ? 'order-to-deliver' : 'order-gp-buying' });
					});
				}
			},2000);
		},
		// 初始化收货默认地址 isDefault 0 所有地址 1 默认地址
		initAddress : function(result,flag){
			var userAndTel = "";
			if(stateParam.team=="1" && stateParam.classId=="10000042") userAndTel = "团长姓名电话：";
			if(result){
				var addressHtml = $('<label class="item" data-id="'+result.addressId+'">\
					<div class="item-hd">\
						<span class="address-icon"></span>\
					</div>\
					<div class="item-bd">\
						<div class="item-bd-inner_column">\
							<div class="item-bd_row">'+userAndTel+result.consignee+" "+result.consigneeMobile+'</div>\
							<div class="item-bd_row font-12">'+result.consigneeAddr+'</div>\
						</div>\
					</div>\
				</label>');
				if(stateParam.team != "1"){
					addressHtml.append('<a class="item-ft app-icon clickable group-purchase-link"  href="#/mine/address"></a>');
				}else{
					// min 为小人团，地址可以修改
					if(flag=="min"){
						addressHtml.append('<a class="item-ft app-icon clickable group-purchase-link"  href="#/mine/address"></a>');
					}
				}
	            $choiseDiv.html(addressHtml);

			}else{
				// 不是参团或者（是参团但不是超级团）就显示填写地址
				if(stateParam.team!="1" || (stateParam.team=="1" && stateParam.classId!="10000042"))$(".page-goods-group-purchase .add-address-btn").show();  
			}
		}
	}
	new GroupObj().init();
});


