require(['$', 'pm','iscroll'], function ($, PM, IScroll) {
     // 我的群员对象
     function MyGroupNumber(){
          // 确保只有单例
          if( MyGroupNumber.unique !== undefined ){
               return MyGroupNumber.unique; 
          }
          this.groupList = $(".group-list-page .inner-box");
          this.openId = PM.stateParam.openId;
          this.goodsScroller = null;
          
          MyGroupNumber.unique = this;
     }
     // 原型扩展
     MyGroupNumber.prototype = {
          init : function(){
               this.initData();
               this.bindEvent();
          },
          bindEvent : function(){
               var _self = this;
               this.groupList.on("tap",'.show-more-number',function(){
                    _self.groupList.find("li.hide-img").toggleClass("hide-more");
                    $(this).remove();
                    _self.goodsScroller.refresh();
               });
          },
          initData : function(){
               var _self = this;
               // 获取群员列表数据
               $.httpGet('/wechatUser/getWechatByGroup?openId='+_self.openId).then(function (data) {
                    _self.initNumberList(data);
               });
          },
          // 初始化群员列表
          initNumberList : function(data){
               var _self = this;
               var ul = $("<ul></ul>");
               $.each(data,function(i,obj){
                    var li = $("<li><div class='number-icon-box'><span class='img-wrap'><img src="+obj.headImgUrl+"></span><p>"+obj.nickname+"</p></div></li>");
                    // 如果群人数大于24则后面的人员隐藏
                    if(i>23) li.addClass("hide-more hide-img"); 
                    ul.append(li);
               });
               
               // 清空li的浮动，让ul的高度自适应
               var div = $('<div style="clear:both;"></div>');
               ul.append(div);

               // 如果群人数大于24则显示查看全部群成员
               if(data.length>23){
                    var p = $("<p class='show-more-number'>查看全部群成员</p>");
                    ul.append(p);
               }
               this.groupList.html(ul);
               // 初始化滚动条
               setTimeout(function(){
                    _self.goodsScroller = new IScroll('.inner-box');
               },300);
          }
     }
     new MyGroupNumber().init();
});