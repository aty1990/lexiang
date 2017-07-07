/**
 * Created by yuanxiufu on 2017/2/22.
 */

define(['$', 'require','wx-util'], function ($, require, WxUtil) {

  var doc = document,
      win = window,
      location = win.location,
      history = win.history;

  var PageManager = {
    resRoot: '/app/',
    _container: null,
    _pageIndex: 0,
    _pageStack: [],  // [{ name, state, $dom }]
    states: {},  // { "name": { url, tplUrl, scriptUrl(可选), cache(可选), animation(可选), isHistory(可选) } }
    stateParam: null,
    shareParams : {},
    events: {
        changeHash: function ( options ) {
            if(options.newName=="home"){
               wx.ready(function () {
                    // 注册 自定义分享
                    WxUtil.shareApp({
                        title : '乐享商城',
                        desc : '乐享商城',
                        state : 'home',
                        qqlink : location.href,
                        imgUrl : 'http://file.hngangxin.com/LX/20170504114045.jpg',
                        success : function(){}
                    });
                });  
            }
        }
    },
    on: function (event, fn) {
      this.events[event] = fn;
      return this;
    },

    state: function (name, config) {
      this.states[name] = config;
      return this;
    },

    _pushPage: function (page) {
      this._pageStack.push(page);
      return this;
    },

    _init: function (container) {
      var that = this;

      this._container = container ? $(container) : $('.page-container');

      if (this._container.length !== 1) {
        throw Error('The page container must be unique!');
      }
      this._pageIndex = 0;
      $('.page-container').children('.weui-tabbar').children().on('click', function (e) {
            e.preventDefault();
            e.stopPropagation();
            var name = $(this).data('stateName'),
                param = $(this).data('stateParam');
                param = param ? JSON.parse(param) : {};
                that.go(name, param);
        });
        var urlParams = location.hash;
        if(urlParams.indexOf("&")!=-1 && urlParams.indexOf("/:")!=-1){
            urlParams = urlParams.slice(urlParams.indexOf("/:"),urlParams.indexOf("&"));

        }else if(urlParams.indexOf("appinstall")!=-1 && urlParams.indexOf("home")!=-1){
            var routerName = urlParams.slice(0,urlParams.indexOf("&"));
            setTimeout(function(){
                  location.hash = routerName;
            },300);
        }
        var paramArr = urlParams.split("/:");
        for(var i=0;i,i<paramArr.length;i++){
            var strObj = paramArr[i].split("=");
            that.shareParams[strObj[0]] = strObj[1];
        }
       
      // hashchange事件在当前页面URL中的hash值发生改变时触发
      $(win).on('hashchange', function (e) {
        var newUrl = location.hash.substring(1),
            newName = that._findStateName(newUrl),
            newState = that._findState(newName);
        var stackIndex = that._findInStack(newName);

        if(location.hash=="#/home")that.shareParams = {};

        // 处理hashchange事件
        that.events.changeHash({
            newUrl : newUrl,
            newName : newName,
            newState : newState,
            shareParams : that.shareParams
        });

        var pageIndex = that._pageIndex,
            historyPageIndex = history.state && history.state._pageIndex;
        // 当访问当路由是根路由，并且该根路由不是当前路由的上一级
        if (newState.root
            && (isNaN(historyPageIndex) || (!isNaN(historyPageIndex) && pageIndex - historyPageIndex != 1))) {
          that._clearPageStack();
          that._go(newName);
        } else {
            if (!history.state) {
                that._go(newName,null,that.shareParams);
            }else if (history.state._pageIndex < that._pageIndex) {
                if (stackIndex >= 0 && (stackIndex == that._pageStack.length - 2))
                  that._back();
                else
                  history.back();
            }
        }
      });

      return this;
    },

    _clearPageStack: function () {
      var that = this;
      this._pageStack.forEach(function (page) {
        page.$dom.remove();
        requirejs.undef(that.resRoot + page.state.scriptUrl);
      });
      this._pageStack = [];
      return this;
    },

    _findInStack: function (name) {
      var i = 0, pageStack = this._pageStack, len = pageStack.length;
      for (; i < len; i++) {
        if (pageStack[i].name === name) {
          return i;
        }
      }
      return -1;
    },

    _findPage: function (name) {
      return this._pageStack[this._findInStack(name)];
    },

    _findState: function (name) {
      return this.states[name];
    },

    _findStateName: function (url) {
      var states = this.states, name;
      for (name in states) {
        if (states[name].url === url) {
          return name;
        }
      }
    },

    go: function (name, param, cannotBack) {
        var oldUrl = location.hash.substring(1),
          oldName = this._findStateName(oldUrl),
          newState = this._findState(name);
        if (cannotBack) {
            cannotBack = 1;
        }else if ( !isNaN(cannotBack) && cannotBack < 0  ) {
            cannotBack = -cannotBack;
        }else {
            cannotBack = 0;
        }
        while (cannotBack--) {
          var page = this._pageStack.pop();
          page.$dom.remove();
          requirejs.undef(this.resRoot + page.state.scriptUrl);
        }
        if (newState) {
            this.stateParam = param || {};
            location.hash = newState.url;

            if (oldUrl === newState.url && oldUrl === '/home') {
                $(win).trigger('hashchange', {});
            }
      }
      else {
        throw Error('Could not go to page:', name);
      }
    },

    _go: function (name, state, toParam) {
        if(toParam)$.extend(this.stateParam,toParam,true);
        this._pageIndex++;
        history.replaceState && history.replaceState({ _pageIndex: this._pageIndex }, '', location.href);
        var that = this,
          state = state || this._findState(name),
          animationIn = state.animation ? state.animation[0] : 'slideIn';

      var tplUrl = state.tplUrl,
          scriptUrl = state.scriptUrl;

      // async load template
      $.get(this.resRoot + tplUrl, function (tpl) {
        var $tpl = $(tpl).addClass('page-' + name);
        if(name!="home" && name!="mine" && name!="order"){
            $tpl.css("visibility","hidden");
        }
        $tpl.data('stateParam', toParam);

        $tpl.on("webkitAnimationStart animationStart",function(){
            $tpl.css("visibility","visible");
        });

        if (scriptUrl !== false) {
            if (!scriptUrl) {
                var start = tplUrl.indexOf('/'), end = tplUrl.indexOf('.');
                state.scriptUrl = scriptUrl = 'js' + tplUrl.substring(start, end) + '.js';
            }
            $tpl.toggleClass(animationIn);

            // async load script
            require([that.resRoot + scriptUrl], function () {
                // console.log(that.resRoot + scriptUrl + ' load success');
            }, function (err) {
                console.error('script error: ', err);
            });

            that._container.append($tpl);
            that._pushPage({ name: name, $dom: $tpl, state: state });
            that._switchTab(name);
        }
      });

      return this;
    },

    back: function () {
      history.back();
      return this;
    },

    _back: function () {
        this._pageIndex--;

        var pageStack = this._pageStack.pop();
        if (!pageStack) return;

        var animationOut = pageStack.state.animation ? pageStack.state.animation[1] : 'slideOut';

        // remove template
        pageStack.$dom.toggleClass(animationOut);
        
        setTimeout(function(){pageStack.$dom.remove(); },300);
        
        // remove script
        requirejs.undef(this.resRoot + pageStack.state.scriptUrl);
        return this;
    },

    _switchTab: function (stateName) {
      var $tab = $('[data-state-name="' + stateName + '"]');

      // 更改图标样式
      if ($tab.length == 1) {
        if ($tab.hasClass('weui-tabbar__item')) {
          $tab.find('.app-icon').removeClass(stateName).addClass(stateName + '-selected');

          var $other = $tab.siblings('.weui-bar__item_on'), otherName = $other.data('stateName');
          $other.find('.app-icon').removeClass(otherName + '-selected').addClass(otherName);

          $tab.addClass('weui-bar__item_on');
          $other.removeClass('weui-bar__item_on');
        }
      }
    }

  };

  PageManager._init();

  return PageManager;

});